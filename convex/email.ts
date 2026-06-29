// Centralized transactional-email sender (AC1).
//
// Every part of the app sends mail by importing `sendEmail` from this module and
// passing a template key + data. Callers NEVER touch Mailgun or the Specode relay
// directly, and never build HTML themselves (templates live in emailTemplates.ts).
//
// Delivery posture (this project): Specode-managed relay. The shared relay is
// provisioned internally by Specode (SPECODE_EMAIL_MODE / SPECODE_EMAIL_RELAY_*),
// so no user env setup is required to send in dev/staging. A custom Mailgun
// sending domain (MAILGUN_API_KEY / MAILGUN_DOMAIN / MAILGUN_FROM) takes
// precedence if the project later brings its own domain.

import Mailgun from "mailgun.js";
import formData from "form-data";
import {
  renderTemplate,
  type EmailTemplateData,
  type EmailTemplateKey,
} from "./emailTemplates";

type SendStatus = "sent" | "skipped" | "error";

// AC5: only non-sensitive metadata. Never the email body/HTML/recipient code.
export type EmailLogEntry = {
  to: string;
  template: string;
  status: SendStatus;
  messageId: string | null;
  // Rate-limiting metadata (AC4): a stable tag + the send timestamp so a
  // rate limiter can be layered on later without touching the sender.
  tag: string;
  timestamp: number;
};

// Optional persistence hook. Callers running inside a Convex ctx pass this so
// the send is recorded in the emailLog table. The sender itself never imports
// the DB layer, keeping it usable from any runtime.
type RecordLog = (entry: EmailLogEntry) => Promise<void>;

type SendEmailArgs<K extends EmailTemplateKey> = {
  to: string;
  template: K;
  data: EmailTemplateData[K];
  // Rate-limiting tag (AC4). Defaults to the template key. Group sends that
  // should share a future rate-limit bucket under the same tag.
  tag?: string;
  recordLog?: RecordLog;
};

async function sendViaSpecodeRelay(args: {
  to: string;
  subject: string;
  html: string;
  tag: string;
  timestamp: number;
}): Promise<{ messageId: string | null }> {
  const relayUrl = process.env.SPECODE_EMAIL_RELAY_URL;
  const relayToken = process.env.SPECODE_EMAIL_RELAY_TOKEN;

  if (!relayUrl || !relayToken) {
    throw new Error("Specode managed email relay is not configured.");
  }

  const response = await fetch(relayUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${relayToken}`,
      "Content-Type": "application/json",
    },
    // Rate-limit metadata travels with every send (AC4).
    body: JSON.stringify({
      to: args.to,
      subject: args.subject,
      html: args.html,
      tag: args.tag,
      timestamp: args.timestamp,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  if (!response.ok) {
    const detail =
      payload && typeof payload.error === "string"
        ? payload.error
        : response.statusText;
    throw new Error(`Specode managed email failed: ${detail}`);
  }

  const messageId =
    payload && typeof payload.id === "string"
      ? payload.id
      : payload && typeof payload.messageId === "string"
        ? payload.messageId
        : null;
  return { messageId };
}

async function sendViaCustomMailgun(args: {
  to: string;
  subject: string;
  html: string;
  tag: string;
}): Promise<{ messageId: string | null }> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const fromEmail = process.env.MAILGUN_FROM ?? process.env.AUTH_EMAIL;

  if (!apiKey || !domain || !fromEmail) {
    throw new Error("Custom Mailgun config is incomplete.");
  }

  const fromName = process.env.AUTH_EMAIL_NAME;
  const fromAddress = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
  const mailgun = new Mailgun(formData);
  const client = mailgun.client({ username: "api", key: apiKey });

  const result = await client.messages.create(domain, {
    from: fromAddress,
    to: args.to,
    subject: args.subject,
    html: args.html,
    // Rate-limit / categorization tag (AC4); Mailgun supports native tags.
    "o:tag": args.tag,
  });

  const messageId =
    result && typeof result.id === "string" ? result.id : null;
  return { messageId };
}

/**
 * Send a transactional email. Renders the named template, routes through the
 * active delivery path (custom Mailgun if fully configured, otherwise the
 * Specode-managed relay), and records non-sensitive metadata via `recordLog`.
 */
export async function sendEmail<K extends EmailTemplateKey>({
  to,
  template,
  data,
  tag,
  recordLog,
}: SendEmailArgs<K>): Promise<{ status: SendStatus; messageId: string | null }> {
  const { subject, html } = renderTemplate(template, data);
  const sendTag = tag ?? template;
  const timestamp = Date.now();

  const finish = async (
    status: SendStatus,
    messageId: string | null,
  ): Promise<{ status: SendStatus; messageId: string | null }> => {
    if (recordLog) {
      // Log failures only as metadata; never include body or error detail
      // that could carry sensitive content.
      await recordLog({
        to,
        template,
        status,
        messageId,
        tag: sendTag,
        timestamp,
      });
    }
    return { status, messageId };
  };

  const hasCustomMailgun = Boolean(
    process.env.MAILGUN_API_KEY &&
      process.env.MAILGUN_DOMAIN &&
      (process.env.MAILGUN_FROM ?? process.env.AUTH_EMAIL),
  );
  const useSpecodeRelay = process.env.SPECODE_EMAIL_MODE === "platform";

  try {
    if (hasCustomMailgun) {
      const { messageId } = await sendViaCustomMailgun({
        to,
        subject,
        html,
        tag: sendTag,
      });
      return finish("sent", messageId);
    }

    if (useSpecodeRelay) {
      const { messageId } = await sendViaSpecodeRelay({
        to,
        subject,
        html,
        tag: sendTag,
        timestamp,
      });
      return finish("sent", messageId);
    }

    // No delivery path configured. Do NOT log the recipient code, link, or body.
    console.warn(
      `Email not sent (template=${template}): no delivery method configured.`,
    );
    return finish("skipped", null);
  } catch (err) {
    console.error(
      `Email send failed (template=${template}):`,
      err instanceof Error ? err.message : String(err),
    );
    return finish("error", null);
  }
}
