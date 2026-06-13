// ─────────────────────────────────────────────
// controller.js — Route handler functions (controllers)
// Controllers contain the business logic for each route
// They receive the request and send back a response
// ─────────────────────────────────────────────

// userController — handles GET /user/:id
// :id is a URL parameter — e.g., /user/42 → id = "42"
// Named export so it can be imported by name in route.js
export const userController = (req, res) => {
  // req.params contains all URL parameters defined with ":"
  // For route "/user/:id", req.params = { id: "42" }
  const id = req.params.id;

  // Send a plain text response back to the client
  // res.send() automatically sets Content-Type and ends the response
  res.send(`User ID: ${id}`); // → "User ID: 42"
};

// searchController — handles GET /search?username=john
// Query strings come after "?" in the URL
// e.g., /search?username=john → username = "john"
export const searchController = (req, res) => {
  // req.query contains all query string parameters
  // For URL "/search?username=john", req.query = { username: "john" }
  // Unlike req.params (path variables), req.query is for optional filters/searches
  const username = req.query.username;

  // Send the username back in the response
  res.send(`User username: ${username}`); // → "User username: john"
};
