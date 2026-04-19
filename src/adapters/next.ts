import { type CookieStore, type CookieOptions } from "../types/cookies";

function normalizeOptions(options: CookieOptions) {
  const now = Date.now();

  const expires =
    options.maxAge !== undefined && options.expires === undefined
      ? new Date(now + options.maxAge)
      : options.expires;

  const maxAge =
    options.expires !== undefined && options.maxAge === undefined
      ? Math.max(0, Math.floor(options.expires.getTime() - now))
      : options.maxAge;

  return {
    path: options.path,
    domain: options.domain,
    sameSite: options.sameSite,
    secure: options.secure,
    httpOnly: options.httpOnly,
    expires,
    maxAge,
  };
}

export async function createNextCookieStore(): Promise<CookieStore> {
  const defaultOptions = {
    path: "/",
  } satisfies CookieOptions;

  const { cookies } = await import("next/headers");
  const store = await cookies();

  return {
    async get(name) {
      return store.get(name)?.value;
    },

    async set(name, value, optionsOverride) {
      const options = normalizeOptions({
        ...defaultOptions,
        ...optionsOverride,
      });

      store.set(name, value, options);
    },

    async delete(name, optionsOverride) {
      const options = normalizeOptions({
        ...defaultOptions,
        ...optionsOverride,
      });

      store.delete({
        name,
        ...options,
      });
    },
  };
}
