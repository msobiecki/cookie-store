import { Router } from "express";
import httpStatus from "http-status";
import { createCookieStore } from "@msobiecki/cookie-store";

const router = Router();

const { BAD_REQUEST } = httpStatus;

const getCookieStore = createCookieStore({ adapter: "express" });

/**
 * GET /
 *
 * Reads the "theme" cookie and returns its value if present.
 * If the cookie is not set, returns a default message.
 */
router.get("/", async (request, response) => {
  const cookieStore = await getCookieStore(request, response);

  const theme = await cookieStore.get("theme");
  if (theme) {
    return response.json({ message: `Current theme is ${theme}` });
  }

  return response.json({ message: "No theme set" });
});

/**
 * POST /
 *
 * Sets the "theme" cookie.
 * Expects { theme } in request body.
 * Returns 400 if theme is missing.
 */
router.post("/", async (request, response) => {
  const cookieStore = await getCookieStore(request, response);

  const { theme } = request.body;
  if (!theme) {
    return response.status(BAD_REQUEST).json({ message: "Theme is required" });
  }

  await cookieStore.set("theme", theme, {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });

  return response.json({ message: `Theme set to ${theme}` });
});

/**
 * DELETE /
 *
 * Deletes the "theme" cookie.
 */
router.delete("/", async (request, response) => {
  const cookieStore = await getCookieStore(request, response);

  await cookieStore.delete("theme");

  return response.json({ message: "Theme deleted" });
});

export default router;
