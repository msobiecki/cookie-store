import {
  type Request,
  type Response,
  CookieOptions as ExpressCookieOptions,
} from "express";

import { type CookieStore, type CookieOptions } from "../types/cookies";

function normalizeOptions(options: CookieOptions): ExpressCookieOptions {
  const now = Date.now();

  const expires =
    options.maxAge !== undefined && options.expires === undefined
      ? new Date(now + options.maxAge)
      : options.expires;

  const maxAge =
    options.expires !== undefined && options.maxAge === undefined
      ? Math.max(0, Math.floor(options.expires.getTime() - now))
      : options.maxAge;

  return {
    path: options.path,
    domain: options.domain,
    sameSite: options.sameSite,
    secure: options.secure,
    httpOnly: options.httpOnly,
    expires,
    maxAge,
  };
}

export function createExpressCookieStore(
  request: Request,
  response: Response,
): CookieStore {
  const defaultOptions = {
    path: "/",
  } satisfies CookieOptions;

  return {
    async get(name) {
      return request.cookies[name];
    },

    async set(name, value, optionsOverride) {
      const options = normalizeOptions({
        ...defaultOptions,
        ...optionsOverride,
      });

      response.cookie(name, value, options);
    },

    async delete(name, optionsOverride) {
      const options = normalizeOptions({
        ...defaultOptions,
        ...optionsOverride,
      });

      response.clearCookie(name, options);
    },
  };
}
