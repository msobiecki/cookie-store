import { Request, Response } from "express";

type Environment = "browser" | "express" | "next";

type Context<T> = T extends "express"
  ? { request: Request; response: Response }
  : never;

export async function createCookieStore<T extends Environment>(
  environment: T,
  context?: Context<T>,
) {
  switch (environment) {
    case "browser": {
      const { createBrowserCookieStore } = await import("./adapters/browser");
      return createBrowserCookieStore();
    }

    case "next": {
      const { createNextCookieStore } = await import("./adapters/next");
      return createNextCookieStore();
    }

    case "express": {
      if (!context) {
        throw new Error("Express requires { request, response } context");
      }

      const { createExpressCookieStore } = await import("./adapters/express");
      const { request, response } = context;

      return createExpressCookieStore(request, response);
    }

    default: {
      throw new Error(`Unsupported environment: ${environment}`);
    }
  }
}
