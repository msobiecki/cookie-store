import { type Request, type Response } from "express";

import { type CookieStore, type CookieOptions } from "../types/cookies";

function normalizeOptions(options: CookieOptions) {
  return {
    ...options,
    expires:
      typeof options.expires === "number"
        ? new Date(options.expires)
        : (options.expires ?? undefined),
  };
}

export function createExpressCookieStore(
  request: Request,
  response: Response,
): CookieStore {
  return {
    async get(name) {
      return request.cookies?.[name];
    },

    async set(name, value, options = {}) {
      response.cookie(name, value, normalizeOptions(options));
    },

    async delete(name) {
      response.clearCookie(name);
    },
  };
}
