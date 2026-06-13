// Import the Express framework
// express() gives us the tools to create a server, define routes, and handle requests
import express from "express";

// Create an Express application instance
// 'app' is the core object — all routes and middleware are registered on it
const app = express();

// Define the port number the server will listen on
// 3000 is the convention for local development
const PORT = 3000;

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
// A route = a combination of an HTTP method + a URL path + a handler function
// Syntax: app.METHOD(PATH, HANDLER)
//   METHOD  → HTTP verb  : get, post, put, patch, delete
//   PATH    → URL string : "/", "/about", "/user/:id"
//   HANDLER → function   : (req, res) => { ... }

// GET /
// The root route — responds when the user visits http://localhost:3000/
// req → the incoming request object (contains headers, params, body, etc.)
// res → the outgoing response object (used to send data back to the client)
app.get("/", (req, res) => {
  res.send("Hello, ExpressJS!"); // res.send() sends a plain text/HTML response
});

// GET /about
// A separate route for the "/about" page
// Each route is independent — has its own path and handler
app.get("/about", (req, res) => {
  res.send("Hello, from About!");
});

// ─────────────────────────────────────────────
// DYNAMIC ROUTE — Route Parameters (:param)
// ─────────────────────────────────────────────
// A route parameter is a named segment in the URL prefixed with ":"
// It acts like a variable — whatever value is in that position of the URL
// gets captured and stored in req.params
//
// Example URLs that match this route:
//   http://localhost:3000/user/42
//   http://localhost:3000/user/alice
//   http://localhost:3000/user/order-99
//
// The :id part is the placeholder — "id" is the key, the actual URL value is the value
app.get("/user/:id", (req, res) => {
  // req.params is an object containing all route parameters
  // Here: req.params = { id: "42" } for URL /user/42
  const id = req.params.id;

  res.send(`User ID: ${id}`); // → "User ID: 42"
});

// ─────────────────────────────────────────────
// QUERY PARAMETERS (?key=value)
// ─────────────────────────────────────────────
// Query parameters are key-value pairs appended to the URL after a "?"
// They are optional and do NOT form part of the route path definition
// Multiple query params are separated by "&"
//
// Example URLs that match this route:
//   http://localhost:3000/user?username=john
//   http://localhost:3000/user?username=alice&age=25   ← multiple params
//   http://localhost:3000/user                         ← no params (username = undefined)
//
// Difference from route params:
//   Route param  → /user/:id      → req.params.id   → part of the path itself
//   Query param  → /user?name=x   → req.query.name  → optional, appended after "?"
app.get("/user", (req, res) => {
  // req.query is an object containing all query string parameters
  // For URL /user?username=john → req.query = { username: "john" }
  // For URL /user?username=john&age=25 → req.query = { username: "john", age: "25" }
  // Note: all query param values are strings — convert with Number() if needed
  const username = req.query.username;

  res.send(`User username is: ${username}`); // → "User username is: john"
});

// ─────────────────────────────────────────────
// START THE SERVER
// ─────────────────────────────────────────────
// app.listen() binds the server to the specified PORT and starts accepting connections
// The callback runs once the server is successfully up and ready
// Without this line, the app does nothing — routes are defined but never reachable
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  // Visit http://localhost:3000 in your browser or Postman to test the routes
});
