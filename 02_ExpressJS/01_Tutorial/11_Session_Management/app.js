import express from "express";
import session from "express-session";

// Initialize the Express application
const app = express();
const PORT = 3000;

// Register express-session middleware to enable server-side sessions
// A session ID cookie (connect.sid) is automatically sent to the client
app.use(
  session({
    secret: "sample-secret", // Key used to sign the session ID cookie — prevents tampering
    resave: false, // Don't re-save the session to the store if nothing changed
    saveUninitialized: false, // Don't create a session until something is stored in it
  }),
);

// GET / — Sets a plain cookie (independent of the session)
// maxAge is in milliseconds: 360000ms = 6 minutes
app.get("/", (req, res) => {
  res.cookie("name", "express-app", { maxAge: 360000 });
  res.send("Hello Express app");
});

// GET /visit — Tracks how many times a user has visited using session data
// req.session persists across requests for the same user via their session ID cookie
app.get("/visit", (req, res) => {
  if (req.session.page_view) {
    // Session already has a page_view count — increment and report it
    req.session.page_view++;
    res.send(`you visited this page ${req.session.page_view} times`);
  } else {
    // First visit — initialize the counter in the session store
    req.session.page_view = 1;
    res.send(`Welcome to this page for the first time`);
  }
});

// GET /remove — Destroys the session, wiping all stored session data server-side
// The session ID cookie on the client becomes invalid after this
app.get("/remove", (req, res) => {
  req.session.destroy();
  res.send("Session remmoved");
});

// Start the server and listen on the specified PORT
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
