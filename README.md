# @msobiecki/cookie-store

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/msobiecki/cookie-store/blob/master/LICENSE)

Tiny, typed cookie API that works across browser, Express, and Next.js.

![cookie-store](./docs/images/logotype.png)

## Features

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

To read/write signed cookies in Express, initialize cookie-parser with a secret:

```ts
app.use(cookieParser("your-secret"));
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
app.use(cookieParser("your-secret"));

const getCookieStore = createCookieStore({ adapter: "express" });

app.post("/theme", async (request, response) => {
  const cookieStore = await getCookieStore(request, response);

  await cookieStore.set("theme", "dark", {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    signed: true,
    path: "/",
  });

  const signedTheme = await cookieStore.get("theme", { signed: true });

  response.json({ ok: true, signedTheme });
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

TypeScript overloads return adapter-specific stores:

- browser -> BrowserCookieStore
- next -> NextCookieStore
- express -> ExpressCookieStore

### CookieStore

```ts
interface CookieStore {
  get(name: string): Promise<string | undefined>;
  set(name: string, value: string, options?: CookieOptions): Promise<void>;
  delete(name: string, options?: CookieOptions): Promise<void>;
  getAll(): Promise<Record<string, string>>;
}
```

Notes:

- Browser adapter adds change listeners via subscribeChange and unsubscribeChange.
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
}
```

maxAge is in milliseconds.

### Express Adapter Options

ExpressCookieStore extends the base store with signed-cookie reads and writes.

```ts
type ExpressCookieReadOptions = {
  signed?: boolean;
};

type ExpressCookieSetOptions = CookieOptions & {
  httpOnly?: boolean;
  signed?: boolean;
};
```

Usage:

```ts
await cookieStore.set("session", "abc", { signed: true, httpOnly: true });
const session = await cookieStore.get("session", { signed: true });
const allSigned = await cookieStore.getAll({ signed: true });
```

### Next Adapter Options

NextCookieStore supports extra options accepted by next/headers cookies API:

```ts
type NextCookieOptions = CookieOptions & {
  httpOnly?: boolean;
  priority?: "low" | "medium" | "high";
};
```

## Exports

```ts
export { createCookieStore };
export { useCookie, useCookies };
export { CookieProvider };
```

## Examples

Runnable examples are included in:

- examples/express
- examples/vite-react-ts
- examples/vite-vanilla-ts

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

## License

See [LICENSE](./LICENSE) file for details.
