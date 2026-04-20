import { type CookieStore, type CookieOptions } from "../types/cookies";

function hasCookieStore(): boolean {
  return (
    typeof globalThis !== "undefined" &&
    "cookieStore" in globalThis &&
    typeof globalThis.cookieStore?.get === "function" &&
    typeof globalThis.cookieStore?.set === "function" &&
    typeof globalThis.cookieStore?.delete === "function"
  );
}

function normalizeOptions(options: CookieOptions) {
  const now = Date.now();

  const expires =
    options.maxAge !== undefined && options.expires === undefined
      ? new Date(now + options.maxAge).getTime()
      : options.expires?.getTime();

  let maxAge: number | undefined;
  if (options.expires !== undefined && options.maxAge === undefined) {
    maxAge = Math.max(0, Math.floor((options.expires.getTime() - now) / 1000));
  } else if (options.maxAge !== undefined) {
    maxAge = options.maxAge / 1000;
  }

  const result: Partial<Omit<CookieOptions, "expires"> & { expires?: number }> =
    {};

  if (options.path) result.path = options.path;
  if (options.domain) result.domain = options.domain;
  if (options.sameSite) result.sameSite = options.sameSite;
  if (options.partitioned) result.partitioned = options.partitioned;
  if (options.secure) result.secure = options.secure;
  if (options.httpOnly) result.httpOnly = options.httpOnly;
  if (expires !== undefined) result.expires = expires;
  if (maxAge !== undefined) result.maxAge = maxAge;

  return result;
}

function parseDocumentCookies(): Record<string, string> {
  if (typeof document === "undefined") return {};

  const result: Record<string, string> = {};

  document.cookie.split("; ").forEach((part) => {
    if (!part.includes("=")) return;

    const [key, ...rest] = part.split("=");
    if (!key) return;

    result[key] = rest.join("=");
  });

  return result;
}

function formatDocumentCookieExpires(expires: number) {
  const date = new Date(expires);
  return date.toUTCString();
}

export function createBrowserCookieStore(): CookieStore {
  const defaultOptions = {
    path: "/",
  } satisfies CookieOptions;

  return {
    async get(name) {
      if (hasCookieStore()) {
        try {
          const cookie = await globalThis.cookieStore.get(name);
          return cookie?.value;
        } catch (error) {
          console.warn("cookieStore.get failed, falling back:", error);
        }
      }

      return parseDocumentCookies()[name];
    },

    async set(name, value, optionsOverride) {
      const options = normalizeOptions({
        ...defaultOptions,
        ...optionsOverride,
      });

      if (hasCookieStore()) {
        try {
          await globalThis.cookieStore.set({
            name,
            value,
            ...options,
          });
          return;
        } catch (error) {
          console.warn("cookieStore.set failed, falling back:", error);
        }
      }

      // Fallback (legacy browsers)
      const path = options.path ?? defaultOptions.path;
      let cookie = `${name}=${value}; path=${path}`;

      if (options?.expires) {
        cookie += `; expires=${formatDocumentCookieExpires(options.expires)}`;
      }

      if (options?.maxAge) {
        cookie += `; max-age=${options.maxAge}`;
      }

      if (options?.sameSite) {
        cookie += `; samesite=${options.sameSite}`;
      }

      if (options?.secure) {
        cookie += "; secure";
      }

      // eslint-disable-next-line unicorn/no-document-cookie
      document.cookie = cookie;
    },

    async delete(name, optionsOverride) {
      const options = normalizeOptions({
        ...defaultOptions,
        ...optionsOverride,
      });

      if (hasCookieStore()) {
        try {
          await globalThis.cookieStore.delete({
            name,
            ...options,
          });
          return;
        } catch (error) {
          console.warn("cookieStore.delete failed, falling back:", error);
        }
      }

      // Fallback (legacy browsers)
      const path = options.path ?? defaultOptions.path;
      let cookie = `${name}=; path=${path}`;

      if (options?.domain) {
        cookie += `; domain=${options.domain}`;
      }

      cookie += "; max-age=0";

      if (options?.sameSite) {
        cookie += `; samesite=${options.sameSite}`;
      }

      if (options?.secure) {
        cookie += "; secure";
      }

      // eslint-disable-next-line unicorn/no-document-cookie
      document.cookie = cookie;
    },

    async getAll() {
      if (hasCookieStore()) {
        try {
          const cookies = await globalThis.cookieStore.getAll();

          return Object.fromEntries(
            cookies
              .filter((cookie) => cookie.name)
              .map((cookie) => [cookie.name, cookie.value ?? ""] as const),
          );
        } catch (error) {
          console.warn("cookieStore.getAll failed, falling back:", error);
        }
      }

      return parseDocumentCookies();
    },
  };
}
