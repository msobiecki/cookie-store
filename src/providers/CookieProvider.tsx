"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import { type CookieStore, type CookieOptions } from "../types/cookies";

import { createCookieStore } from "../store";

type CookieState = Record<string, string | undefined>;

export interface CookieContextValue {
  cookies: CookieState;
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options?: CookieOptions) => Promise<void>;
  remove: (name: string, options?: CookieOptions) => Promise<void>;
}

export const CookieContext = createContext<CookieContextValue | null>(null);

const getCookieStore = createCookieStore({ adapter: "browser" });

export const CookieProvider = ({
  children,
  initialCookies = {},
}: {
  children: ReactNode;
  initialCookies?: Record<string, string>;
}) => {
  const [cookieStore, setCookieStore] = useState<CookieStore | null>(null);
  const [cookies, setCookies] = useState<CookieState>(initialCookies);

  const get = useCallback((name: string) => cookies[name], [cookies]);

  const set = useCallback(
    async (name: string, value: string, options?: CookieOptions) => {
      if (!cookieStore) return;

      // eslint-disable-next-line compat/compat
      await cookieStore.set(name, value, options);

      setCookies((previous) => ({
        ...previous,
        [name]: value,
      }));
    },
    [cookieStore],
  );

  const remove = useCallback(
    async (name: string, options?: CookieOptions) => {
      if (!cookieStore) return;

      // eslint-disable-next-line compat/compat
      await cookieStore.delete(name, options);

      setCookies((previous) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [name]: _, ...rest } = previous;
        return rest;
      });
    },
    [cookieStore],
  );

  useEffect(() => {
    (async () => {
      const store = await getCookieStore();
      setCookieStore(store);

      const all = await store.getAll?.();
      if (all) setCookies(all);
    })();
  }, []);

  useEffect(() => {
    if (!("cookieStore" in globalThis)) {
      return undefined;
    }

    const handler = (event: CookieChangeEvent) => {
      setCookies((previous) => {
        let next: CookieState = { ...previous };

        if (event.changed.length > 0) {
          const updates: CookieState = {};

          event.changed.forEach((cookieEntry) => {
            if (!cookieEntry.name) return;
            updates[cookieEntry.name] = cookieEntry.value ?? "";
          });

          next = { ...next, ...updates };
        }

        event.deleted.forEach((cookieEntry) => {
          if (!cookieEntry.name) return;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [cookieEntry.name]: _, ...rest } = next;
          next = rest;
        });

        return next;
      });
    };

    globalThis.cookieStore.addEventListener("change", handler);

    return () => {
      globalThis.cookieStore.removeEventListener("change", handler);
    };
  }, []);

  return (
    <CookieContext.Provider value={{ cookies, get, set, remove }}>
      {children}
    </CookieContext.Provider>
  );
};
