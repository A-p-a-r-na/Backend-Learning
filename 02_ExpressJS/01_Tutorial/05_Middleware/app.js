import express from "express";

const app = express();
const PORT = 3000;

// express.json() is built-in middleware that parses incoming JSON request bodies
// It reads the body and makes it available as req.body
// MUST be registered before any route that reads req.body
app.use(express.json());

// ─────────────────────────────────────────────
// TYPE 1 — Application-Level Middleware
// ─────────────────────────────────────────────
// Registered with app.use() and NO path argument
// Runs on EVERY incoming request regardless of URL or HTTP method
// Common uses: logging, attaching request IDs, setting headers globally
//
// Execution order:
//   GET  /user    → this middleware runs first → then the /user GET handler
//   POST /user    → this middleware runs first → then the /user POST handler
//   GET  /search  → this middleware runs first → then the /search GET handler
app.use((req, res, next) => {
  console.log("Application-level middleware");
  // next() passes control to the next middleware or route handler in the chain
  // Without calling next() here, the request would hang and never reach any route
  next();
});

// GET /user — simple route that sends a JSON response
// This runs AFTER the application-level middleware above calls next()
app.get("/user", (req, res) => {
  res.json({
    message: `user request successful`,
  });
});

// POST /user — reads data from the request body
// req.body is available here because express.json() is registered above
// Without express.json() → req.body would be undefined
//
// Example request body: { "name": "Alice", "age": 25 }
app.post("/user", (req, res) => {
  const { name, age } = req.body; // destructure fields from the parsed JSON body
  res.json({
    message: `Post request for ${name} with age ${age} is successful`,
  });
});

// ─────────────────────────────────────────────
// TYPE 2 — Path-Specific Middleware
// ─────────────────────────────────────────────
// Registered with app.use() and a PATH argument
// Only runs when the request URL starts with the given path
// Matches: /search, /search/, /search?q=hello, /search/results
// Skips:   /user, /about, /welcome (different paths)
//
// Note: this still runs for ALL HTTP methods matching the path
//   GET  /search → runs ✅
//   POST /search → runs ✅
//   GET  /user   → skips ❌
app.use("/search", (req, res, next) => {
  console.log("Path-specific middleware");
  // Must call next() to pass control to the actual /search route handler below
  next();
});

// GET /search — only reached after the path-specific middleware above calls next()
app.get("/search", (req, res) => {
  res.json({
    message: `Search request successful`,
  });
});

// ─────────────────────────────────────────────
// TYPE 3 — Route-Level Middleware
// ─────────────────────────────────────────────
// Passed directly as an argument inside a specific route definition
// Only runs for that exact route — not applied globally
// Can pass multiple middleware functions before the final handler:
//   app.get("/path", middleware1, middleware2, finalHandler)

// isAuthenticated is a custom middleware function
// It checks the Authorization header and either:
//   a) calls next() to allow the request through, OR
//   b) sends a 401 response to stop the chain
//
// req.headers["authorization"] reads the "Authorization" HTTP header
// sent by the client — e.g. { "Authorization": "secret-token" }
function isAuthenticated(req, res, next) {
  const token = req.headers["authorization"];

  if (token === "secret-token") {
    // Token matches — user is authenticated
    // Call next() to proceed to the actual route handler
    next();
  } else {
    // Token is missing or wrong — stop the chain immediately
    // Return 401 Unauthorized — do NOT call next() here
    // If next() were called after res.json(), Express would throw
    // a "Cannot set headers after they are sent" error
    res.status(401).json({ error: "Unauthorized" });
  }
}

// GET /welcome — protected route
// Request flow:
//   1. isAuthenticated runs first
//      → token valid?   → next() → step 2
//      → token invalid? → 401 sent → chain stops here
//   2. Final handler runs and sends the welcome message
app.get("/welcome", isAuthenticated, (req, res) => {
  res.json({ message: "Welcome to the dashboard!" });
});

// ─────────────────────────────────────────────
// TYPE 4 — Router-Level Middleware
// ─────────────────────────────────────────────
// Uses express.Router() to group related routes and apply middleware
// to only that group — without affecting the rest of the app
//
// Best used when you want to protect or configure a whole section:
//
//   import { Router } from "express";
//   const router = Router();
//
//   router.use(isAuthenticated);      // protects ALL routes on this router
//   router.get("/dashboard", handler);
//   router.get("/settings",  handler);
//
//   app.use("/admin", router);        // mount at /admin prefix
//   → GET /admin/dashboard and GET /admin/settings are both protected
//
// (Not implemented in this file — shown here for reference)

// ─────────────────────────────────────────────
// TYPE 5 — Error-Handling Middleware
// ─────────────────────────────────────────────
// Identified by Express via its FOUR parameters: (err, req, res, next)
// The extra first parameter 'err' is what makes it an error handler
// MUST be registered AFTER all routes — Express won't call it otherwise
//
// It is triggered when:
//   a) A route throws a synchronous error  → Express catches it automatically
//   b) A route calls next(err)             → Express jumps here directly
//
// ⚠️ IMPORTANT: In this file the error handler is registered BEFORE
// the /error route — so errors from /error won't reach it.
// Move app.use(err handler) to AFTER all routes to fix this.
app.use((err, req, res, next) => {
  // err.stack contains the full error message and where it was thrown
  // Log it server-side for debugging (never expose stack to client in production)
  console.error(err);

  res.status(500).json({ error: "Internal Server Error" });
});

// GET /error — intentionally throws a synchronous error to test error handling
// When a synchronous error is thrown inside a route handler,
// Express automatically catches it and forwards it to the error-handling middleware
//
// ⚠️ This route is defined AFTER the error handler above — which means
// the error handler registered above will NOT catch errors from this route
// because Express processes middleware top-to-bottom.
// FIX: move the error handler app.use() to the very bottom of the file
app.get("/error", (req, res) => {
  // throw inside a synchronous route → Express catches → passes to error handler
  throw new Error("This is test error");
});

// ─────────────────────────────────────────────
// CORRECT ORDER (fix for this file)
// ─────────────────────────────────────────────
// app.use(express.json())       ← body parser
// app.use(globalMiddleware)     ← application-level middleware
// app.use("/path", middleware)  ← path-specific middleware
// app.get("/route", handler)    ← all your routes
// app.get("/error", handler)    ← error-triggering routes
// app.use((err, req, res, next) ← error handler LAST ✅

app.listen(PORT, () => {
  console.log(`Server running on port number ${PORT}`);
});
