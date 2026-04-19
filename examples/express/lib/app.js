import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";

import indexRouter from "./routes/index.js";

/**
 * Main Express application instance.
 */
const app = express();

/**
 * Middleware: Parses incoming JSON request bodies.
 * Makes `req.body` available when Content-Type is application/json.
 */
app.use(json());

/**
 * Middleware: Parses URL-encoded request bodies (form submissions).
 *
 * @param {object} options
 * @param {boolean} options.extended - Allows rich objects and arrays if true
 */
app.use(urlencoded({ extended: false }));

/**
 * Middleware: Parses Cookie header and populates `req.cookies`.
 * Required for reading cookies in routes.
 */
app.use(cookieParser());

/**
 * Mount root router.
 * All routes defined in indexRouter will be available under "/".
 */
app.use("/", indexRouter);

export default app;
