// Temporaty CookieStore interface to be used in the provider and browser adapter
// until the spec is finalized and we can use the official types from TypeScript lib.dom.d.ts
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
  subscribeChange?(listener: (event: CookieChangeEvent) => void): void;
  unsubscribeChange?(listener: (event: CookieChangeEvent) => void): void;
}
