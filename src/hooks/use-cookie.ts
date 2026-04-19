"use client";

import { useMemo, useCallback } from "react";

import { type CookieOptions } from "../types/cookies";

import { useCookies } from "./use-cookies";

export function useCookie(name: string, options?: CookieOptions) {
  const { get, set, remove } = useCookies();

  const value = useMemo(() => get(name), [name, get]);

  const setValue = useCallback(
    async (newValue: string) => {
      await set(name, newValue, options);
    },
    [name, set, options],
  );

  const removeValue = useCallback(async () => {
    await remove(name, options);
  }, [name, remove, options]);

  return [value, setValue, removeValue] as const;
}
