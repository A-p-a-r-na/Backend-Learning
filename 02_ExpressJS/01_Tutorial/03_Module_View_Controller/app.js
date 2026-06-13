// ─────────────────────────────────────────────
// app.js — Entry point of the Express application
// ─────────────────────────────────────────────

// Import the Express framework using ES Module syntax
// Express simplifies building web servers and APIs
import express from "express";

// Import the router from route.js
// The router contains all the defined URL routes for this app
import router from "./route.js";

// Create an Express application instance
// 'app' is the main object — used to configure middleware, routes, etc.
const app = express();

// Define the port number the server will listen on
// 3000 is the convention for local development
// In production, this would typically come from process.env.PORT
const PORT = 3000;

// Mount the router on the root path "/"
// This means ALL routes defined in router will be accessible from "/"
// Example: router has "/user/:id" → accessible at "http://localhost:3000/user/:id"
// app.use(path, middleware) → registers middleware for a specific path
app.use("/", router);

// Start the HTTP server and listen for incoming requests on PORT
// The callback runs once the server is successfully started
// Template literal logs the full URL for easy clicking in terminal
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
