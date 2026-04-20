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

  const result: Partial<CookieOptions> = {};

  if (options.path) result.path = options.path;
  if (options.domain) result.domain = options.domain;
  if (options.sameSite) result.sameSite = options.sameSite;
  if (options.partitioned) result.partitioned = options.partitioned;
  if (options.secure) result.secure = options.secure;
  if (options.httpOnly) result.httpOnly = options.httpOnly;
  if (expires !== undefined) result.expires = expires;
  if (maxAge !== undefined) result.maxAge = maxAge;

  return result;
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
