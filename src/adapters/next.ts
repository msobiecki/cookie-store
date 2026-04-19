import { type CookieStore, type CookieOptions } from "../types/cookies";

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
      const options: CookieOptions = {
        ...defaultOptions,
        ...optionsOverride,
      };

      store.set(name, value, options);
    },

    async delete(name, optionsOverride) {
      const options: CookieOptions = {
        ...defaultOptions,
        ...optionsOverride,
      };

      store.delete({
        name,
        ...options,
      });
    },
  };
}
