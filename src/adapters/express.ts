import {
  type Request,
  type Response,
  CookieOptions as ExpressCookieOptions,
} from "express";

import { type CookieStore, type CookieOptions } from "../types/cookies";

interface ExpressCookieReadOptions {
  signed?: boolean;
}

type ExpressCookieSetOptions = CookieOptions & {
  httpOnly?: boolean;
  signed?: boolean;
};

export interface ExpressCookieStore extends CookieStore {
  get(
    name: string,
    options?: ExpressCookieReadOptions,
  ): Promise<string | undefined>;
  set(
    name: string,
    value: string,
    options?: ExpressCookieSetOptions,
  ): Promise<void>;
  delete(name: string, options?: ExpressCookieSetOptions): Promise<void>;
  getAll(options?: ExpressCookieReadOptions): Promise<Record<string, string>>;
}

function normalizeSetOptions(options: ExpressCookieSetOptions) {
  const now = Date.now();

  const expires =
    options.maxAge !== undefined && options.expires === undefined
      ? new Date(now + options.maxAge)
      : options.expires;

  const maxAge =
    options.expires !== undefined && options.maxAge === undefined
      ? Math.max(0, Math.floor(options.expires.getTime() - now))
      : options.maxAge;

  const result: Partial<ExpressCookieOptions> = {};

  if (options.path) result.path = options.path;
  if (options.domain) result.domain = options.domain;
  if (options.sameSite) result.sameSite = options.sameSite;
  if (options.partitioned) result.partitioned = options.partitioned;
  if (options.secure) result.secure = options.secure;
  if (options.httpOnly) result.httpOnly = options.httpOnly;
  if (options.signed !== undefined) result.signed = options.signed;
  if (expires !== undefined) result.expires = expires;
  if (maxAge !== undefined) result.maxAge = maxAge;

  return result;
}

export function createExpressCookieStore(
  request: Request,
  response: Response,
): ExpressCookieStore {
  const defaultOptions = {
    path: "/",
  } satisfies ExpressCookieSetOptions;

  return {
    async get(name, { signed }: ExpressCookieReadOptions = {}) {
      if (signed) {
        return request.signedCookies[name];
      }
      return request.cookies[name];
    },

    async set(name, value, optionsOverride) {
      const options = normalizeSetOptions({
        ...defaultOptions,
        ...optionsOverride,
      });

      response.cookie(name, value, options);
    },

    async delete(name, optionsOverride) {
      const options = normalizeSetOptions({
        ...defaultOptions,
        ...optionsOverride,
      });

      response.clearCookie(name, options);
    },

    async getAll({ signed }: ExpressCookieReadOptions = {}) {
      if (signed) {
        return request.signedCookies;
      }
      return request.cookies;
    },
  };
}
