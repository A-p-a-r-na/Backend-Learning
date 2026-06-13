# Template Engines in Express.js — A Detailed Guide

---

## Table of Contents

1. [What is a Template Engine?](#1-what-is-a-template-engine)
2. [How Template Engines Work](#2-how-template-engines-work)
3. [Server-Side Rendering vs Client-Side Rendering](#3-server-side-rendering-vs-client-side-rendering)
4. [Popular Template Engines](#4-popular-template-engines)
5. [Setting Up EJS](#5-setting-up-ejs)
6. [EJS Syntax — Complete Guide](#6-ejs-syntax--complete-guide)
7. [Passing Data to Templates](#7-passing-data-to-templates)
8. [EJS Partials — Reusable Fragments](#8-ejs-partials--reusable-fragments)
9. [EJS Layouts](#9-ejs-layouts)
10. [Setting Up Pug](#10-setting-up-pug)
11. [Pug Syntax — Complete Guide](#11-pug-syntax--complete-guide)
12. [Setting Up Handlebars](#12-setting-up-handlebars)
13. [Handlebars Syntax — Complete Guide](#13-handlebars-syntax--complete-guide)
14. [EJS vs Pug vs Handlebars](#14-ejs-vs-pug-vs-handlebars)
15. [Full Project Example with EJS](#15-full-project-example-with-ejs)
16. [Quick Reference Cheatsheet](#16-quick-reference-cheatsheet)

---

## 1. What is a Template Engine?

A **template engine** allows you to generate dynamic HTML on the **server side** by combining a static HTML template with live data before sending it to the browser.

Instead of writing:
```javascript
// ❌ Hard to maintain — HTML mixed into JavaScript strings
res.send(`
  <html>
    <body>
      <h1>Hello, ${user.name}!</h1>
      <p>You have ${messages.length} messages.</p>
      <ul>
        ${messages.map(m => `<li>${m.text}</li>`).join("")}
      </ul>
    </body>
  </html>
`);
```

You write a clean template file:
```html
<!-- views/home.ejs ✅ clean, readable, maintainable -->
<h1>Hello, <%= user.name %>!</h1>
<p>You have <%= messages.length %> messages.</p>
<ul>
  <% messages.forEach(m => { %>
    <li><%= m.text %></li>
  <% }) %>
</ul>
```

And in Express:
```javascript
res.render("home", { user, messages });
```

---

## 2. How Template Engines Work

```
┌────────────────────────────────────────────────────────────┐
│                     THE PROCESS                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   Template File          Data from Server                  │
│   (views/home.ejs)  +   { name: "Alice", age: 28 }        │
│          │                        │                        │
│          └──────────┬─────────────┘                        │
│                     │                                      │
│                     ▼                                      │
│            Template Engine                                 │
│         (EJS / Pug / Handlebars)                           │
│                     │                                      │
│                     ▼                                      │
│            Final HTML String                               │
│   <h1>Hello, Alice!</h1><p>Age: 28</p>                     │
│                     │                                      │
│                     ▼                                      │
│         Sent to Browser as HTTP Response                   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Step-by-step in Express

```javascript
// 1. Express receives a request
app.get("/profile", (req, res) => {

  // 2. Fetch or build the data
  const data = { name: "Alice", age: 28, role: "admin" };

  // 3. res.render() tells Express:
  //    - find the file "views/profile.ejs"
  //    - inject the data object into it
  //    - compile the result into a plain HTML string
  //    - send that HTML string as the HTTP response
  res.render("profile", data);
});
```

---

## 3. Server-Side Rendering vs Client-Side Rendering

```
┌──────────────────────────────────────────────────────────────────┐
│           SERVER-SIDE RENDERING (SSR) — Template Engines         │
├──────────────────────────────────────────────────────────────────┤
│  HTML is built on the SERVER before being sent to the browser    │
│  Browser receives complete, ready-to-display HTML                │
│  Great for: SEO, fast initial load, simple apps, dashboards      │
│                                                                  │
│  Request → Server builds HTML → Browser displays it             │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│           CLIENT-SIDE RENDERING (CSR) — React / Vue / Angular    │
├──────────────────────────────────────────────────────────────────┤
│  Browser receives empty HTML + JavaScript bundle                 │
│  JavaScript runs in the browser and builds the HTML              │
│  Great for: SPAs, highly interactive apps, real-time updates     │
│                                                                  │
│  Request → Server sends JS → Browser builds HTML                 │
└──────────────────────────────────────────────────────────────────┘
```

### When to use a template engine (SSR)

- Admin dashboards and internal tools
- Blogs, news sites, e-commerce (SEO matters)
- Simple web apps where React/Vue would be overkill
- Email generation (HTML emails)
- Apps that need to work without JavaScript

---

## 4. Popular Template Engines

```
┌──────────────────┬───────────────┬──────────────────────────────┐
│ Engine           │ File Ext.     │ Style                        │
├──────────────────┼───────────────┼──────────────────────────────┤
│ EJS              │ .ejs          │ HTML with embedded JS tags   │
│ Pug (ex-Jade)    │ .pug          │ Indentation-based, no tags   │
│ Handlebars (hbs) │ .hbs          │ Logic-less, {{mustache}}     │
│ Nunjucks         │ .njk          │ Jinja2-style, powerful       │
│ Mustache         │ .mustache     │ Minimal, logic-less          │
└──────────────────┴───────────────┴──────────────────────────────┘
```

This guide covers the three most widely used: **EJS**, **Pug**, and **Handlebars**.

---

## 5. Setting Up EJS

EJS (Embedded JavaScript) is the most beginner-friendly template engine — it's just HTML with special tags for JavaScript.

### Installation

```bash
npm install ejs
```

### Configuration in Express

```javascript
import express from "express";
import path    from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Tell Express which template engine to use
// Express will automatically look for files with the .ejs extension
app.set("view engine", "ejs");

// Tell Express where to find template files
// By default Express looks in a "views" folder in the project root
// This line makes it explicit — good practice
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, JS, images) from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

### Folder structure

```
project/
├── server.js
├── views/                  ← template files live here
│   ├── index.ejs
│   ├── about.ejs
│   ├── profile.ejs
│   └── partials/           ← reusable fragments
│       ├── header.ejs
│       ├── footer.ejs
│       └── navbar.ejs
├── public/                 ← static assets
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
└── package.json
```

---

## 6. EJS Syntax — Complete Guide

### The three EJS tag types

```
┌───────────────┬────────────────────────────────────────────────┐
│ Tag           │ Purpose                                        │
├───────────────┼────────────────────────────────────────────────┤
│ <%= value %>  │ Output — renders the value (HTML-escaped)      │
│ <%- value %>  │ Raw output — renders HTML as-is (unescaped)    │
│ <% code %>    │ Script — runs JS but outputs nothing           │
│ <%# comment%> │ Comment — not sent to the browser              │
└───────────────┴────────────────────────────────────────────────┘
```

### Output tags

```html
<!-- views/demo.ejs -->

<!-- <%= %> — outputs value, escapes HTML special characters -->
<!-- Escaping protects against XSS attacks -->
<p>Name: <%= name %></p>
<!-- If name = "Alice" → <p>Name: Alice</p> -->
<!-- If name = "<script>alert('xss')</script>" → rendered as safe text -->

<!-- <%- %> — outputs raw HTML, NO escaping -->
<!-- Only use this when you trust the content (e.g. your own HTML) -->
<div><%- htmlContent %></div>
<!-- If htmlContent = "<strong>Bold</strong>" → renders as actual bold text -->

<!-- <%# %> — EJS comment, never sent to the browser -->
<%# This comment won't appear in the HTML source %>
```

### Script tag — control flow

```html
<!-- <% %> — runs JavaScript, produces no output itself -->

<!-- if / else -->
<% if (user.role === "admin") { %>
  <p>Welcome, Administrator!</p>
<% } else if (user.role === "editor") { %>
  <p>Welcome, Editor!</p>
<% } else { %>
  <p>Welcome, Guest!</p>
<% } %>

<!-- forEach loop — render a list -->
<ul>
  <% products.forEach(product => { %>
    <li>
      <%= product.name %> — $<%= product.price.toFixed(2) %>
    </li>
  <% }) %>
</ul>

<!-- for loop -->
<% for (let i = 1; i <= 5; i++) { %>
  <p>Item <%= i %></p>
<% } %>

<!-- Ternary expression inside output tag -->
<p>Status: <%= isActive ? "Active" : "Inactive" %></p>

<!-- Accessing object properties -->
<p><%= user.name %> — <%= user.email %></p>

<!-- Calling methods -->
<p><%= title.toUpperCase() %></p>
<p><%= new Date().getFullYear() %></p>
```

### Rendering arrays and objects

```html
<!-- Array of strings -->
<% const colors = ["red", "green", "blue"]; %>
<ul>
  <% colors.forEach(color => { %>
    <li style="color: <%= color %>"><%= color %></li>
  <% }) %>
</ul>

<!-- Array of objects -->
<table>
  <thead>
    <tr><th>Name</th><th>Email</th><th>Role</th></tr>
  </thead>
  <tbody>
    <% users.forEach(user => { %>
      <tr>
        <td><%= user.name %></td>
        <td><%= user.email %></td>
        <td><%= user.role %></td>
      </tr>
    <% }) %>
  </tbody>
</table>

<!-- Conditional class — apply CSS class based on data -->
<% users.forEach(user => { %>
  <div class="user-card <%= user.isActive ? 'active' : 'inactive' %>">
    <%= user.name %>
  </div>
<% }) %>
```

---

## 7. Passing Data to Templates

Data is passed as the **second argument** to `res.render()`. Everything in that object becomes a local variable inside the template.

```javascript
// server.js

// Passing simple values
app.get("/", (req, res) => {
  res.render("index", {
    title:    "Home Page",
    heading:  "Welcome to My App",
    year:     new Date().getFullYear(),
  });
  // In the template: <%= title %>, <%= heading %>, <%= year %>
});

// Passing an object
app.get("/profile/:id", (req, res) => {
  const user = {
    id:       req.params.id,
    name:     "Alice",
    email:    "alice@example.com",
    role:     "admin",
    isActive: true,
    joinedAt: new Date("2023-01-15"),
  };

  res.render("profile", { user });
  // In the template: <%= user.name %>, <%= user.email %>
});

// Passing an array
app.get("/products", (req, res) => {
  const products = [
    { id: 1, name: "Laptop",  price: 999.99, inStock: true  },
    { id: 2, name: "Mouse",   price: 29.99,  inStock: true  },
    { id: 3, name: "Monitor", price: 399.99, inStock: false },
  ];

  res.render("products", {
    title:    "All Products",
    products,
    count:    products.length,
  });
});

// Passing multiple data types together
app.get("/dashboard", (req, res) => {
  res.render("dashboard", {
    user:         { name: "Alice", role: "admin" },
    stats:        { users: 1240, orders: 88, revenue: 54320 },
    recentOrders: [
      { id: 101, product: "Laptop",  status: "shipped" },
      { id: 102, product: "Mouse",   status: "pending" },
    ],
    notifications: 5,
    isAdmin:       true,
  });
});
```

### Global template variables with app.locals

```javascript
// Variables set on app.locals are available in EVERY template
// without passing them manually each time
app.locals.appName    = "My Express App";
app.locals.year       = new Date().getFullYear();
app.locals.version    = "1.0.0";

// Now every template can use:
// <%= appName %>, <%= year %>, <%= version %>
// without them being passed in res.render()
```

### Per-request variables with res.locals

```javascript
// Variables set on res.locals are available in templates
// for the duration of that single request
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;      // from auth middleware
  res.locals.isLoggedIn  = !!req.user;
  res.locals.flashMessage = req.session?.flash || null;
  next();
});

// Every template now has access to:
// <%= currentUser?.name %>, <%= isLoggedIn %>, <%= flashMessage %>
```

---

## 8. EJS Partials — Reusable Fragments

Partials are **reusable template fragments** included inside other templates — great for headers, footers, navbars, and sidebars.

### Creating partials

```html
<!-- views/partials/header.ejs -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title || "My App" %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
```

```html
<!-- views/partials/navbar.ejs -->
<nav class="navbar">
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/products">Products</a>

  <!-- Show different links based on login state -->
  <% if (isLoggedIn) { %>
    <a href="/profile">Profile</a>
    <a href="/logout">Logout</a>
  <% } else { %>
    <a href="/login">Login</a>
  <% } %>
</nav>
```

```html
<!-- views/partials/footer.ejs -->
  <footer>
    <p>&copy; <%= new Date().getFullYear() %> My App. All rights reserved.</p>
  </footer>
</body>
</html>
```

### Using partials with <%- include() %>

```html
<!-- views/index.ejs -->

<!-- <%- include("partials/header") %> -->
<!-- Use <%- (raw) not <%= (escaped) — the partial contains real HTML -->
<%- include("partials/header") %>
<%- include("partials/navbar") %>

<main>
  <h1><%= heading %></h1>
  <p>Welcome to the home page!</p>

  <section class="features">
    <% features.forEach(feature => { %>
      <div class="feature-card">
        <h3><%= feature.title %></h3>
        <p><%= feature.description %></p>
      </div>
    <% }) %>
  </section>
</main>

<%- include("partials/footer") %>
```

### Passing data to partials

```html
<!-- Pass variables directly into an included partial -->
<%- include("partials/card", { title: "Hello", body: "World" }) %>

<!-- views/partials/card.ejs -->
<div class="card">
  <h3><%= title %></h3>
  <p><%= body %></p>
</div>

<!-- Including in a loop with dynamic data -->
<% products.forEach(product => { %>
  <%- include("partials/product-card", { product }) %>
<% }) %>
```

---

## 9. EJS Layouts

EJS doesn't have built-in layout support, but the `express-ejs-layouts` package adds it.

```bash
npm install express-ejs-layouts
```

```javascript
// server.js
import expressLayouts from "express-ejs-layouts";

app.use(expressLayouts);
app.set("layout", "layouts/main"); // default layout file
```

```html
<!-- views/layouts/main.ejs — the wrapper that all pages share -->
<!DOCTYPE html>
<html lang="en">
<head>
  <title><%= title || "My App" %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>

  <main>
    <%- body %>
    <!-- <%- body %> is replaced with the content of each page's template -->
  </main>

  <footer>
    <p>&copy; <%= new Date().getFullYear() %></p>
  </footer>
</body>
</html>
```

```html
<!-- views/index.ejs — only the page-specific content -->
<!-- No <html>, <head>, or <body> needed — the layout provides them -->
<h1><%= heading %></h1>
<p>This is the home page content.</p>
```

```html
<!-- views/about.ejs -->
<h1>About Us</h1>
<p>We are a great company!</p>
```

---

## 10. Setting Up Pug

Pug (formerly Jade) uses **indentation** instead of HTML tags. More concise, but has a steeper learning curve.

### Installation

```bash
npm install pug
```

### Configuration

```javascript
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
```

---

## 11. Pug Syntax — Complete Guide

Pug replaces HTML tags and angle brackets with **indented plain text**. Indentation defines nesting.

```pug
//- views/index.pug
//- "//-" is a Pug comment (not sent to browser)
//- "-//" is also valid

doctype html
html(lang="en")
  head
    title= title
    link(rel="stylesheet", href="/css/style.css")
  body
    nav
      a(href="/") Home
      a(href="/about") About

    main
      h1= heading
      p Welcome to my app!

    footer
      p &copy; #{year}
```

### Pug syntax rules

```pug
//- Tag names — just write the tag name, no angle brackets
p This is a paragraph
h1 This is a heading
div This is a div

//- Attributes — in parentheses after the tag name
a(href="/about", class="nav-link") About Page
input(type="text", name="username", placeholder="Enter name")
img(src="/logo.png", alt="Logo")

//- CSS classes and IDs — shorthand like CSS selectors
p.my-class This has class "my-class"
div#my-id This has id "my-id"
p.card.highlighted Multiple classes
div#sidebar.container Both id and class

//- Output a variable — use = after the tag name
h1= title
p= user.email
td= product.price.toFixed(2)

//- Inline variable in text — use #{} syntax
p Hello, #{user.name}! You have #{count} messages.
p Copyright &copy; #{new Date().getFullYear()}

//- Raw HTML output — use != to skip escaping
p!= htmlContent

//- if / else
if user.role === "admin"
  p Welcome, Admin!
else if user.role === "editor"
  p Welcome, Editor!
else
  p Welcome, Guest!

//- each loop
ul
  each product in products
    li #{product.name} — $#{product.price}

//- each with index
ul
  each item, index in items
    li #{index + 1}. #{item.name}

//- Mixins — reusable blocks (like partials inside the same file)
mixin card(title, body)
  .card
    h3= title
    p= body

+card("Hello", "World")
+card(user.name, user.bio)

//- Include other pug files
include partials/header
include partials/navbar

//- Extends a layout (inheritance)
extends layouts/main

block content
  h1= heading
  p Page content goes here
```

### Pug layout (extends)

```pug
//- views/layouts/main.pug
doctype html
html
  head
    title= title
    link(rel="stylesheet", href="/css/style.css")
  body
    include ../partials/navbar
    main
      block content
        p Default content (overridden by child templates)
    include ../partials/footer
```

```pug
//- views/index.pug — extends the layout
extends layouts/main

block content
  h1= heading
  p Welcome to the home page!
  ul
    each item in items
      li= item
```

---

## 12. Setting Up Handlebars

Handlebars uses `{{}}` (mustache) syntax and is deliberately **logic-less** — keeping templates simple and clean.

### Installation

```bash
npm install express-handlebars
```

### Configuration

```javascript
import { engine } from "express-handlebars";

// Register the Handlebars engine
app.engine("hbs", engine({
  extname:        ".hbs",          // file extension to use
  defaultLayout:  "main",          // default layout file
  layoutsDir:     path.join(__dirname, "views/layouts"),
  partialsDir:    path.join(__dirname, "views/partials"),
}));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
```

### Folder structure for Handlebars

```
views/
├── home.hbs              ← page templates
├── profile.hbs
├── products.hbs
├── layouts/
│   └── main.hbs          ← layout wrapper
└── partials/
    ├── navbar.hbs
    └── footer.hbs
```

---

## 13. Handlebars Syntax — Complete Guide

```html
<!-- views/home.hbs -->

<!-- Output a variable — {{}} auto-escapes HTML -->
<h1>Hello, {{name}}!</h1>
<p>Email: {{user.email}}</p>

<!-- Raw HTML output — {{{triple braces}}} skips escaping -->
<div>{{{htmlContent}}}</div>

<!-- Comments — not sent to the browser -->
{{!-- This is a Handlebars comment --}}

<!-- if block helper -->
{{#if isAdmin}}
  <p>You are an admin.</p>
{{else if isEditor}}
  <p>You are an editor.</p>
{{else}}
  <p>You are a guest.</p>
{{/if}}

<!-- unless — opposite of if (runs when condition is FALSE) -->
{{#unless isLoggedIn}}
  <a href="/login">Please log in</a>
{{/unless}}

<!-- each — loop over an array -->
<ul>
  {{#each products}}
    <li>
      {{this.name}} — ${{this.price}}
      {{#if this.inStock}}
        <span class="badge">In Stock</span>
      {{/if}}
    </li>
  {{/each}}
</ul>

<!-- @index and @key inside each -->
<ul>
  {{#each users}}
    <li>{{@index}}. {{this.name}}</li>
  {{/each}}
</ul>

<!-- with — changes the context -->
{{#with user}}
  <p>{{name}} — {{email}} — {{role}}</p>
{{/with}}
<!-- Inside #with, you access user's properties directly — no "user." prefix -->
```

### Handlebars layout

```html
<!-- views/layouts/main.hbs -->
<!DOCTYPE html>
<html lang="en">
<head>
  <title>{{title}}</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  {{> navbar}}

  <main>
    {{{body}}}
    <!-- {{{body}}} is replaced with the current page's template -->
  </main>

  {{> footer}}
</body>
</html>
```

```html
<!-- views/partials/navbar.hbs -->
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  {{#if isLoggedIn}}
    <a href="/logout">Logout</a>
  {{else}}
    <a href="/login">Login</a>
  {{/if}}
</nav>
```

```html
<!-- views/home.hbs — just the page content, layout wraps it -->
<h1>{{heading}}</h1>
<p>Welcome to the home page!</p>

<div class="product-grid">
  {{#each products}}
    <div class="product-card">
      <h3>{{this.name}}</h3>
      <p>${{this.price}}</p>
    </div>
  {{/each}}
</div>
```

### Custom Helpers

```javascript
// Register a custom helper in server.js
app.engine("hbs", engine({
  helpers: {
    // Format a number as currency
    currency: (value) => `$${Number(value).toFixed(2)}`,

    // Format a date
    formatDate: (date) => new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    }),

    // Capitalize first letter
    capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),

    // Compare two values (for conditionals)
    eq: (a, b) => a === b,
  },
}));
```

```html
<!-- Using custom helpers in a template -->
<p>Price: {{currency product.price}}</p>
<p>Joined: {{formatDate user.joinedAt}}</p>
<p>{{capitalize user.name}}</p>

{{#if (eq user.role "admin")}}
  <p>Admin panel visible</p>
{{/if}}
```

---

## 14. EJS vs Pug vs Handlebars

### Syntax comparison — same output from all three

**Data:**
```javascript
{ title: "Products", products: [{ name: "Laptop", price: 999 }] }
```

**EJS:**
```html
<h1><%= title %></h1>
<ul>
  <% products.forEach(p => { %>
    <li><%= p.name %> — $<%= p.price %></li>
  <% }) %>
</ul>
```

**Pug:**
```pug
h1= title
ul
  each p in products
    li #{p.name} — $#{p.price}
```

**Handlebars:**
```html
<h1>{{title}}</h1>
<ul>
  {{#each products}}
    <li>{{this.name}} — ${{this.price}}</li>
  {{/each}}
</ul>
```

### Feature comparison

```
┌──────────────────────────┬─────────┬─────────┬─────────────┐
│ Feature                  │ EJS     │ Pug     │ Handlebars  │
├──────────────────────────┼─────────┼─────────┼─────────────┤
│ Looks like HTML          │ ✅ Yes  │ ❌ No   │ ✅ Yes      │
│ Full JS expressions      │ ✅ Yes  │ ✅ Yes  │ ❌ Helpers  │
│ Built-in layouts         │ ❌ No   │ ✅ Yes  │ ✅ Yes      │
│ Built-in partials        │ ✅ Yes  │ ✅ Yes  │ ✅ Yes      │
│ Logic-less approach      │ ❌ No   │ ❌ No   │ ✅ Yes      │
│ Beginner-friendly        │ ✅ Best │ ⚠️ Hard  │ ✅ Good     │
│ Whitespace sensitive     │ ❌ No   │ ✅ Yes  │ ❌ No       │
│ Custom helpers           │ ❌ No   │ ❌ No   │ ✅ Yes      │
│ Template inheritance     │ ❌ No   │ ✅ Yes  │ ✅ Yes      │
└──────────────────────────┴─────────┴─────────┴─────────────┘
```

### When to pick which

```
EJS          → You're new to template engines. Familiar HTML + JS.
               Best for beginners and quick prototypes.

Pug          → You want concise, clean templates and don't mind
               learning new syntax. Great for experienced devs.

Handlebars   → You want strict separation between logic and view.
               Great for larger teams or when designers edit templates.
```

---

## 15. Full Project Example with EJS

A complete working Express + EJS app:

```javascript
// server.js
import express from "express";
import path    from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = 3000;

// Template engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Global template variables
app.locals.appName = "My Express App";
app.locals.year    = new Date().getFullYear();

// Attach current user to every request (simulated)
app.use((req, res, next) => {
  res.locals.currentUser = { name: "Alice", role: "admin" };
  res.locals.isLoggedIn  = true;
  next();
});

// ── Routes ────────────────────────────────────────────────────

// Home page
app.get("/", (req, res) => {
  res.render("index", {
    title:    "Home",
    heading:  "Welcome to My App",
    features: [
      { title: "Fast",    description: "Built with Node.js and Express" },
      { title: "Dynamic", description: "Powered by EJS templates"       },
      { title: "Secure",  description: "Helmet and CORS protected"       },
    ],
  });
});

// Products listing page
app.get("/products", (req, res) => {
  const products = [
    { id: 1, name: "Laptop",   price: 999.99, category: "electronics", inStock: true  },
    { id: 2, name: "Mouse",    price: 29.99,  category: "accessories",  inStock: true  },
    { id: 3, name: "Monitor",  price: 399.99, category: "electronics", inStock: false },
    { id: 4, name: "Keyboard", price: 79.99,  category: "accessories",  inStock: true  },
  ];

  const { category } = req.query;
  const filtered = category
    ? products.filter(p => p.category === category)
    : products;

  res.render("products", {
    title:    "Products",
    products: filtered,
    category: category || "all",
    count:    filtered.length,
  });
});

// Single product page
app.get("/products/:id", (req, res) => {
  const id      = Number(req.params.id);
  const product = { id, name: "Laptop", price: 999.99, inStock: true,
    description: "A powerful laptop for developers." };

  if (!product) return res.status(404).render("404", { title: "Not Found" });

  res.render("product-detail", { title: product.name, product });
});

// 404 page — catch all unmatched routes
app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

```html
<!-- views/partials/header.ejs -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><%= title %> | <%= appName %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
```

```html
<!-- views/partials/navbar.ejs -->
<nav class="navbar">
  <a href="/" class="brand"><%= appName %></a>
  <div class="nav-links">
    <a href="/">Home</a>
    <a href="/products">Products</a>
    <% if (isLoggedIn) { %>
      <span>Hello, <%= currentUser.name %>!</span>
      <a href="/logout">Logout</a>
    <% } else { %>
      <a href="/login">Login</a>
    <% } %>
  </div>
</nav>
```

```html
<!-- views/partials/footer.ejs -->
<footer>
  <p>&copy; <%= year %> <%= appName %>. All rights reserved.</p>
</footer>
</body>
</html>
```

```html
<!-- views/index.ejs -->
<%- include("partials/header") %>
<%- include("partials/navbar") %>

<main class="container">
  <section class="hero">
    <h1><%= heading %></h1>
  </section>

  <section class="features">
    <% features.forEach(feature => { %>
      <div class="feature-card">
        <h3><%= feature.title %></h3>
        <p><%= feature.description %></p>
      </div>
    <% }) %>
  </section>
</main>

<%- include("partials/footer") %>
```

```html
<!-- views/products.ejs -->
<%- include("partials/header") %>
<%- include("partials/navbar") %>

<main class="container">
  <h1>Products (<%= count %> found)</h1>

  <div class="filters">
    <a href="/products">All</a>
    <a href="/products?category=electronics">Electronics</a>
    <a href="/products?category=accessories">Accessories</a>
  </div>

  <div class="product-grid">
    <% if (products.length === 0) { %>
      <p>No products found.</p>
    <% } else { %>
      <% products.forEach(product => { %>
        <div class="product-card <%= product.inStock ? '' : 'out-of-stock' %>">
          <h3><%= product.name %></h3>
          <p class="price">$<%= product.price.toFixed(2) %></p>
          <% if (product.inStock) { %>
            <span class="badge in-stock">In Stock</span>
            <a href="/products/<%= product.id %>" class="btn">View Details</a>
          <% } else { %>
            <span class="badge out-of-stock">Out of Stock</span>
          <% } %>
        </div>
      <% }) %>
    <% } %>
  </div>
</main>

<%- include("partials/footer") %>
```

```html
<!-- views/404.ejs -->
<%- include("partials/header") %>
<%- include("partials/navbar") %>

<main class="container">
  <div class="error-page">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you are looking for doesn't exist.</p>
    <a href="/" class="btn">Go Home</a>
  </div>
</main>

<%- include("partials/footer") %>
```

---

## 16. Quick Reference Cheatsheet

```
┌─────────────────────────────────────────────────────────────────┐
│                      EJS TAGS                                   │
├────────────────────┬────────────────────────────────────────────┤
│ <%= value %>       │ Output (HTML-escaped — safe)               │
│ <%- value %>       │ Raw output (unescaped — use with trust)    │
│ <% code %>         │ JavaScript code (no output)                │
│ <%# comment %>     │ Comment (not sent to browser)              │
│ <%- include() %>   │ Include a partial template                 │
└────────────────────┴────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   PASSING DATA                                  │
├────────────────────┬────────────────────────────────────────────┤
│ res.render(view, obj)   │ Pass data to one template            │
│ app.locals.key = value  │ Available in ALL templates           │
│ res.locals.key = value  │ Available for current request only   │
└────────────────────┴────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   EXPRESS SETUP                                 │
├─────────────────────────────────────────────────────────────────┤
│  app.set("view engine", "ejs")                                  │
│  app.set("views", path.join(__dirname, "views"))                │
│  res.render("filename", { key: value })                         │
│  // file: views/filename.ejs                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 ENGINE QUICK PICK                               │
├─────────────────────────────────────────────────────────────────┤
│  Beginner / familiar with HTML  → EJS                          │
│  Concise syntax / experienced   → Pug                          │
│  Logic-free / team projects     → Handlebars                   │
└─────────────────────────────────────────────────────────────────┘
```

---

> **Summary:** Template engines bridge the gap between your server data and what the user sees in the browser. EJS is the easiest to learn — it's just HTML with JavaScript tags. Pug is the most concise. Handlebars enforces the cleanest separation between logic and presentation. All three integrate with Express in the same way: `app.set("view engine", ...)` and `res.render("template", data)`.