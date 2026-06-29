import type { BetterAuthClientPlugin, ClientStore } from "better-auth";
import type { crossDomain } from "@convex-dev/better-auth/plugins";

type BetterFetchOption = {
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  body?: unknown;
  method?: string;
  [key: string]: unknown;
};

interface CookieAttributes {
  value: string;
  expires?: Date;
  "max-age"?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

export function parseSetCookieHeader(
  header: string
): Map<string, CookieAttributes> {
  const cookieMap = new Map<string, CookieAttributes>();
  const cookies = splitSetCookieHeader(header);
  cookies.forEach((cookie) => {
    const [nameValue, ...attributes] = cookie.split("; ");
    const separatorIndex = nameValue.indexOf("=");
    const name =
      separatorIndex === -1 ? nameValue : nameValue.slice(0, separatorIndex);
    const value =
      separatorIndex === -1 ? "" : nameValue.slice(separatorIndex + 1);

    const cookieObj: CookieAttributes = { value };

    attributes.forEach((attr) => {
      const [attrName, attrValue] = attr.split("=");
      cookieObj[attrName.toLowerCase() as "value"] = attrValue;
    });

    cookieMap.set(name, cookieObj);
  });

  return cookieMap;
}

function splitSetCookieHeader(header: string): string[] {
  if (!header.trim()) return [];

  const cookies: string[] = [];
  let position = 0;

  while (position < header.length) {
    const start = position;
    let separatorFound = false;

    while (position < header.length) {
      while (position < header.length && /\s/.test(header.charAt(position))) {
        position += 1;
      }

      const char = header.charAt(position);
      if (char !== ",") {
        position += 1;
        continue;
      }

      const commaIndex = position;
      position += 1;

      while (position < header.length && /\s/.test(header.charAt(position))) {
        position += 1;
      }

      const nextStart = position;
      while (
        position < header.length &&
        header.charAt(position) !== "=" &&
        header.charAt(position) !== ";" &&
        header.charAt(position) !== ","
      ) {
        position += 1;
      }

      if (position < header.length && header.charAt(position) === "=") {
        separatorFound = true;
        cookies.push(header.slice(start, commaIndex).trim());
        position = nextStart;
        break;
      }

      position = commaIndex + 1;
    }

    if (!separatorFound) {
      cookies.push(header.slice(start).trim());
      break;
    }
  }

  return cookies.filter(Boolean);
}

interface StoredCookie {
  value: string;
  expires: string | null;
}

interface CrossDomainStorage {
  setItem: (key: string, value: string) => void | Promise<void>;
  getItem: (key: string) => string | null;
}

const DEFAULT_STORAGE_PREFIX = "better-auth";

function getCookieStorageKeys(storagePrefix = DEFAULT_STORAGE_PREFIX) {
  return {
    cookieName: `${storagePrefix}_cookie`,
    localCacheName: `${storagePrefix}_session_data`,
  };
}

function readStoredCookieMap(
  storagePrefix = DEFAULT_STORAGE_PREFIX,
  storage =
    typeof window !== "undefined"
      ? window.localStorage
      : (undefined as CrossDomainStorage | undefined)
): Record<string, StoredCookie> {
  if (!storage) return {};
  const { cookieName } = getCookieStorageKeys(storagePrefix);
  const raw = storage.getItem(cookieName);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, StoredCookie>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function hasStoredSessionCookie(storagePrefix = DEFAULT_STORAGE_PREFIX) {
  const storedCookies = readStoredCookieMap(storagePrefix);
  return Object.keys(storedCookies).some((key) => key.includes("session_token"));
}

export function getSetCookie(header: string, prevCookie?: string) {
  const parsed = parseSetCookieHeader(header);
  let toSetCookie: Record<string, StoredCookie> = {};
  parsed.forEach((cookie, key) => {
    const expiresAt = cookie["expires"];
    const maxAge = cookie["max-age"];
    const expires = expiresAt
      ? new Date(String(expiresAt))
      : maxAge
        ? new Date(Date.now() + Number(maxAge) * 1000)
        : null;
    toSetCookie[key] = {
      value: cookie["value"],
      expires: expires ? expires.toISOString() : null,
    };
  });
  if (prevCookie) {
    try {
      const prevCookieParsed = JSON.parse(prevCookie);
      toSetCookie = {
        ...prevCookieParsed,
        ...toSetCookie,
      };
    } catch {
      // ignore malformed cache
    }
  }
  return JSON.stringify(toSetCookie);
}

export function getCookie(cookie: string) {
  let parsed = {} as Record<string, StoredCookie>;
  try {
    parsed = JSON.parse(cookie) as Record<string, StoredCookie>;
  } catch {
    // noop
  }
  const toSend = Object.entries(parsed).reduce((acc, [key, value]) => {
    if (value.expires && new Date(value.expires) < new Date()) {
      return acc;
    }
    if (!value.value) {
      return acc;
    }
    let cookieValue = value.value;
    try {
      cookieValue = decodeURIComponent(value.value);
    } catch {
      // Keep the raw value if it wasn't URI-encoded.
    }
    return `${acc}${acc ? "; " : ""}${key}=${cookieValue}`;
  }, "");
  return toSend;
}

export function hasStoredSessionData(
  storagePrefix = DEFAULT_STORAGE_PREFIX,
  storage =
    typeof window !== "undefined"
      ? window.localStorage
      : (undefined as CrossDomainStorage | undefined)
) {
  if (!storage) return false;
  const { localCacheName } = getCookieStorageKeys(storagePrefix);
  const raw = storage.getItem(localCacheName);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return (
      !!parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      Object.keys(parsed).length > 0
    );
  } catch {
    return false;
  }
}

export function clearPendingTwoFactorState(
  storagePrefix = DEFAULT_STORAGE_PREFIX,
  storage =
    typeof window !== "undefined"
      ? window.localStorage
      : (undefined as CrossDomainStorage | undefined)
) {
  if (!storage) return;
  const { cookieName, localCacheName } = getCookieStorageKeys(storagePrefix);
  const storedCookies = readStoredCookieMap(storagePrefix, storage);
  const filteredCookies = Object.fromEntries(
    Object.entries(storedCookies).filter(
      ([key]) => !key.includes("two_factor") && !key.includes("trust_device")
    )
  );
  storage.setItem(cookieName, JSON.stringify(filteredCookies));
  if (!Object.keys(filteredCookies).some((key) => key.includes("session_token"))) {
    storage.setItem(localCacheName, "{}");
  }
}

export function prepareTwoFactorChallengeState(
  storagePrefix = DEFAULT_STORAGE_PREFIX,
  storage =
    typeof window !== "undefined"
      ? window.localStorage
      : (undefined as CrossDomainStorage | undefined)
) {
  if (!storage) return;
  const { cookieName, localCacheName } = getCookieStorageKeys(storagePrefix);
  const storedCookies = readStoredCookieMap(storagePrefix, storage);
  const filteredCookies = Object.fromEntries(
    Object.entries(storedCookies).filter(([key]) => {
      return (
        key.includes("two_factor") ||
        key.includes("trust_device") ||
        key.includes("dont_remember")
      );
    })
  );
  storage.setItem(cookieName, JSON.stringify(filteredCookies));
  storage.setItem(localCacheName, "null");
}

export const crossDomainClient = (
  opts: {
    storage?: CrossDomainStorage;
    storagePrefix?: string;
    disableCache?: boolean;
  } = {}
) => {
  let store: ClientStore | null = null;
  const storagePrefix = opts?.storagePrefix || DEFAULT_STORAGE_PREFIX;
  const { cookieName, localCacheName } = getCookieStorageKeys(storagePrefix);
  const storage =
    opts?.storage || (typeof window !== "undefined" ? localStorage : undefined);

  return {
    id: "cross-domain",
    $InferServerPlugin: {} as ReturnType<typeof crossDomain>,
    getActions(_, $store) {
      store = $store;
      return {
        getCookie: () => {
          const cookie = storage?.getItem(cookieName);
          return getCookie(cookie || "{}");
        },
        updateSession: () => {
          $store.notify("$sessionSignal");
        },
        getSessionData: () => {
          const sessionData = storage?.getItem(localCacheName);
          if (!sessionData) return null;
          try {
            const parsed = JSON.parse(sessionData);
            if (
              parsed &&
              typeof parsed === "object" &&
              Object.keys(parsed).length === 0
            ) {
              return null;
            }
            return parsed;
          } catch {
            return null;
          }
        },
      };
    },
    fetchPlugins: [
      {
        id: "convex",
        name: "Convex",
        hooks: {
          async onSuccess(context) {
            if (!storage) {
              return;
            }
            const setCookie = context.response.headers.get(
              "set-better-auth-cookie"
            );
            if (setCookie) {
              const prevCookie = storage.getItem(cookieName);
              const toSetCookie = getSetCookie(
                setCookie || "",
                prevCookie ?? undefined
              );
              await storage.setItem(cookieName, toSetCookie);
              // Only notify when the session token value actually changed.
              // max-age recalculation with Date.now() causes the stored cookie
              // JSON to always differ, so comparing values directly prevents
              // infinite get-session polling loops.
              if (setCookie.includes(".session_token=")) {
                const parsed = parseSetCookieHeader(setCookie);
                let prevParsed: Record<string, StoredCookie> = {};
                try {
                  prevParsed = JSON.parse(prevCookie || "{}");
                } catch {
                  // noop
                }
                const tokenKey = [...parsed.keys()].find((key) =>
                  key.includes("session_token")
                );
                if (
                  tokenKey &&
                  prevParsed[tokenKey]?.value !== parsed.get(tokenKey)?.value
                ) {
                  store?.notify("$sessionSignal");
                }
              }
            }

            if (
              context.request.url.toString().includes("/get-session") &&
              !opts?.disableCache
            ) {
              const data = context.data;
              storage.setItem(localCacheName, JSON.stringify(data));
              if (data === null) {
                const storedCookies = readStoredCookieMap(storagePrefix, storage);
                const hasPendingTwoFactor = Object.keys(storedCookies).some(
                  (key) => key.includes("two_factor")
                );
                if (hasPendingTwoFactor) {
                  prepareTwoFactorChallengeState(storagePrefix, storage);
                } else {
                  storage.setItem(cookieName, "{}");
                }
              }
            }
          },
        },
        async init(url, options) {
          if (!storage) {
            return {
              url,
              options: options as BetterFetchOption,
            };
          }
          options = options || {};
          const storedCookie = storage.getItem(cookieName);
          const cookie = getCookie(storedCookie || "{}");
          options.credentials = "omit";
          options.headers = {
            ...options.headers,
            "Better-Auth-Cookie": cookie,
          };
          if (url.includes("/sign-out")) {
            await storage.setItem(cookieName, "{}");
            store?.atoms.session?.set({
              data: null,
              error: null,
              isPending: false,
            });
            storage.setItem(localCacheName, "{}");
          }
          return {
            url,
            options: options as BetterFetchOption,
          };
        },
      },
    ],
  } satisfies BetterAuthClientPlugin;
};
