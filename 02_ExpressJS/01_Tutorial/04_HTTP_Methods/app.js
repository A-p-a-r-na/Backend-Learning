// Import the Express framework
import express from "express";

const app = express();
const PORT = 3000;

// ─────────────────────────────────────────────
// GLOBAL MIDDLEWARE
// ─────────────────────────────────────────────
// express.json() is a built-in middleware that parses incoming requests
// whose Content-Type header is "application/json"
// It reads the raw request body and converts it into a JavaScript object
// accessible via req.body
//
// Without this line:
//   req.body → undefined  ❌
// With this line:
//   req.body → { name: "Alice", email: "alice@example.com" }  ✅
//
// IMPORTANT: app.use() registers middleware GLOBALLY — it runs on
// every request before it reaches any route handler
// Always place middleware ABOVE your route definitions
app.use(express.json());

// ─────────────────────────────────────────────
// Content-Type — The "label on the package"
// ─────────────────────────────────────────────
// The Content-Type request header tells the server HOW the body is encoded
// so it knows how to parse/unpack it correctly:
//
//   application/json       → JSON data        → parsed by express.json()
//   text/plain             → plain text        → parsed by express.text()
//   application/xml        → XML data          → needs a custom XML parser
//   multipart/form-data    → file uploads      → needs multer or similar
//   application/x-www-form-urlencoded → HTML form data → express.urlencoded()
//
// If Content-Type is missing or wrong, express.json() won't parse the body
// and req.body will be undefined — even if the body contains valid JSON

// ─────────────────────────────────────────────
// GET /search — Query Parameter
// ─────────────────────────────────────────────
// GET requests should NEVER have a body — data is passed via the URL instead
// Query parameters appear after "?" in the URL as key=value pairs
//
// Example URL: http://localhost:3000/search?id=42
//   req.query → { id: "42" }     ← always a STRING even if value looks like a number
//
// Multiple query params: /search?id=42&type=user&page=1
//   req.query → { id: "42", type: "user", page: "1" }
app.get("/search", (req, res) => {
  // Extract the 'id' query parameter from the URL
  // If not provided (e.g. GET /search), id will be undefined
  const id = req.query.id;

  res.send(`Search id is : ${id}`);
  // res.send() sends a plain text response
  // For /search?id=42  → "Search id is : 42"
  // For /search        → "Search id is : undefined"
});

// ─────────────────────────────────────────────
// POST /user — Create a New User
// ─────────────────────────────────────────────
// POST is used to CREATE a new resource on the server
// Data is sent in the REQUEST BODY (not in the URL)
// express.json() (registered above) parses the body into req.body
//
// Example request:
//   POST /user
//   Content-Type: application/json        ← REQUIRED header for express.json() to work
//   Body: { "name": "Alice", "email": "alice@example.com" }
//
// If Content-Type is missing → express.json() skips parsing → req.body = undefined
// If Content-Type is wrong   → same result — body won't be parsed
app.post("/user", (req, res) => {
  // req.body contains the parsed JSON object sent by the client
  // e.g. → { name: "Alice", email: "alice@example.com" }
  const body = req.body;

  // res.json() serializes the object back to JSON and sends it as the response
  // also automatically sets Content-Type: application/json on the response
  res.json(body);

  // In a real app you would:
  //   1. Validate the body fields
  //   2. Save to a database
  //   3. Return the created resource with status 201:
  //      res.status(201).json({ id: newId, ...body });
});

// ─────────────────────────────────────────────
// PUT /user/:id — Replace / Update a User
// ─────────────────────────────────────────────
// PUT is used to REPLACE an existing resource entirely
// Requires the resource ID in the URL (:id) — identifies WHICH user to update
// Requires ALL fields in the body — PUT replaces the whole object
//
// Example request:
//   PUT /user/5
//   Content-Type: application/json
//   Body: { "name": "Alice Updated", "email": "alice_new@example.com" }
//
// Two data sources used together:
//   req.params → WHERE  (which resource: the ID from the URL)
//   req.body   → WHAT   (what to update: the new data from the body)
app.put("/user/:id", (req, res) => {
  // req.params.id captures the :id segment from the URL
  // PUT /user/5 → req.params = { id: "5" }
  // Note: always a string — use Number(id) if you need to compare with numbers
  const id = req.params.id;

  // Destructure the fields expected in the request body
  // If a field is missing from the body, it will be undefined
  const { name, email } = req.body;

  res.json({
    message: `User ${id} updated to ${name} and ${email}`,
    // In a real app: look up the user in the DB, validate, then save changes
    // and return the updated user object
  });
});

// ─────────────────────────────────────────────
// DELETE /users/:id — Remove a User
// ─────────────────────────────────────────────
// DELETE is used to PERMANENTLY REMOVE a resource from the server
// The resource ID is passed in the URL — no request body needed
//
// Example request:
//   DELETE /users/5  → deletes the user with id 5
//
// DELETE is idempotent:
//   Calling DELETE /users/5 once  → user deleted
//   Calling DELETE /users/5 again → user already gone, same end state
//   (though the second call would typically return 404 in practice)
app.delete("/users/:id", (req, res) => {
  // Extract the id of the user to delete from the URL
  // DELETE /users/5 → req.params = { id: "5" }
  const id = req.params.id;

  res.json({
    message: `User with ${id} deleted successfully`,
    // In a real app:
    //   1. Check if user exists → if not, return 404
    //   2. Delete from database
    //   3. Return 204 No Content (no body) — the standard for DELETE success:
    //      res.status(204).send();
    //   OR return the deleted user with 200 so the client knows what was removed
  });
});

// ─────────────────────────────────────────────
// START THE SERVER
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port number ${PORT}`);
  // Routes available:
  //   GET    http://localhost:3000/search?id=42
  //   POST   http://localhost:3000/user
  //   PUT    http://localhost:3000/user/:id
  //   DELETE http://localhost:3000/users/:id
});
