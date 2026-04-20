"use client";

import { useCookieContext } from "../providers/use-cookie-context";

export function useCookies() {
  const { cookies } = useCookieContext();

  return cookies;
}
