"use client";

import { useContext } from "react";

import { CookieContext } from "./CookieProvider";

export function useCookieContext() {
  const context = useContext(CookieContext);

  if (!context) {
    throw new Error("useCookieContext must be used inside CookieProvider");
  }

  return context;
}
