"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import { type CookieOptions } from "../types/cookies";
import { createCookieStore } from "../store";

import { type BrowserCookieStore } from "../adapters/browser";

type CookieState = Record<string, string | undefined>;

export interface CookieContextValue {
  cookies: CookieState;
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options?: CookieOptions) => Promise<void>;
  remove: (name: string, options?: CookieOptions) => Promise<void>;
}

export const CookieContext = createContext<CookieContextValue | null>(null);

export const CookieProvider = ({
  children,
  initialCookies = {},
}: {
  children: ReactNode;
  initialCookies?: Record<string, string>;
}) => {
  const [cookieStore, setCookieStore] = useState<BrowserCookieStore | null>(
    null,
  );
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
    let cancelled = false;

    const init = async () => {
      const getCookieStore = createCookieStore({ adapter: "browser" });
      const store = await getCookieStore();

      if (cancelled) return;

      setCookieStore(store);

      const all = await store.getAll?.();
      if (all && !cancelled) {
        setCookies(all);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!cookieStore) {
      return undefined;
    }

    const handler = (event: CookieChangeEvent) => {
      console.log("Cookie change event:", event);
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

    // eslint-disable-next-line compat/compat
    cookieStore.subscribeChange(handler);

    return () => {
      // eslint-disable-next-line compat/compat
      cookieStore.unsubscribeChange(handler);
    };
  }, [cookieStore]);

  return (
    <CookieContext.Provider
      value={{
        cookies,
        get,
        set,
        remove,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
};
