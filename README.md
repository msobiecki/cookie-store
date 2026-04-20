# @msobiecki/cookie-store

Tiny, typed cookie API that works across browser, Express, and Next.js.

The package provides:

- One factory to create an adapter-specific cookie store.
- A Promise-based API with get, set, and delete methods.
- Optional React helpers for client-side apps.

## Installation

```bash
npm install @msobiecki/cookie-store
```

If you use the Express adapter, also install cookie-parser:

```bash
npm install cookie-parser
```

## Quick Start

### Browser

```ts
import { createCookieStore } from "@msobiecki/cookie-store";

const getCookieStore = createCookieStore({ adapter: "browser" });
const cookieStore = await getCookieStore();

await cookieStore.set("theme", "dark", {
  maxAge: 1000 * 60 * 60 * 24,
  path: "/",
});

const theme = await cookieStore.get("theme");
await cookieStore.delete("theme");
```

### Express

```ts
import express from "express";
import cookieParser from "cookie-parser";
import { createCookieStore } from "@msobiecki/cookie-store";

const app = express();
app.use(cookieParser());

const getCookieStore = createCookieStore({ adapter: "express" });

app.post("/theme", async (request, response) => {
  const cookieStore = await getCookieStore(request, response);

  await cookieStore.set("theme", "dark", {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    path: "/",
  });

  response.json({ ok: true });
});
```

### Next.js (App Router)

```ts
import { createCookieStore } from "@msobiecki/cookie-store";

const getCookieStore = createCookieStore({ adapter: "next" });

export async function POST() {
  const cookieStore = await getCookieStore();

  await cookieStore.set("theme", "dark", {
    maxAge: 1000 * 60 * 60 * 24,
    path: "/",
  });

  return Response.json({ ok: true });
}
```

## React Integration

Use CookieProvider in client components and read/update values with hooks.

```tsx
"use client";

import { CookieProvider, useCookie, useCookies } from "@msobiecki/cookie-store";

function ThemeControls() {
  const [theme, setTheme, removeTheme] = useCookie("theme", {
    maxAge: 1000 * 60 * 60 * 24,
  });

  const allCookies = useCookies();

  return (
    <div>
      <p>Theme: {theme ?? "not set"}</p>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle
      </button>
      <button onClick={() => removeTheme()}>Clear</button>
      <pre>{JSON.stringify(allCookies, null, 2)}</pre>
    </div>
  );
}

export default function App() {
  return (
    <CookieProvider>
      <ThemeControls />
    </CookieProvider>
  );
}
```

## API

### createCookieStore

```ts
createCookieStore({ adapter: "browser" | "express" | "next" });
```

Returns an async function:

- browser: call with no arguments.
- next: call with no arguments.
- express: call with request and response.

### CookieStore

```ts
interface CookieStore {
  get(name: string): Promise<string | undefined>;
  set(name: string, value: string, options?: CookieOptions): Promise<void>;
  delete(name: string, options?: CookieOptions): Promise<void>;
  getAll?(): Promise<Record<string, string>>;
  subscribeChange?(listener: (event: CookieChangeEvent) => void): void;
  unsubscribeChange?(listener: (event: CookieChangeEvent) => void): void;
}
```

Notes:

- getAll and change listeners are browser-focused capabilities.
- Browser adapter uses the Cookie Store API when available and falls back to document.cookie.

### CookieOptions

```ts
interface CookieOptions {
  path?: string;
  domain?: string;
  expires?: Date;
  maxAge?: number;
  sameSite?: "strict" | "lax" | "none";
  partitioned?: boolean;
  secure?: boolean;
  httpOnly?: boolean;
}
```

maxAge is in milliseconds.

## Exports

```ts
export { createCookieStore };
export { useCookie, useCookies };
export { CookieProvider };
```

## Development

```bash
npm install
npm run build
npm run test
npm run lint
```

## Examples

Runnable examples are included in:

- examples/express
- examples/vite-react-ts
- examples/vite-vanilla-ts

## License

MIT
