# Handling Form Data in Express.js — A Detailed Guide

---

## Table of Contents

1. [What is Form Data?](#1-what-is-form-data)
2. [How Forms Send Data to the Server](#2-how-forms-send-data-to-the-server)
3. [Content-Type Headers](#3-content-type-headers)
4. [Handling URL-Encoded Form Data](#4-handling-url-encoded-form-data)
5. [Handling JSON Form Data](#5-handling-json-form-data)
6. [Handling File Uploads with Multer](#6-handling-file-uploads-with-multer)
7. [Form Validation](#7-form-validation)
8. [Sanitizing Input](#8-sanitizing-input)
9. [Flash Messages and Redirects](#9-flash-messages-and-redirects)
10. [Complete Form — Full Example](#10-complete-form--full-example)
11. [Handling Forms with Fetch (AJAX)](#11-handling-forms-with-fetch-ajax)
12. [Common Mistakes](#12-common-mistakes)
13. [Quick Reference Cheatsheet](#13-quick-reference-cheatsheet)

---

## 1. What is Form Data?

**Form data** is information submitted by a user through an HTML form
or an API client (Postman, Fetch, Axios). It travels from the client
to the server inside the **HTTP request body**.

```
┌──────────────────────────────────────────────────────────────┐
│                   TYPES OF FORM DATA                         │
├───────────────────────┬──────────────────────────────────────┤
│ URL-Encoded           │ Traditional HTML form submission      │
│ (application/x-www-  │ Key=value pairs joined by &           │
│  form-urlencoded)     │ name=Alice&email=alice%40example.com  │
├───────────────────────┼──────────────────────────────────────┤
│ JSON                  │ API requests from Fetch / Axios       │
│ (application/json)    │ { "name": "Alice", "age": 28 }       │
├───────────────────────┼──────────────────────────────────────┤
│ Multipart             │ File uploads + text fields mixed      │
│ (multipart/form-data) │ Required when sending files           │
├───────────────────────┼──────────────────────────────────────┤
│ Plain Text            │ Rarely used — raw string body         │
│ (text/plain)          │                                       │
└───────────────────────┴──────────────────────────────────────┘
```

### Why Express can't read the body without middleware

HTTP requests arrive as a **raw binary stream**. Express does not
automatically parse this stream — you need middleware to read,
decode, and convert it into a usable JavaScript object on `req.body`.

```
Raw HTTP Request Body (binary stream)
  name=Alice&email=alice%40example.com&age=28

Without middleware:  req.body → undefined ❌
With middleware:     req.body → { name: "Alice", email: "alice@example.com", age: "28" } ✅
```

---

## 2. How Forms Send Data to the Server

### HTML form — GET method

```html
<!-- GET — data goes in the URL as a query string -->
<!-- Use for: search forms, filters — NOT for passwords or sensitive data -->
<form action="/search" method="GET">
  <input type="text" name="query" placeholder="Search...">
  <button type="submit">Search</button>
</form>

<!-- Submitting this sends: GET /search?query=nodejs -->
<!-- Data accessible via: req.query.query -->
```

### HTML form — POST method

```html
<!-- POST — data goes in the request body -->
<!-- Use for: login, registration, creating data, sending passwords -->
<form action="/register" method="POST">
  <input type="text"     name="name"     placeholder="Your name">
  <input type="email"    name="email"    placeholder="Your email">
  <input type="password" name="password" placeholder="Password">
  <button type="submit">Register</button>
</form>

<!-- Submitting this sends:
     POST /register
     Content-Type: application/x-www-form-urlencoded
     Body: name=Alice&email=alice%40example.com&password=secret123
-->
<!-- Data accessible via: req.body.name, req.body.email, req.body.password -->
```

### GET vs POST — when to use which

```
┌─────────────────────────────────────────────────────────────────┐
│  GET                          │  POST                           │
├───────────────────────────────┼─────────────────────────────────┤
│  Data in URL query string     │  Data in request body           │
│  Visible in browser URL bar   │  Not visible in URL             │
│  Bookmarkable                 │  Not bookmarkable               │
│  Cached by browsers           │  Never cached                   │
│  Limited data length (~2000   │  No practical data length limit │
│  characters)                  │                                 │
│  Use for: search, filters     │  Use for: login, registration,  │
│                               │  creating, updating, deleting   │
│  ❌ Never for passwords       │  ✅ Safe for passwords          │
└───────────────────────────────┴─────────────────────────────────┘
```

---

## 3. Content-Type Headers

The `Content-Type` header tells Express **how the body is encoded**
so it knows which middleware to use to parse it.

```
┌────────────────────────────────────────────────────────────────────┐
│  Content-Type                    │  Parse with                     │
├──────────────────────────────────┼─────────────────────────────────┤
│  application/x-www-form-urlencoded│  express.urlencoded()          │
│  application/json                 │  express.json()                │
│  multipart/form-data              │  multer (third-party)          │
│  text/plain                       │  express.text()                │
└──────────────────────────────────┴─────────────────────────────────┘
```

```
Client sets Content-Type: application/x-www-form-urlencoded
                                    │
                                    ▼
               express.urlencoded() reads and parses the body
                                    │
                                    ▼
                   req.body = { name: "Alice", email: "..." }
```

> If the `Content-Type` header is **missing or wrong**, the middleware
> will not parse the body — `req.body` will be `undefined` or `{}`.

---

## 4. Handling URL-Encoded Form Data

URL-encoded is the **default encoding** for HTML forms. Every
`<form>` without an `enctype` attribute uses it automatically.

### Setup

```javascript
// server.js
import express from "express";
import path    from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = 3000;

// REQUIRED — parse URL-encoded form bodies
// extended: true  → uses the "qs" library — supports nested objects
//   e.g. address[city]=Kerala → { address: { city: "Kerala" } }
// extended: false → uses the "querystring" library — flat key-value only
app.use(express.urlencoded({ extended: true }));

// Serve static files and EJS templates
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
```

### Simple contact form

```html
<!-- views/contact.ejs -->
<%- include("partials/header") %>

<main class="container">
  <h1>Contact Us</h1>

  <!-- Show error/success messages if any -->
  <% if (error) { %>
    <div class="alert alert-error"><%= error %></div>
  <% } %>
  <% if (success) { %>
    <div class="alert alert-success"><%= success %></div>
  <% } %>

  <form action="/contact" method="POST" class="form">

    <div class="form-group">
      <label for="name">Full Name *</label>
      <!-- value="<%= formData.name %>" repopulates the field on error -->
      <input
        type="text"
        id="name"
        name="name"
        value="<%= formData.name || '' %>"
        placeholder="Alice Smith"
        required
      >
    </div>

    <div class="form-group">
      <label for="email">Email Address *</label>
      <input
        type="email"
        id="email"
        name="email"
        value="<%= formData.email || '' %>"
        placeholder="alice@example.com"
        required
      >
    </div>

    <div class="form-group">
      <label for="subject">Subject</label>
      <select id="subject" name="subject">
        <option value="">-- Select a subject --</option>
        <option value="general"  <%= formData.subject === "general"  ? "selected" : "" %>>General Inquiry</option>
        <option value="support"  <%= formData.subject === "support"  ? "selected" : "" %>>Support</option>
        <option value="feedback" <%= formData.subject === "feedback" ? "selected" : "" %>>Feedback</option>
      </select>
    </div>

    <div class="form-group">
      <label for="message">Message *</label>
      <textarea
        id="message"
        name="message"
        rows="5"
        placeholder="Your message here..."
        required
      ><%= formData.message || '' %></textarea>
    </div>

    <!-- Checkbox -->
    <div class="form-group">
      <label>
        <input
          type="checkbox"
          name="subscribe"
          value="yes"
          <%= formData.subscribe === "yes" ? "checked" : "" %>
        >
        Subscribe to newsletter
      </label>
    </div>

    <button type="submit" class="btn">Send Message</button>
  </form>
</main>

<%- include("partials/footer") %>
```

```javascript
// server.js — contact form routes

// GET /contact — show the form
app.get("/contact", (req, res) => {
  res.render("contact", {
    title:    "Contact Us",
    error:    null,
    success:  null,
    formData: {},   // empty on first load
  });
});

// POST /contact — handle form submission
app.post("/contact", (req, res) => {
  // req.body is populated by express.urlencoded() middleware
  // All values are STRINGS — even numbers like age will be "28" not 28
  const { name, email, subject, message, subscribe } = req.body;

  // ── Validation ────────────────────────────────────────────
  if (!name || name.trim() === "") {
    return res.render("contact", {
      title:    "Contact Us",
      error:    "Name is required",
      success:  null,
      formData: req.body,  // pass back the submitted data to repopulate fields
    });
  }

  if (!email || !email.includes("@")) {
    return res.render("contact", {
      title:    "Contact Us",
      error:    "A valid email address is required",
      success:  null,
      formData: req.body,
    });
  }

  if (!message || message.trim() === "") {
    return res.render("contact", {
      title:    "Contact Us",
      error:    "Message cannot be empty",
      success:  null,
      formData: req.body,
    });
  }

  // ── Process the data ──────────────────────────────────────
  // In a real app: save to DB, send an email, etc.
  console.log("Form submission received:", {
    name:      name.trim(),
    email:     email.trim().toLowerCase(),
    subject:   subject || "general",
    message:   message.trim(),
    subscribe: subscribe === "yes",   // checkbox: "yes" or undefined
  });

  // ── Success ───────────────────────────────────────────────
  // Re-render with success message and clear the form
  res.render("contact", {
    title:    "Contact Us",
    error:    null,
    success:  "Your message has been sent! We will get back to you soon.",
    formData: {},   // clear the form on success
  });
});
```

### Nested objects with extended: true

```html
<!-- Nested field names using bracket notation -->
<form action="/register" method="POST">
  <input type="text" name="user[name]"          value="Alice">
  <input type="text" name="user[address][city]"  value="Kerala">
  <input type="text" name="user[address][state]" value="KL">
  <button type="submit">Register</button>
</form>
```

```javascript
app.post("/register", (req, res) => {
  console.log(req.body);
  // → {
  //     user: {
  //       name: "Alice",
  //       address: { city: "Kerala", state: "KL" }
  //     }
  //   }
  // Only works when extended: true is set
});
```

---

## 5. Handling JSON Form Data

JSON is used when submitting data via **Fetch, Axios, or any API client**.
HTML forms do NOT send JSON by default — this requires JavaScript.

### Setup

```javascript
// Parse JSON request bodies
// Required when Content-Type: application/json
app.use(express.json());
```

### JSON form submission routes

```javascript
// POST /api/register — expects JSON body
app.post("/api/register", (req, res) => {
  // req.body is already a parsed JavaScript object
  // { "name": "Alice", "email": "alice@example.com", "age": 28 }
  const { name, email, age } = req.body;

  // Note: unlike urlencoded, numbers sent as JSON are actual numbers
  // age = 28 (number) not "28" (string)
  console.log(typeof age); // → "number"

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error:   "Name and email are required",
    });
  }

  // Process... save to DB etc.
  res.status(201).json({
    success: true,
    message: "Registration successful",
    user:    { name, email, age },
  });
});
```

### Using both JSON and URL-encoded in the same app

```javascript
// Register BOTH parsers — Express uses the right one automatically
// based on the incoming Content-Type header
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Now:
// HTML form POST  → Content-Type: application/x-www-form-urlencoded → urlencoded() parses it
// Fetch/Axios API → Content-Type: application/json                  → json() parses it
// Both end up in req.body
```

---

## 6. Handling File Uploads with Multer

HTML file inputs require `enctype="multipart/form-data"` and
the **multer** third-party middleware (Express has no built-in support).

### Installation

```bash
npm install multer
```

### Basic file upload

```javascript
import multer from "multer";
import path   from "path";
import fs     from "fs";

// ── Storage Configuration ─────────────────────────────────────

// Option A: disk storage — save files to disk
const diskStorage = multer.diskStorage({
  // Destination folder for uploaded files
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");

    // Create the folder if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir); // null = no error, uploadDir = where to save
  },

  // Custom filename — prevents collisions
  filename: (req, file, cb) => {
    const ext      = path.extname(file.originalname); // e.g. ".jpg"
    const baseName = path.basename(file.originalname, ext)
                         .replace(/\s+/g, "-")  // replace spaces with dashes
                         .toLowerCase();
    const unique   = Date.now() + "-" + Math.round(Math.random() * 1e6);

    cb(null, `${baseName}-${unique}${ext}`);
    // e.g. "my-photo-1705312345678-123456.jpg"
  },
});

// Option B: memory storage — keep file in memory as a Buffer
// Useful when you want to process/upload to cloud (S3, Cloudinary) without
// saving to disk first
const memoryStorage = multer.memoryStorage();

// ── File Filter — validate file type ─────────────────────────

function imageFilter(req, file, cb) {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);  // accept the file
  } else {
    // Reject the file — pass an error
    cb(new Error("Only image files (JPEG, PNG, WebP, GIF) are allowed"), false);
  }
}

// ── Multer Instance ───────────────────────────────────────────

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB max per file
    files:    5,                  // max 5 files per request
  },
  fileFilter: imageFilter,
});
```

### HTML file upload form

```html
<!-- views/upload.ejs -->
<form action="/upload/avatar" method="POST" enctype="multipart/form-data">
  <!--
    enctype="multipart/form-data" is REQUIRED for file uploads
    Without it, only the filename is sent — not the file content
  -->

  <div class="form-group">
    <label for="name">Your Name</label>
    <input type="text" id="name" name="name" required>
  </div>

  <!-- Single file upload -->
  <div class="form-group">
    <label for="avatar">Profile Picture</label>
    <input
      type="file"
      id="avatar"
      name="avatar"
      accept="image/*"
    >
    <!-- accept="image/*" is a client-side hint only — always validate server-side too -->
  </div>

  <button type="submit" class="btn">Upload</button>
</form>

<!-- Multiple file upload -->
<form action="/upload/gallery" method="POST" enctype="multipart/form-data">
  <div class="form-group">
    <label for="photos">Upload Photos (max 5)</label>
    <input
      type="file"
      id="photos"
      name="photos"
      accept="image/*"
      multiple
    >
  </div>
  <button type="submit" class="btn">Upload Gallery</button>
</form>
```

### Upload route handlers

```javascript
// Single file upload — upload.single("fieldName")
// "avatar" must match the name attribute of the file input
app.post("/upload/avatar", upload.single("avatar"), (req, res) => {
  // req.file — the uploaded file object (undefined if no file was sent)
  // req.body — other form fields (name, email, etc.)

  if (!req.file) {
    return res.status(400).json({ error: "Please select a file to upload" });
  }

  console.log(req.file);
  // → {
  //     fieldname:    "avatar",
  //     originalname: "my-photo.jpg",
  //     encoding:     "7bit",
  //     mimetype:     "image/jpeg",
  //     destination:  "/path/to/project/uploads",
  //     filename:     "my-photo-1705312345678-123456.jpg",
  //     path:         "/path/to/project/uploads/my-photo-1705312345678-123456.jpg",
  //     size:         204800   ← file size in bytes
  //   }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.json({
    success:  true,
    message:  "Avatar uploaded successfully",
    name:     req.body.name,      // text field from the same form
    fileUrl,                       // URL to access the file
    size:     req.file.size,
  });
});

// Multiple files — upload.array("fieldName", maxCount)
app.post("/upload/gallery", upload.array("photos", 5), (req, res) => {
  // req.files — array of file objects
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const uploadedFiles = req.files.map(file => ({
    originalName: file.originalname,
    filename:     file.filename,
    size:         file.size,
    url:          `/uploads/${file.filename}`,
  }));

  res.json({
    success: true,
    message: `${req.files.length} files uploaded successfully`,
    files:   uploadedFiles,
  });
});

// Multiple fields — upload.fields([...])
// Use when different file inputs have different field names
app.post("/upload/profile",
  upload.fields([
    { name: "avatar",  maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  (req, res) => {
    // req.files is now an object keyed by field name
    const avatar     = req.files["avatar"]?.[0];
    const coverPhoto = req.files["coverPhoto"]?.[0];

    res.json({
      avatar:     avatar     ? `/uploads/${avatar.filename}`     : null,
      coverPhoto: coverPhoto ? `/uploads/${coverPhoto.filename}` : null,
    });
  }
);

// Handle multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large — maximum size is 5MB" });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ error: "Too many files — maximum is 5" });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ error: "Unexpected field name in upload" });
    }
  }

  // Other errors (e.g. our custom fileFilter error)
  if (err.message.includes("Only image files")) {
    return res.status(400).json({ error: err.message });
  }

  next(err); // pass to global error handler
});
```

### Serve uploaded files

```javascript
// Make uploaded files accessible via URL
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Uploaded file at: uploads/my-photo-123.jpg
// Accessible at:    http://localhost:3000/uploads/my-photo-123.jpg
```

---

## 7. Form Validation

Always validate form data **server-side** — client-side validation
is a UX convenience but can be bypassed.

### Manual validation

```javascript
app.post("/register", (req, res) => {
  const { name, email, password, age } = req.body;
  const errors = [];

  // ── Required fields ────────────────────────────────────────
  if (!name || name.trim() === "") {
    errors.push("Name is required");
  } else if (name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  } else if (name.trim().length > 100) {
    errors.push("Name cannot exceed 100 characters");
  }

  // ── Email validation ───────────────────────────────────────
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.trim() === "") {
    errors.push("Email is required");
  } else if (!emailRegex.test(email.trim())) {
    errors.push("Please enter a valid email address");
  }

  // ── Password validation ────────────────────────────────────
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters");
  } else if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // ── Number validation ──────────────────────────────────────
  // URL-encoded values are always strings — convert before comparing
  const ageNum = Number(age);
  if (age && (isNaN(ageNum) || ageNum < 18 || ageNum > 120)) {
    errors.push("Age must be a number between 18 and 120");
  }

  // ── Return errors ──────────────────────────────────────────
  if (errors.length > 0) {
    // For HTML form: re-render with errors and repopulate fields
    return res.status(400).render("register", {
      title:    "Register",
      errors,              // array of error messages
      formData: req.body,  // repopulate the form fields
    });

    // For API (JSON): return structured error response
    // return res.status(400).json({ success: false, errors });
  }

  // All validation passed — process the data
  res.redirect("/dashboard");
});
```

### Validation with express-validator

```bash
npm install express-validator
```

```javascript
import { body, validationResult } from "express-validator";

// Define validation rules as middleware — runs before the handler
const registerValidation = [
  body("name")
    .trim()
    .notEmpty()    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
                   .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()    .withMessage("Email is required")
    .isEmail()     .withMessage("Please enter a valid email address")
    .normalizeEmail(),  // converts to lowercase, removes dots in Gmail, etc.

  body("password")
    .notEmpty()    .withMessage("Password is required")
    .isLength({ min: 8 })
                   .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a number"),

  body("age")
    .optional()    // not required
    .isInt({ min: 18, max: 120 })
                   .withMessage("Age must be between 18 and 120"),

  body("website")
    .optional()
    .isURL()       .withMessage("Please enter a valid URL"),
];

app.post("/register", registerValidation, (req, res) => {
  // Check if any validation rules failed
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // errors.array() → [{msg: "Name is required", param: "name", ...}, ...]
    return res.status(400).render("register", {
      title:    "Register",
      errors:   errors.array().map(e => e.msg),  // extract just the messages
      formData: req.body,
    });
  }

  // req.body fields are now validated and sanitized
  const { name, email, password } = req.body;
  // ... save to database
  res.redirect("/dashboard");
});
```

---

## 8. Sanitizing Input

**Sanitization** cleans the input — trimming whitespace, converting
case, removing dangerous characters — to protect your database and
prevent attacks.

```javascript
app.post("/submit", (req, res) => {
  // ── Manual sanitization ───────────────────────────────────

  const name     = req.body.name?.trim();                    // remove leading/trailing spaces
  const email    = req.body.email?.trim().toLowerCase();     // lowercase email
  const age      = Number(req.body.age);                     // convert string to number
  const isActive = req.body.isActive === "true";             // convert string to boolean
  const tags     = req.body.tags?.split(",").map(t => t.trim()); // "a, b, c" → ["a", "b", "c"]

  // ── Prevent XSS — never insert raw user input into HTML ──
  // If using EJS: <%= value %> escapes HTML automatically ✅
  // NEVER use <%- userInput %> with user-provided data ❌

  // ── SQL injection prevention ──────────────────────────────
  // Always use parameterized queries — never string concatenation
  // ❌ NEVER: db.query(`SELECT * FROM users WHERE email = '${email}'`)
  // ✅ ALWAYS: db.query("SELECT * FROM users WHERE email = ?", [email])

  res.json({ name, email, age, isActive, tags });
});
```

### Using express-validator for sanitization

```javascript
const sanitizeRules = [
  body("name").trim().escape(),            // trim + escape HTML characters
  body("email").trim().normalizeEmail(),   // trim + lowercase + normalize
  body("age").toInt(),                     // convert to integer
  body("website").trim().toLowerCase(),   // trim + lowercase
  body("bio").trim().escape(),             // escape HTML in long text
];

app.post("/profile", sanitizeRules, (req, res) => {
  // req.body values are now sanitized
  console.log(req.body.name);  // already trimmed and escaped
});
```

---

## 9. Flash Messages and Redirects

The **Post/Redirect/Get (PRG) pattern** prevents duplicate form
submissions when the user refreshes the page after a successful POST.

```
Without PRG:
  POST /register → success page
  User refreshes → another POST /register → duplicate submission ❌

With PRG:
  POST /register → redirect to /success
  User refreshes → GET /success → no duplicate ✅
```

### Simple redirect after form submission

```javascript
// POST /contact → process → redirect to thank you page
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.redirect("/contact?error=missing-fields");
  }

  // Save to DB, send email, etc.
  console.log("Contact form submitted:", { name, email, message });

  // Redirect to a success page — PRG pattern
  res.redirect("/contact/success");
});

app.get("/contact/success", (req, res) => {
  res.render("contact-success", {
    title: "Message Sent!",
    message: "Thank you for contacting us. We will reply within 24 hours.",
  });
});
```

### Flash messages with connect-flash

Flash messages survive a redirect — stored in the session temporarily
and deleted after being read once.

```bash
npm install connect-flash express-session
```

```javascript
import session     from "express-session";
import flash       from "connect-flash";

// Session middleware is required for flash messages
app.use(session({
  secret:            process.env.SESSION_SECRET || "keyboard-cat",
  resave:            false,
  saveUninitialized: false,
  cookie:            { maxAge: 60000 }, // 1 minute
}));

// Flash middleware — requires session to be set up first
app.use(flash());

// Make flash messages available in ALL templates automatically
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error   = req.flash("error");
  next();
});
```

```javascript
// POST /register — save flash and redirect
app.post("/register", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    req.flash("error", "Name and email are required");
    return res.redirect("/register");  // redirect back to the form
  }

  // Success — save to DB etc.
  req.flash("success", `Welcome, ${name}! Your account has been created.`);
  res.redirect("/dashboard");  // redirect to a new page
});

// GET /register — show the form (flash messages auto available in template)
app.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});
```

```html
<!-- views/partials/flash.ejs — reusable flash message partial -->
<!-- error and success are available globally via res.locals -->

<% if (error && error.length > 0) { %>
  <div class="alert alert-error">
    <% error.forEach(msg => { %>
      <p><%= msg %></p>
    <% }) %>
  </div>
<% } %>

<% if (success && success.length > 0) { %>
  <div class="alert alert-success">
    <% success.forEach(msg => { %>
      <p><%= msg %></p>
    <% }) %>
  </div>
<% } %>
```

```html
<!-- Include the flash partial in any template -->
<%- include("partials/flash") %>
```

---

## 10. Complete Form — Full Example

A complete registration form with validation, sanitization, and flash messages:

```javascript
// server.js
import express      from "express";
import path         from "path";
import session      from "express-session";
import flash        from "connect-flash";
import { body, validationResult } from "express-validator";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
  secret: "my-secret",
  resave: false,
  saveUninitialized: false,
}));
app.use(flash());

// Make flash messages and user available in all templates
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error   = req.flash("error");
  next();
});

// In-memory user store (use a database in production)
const users = [];

// Validation rules
const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email address")
    .normalizeEmail()
    .custom(email => {
      // Custom validator — check if email already exists
      const exists = users.find(u => u.email === email);
      if (exists) throw new Error("This email is already registered");
      return true;
    }),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),

  body("confirmPassword")
    .notEmpty().withMessage("Please confirm your password")
    .custom((value, { req }) => {
      // Custom validator — ensure passwords match
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  body("age")
    .optional({ checkFalsy: true })  // skip if empty string
    .isInt({ min: 18, max: 120 }).withMessage("Age must be between 18 and 120")
    .toInt(),
];

// GET /register — show the registration form
app.get("/register", (req, res) => {
  res.render("register", {
    title:    "Create Account",
    errors:   [],
    formData: {},
  });
});

// POST /register — process the form
app.post("/register", registerRules, (req, res) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).render("register", {
      title:    "Create Account",
      errors:   validationErrors.array().map(e => e.msg),
      formData: req.body,  // repopulate fields on error
    });
  }

  // Sanitized and validated data
  const { name, email, age } = req.body;

  // In production: hash password with bcrypt before saving
  // const hashedPassword = await bcrypt.hash(req.body.password, 12);

  const newUser = {
    id:    users.length + 1,
    name:  name,
    email: email,
    age:   age || null,
  };

  users.push(newUser);

  req.flash("success", `Account created! Welcome, ${name}!`);
  res.redirect("/dashboard");
});

// GET /dashboard — shown after successful registration
app.get("/dashboard", (req, res) => {
  res.render("dashboard", {
    title: "Dashboard",
    users,
  });
});

app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
```

```html
<!-- views/register.ejs -->
<%- include("partials/header") %>

<main class="container">
  <div class="form-wrapper">
    <h1>Create Account</h1>

    <!-- Validation errors list -->
    <% if (errors && errors.length > 0) { %>
      <div class="alert alert-error">
        <ul>
          <% errors.forEach(err => { %>
            <li><%= err %></li>
          <% }) %>
        </ul>
      </div>
    <% } %>

    <form action="/register" method="POST" novalidate>
      <!-- novalidate disables browser validation so our custom errors show -->

      <div class="form-group">
        <label for="name">Full Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value="<%= formData.name || '' %>"
          autocomplete="name"
        >
      </div>

      <div class="form-group">
        <label for="email">Email Address *</label>
        <input
          type="email"
          id="email"
          name="email"
          value="<%= formData.email || '' %>"
          autocomplete="email"
        >
      </div>

      <div class="form-group">
        <label for="password">Password *</label>
        <input
          type="password"
          id="password"
          name="password"
          autocomplete="new-password"
        >
        <small>Min 8 characters</small>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password *</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          autocomplete="new-password"
        >
      </div>

      <div class="form-group">
        <label for="age">Age (optional)</label>
        <input
          type="number"
          id="age"
          name="age"
          value="<%= formData.age || '' %>"
          min="18"
          max="120"
        >
      </div>

      <button type="submit" class="btn btn-primary">Create Account</button>
      <p>Already have an account? <a href="/login">Log in</a></p>
    </form>
  </div>
</main>

<%- include("partials/footer") %>
```

---

## 11. Handling Forms with Fetch (AJAX)

Submit forms without a full page reload using the Fetch API:

```html
<!-- views/contact-ajax.ejs -->
<form id="contactForm">
  <input type="text"  name="name"    id="name"    placeholder="Your name" required>
  <input type="email" name="email"   id="email"   placeholder="Email"     required>
  <textarea           name="message" id="message"  rows="4"               required></textarea>
  <button type="submit" id="submitBtn">Send Message</button>
  <div id="formResult"></div>
</form>

<script>
  const form   = document.getElementById("contactForm");
  const result = document.getElementById("formResult");
  const btn    = document.getElementById("submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();   // prevent normal form submission
    btn.disabled    = true;
    btn.textContent = "Sending...";
    result.textContent = "";

    // Option A: send as JSON (requires express.json() on server)
    const payload = {
      name:    document.getElementById("name").value,
      email:   document.getElementById("email").value,
      message: document.getElementById("message").value,
    };

    try {
      const response = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        result.textContent = data.message;
        result.className   = "alert alert-success";
        form.reset();
      } else {
        result.textContent = data.error || "Something went wrong";
        result.className   = "alert alert-error";
      }
    } catch (err) {
      result.textContent = "Network error — please try again";
      result.className   = "alert alert-error";
    } finally {
      btn.disabled    = false;
      btn.textContent = "Send Message";
    }
  });
</script>
```

```javascript
// server.js — JSON API endpoint for the AJAX form
app.use(express.json());

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Process the contact submission
  console.log("AJAX contact form:", { name, email, message });

  res.status(200).json({
    success: true,
    message: "Your message has been sent! We will reply within 24 hours.",
  });
});
```

---

## 12. Common Mistakes

### Mistake 1 — Forgetting the body parser middleware

```javascript
// ❌ req.body is undefined — no middleware registered
app.post("/submit", (req, res) => {
  console.log(req.body); // → undefined
});

// ✅ Register middleware BEFORE routes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/submit", (req, res) => {
  console.log(req.body); // → { name: "Alice", ... }
});
```

### Mistake 2 — Wrong middleware for the Content-Type

```javascript
// ❌ Using json() for a regular HTML form — won't parse it
app.use(express.json());

// HTML forms send: Content-Type: application/x-www-form-urlencoded
// express.json() ignores it → req.body = {}

// ✅ Use urlencoded() for HTML forms
app.use(express.urlencoded({ extended: true }));
```

### Mistake 3 — Forgetting enctype on file upload forms

```html
<!-- ❌ Missing enctype — only filename is sent, not file content -->
<form action="/upload" method="POST">
  <input type="file" name="avatar">
</form>

<!-- ✅ enctype is required for file uploads -->
<form action="/upload" method="POST" enctype="multipart/form-data">
  <input type="file" name="avatar">
</form>
```

### Mistake 4 — Trusting client-side validation alone

```javascript
// ❌ Only client-side validation — can be bypassed via Postman or curl
// <input type="email" required> does nothing server-side

// ✅ Always validate on the server — no exceptions
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.email.includes("@")) {
    return res.status(400).json({ error: "Valid email required" });
  }
});
```

### Mistake 5 — Not repopulating form fields on error

```javascript
// ❌ User loses all their typed data when there is a validation error
return res.render("register", { errors });

// ✅ Pass req.body back so the form is repopulated
return res.render("register", {
  errors,
  formData: req.body,  // fields repopulate from this
});
```

### Mistake 6 — Treating URL-encoded values as the wrong type

```javascript
// URL-encoded form values are ALWAYS strings
const { age, isAdmin } = req.body;

// ❌ Wrong comparisons
if (age > 18) { }          // "28" > 18 = true (coercion), but unreliable
if (isAdmin === true) { }  // "true" === true → false!

// ✅ Correct — convert explicitly
if (Number(age) > 18) { }          // always reliable
if (isAdmin === "true") { }        // compare as string
if (isAdmin === "on") { }          // checkboxes send "on" when checked
```

---

## 13. Quick Reference Cheatsheet

```
┌───────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE SETUP                               │
├───────────────────────────────────────────────────────────────────┤
│  app.use(express.urlencoded({ extended: true })); // HTML forms   │
│  app.use(express.json());                         // API/Fetch     │
│  app.use(express.text());                         // plain text    │
│  import multer → upload.single/array/fields()     // file uploads  │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                  WHERE DATA COMES FROM                            │
├──────────────────────┬────────────────────────────────────────────┤
│  req.body.field      │ POST body (URL-encoded or JSON)            │
│  req.query.field     │ GET query string (?field=value)            │
│  req.params.field    │ Route parameter (/users/:field)            │
│  req.file            │ Single file (multer upload.single())       │
│  req.files           │ Multiple files (multer upload.array())     │
└──────────────────────┴────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                 CONTENT-TYPE → MIDDLEWARE MAP                     │
├──────────────────────────────────┬────────────────────────────────┤
│  application/x-www-form-urlencoded│  express.urlencoded()        │
│  application/json                 │  express.json()              │
│  multipart/form-data              │  multer                      │
│  text/plain                       │  express.text()              │
└──────────────────────────────────┴────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│               URL-ENCODED TYPE GOTCHAS                            │
├───────────────────────────────────────────────────────────────────┤
│  All values are STRINGS — always convert explicitly:              │
│    Number(req.body.age)                → number                   │
│    req.body.active === "true"          → boolean check            │
│    req.body.subscribe === "on"         → checkbox checked         │
│    req.body.tags?.split(",")           → array from CSV string    │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                 PRG PATTERN (Post/Redirect/Get)                   │
├───────────────────────────────────────────────────────────────────┤
│  POST /form → process → req.flash("success", "msg")              │
│            → res.redirect("/success")                            │
│  GET /success → res.render with flash message                    │
│  (prevents duplicate submissions on browser refresh)             │
└───────────────────────────────────────────────────────────────────┘
```

---

> **Summary:** Handling form data in Express requires the right
> middleware for the right Content-Type — `express.urlencoded()` for
> HTML forms, `express.json()` for API requests, and `multer` for file
> uploads. Always validate and sanitize on the server, repopulate
> form fields on error, use the PRG pattern to prevent duplicate
> submissions, and never trust client-side validation alone.