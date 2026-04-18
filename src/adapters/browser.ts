import { type CookieStore } from "../types/cookies";

export function createBrowserCookieStore(): CookieStore {
  return {
    async get(name) {
      if ("cookieStore" in globalThis) {
        const cookie = await globalThis.cookieStore.get(name);
        return cookie?.value;
      }

      return document.cookie
        .split("; ")
        .find((c) => c.startsWith(`${name}=`))
        ?.split("=")[1];
    },

    async set(name, value, options = {}) {
      if ("cookieStore" in globalThis) {
        await globalThis.cookieStore.set({
          name,
          value,
          ...options,
        });
        return;
      }

      // eslint-disable-next-line unicorn/no-document-cookie
      document.cookie = `${name}=${value}`;
    },

    async delete(name) {
      if ("cookieStore" in globalThis) {
        await globalThis.cookieStore.delete(name);
        return;
      }

      // eslint-disable-next-line unicorn/no-document-cookie
      document.cookie = `${name}=; Max-Age=0`;
    },
  };
}
