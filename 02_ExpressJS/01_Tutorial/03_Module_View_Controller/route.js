// ─────────────────────────────────────────────
// route.js — Route definitions
// This file maps URLs to their controller functions
// Separating routes from app.js keeps the code clean and modular
// ─────────────────────────────────────────────

// Import Router from Express
// Router() creates a mini Express app that handles only routing
// It keeps routes organized and separate from the main app
import { Router } from "express";

// Import controller functions from controllers.js
// Each controller handles the logic for a specific route
import { userController, searchController } from "./controllers.js";

// Create a new Router instance
// Think of it as a group of related routes bundled together
const router = Router();

// ── Route Definitions ───────────────────────────────

// GET /user/:id
// ":id" is a dynamic URL parameter — it can be any value
// Examples:
//   GET /user/42    → req.params.id = "42"
//   GET /user/101   → req.params.id = "101"
// Handled by userController in controller.js
router.get("/user/:id", userController);

// GET /search?username=john
// No dynamic segment here — data is passed as a query string
// Examples:
//   GET /search?username=john  → req.query.username = "john"
//   GET /search?username=arjun → req.query.username = "arjun"
// Handled by searchController in controller.js
router.get("/search", searchController);

// Export the router as the default export
// Imported in app.js and mounted with app.use("/", router)
export default router;
