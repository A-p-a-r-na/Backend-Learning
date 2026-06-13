import express from "express";
import session from "express-session";

const app = express();
const PORT = 3000;

// Parse incoming JSON request bodies → populates req.body
app.use(express.json());

// ─────────────────────────────────────────────
// SESSION MIDDLEWARE
// ─────────────────────────────────────────────
// express-session enables server-side sessions
// How it works:
//   1. On first request → creates a session object stored on the SERVER
//   2. Sends the client a cookie called "connect.sid" containing the session ID
//   3. On every future request → reads "connect.sid" from the cookie
//      → looks up the session data on the server using that ID
//      → populates req.session with the stored data
//
// The client ONLY holds the session ID — all actual data stays on the server
// This is different from JWTs where the payload lives in the token itself
app.use(
  session({
    // secret — used to cryptographically SIGN the session ID cookie
    // Prevents attackers from forging or tampering with the session ID
    // In production: use a long random string stored in .env
    // process.env.SESSION_SECRET
    secret: "sample-secret",

    // resave: false — do NOT re-save the session to the store on every request
    // if nothing in req.session changed between requests
    // Prevents unnecessary writes and race conditions
    // Set to false unless your session store requires it
    resave: false,

    // saveUninitialized: false — do NOT create and save a session
    // for requests that never modify req.session
    // Good for GDPR compliance — don't set a cookie until the user
    // actually does something (like logging in)
    saveUninitialized: false,

    // cookie options (not set here but important to know):
    // cookie: {
    //   httpOnly: true,   → JS can't read the session cookie (XSS protection)
    //   secure:   true,   → only sent over HTTPS (production)
    //   maxAge:   86400000 → expires in 24 hours (milliseconds)
    // }
  }),
);

// In-memory user store — simulates a database
// ⚠️ In production: use MongoDB, PostgreSQL, etc.
// ⚠️ Data is lost when the server restarts
const users = [];

// ─────────────────────────────────────────────
// GET / — Public home route
// ─────────────────────────────────────────────
// No session required — anyone can access this
app.get("/", (req, res) => {
  res.send("Hello Express app");
});

// ─────────────────────────────────────────────
// POST /register — Create a new user
// ─────────────────────────────────────────────
// In a real app you would:
//   1. Validate input (name, email format, password length)
//   2. Check if username/email already exists
//   3. Hash the password with bcrypt before storing
//      const hashed = await bcrypt.hash(password, 12)
//   4. Save to a database, not an in-memory array
//
// ⚠️ This stores plain-text passwords — NEVER do this in production
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Push a new user object into the in-memory array
  users.push({
    username,
    password, // ⚠️ plain text — in production: store bcrypt hash only
  });

  res.send(`User registered`);
  // In production: respond with 201 Created and the new user (without password)
  // res.status(201).json({ message: "User registered", username });
});

// ─────────────────────────────────────────────
// POST /login — Verify credentials and start a session
// ─────────────────────────────────────────────
// Flow:
//   1. Find user by username in the data store
//   2. Compare submitted password with stored password
//   3. If valid → store user info in req.session to mark them as logged in
//   4. On future requests → req.session.user will be set automatically
//
// ⚠️ BUG IN ORIGINAL CODE:
//   req.session.user;   ← this is just a READ (does nothing)
//   It should be:
//   req.session.user = user;  ← this WRITES to the session (fixes it)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Find the user in the in-memory store by username
  const user = users.find((u) => u.username === username);

  // If no user found OR password doesn't match → reject
  // ⚠️ In production: use bcrypt.compare(password, user.password)
  //    NEVER compare plain text passwords with ===
  // ⚠️ Use a vague error message — don't reveal whether the
  //    username exists or the password was wrong (prevents user enumeration)
  if (!user || password !== user.password) {
    return res.status(401).send("Not authorized");
  }

  // ✅ FIX — store the user object in the session
  // This is what actually logs the user in:
  //   - req.session is saved to the session store (server-side)
  //   - The session ID cookie is sent to the client
  //   - On future requests, Express reads the cookie → looks up this session
  //     → restores req.session.user automatically
  req.session.user = user;
  // In production: store only safe fields — never store the password in the session
  // req.session.user = { username: user.username, role: user.role };

  res.send(`User Logged In`);
});

// ─────────────────────────────────────────────
// GET /dashboard — Protected route
// ─────────────────────────────────────────────
// This route checks whether the user is authenticated
// by looking for req.session.user set during login
//
// Flow:
//   Logged-in user:
//     Browser sends Cookie: connect.sid=<sessionId>
//     → Express finds the session in the store
//     → req.session.user is populated
//     → access granted ✅
//
//   Not logged-in user:
//     No session cookie, or session has expired
//     → req.session.user is undefined
//     → access denied ❌
app.get("/dashboard", (req, res) => {
  // If req.session.user is not set → user never logged in (or session expired)
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
    // In production: redirect to the login page for web apps
    // return res.redirect("/login");
  }

  // req.session.user is set → user is authenticated
  // req.session.user.username was stored during login
  res.send(`Welcome ${req.session.user.username}`);
});

// ─────────────────────────────────────────────
// (MISSING) POST /logout — Destroy the session
// ─────────────────────────────────────────────
// A complete auth system needs a logout route
// Add this to properly end the user's session:
//
// app.post("/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) return res.status(500).send("Logout failed");
//     res.clearCookie("connect.sid"); // remove session ID from browser
//     res.send("Logged out successfully");
//   });
// });

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
