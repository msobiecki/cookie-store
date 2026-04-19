export interface CookieOptions {
  path?: string;
  domain?: string;
  expires?: Date;
  maxAge?: number;
  sameSite?: "strict" | "lax" | "none";
  partitioned?: boolean;
  secure?: boolean;
  httpOnly?: boolean;
}

export interface CookieStore {
  get(name: string): Promise<string | undefined>;
  set(name: string, value: string, options?: CookieOptions): Promise<void>;
  delete(name: string, options?: CookieOptions): Promise<void>;
  getAll?(): Promise<Record<string, string>>;
}
