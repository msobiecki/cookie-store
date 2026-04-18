"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createBrowserCookieStore } from "../adapters";

type CookieState = Record<string, string | undefined>;

export interface CookieContextValue {
  cookies: CookieState;
  get: (name: string) => string | undefined;
  set: (name: string, value: string) => Promise<void>;
  remove: (name: string) => Promise<void>;
}

export const CookieContext = createContext<CookieContextValue | null>(null);

export const CookieProvider = ({
  children,
  initialCookies = {},
}: {
  children: ReactNode;
  initialCookies?: Record<string, string>;
}) => {
  const cookieStore = useMemo(() => createBrowserCookieStore(), []);

  const [cookies, setCookies] = useState<CookieState>(initialCookies);

  const get = useCallback((name: string) => cookies[name], [cookies]);

  const set = useCallback(
    async (name: string, value: string) => {
      await cookieStore.set(name, value);

      setCookies((previous) => ({
        ...previous,
        [name]: value,
      }));
    },
    [cookieStore],
  );

  const remove = useCallback(
    async (name: string) => {
      await cookieStore.delete(name);

      setCookies((previous) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [name]: _, ...rest } = previous;
        return rest;
      });
    },
    [cookieStore],
  );

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
