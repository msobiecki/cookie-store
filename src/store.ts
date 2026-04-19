import { Request, Response } from "express";

type Adapter = "browser" | "express" | "next";

type Context<T> = T extends "express"
  ? [request: Request, response: Response]
  : never;

export function createCookieStore<T extends Adapter>({
  adapter,
}: {
  adapter: T;
}) {
  switch (adapter) {
    case "browser": {
      return async () => {
        const { createBrowserCookieStore } = await import("./adapters/browser");
        return createBrowserCookieStore();
      };
    }

    case "next": {
      return async () => {
        const { createNextCookieStore } = await import("./adapters/next");
        return createNextCookieStore();
      };
    }

    case "express": {
      return async (...context: Context<T>) => {
        if (!adapter) {
          throw new Error("Express requires { request, response } context");
        }

        const { createExpressCookieStore } = await import("./adapters/express");
        const [request, response] = context;

        return createExpressCookieStore(request, response);
      };
    }

    default: {
      throw new Error(`Unsupported adapter: ${adapter}`);
    }
  }
}
