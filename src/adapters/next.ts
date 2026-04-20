import { type CookieStore, type CookieOptions } from "../types/cookies";

interface NextCookieOptions extends CookieOptions {
  httpOnly?: boolean;
  priority?: "low" | "medium" | "high";
}

export interface NextCookieStore extends CookieStore {
  get(name: string): Promise<string | undefined>;
  set(name: string, value: string, options?: NextCookieOptions): Promise<void>;
  delete(name: string, options?: NextCookieOptions): Promise<void>;
  getAll(): Promise<Record<string, string>>;
}

function normalizeOptions(options: NextCookieOptions) {
  const now = Date.now();

  const expires =
    options.maxAge !== undefined && options.expires === undefined
      ? new Date(now + options.maxAge)
      : options.expires;

  const maxAge =
    options.expires !== undefined && options.maxAge === undefined
      ? Math.max(0, Math.floor(options.expires.getTime() - now))
      : options.maxAge;

  const result: Partial<NextCookieOptions> = {};

  if (options.path) result.path = options.path;
  if (options.domain) result.domain = options.domain;
  if (options.sameSite) result.sameSite = options.sameSite;
  if (options.partitioned) result.partitioned = options.partitioned;
  if (options.secure) result.secure = options.secure;
  if (options.httpOnly) result.httpOnly = options.httpOnly;
  if (options.priority !== undefined) result.priority = options.priority;
  if (expires !== undefined) result.expires = expires;
  if (maxAge !== undefined) result.maxAge = maxAge;

  return result;
}

export async function createNextCookieStore(): Promise<NextCookieStore> {
  const defaultOptions = {
    path: "/",
  } satisfies NextCookieOptions;

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

    async getAll() {
      const allCookies = store.getAll();
      const result: Record<string, string> = {};
      allCookies.forEach((cookie) => {
        result[cookie.name] = cookie.value;
      });
      return result;
    },
  };
}
