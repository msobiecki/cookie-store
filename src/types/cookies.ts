export interface CookieOptions {
  path?: string;
  domain?: string;
  expires?: number | null;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export interface CookieStore {
  get(name: string): Promise<string | undefined>;
  set(name: string, value: string, options?: CookieOptions): Promise<void>;
  delete(name: string): Promise<void>;
}
