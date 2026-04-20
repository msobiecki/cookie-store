import { Request, Response } from "express";

import { type BrowserCookieStore } from "./adapters/browser";
import { type ExpressCookieStore } from "./adapters/express";
import { type NextCookieStore } from "./adapters/next";

type Adapter = "browser" | "express" | "next";

export function createCookieStore({
  adapter,
}: {
  adapter: "browser";
}): () => Promise<BrowserCookieStore>;

// eslint-disable-next-line no-redeclare
export function createCookieStore({
  adapter,
}: {
  adapter: "next";
}): () => Promise<NextCookieStore>;

// eslint-disable-next-line no-redeclare
export function createCookieStore({
  adapter,
}: {
  adapter: "express";
}): (request: Request, response: Response) => Promise<ExpressCookieStore>;

// eslint-disable-next-line no-redeclare
export function createCookieStore({ adapter }: { adapter: Adapter }) {
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
      return async (...context: [request: Request, response: Response]) => {
        if (!context?.length) {
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
