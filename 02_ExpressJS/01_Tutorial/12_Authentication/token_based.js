// ─────────────────────────────────────────────────────────────
// Authentication API — Register, Login, Protected Route
// Uses: bcryptjs (password hashing) + jsonwebtoken (JWT auth)
// ─────────────────────────────────────────────────────────────

// Express — web framework for building the HTTP server and routes
import express from "express";

// bcryptjs — library for hashing and comparing passwords
// Never store plain-text passwords — always hash them before saving
import bcrypt from "bcryptjs";

// jsonwebtoken — library for creating and verifying JWT tokens
// JWT = a signed token sent to the client after login
// The client sends it back on protected requests to prove identity
import jwt from "jsonwebtoken";

// ── App Setup ─────────────────────────────────────────────────

// Initialize the Express application
const app = express();
const PORT = 3000;

// Middleware: parse incoming JSON request bodies
// Without this, req.body will be undefined for JSON payloads
app.use(express.json());

// ── In-memory "database" ──────────────────────────────────────
// Stores registered users as an array of objects
// ⚠️ This is for demo only — data is lost when server restarts
// In production: use a real database (MongoDB, PostgreSQL, etc.)
const users = [];

// ── Routes ────────────────────────────────────────────────────

// GET / — Health check / home route
app.get("/", (req, res) => {
  res.send("Hello Express app");
});

// ── POST /register ─────────────────────────────────────────────
// Registers a new user by hashing their password and storing it
// Request body: { username: string, password: string }
app.post("/register", async (req, res) => {
  // Destructure username and password from the request body
  const { username, password } = req.body;

  // Hash the password using bcrypt before storing
  // 10 = saltRounds — how many times the hashing runs
  // Higher number = more secure but slower (10 is the standard)
  // A unique "salt" is automatically generated and embedded in the hash
  // This means even if two users have the same password, their hashes differ
  const hashedPassword = await bcrypt.hash(password, 10);

  // Push the new user into the in-memory users array
  // ✅ Only the hashed password is stored — never the plain text
  users.push({
    username,
    password: hashedPassword, // e.g., "$2a$10$N9qo8uLOick..."
  });

  // Respond with a success message
  // ⚠️ In production: check for duplicate usernames before registering
  res.send(`User registered`);
});

// ── POST /login ────────────────────────────────────────────────
// Authenticates a user and returns a JWT token on success
// Request body: { username: string, password: string }
app.post("/login", async (req, res) => {
  // Destructure credentials from request body
  const { username, password } = req.body;

  // Look up the user in the in-memory array by username
  const user = users.find((u) => u.username === username);

  // Check two conditions:
  // 1. user exists (find returns undefined if not found)
  // 2. the provided password matches the stored hashed password
  //    bcrypt.compare() hashes the plain password and compares it
  //    to the stored hash — returns true if they match
  if (!user || !(await bcrypt.compare(password, user.password))) {
    // Either user not found OR password is wrong
    // ⚠️ Return the same message for both cases — never reveal WHICH
    // one failed (security: prevents username enumeration)
    return res.send("Not authorized");
  }

  // ── Create JWT Token ────────────────────────────────────────
  // jwt.sign(payload, secret, options)
  // payload  → data to encode in the token (username here)
  //            ⚠️ Don't put sensitive data (passwords, card numbers) in JWT
  // secret   → secret key used to sign the token
  //            ⚠️ In production: use a long random key from process.env.JWT_SECRET
  // options  → { expiresIn: '1h' } (no expiry set here — not recommended for production)
  const token = jwt.sign({ username }, "test#secret");

  // Send the token back to the client
  // The client must store this token (localStorage or cookie)
  // and send it in the Authorization header for protected routes
  res.send({ token });
});

// ── GET /dashboard ─────────────────────────────────────────────
// Protected route — only accessible with a valid JWT token
// Client must send: Authorization: <token> header
app.get("/dashboard", (req, res) => {
  // Read the JWT token from the 'Authorization' request header
  // ⚠️ Typically the header value is "Bearer <token>"
  //    In that case: req.header("Authorization").replace("Bearer ", "")
  const token = req.header("Authorization");

  // jwt.verify(token, secret) — verifies the token's signature
  // If valid    → returns the decoded payload ({ username, iat, ... })
  // If invalid  → throws an error (expired, tampered, wrong secret)
  // ⚠️ This should be wrapped in try/catch to handle invalid tokens gracefully
  const decodedToken = jwt.verify(token, "test#secret");

  // Check if the decoded token contains a username
  // (i.e., the token was created for a valid user)
  if (decodedToken.username) {
    // Token is valid — grant access to the protected resource
    res.send(`Welcome ${decodedToken.username}`);
  } else {
    // Token doesn't contain expected data
    res.send("Access Denied");
  }
});

// ── Start Server ───────────────────────────────────────────────
// Start the server and listen on the specified PORT
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
