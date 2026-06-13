# Serving Static Files in Express.js — A Detailed Guide

---

## Table of Contents

1. [What are Static Files?](#1-what-are-static-files)
2. [How express.static() Works](#2-how-expressstatic-works)
3. [Basic Setup](#3-basic-setup)
4. [Folder Structure](#4-folder-structure)
5. [Accessing Static Files in the Browser](#5-accessing-static-files-in-the-browser)
6. [Virtual Path Prefix](#6-virtual-path-prefix)
7. [Multiple Static Directories](#7-multiple-static-directories)
8. [express.static() Options](#8-expressstatic-options)
9. [Using Static Files in EJS Templates](#9-using-static-files-in-ejs-templates)
10. [Serving a Single Page Application (SPA)](#10-serving-a-single-page-application-spa)
11. [Serving Static Files in Production](#11-serving-static-files-in-production)
12. [Security Considerations](#12-security-considerations)
13. [Common Mistakes](#13-common-mistakes)
14. [Quick Reference Cheatsheet](#14-quick-reference-cheatsheet)

---

## 1. What are Static Files?

**Static files** are files that are sent to the browser **exactly as they are** — the server does not modify or process them before sending. They are the same for every user who requests them.

```
┌─────────────────────────────────────────────────────────────┐
│                     STATIC FILES                            │
├──────────────────┬──────────────────────────────────────────┤
│ CSS              │ style.css, bootstrap.css, tailwind.css   │
│ JavaScript       │ main.js, app.js, jquery.js               │
│ Images           │ logo.png, banner.jpg, icon.svg           │
│ Fonts            │ roboto.woff2, opensans.ttf                │
│ Documents        │ resume.pdf, manual.pdf                   │
│ Audio / Video    │ intro.mp3, demo.mp4                      │
│ HTML             │ index.html (for SPAs)                    │
│ Icons            │ favicon.ico                              │
└──────────────────┴──────────────────────────────────────────┘
```

### Static vs Dynamic

```
┌─────────────────────────────────────────────────────────────────┐
│  STATIC  → same file sent every time, no server processing      │
│  Request: GET /style.css                                        │
│  Response: the raw CSS file — identical for every user          │
├─────────────────────────────────────────────────────────────────┤
│  DYNAMIC → server builds the response using data and logic      │
│  Request: GET /profile/42                                       │
│  Response: HTML built from a template + database data           │
│            (different for every user)                           │
└─────────────────────────────────────────────────────────────────┘
```

### Without express.static()

Without static file middleware, Express has no idea what to do with
requests for `.css`, `.js`, or `.png` files — it would return 404
for all of them.

```javascript
// ❌ Without express.static()
// GET /style.css → 404 Not Found
// GET /logo.png  → 404 Not Found
// GET /main.js   → 404 Not Found

// ✅ With express.static("public")
// GET /style.css → serves public/style.css
// GET /logo.png  → serves public/logo.png
// GET /main.js   → serves public/main.js
```

---

## 2. How express.static() Works

`express.static()` is a **built-in middleware** in Express. When a
request comes in, it checks whether the requested file exists in the
specified directory. If it does, it serves it. If not, it calls
`next()` and lets the next middleware or route handle the request.

```
Incoming Request: GET /css/style.css
         │
         ▼
┌────────────────────────────────────┐
│     express.static("public")       │
│                                    │
│  Does public/css/style.css exist?  │
│                                    │
│   YES → serve the file ✅          │
│   NO  → call next() and move on ➡  │
└────────────────────────────────────┘
         │ (if not found)
         ▼
  Next middleware or route handler
```

### What it does automatically

- Sets the correct **Content-Type** header for every file type
- Handles **HTTP caching** headers (`ETag`, `Last-Modified`, `Cache-Control`)
- Responds to **conditional GET requests** (`If-None-Match`, `If-Modified-Since`)
- Supports **range requests** for audio/video streaming
- Handles `index.html` automatically when a directory is requested

---

## 3. Basic Setup

```javascript
// server.js
import express from "express";
import path    from "path";
import { fileURLToPath } from "url";

// __dirname is not available in ES Modules — this is the workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = 3000;

// Serve all files inside the "public" folder as static assets
// path.join() builds the correct absolute path regardless of OS
// __dirname + "public" = /absolute/path/to/your/project/public
app.use(express.static(path.join(__dirname, "public")));

// Other middleware and routes go here
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

### Why use `path.join(__dirname, "public")` and not just `"public"`?

```javascript
// Relative path — works only if you run node from the project root
app.use(express.static("public"));
// ✅ Works when: cd project && node server.js
// ❌ Breaks when: node /some/other/dir/project/server.js

// Absolute path — always works, no matter where you run node from
app.use(express.static(path.join(__dirname, "public")));
// ✅ Always works — __dirname is always the directory of server.js
```

> **Best practice:** Always use `path.join(__dirname, "public")` for reliability.

---

## 4. Folder Structure

```
project/
│
├── server.js
├── package.json
│
├── public/                     ← static files root
│   │
│   ├── index.html              → http://localhost:3000/
│   ├── about.html              → http://localhost:3000/about.html
│   ├── favicon.ico             → http://localhost:3000/favicon.ico
│   │
│   ├── css/
│   │   ├── style.css           → http://localhost:3000/css/style.css
│   │   ├── bootstrap.min.css   → http://localhost:3000/css/bootstrap.min.css
│   │   └── responsive.css      → http://localhost:3000/css/responsive.css
│   │
│   ├── js/
│   │   ├── main.js             → http://localhost:3000/js/main.js
│   │   ├── utils.js            → http://localhost:3000/js/utils.js
│   │   └── vendor/
│   │       └── jquery.min.js   → http://localhost:3000/js/vendor/jquery.min.js
│   │
│   ├── images/
│   │   ├── logo.png            → http://localhost:3000/images/logo.png
│   │   ├── banner.jpg          → http://localhost:3000/images/banner.jpg
│   │   └── icons/
│   │       └── arrow.svg       → http://localhost:3000/images/icons/arrow.svg
│   │
│   ├── fonts/
│   │   ├── roboto.woff2        → http://localhost:3000/fonts/roboto.woff2
│   │   └── opensans.ttf        → http://localhost:3000/fonts/opensans.ttf
│   │
│   └── downloads/
│       └── manual.pdf          → http://localhost:3000/downloads/manual.pdf
│
├── views/                      ← EJS/Pug templates (NOT public)
│   ├── index.ejs
│   └── partials/
│
└── uploads/                    ← user-uploaded files (separate from public)
    └── avatars/
```

> **Key rule:** The `public/` folder name is stripped from the URL.  
> `public/css/style.css` is accessed as `/css/style.css` — not `/public/css/style.css`.

---

## 5. Accessing Static Files in the Browser

Once `express.static("public")` is set up, files are accessible by
their path **relative to the public folder**:

```
File on disk                      URL in browser
─────────────────────────────     ──────────────────────────────────────
public/index.html             →   http://localhost:3000/
public/about.html             →   http://localhost:3000/about.html
public/css/style.css          →   http://localhost:3000/css/style.css
public/js/main.js             →   http://localhost:3000/js/main.js
public/images/logo.png        →   http://localhost:3000/images/logo.png
public/fonts/roboto.woff2     →   http://localhost:3000/fonts/roboto.woff2
public/favicon.ico            →   http://localhost:3000/favicon.ico
public/downloads/manual.pdf   →   http://localhost:3000/downloads/manual.pdf
```

### Linking static files in HTML

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My App</title>

  <!-- CSS — path starts from public/ root, so no "public/" prefix -->
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/bootstrap.min.css">

  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
<body>

  <!-- Image -->
  <img src="/images/logo.png" alt="Logo" width="200">

  <!-- Link to another static HTML page -->
  <a href="/about.html">About Us</a>

  <!-- JavaScript — always at the bottom of body -->
  <script src="/js/main.js"></script>
</body>
</html>
```

### Automatic index.html

When a user visits a directory URL (e.g. `http://localhost:3000/`),
Express automatically serves `index.html` from that directory if it exists:

```
GET /           → serves public/index.html   (automatically)
GET /docs/      → serves public/docs/index.html (if it exists)
```

---

## 6. Virtual Path Prefix

A **virtual path prefix** adds a URL prefix that doesn't exist on disk.
The files are still in the same folder — but they're accessed via
a different URL path.

```javascript
// Files are in the "public" folder on disk
// But accessed via the "/static" URL prefix in the browser

app.use("/static", express.static(path.join(__dirname, "public")));

// File on disk                URL in browser
// public/css/style.css    →   http://localhost:3000/static/css/style.css
// public/js/main.js       →   http://localhost:3000/static/js/main.js
// public/images/logo.png  →   http://localhost:3000/static/images/logo.png
```

### Why use a virtual prefix?

```
1. VERSIONING — prefix with version number for cache busting
   app.use("/v2", express.static("public"));
   → /v2/style.css  (changing prefix forces browsers to re-download)

2. NAMESPACING — separate static files from API routes clearly
   app.use("/assets", express.static("public"));
   → /assets/logo.png  (clearly not an API endpoint)

3. SECURITY — hide the real directory structure from users
   app.use("/static", express.static("public"));
   → users never know files live in "public/"
```

### Linking files with a virtual prefix

```html
<!-- When using a virtual prefix "/static", all links must include it -->
<link rel="stylesheet" href="/static/css/style.css">
<script src="/static/js/main.js"></script>
<img src="/static/images/logo.png" alt="Logo">
```

---

## 7. Multiple Static Directories

You can register `express.static()` multiple times with different
directories. Express searches them **in the order they are registered**.

```javascript
// Serve from TWO directories
app.use(express.static(path.join(__dirname, "public")));   // checked first
app.use(express.static(path.join(__dirname, "uploads")));  // checked second

// Request: GET /logo.png
// Step 1: Does public/logo.png exist?  → YES → serve it ✅ (stops here)
// Step 2: (never reached)

// Request: GET /avatar.png
// Step 1: Does public/avatar.png exist?  → NO  → try next directory
// Step 2: Does uploads/avatar.png exist? → YES → serve it ✅
```

### Practical example — public files + user uploads

```javascript
// Main static assets (CSS, JS, images bundled with the app)
app.use(express.static(path.join(__dirname, "public")));

// User-uploaded files (profile pictures, documents)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Example URLs:
// http://localhost:3000/css/style.css        → public/css/style.css
// http://localhost:3000/uploads/avatar.png   → uploads/avatar.png
```

### Three directories with prefixes

```javascript
// Different sections of the site served from different directories
app.use("/",        express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/docs",    express.static(path.join(__dirname, "documentation")));

// http://localhost:3000/css/style.css          → public/css/style.css
// http://localhost:3000/uploads/photo.jpg      → uploads/photo.jpg
// http://localhost:3000/docs/api-reference.pdf → documentation/api-reference.pdf
```

---

## 8. express.static() Options

`express.static()` accepts an optional second argument with configuration:

```javascript
app.use(express.static(path.join(__dirname, "public"), {

  // ── dotfiles ─────────────────────────────────────────────────
  // How to handle files starting with a dot (e.g. .env, .htaccess)
  // "ignore"  → pretend they don't exist (returns 404) — DEFAULT
  // "allow"   → serve them normally
  // "deny"    → return 403 Forbidden
  dotfiles: "ignore",  // never expose .env, .gitignore etc.

  // ── etag ─────────────────────────────────────────────────────
  // Generate ETag headers for caching validation
  // ETag = a fingerprint of the file — browser sends it back next
  // time to check if the file changed (304 Not Modified if same)
  etag: true,          // default: true — leave enabled for caching

  // ── extensions ───────────────────────────────────────────────
  // Try these extensions if the requested file has no extension
  // GET /about → tries about.html, about.htm in order
  extensions: ["html", "htm"],

  // ── index ─────────────────────────────────────────────────────
  // File to serve when a directory is requested
  // GET / → serves public/index.html automatically
  // Set to false to disable this behaviour
  index: "index.html",  // default: "index.html"

  // ── lastModified ──────────────────────────────────────────────
  // Set the Last-Modified header to the file's last modification date
  // Browsers use this to validate cached copies
  lastModified: true,   // default: true

  // ── maxAge ─────────────────────────────────────────────────────
  // Sets the Cache-Control max-age header — how long browsers cache the file
  // Value: milliseconds (number) or a string like "1d", "7d", "1y"
  // 0   → no caching (always re-fetch) — good for development
  // "1d" → cache for 1 day
  // "1y" → cache for 1 year — good for fingerprinted assets in production
  maxAge: 0,            // development: no cache
  // maxAge: "1d",      // production: cache for 1 day
  // maxAge: "1y",      // production: cache fingerprinted assets for 1 year

  // ── redirect ──────────────────────────────────────────────────
  // Redirect to trailing slash when URL is a directory without slash
  // GET /about → 301 redirect to /about/
  redirect: true,       // default: true

  // ── setHeaders ────────────────────────────────────────────────
  // Custom function to set additional response headers per file
  setHeaders: (res, filePath, stat) => {
    // filePath = absolute path to the file being served
    // stat     = file stats object (size, mtime, etc.)

    // Example: add CORS header for font files
    if (filePath.endsWith(".woff2") || filePath.endsWith(".ttf")) {
      res.set("Access-Control-Allow-Origin", "*");
    }

    // Example: force PDF download instead of opening in browser
    if (filePath.endsWith(".pdf")) {
      res.set("Content-Disposition", "attachment");
    }

    // Example: add custom cache header for images
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(filePath)) {
      res.set("Cache-Control", "public, max-age=86400"); // 1 day
    }
  },

}));
```

### Development vs Production config

```javascript
const isDev = process.env.NODE_ENV !== "production";

app.use(express.static(path.join(__dirname, "public"), {
  // In development: no caching so changes are visible immediately
  // In production:  cache for 1 day to reduce server load
  maxAge: isDev ? 0 : "1d",

  // ETags help browsers validate cached files — always keep on
  etag: true,

  // Dotfiles always ignored for security
  dotfiles: "ignore",
}));
```

---

## 9. Using Static Files in EJS Templates

When using a template engine alongside static files, link assets
using absolute paths starting with `/`:

```html
<!-- views/partials/header.ejs -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %> | My App</title>

  <!-- ✅ Absolute path — works on any page, any URL depth -->
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/components.css">

  <!-- ❌ Relative path — BREAKS on nested routes like /users/profile -->
  <!-- <link rel="stylesheet" href="css/style.css"> -->

  <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
<body>
```

```html
<!-- views/partials/navbar.ejs -->
<nav class="navbar">
  <!-- Logo image from static folder -->
  <a href="/">
    <img src="/images/logo.png" alt="My App Logo" height="40">
  </a>

  <ul class="nav-links">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/products">Products</a></li>
  </ul>
</nav>
```

```html
<!-- views/partials/footer.ejs -->
  <!-- JavaScript at the bottom — improves page load performance -->
  <script src="/js/main.js"></script>
  <script src="/js/utils.js"></script>

  <footer class="footer">
    <p>&copy; <%= year %> My App</p>
  </footer>
</body>
</html>
```

```html
<!-- views/products.ejs — dynamic image paths -->
<%- include("partials/header") %>

<main>
  <% products.forEach(product => { %>
    <div class="product-card">

      <!-- Dynamic image path — built from product data -->
      <img
        src="/images/products/<%= product.image %>"
        alt="<%= product.name %>"
        onerror="this.src='/images/placeholder.png'"
      >

      <h3><%= product.name %></h3>
      <p>$<%= product.price.toFixed(2) %></p>
    </div>
  <% }) %>
</main>

<%- include("partials/footer") %>
```

### Serving user-uploaded files

```javascript
// server.js
import multer from "multer"; // npm install multer
import path   from "path";

// Configure multer to save uploads to the "uploads/avatars" folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads/avatars"));
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp + original extension
    const ext      = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Serve the uploads folder so users can access their files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Upload endpoint
app.post("/upload/avatar", upload.single("avatar"), (req, res) => {
  // req.file.filename = "1705312345678.jpg"
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  res.json({
    message:   "Avatar uploaded successfully",
    avatarUrl, // client uses this URL to display the image
  });
});
```

```html
<!-- In a template — display a user's uploaded avatar -->
<img
  src="<%= user.avatarUrl || '/images/default-avatar.png' %>"
  alt="<%= user.name %>'s avatar"
  class="avatar"
>
```

---

## 10. Serving a Single Page Application (SPA)

When serving a React/Vue/Angular app built with Vite or CRA,
all routes should serve the same `index.html` — the JS router
handles navigation on the client side.

```javascript
// server.js
import express from "express";
import path    from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Serve the built SPA files (e.g. from "dist" after running npm run build)
app.use(express.static(path.join(__dirname, "dist")));

// API routes — handled by Express before the SPA catch-all
app.use("/api/users",    usersRouter);
app.use("/api/products", productsRouter);

// SPA catch-all — for any route not matched above
// Send index.html and let the client-side router handle it
// GET /about     → index.html (React Router handles /about)
// GET /products/5 → index.html (React Router handles /products/5)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(3000);
```

### Why the catch-all is needed

```
Without catch-all:
  User navigates to http://localhost:3000/about
  → Browser requests GET /about from Express
  → Express has no /about route → 404 ❌

With catch-all:
  User navigates to http://localhost:3000/about
  → Browser requests GET /about from Express
  → Express serves dist/index.html ✅
  → React Router reads the URL and renders the /about component ✅
```

---

## 11. Serving Static Files in Production

In production you generally don't serve static files from Express.
A dedicated **reverse proxy** or **CDN** is faster and more efficient.

### With Nginx as a reverse proxy

```nginx
# /etc/nginx/sites-available/myapp
server {
    listen 80;
    server_name myapp.com;

    # Nginx serves static files directly — much faster than Node.js
    location /static/ {
        root /var/www/myapp/public;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # Everything else goes to Express (API routes, dynamic pages)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### With a CDN (e.g. Cloudflare, AWS CloudFront)

```javascript
// Use different asset base URLs per environment
const ASSET_BASE_URL = process.env.NODE_ENV === "production"
  ? "https://cdn.myapp.com"   // files served from CDN in production
  : "";                        // local in development (no prefix)

app.locals.assetUrl = ASSET_BASE_URL;
```

```html
<!-- views/partials/header.ejs -->
<!-- In development: /css/style.css -->
<!-- In production:  https://cdn.myapp.com/css/style.css -->
<link rel="stylesheet" href="<%= assetUrl %>/css/style.css">
<script src="<%= assetUrl %>/js/main.js"></script>
```

### Cache busting with file fingerprinting

When you deploy new versions of your CSS or JS, browsers may serve
the old cached version. The solution is to include a hash or version
in the filename — changing it forces browsers to re-download.

```
style.css           → cached forever (bad)
style.a1b2c3d4.css  → hash in filename — when file changes, hash changes
                       browsers download the new file automatically ✅
```

```javascript
// Simple version-based approach using package.json version
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { version } = require("./package.json");

// Pass version to templates for cache busting
app.locals.version = version;
```

```html
<!-- Append version as query string — browser sees it as a new URL -->
<link rel="stylesheet" href="/css/style.css?v=<%= version %>">
<script src="/js/main.js?v=<%= version %>"></script>
```

---

## 12. Security Considerations

### Never serve sensitive files

```javascript
// ❌ BAD — serving root project directory exposes everything
app.use(express.static(__dirname));
// This would serve: server.js, .env, package.json, node_modules, etc.

// ✅ GOOD — serve only the dedicated public folder
app.use(express.static(path.join(__dirname, "public")));
```

### Protect dotfiles

```javascript
// express.static() ignores dotfiles by default — this is good security
// .env, .htaccess, .git, etc. will return 404 even if they somehow
// end up inside the public folder
app.use(express.static(path.join(__dirname, "public"), {
  dotfiles: "ignore",  // default — but be explicit about it
}));
```

### Restrict upload types

```javascript
// When serving user uploads, validate file types before saving
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);  // accept the file
    } else {
      cb(new Error("Only image files are allowed"), false); // reject
    }
  },
});
```

### Prevent path traversal attacks

```javascript
// express.static() automatically prevents path traversal:
// GET /../../../etc/passwd → 403 Forbidden (blocked by Express)
// This protection is built-in — no extra config needed
```

### Add security headers for downloads

```javascript
app.use(express.static(path.join(__dirname, "public"), {
  setHeaders: (res, filePath) => {
    // Force PDFs to download rather than open in the browser
    if (filePath.endsWith(".pdf")) {
      res.set("Content-Disposition", "attachment");
    }

    // Prevent browsers from MIME-sniffing (security best practice)
    res.set("X-Content-Type-Options", "nosniff");
  },
}));
```

---

## 13. Common Mistakes

### Mistake 1 — Wrong path using relative string

```javascript
// ❌ Breaks when Node is run from a different directory
app.use(express.static("public"));

// ✅ Always works — absolute path
app.use(express.static(path.join(__dirname, "public")));
```

### Mistake 2 — Including "public" in HTML links

```html
<!-- ❌ Wrong — "public" is the folder name, not part of the URL -->
<link rel="stylesheet" href="/public/css/style.css">

<!-- ✅ Correct — "public" is stripped from the URL by Express -->
<link rel="stylesheet" href="/css/style.css">
```

### Mistake 3 — Using relative paths in templates

```html
<!-- ❌ Relative path — breaks on any route that isn't at root level -->
<!-- Works on /  but breaks on /users/profile -->
<link rel="stylesheet" href="css/style.css">

<!-- ✅ Absolute path — works on all routes, any nesting level -->
<link rel="stylesheet" href="/css/style.css">
```

### Mistake 4 — Registering static middleware after routes

```javascript
// ❌ If a route matches first, static files may never be served
app.get("/", (req, res) => res.send("Home"));
app.use(express.static("public")); // too late — routes already matched

// ✅ Register static middleware BEFORE routes
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => res.send("Home"));
```

### Mistake 5 — Exposing the entire project as static

```javascript
// ❌ DANGEROUS — exposes server.js, .env, node_modules, and everything else
app.use(express.static(__dirname));

// ✅ Only expose the dedicated public folder
app.use(express.static(path.join(__dirname, "public")));
```

### Mistake 6 — Not handling missing images gracefully

```html
<!-- ✅ Fallback image if the main one fails to load -->
<img
  src="/images/products/<%= product.image %>"
  alt="<%= product.name %>"
  onerror="this.src='/images/placeholder.png'; this.onerror=null;"
>
```

---

## 14. Quick Reference Cheatsheet

```
┌──────────────────────────────────────────────────────────────────┐
│                        BASIC SETUP                              │
├──────────────────────────────────────────────────────────────────┤
│  import path from "path";                                        │
│  import { fileURLToPath } from "url";                            │
│                                                                  │
│  const __dirname = path.dirname(fileURLToPath(import.meta.url)); │
│                                                                  │
│  app.use(express.static(path.join(__dirname, "public")));        │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    URL MAPPING RULE                             │
├──────────────────────────────────────────────────────────────────┤
│  public/css/style.css   →  /css/style.css                        │
│  public/js/main.js      →  /js/main.js                           │
│  public/images/logo.png →  /images/logo.png                      │
│  public/index.html      →  /  (auto served)                      │
│                                                                  │
│  "public" is NEVER part of the URL                               │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    VIRTUAL PREFIX                               │
├──────────────────────────────────────────────────────────────────┤
│  app.use("/assets", express.static("public"));                   │
│  public/logo.png  →  /assets/logo.png                            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    KEY OPTIONS                                   │
├─────────────────────┬────────────────────────────────────────────┤
│  dotfiles           │ "ignore" (default) / "allow" / "deny"     │
│  etag               │ true (default) — cache validation          │
│  extensions         │ ["html"] — try extensions if no match      │
│  index              │ "index.html" — file for directory requests  │
│  maxAge             │ 0 (dev) / "1d" (prod) — browser cache time │
│  setHeaders         │ function to add custom headers per file    │
└─────────────────────┴────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   CORRECT ORDER                                 │
├──────────────────────────────────────────────────────────────────┤
│  1. helmet() / cors()                                            │
│  2. express.static()     ← before routes                         │
│  3. express.json()                                               │
│  4. Route handlers                                               │
│  5. 404 handler                                                  │
│  6. Error handler                                                │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    NEVER DO THIS                                 │
├──────────────────────────────────────────────────────────────────┤
│  ❌ app.use(express.static(__dirname))    — exposes everything   │
│  ❌ href="/public/css/style.css"          — wrong URL prefix     │
│  ❌ href="css/style.css"                  — relative path breaks  │
│  ❌ express.static("public") without path.join — unreliable     │
└──────────────────────────────────────────────────────────────────┘
```

---

> **Summary:** `express.static()` is the simplest middleware in Express but one of the most important. Point it at a dedicated `public/` folder, always use `path.join(__dirname, "public")` for reliability, link assets with absolute paths starting with `/`, and never expose your project root. Everything else — caching, ETags, Content-Type headers — is handled for you automatically.