import { type CookieStore, type CookieOptions } from "../types/cookies";

function normalizeOptions(options: CookieOptions) {
  return {
    ...options,
    expires:
      typeof options.expires === "number"
        ? options.expires
        : (options.expires ?? undefined),
  };
}

export async function createNextCookieStore(): Promise<CookieStore> {
  const { cookies } = await import("next/headers");
  const store = await cookies();

  return {
    async get(name) {
      return store.get(name)?.value;
    },

    async set(name, value, options = {}) {
      store.set(name, value, normalizeOptions(options));
    },

    async delete(name) {
      store.delete(name);
    },
  };
}
