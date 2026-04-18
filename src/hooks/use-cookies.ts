import { useContext } from "react";

import { CookieContext } from "../providers/CookieProvider";

export function useCookies() {
  const context = useContext(CookieContext);

  if (!context) {
    throw new Error("useCookies must be used inside CookieProvider");
  }

  return context;
}
