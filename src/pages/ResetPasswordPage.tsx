import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

// Two-step password reset over the emailOTP flow:
// 1. Request a one-time code by email.
// 2. Enter the code + a new password to reset.
type Stage = "request" | "verify" | "done";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [stage, setStage] = useState<Stage>("request");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Enter the email for your account.");

    setSubmitting(true);
    const { error: authError } = await authClient.forgetPassword.emailOtp({
      email: email.trim(),
    });
    setSubmitting(false);

    if (authError) {
      setError("We couldn't start a reset for that email. Please try again.");
      return;
    }
    setStage("verify");
  }

  async function submitNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!code.trim()) return setError("Enter the 6-digit code we emailed you.");
    if (password.length < 8)
      return setError("Your new password must be at least 8 characters.");

    setSubmitting(true);
    const { error: authError } = await authClient.emailOtp.resetPassword({
      email: email.trim(),
      otp: code.trim(),
      password,
    });
    setSubmitting(false);

    if (authError) {
      setError(
        "That code didn't work or has expired. Request a new one and try again.",
      );
      return;
    }
    setStage("done");
  }

  if (stage === "done") {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="You can now sign in with your new password."
        footer={
          <Link
            to="/login"
            className="font-semibold text-brand hover:text-brand-hover"
          >
            Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="rounded-[10px] bg-[#e9f0ec] px-3.5 py-3 text-[14px] leading-relaxed text-ink">
            Your password has been reset. Use it the next time you sign in to
            continue your intake or check on an order.
          </p>
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate("/login", { replace: true })}
          >
            Go to sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        stage === "request"
          ? "Enter your email and we'll send a code to reset your password."
          : "Enter the code we emailed you, then choose a new password."
      }
      footer={
        <>
          Remembered it?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand hover:text-brand-hover"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      {stage === "request" ? (
        <form onSubmit={requestCode} className="flex flex-col gap-5">
          <Field label="Email" htmlFor="reset-email" required>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>

          {error && (
            <p className="rounded-[10px] bg-[#f7e8e6] px-3.5 py-2.5 text-[13px] font-medium text-error">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? "Sending code..." : "Send reset code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={submitNewPassword} className="flex flex-col gap-5">
          <Field
            label="Reset code"
            htmlFor="reset-code"
            required
            hint={`Sent to ${email}. Check your inbox for a 6-digit code.`}
          >
            <Input
              id="reset-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
            />
          </Field>
          <Field
            label="New password"
            htmlFor="reset-password"
            required
            hint="At least 8 characters."
          >
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a new password"
            />
          </Field>

          {error && (
            <p className="rounded-[10px] bg-[#f7e8e6] px-3.5 py-2.5 text-[13px] font-medium text-error">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? "Updating..." : "Update password"}
          </Button>
          <button
            type="button"
            className="text-center text-[13px] font-medium text-muted hover:text-ink"
            onClick={() => {
              setStage("request");
              setCode("");
              setError(null);
            }}
          >
            Use a different email or resend the code
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
