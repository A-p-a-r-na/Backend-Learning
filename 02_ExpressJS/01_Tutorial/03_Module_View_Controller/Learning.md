# MVC Architecture in Express.js — A Detailed Guide

---

## Table of Contents

1. [What is MVC?](#1-what-is-mvc)
2. [Why use MVC?](#2-why-use-mvc)
3. [MVC vs No-MVC — Side by Side](#3-mvc-vs-no-mvc--side-by-side)
4. [Folder Structure](#4-folder-structure)
5. [server.js — Entry Point](#5-serverjs--entry-point)
6. [app.js — Express App Setup](#6-appjs--express-app-setup)
7. [Routes Layer](#7-routes-layer)
8. [Controller Layer](#8-controller-layer)
9. [Model Layer](#9-model-layer)
10. [How All Layers Connect](#10-how-all-layers-connect)
11. [Adding a New Resource (Step-by-Step)](#11-adding-a-new-resource-step-by-step)
12. [Connecting a Real Database](#12-connecting-a-real-database)
13. [MVC Rules to Always Follow](#13-mvc-rules-to-always-follow)
14. [Quick Reference Cheatsheet](#14-quick-reference-cheatsheet)

---

## 1. What is MVC?

**MVC** stands for **Model — View — Controller**. It is a **design pattern** that separates your application into three distinct layers, each with a single, clearly defined responsibility.

```
┌─────────────────────────────────────────────────────────────┐
│                        MVC LAYERS                           │
├─────────────────┬───────────────────────────────────────────┤
│   MODEL (M)     │  Data layer — talks to the database       │
│   VIEW (V)      │  Presentation layer — what the user sees  │
│   CONTROLLER(C) │  Logic layer — connects Model and View    │
└─────────────────┴───────────────────────────────────────────┘
```

In an **Express REST API** (no HTML views), the View layer is replaced by **JSON responses** sent back to the client (browser, mobile app, etc.).

```
┌───────────────────────────────────────────────────────────┐
│             MVC in a REST API Context                     │
├───────────────────┬───────────────────────────────────────┤
│  MODEL (M)        │  Data access — DB queries, schemas    │
│  VIEW (V)         │  JSON response (res.json())           │
│  CONTROLLER (C)   │  Handles req/res, calls the model     │
│  ROUTER           │  Maps URLs to controllers             │
└───────────────────┴───────────────────────────────────────┘
```

---

## 2. Why use MVC?

Without MVC, as your app grows, all your logic ends up in one file — routes, database calls, validation, and response logic all tangled together. This is called **Spaghetti code**.

### Problems without MVC

- Hard to find where a bug is
- Changing one thing breaks something else
- Impossible to test individual parts in isolation
- Multiple developers working on the same file constantly causes conflicts

### Benefits of MVC

| Benefit | What it means in practice |
|---|---|
| **Separation of concerns** | Each file does exactly one thing |
| **Easier debugging** | You know exactly which layer to look in |
| **Easier testing** | Models and controllers can be tested independently |
| **Team-friendly** | Frontend, backend, DB devs can work in parallel |
| **Scalable** | Adding new features doesn't touch existing code |
| **Swappable layers** | Change the database → only the Model changes |

---

## 3. MVC vs No-MVC — Side by Side

### Without MVC — everything in one file

```javascript
// server.js — ❌ hard to maintain as it grows
import express from "express";
const app = express();
app.use(express.json());

const users = [
  { id: "1", username: "alice" },
  { id: "2", username: "john"  },
];

app.get("/user/:id", (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

app.get("/user", (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: "username required" });
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

app.listen(3000);
```

### With MVC — clean and separated

```
server.js       → starts the server (3 lines)
app.js          → wires middleware and routers
routes/         → maps URLs to controllers
controllers/    → handles req/res
models/         → all data logic
```

Each file is short, focused, and easy to understand at a glance.

---

## 4. Folder Structure

```
project/
│
├── server.js                  ← starts the HTTP server only
├── app.js                     ← express setup, middleware, routers
├── package.json
├── .env                       ← environment variables (never commit!)
│
├── routes/                    ← URL → controller mapping
│   ├── userRoutes.js
│   └── postRoutes.js          ← add a new file per resource
│
├── controllers/               ← req/res logic
│   ├── userController.js
│   └── postController.js
│
├── models/                    ← data access logic
│   ├── userModel.js
│   └── postModel.js
│
└── views/                     ← only needed if using a template engine
    └── profile.ejs            ← (skip this for pure REST APIs)
```

> **Rule of thumb:** one route file + one controller file + one model file per resource (users, posts, products, orders, etc.)

---

## 5. server.js — Entry Point

```javascript
// server.js
//
// Responsibility: START THE SERVER — nothing else.
//
// Keeping this file separate from app.js means:
//   - You can import app.js in unit tests without starting a real server
//   - The server startup logic is isolated and easy to find
//   - PORT and environment config is handled in one place

import "dotenv/config";        // load .env variables before anything else
import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

---

## 6. app.js — Express App Setup

```javascript
// app.js
//
// Responsibility: CONFIGURE THE EXPRESS APPLICATION
//   - Register global middleware (JSON parsing, logging, CORS, etc.)
//   - Mount routers at their base paths
//   - Register the 404 and global error handlers
//
// Does NOT start the server (that's server.js's job)

import express from "express";
import userRoutes from "./routes/userRoutes.js";
// import postRoutes from "./routes/postRoutes.js"; ← add more as you grow

const app = express();

// ── Global Middleware ────────────────────────────────────────
// Runs on EVERY request before it reaches any route handler

app.use(express.json());            // parse JSON request bodies → req.body
app.use(express.urlencoded({ extended: true })); // parse HTML form bodies

// ── Routers ──────────────────────────────────────────────────
// Mount each resource router at its base path
// Routes inside userRoutes.js will be prefixed with "/"

app.use("/", userRoutes);
// app.use("/api/posts",    postRoutes);    ← future resource
// app.use("/api/products", productRoutes); ← future resource

// ── 404 Handler ──────────────────────────────────────────────
// Catches any request that didn't match any route above
// Must come AFTER all routers

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// ── Global Error Handler ─────────────────────────────────────
// Catches any error passed via next(err) from routes or controllers
// Must have exactly 4 parameters — (err, req, res, next)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || "Internal Server Error",
  });
});

export default app;   // exported so server.js and tests can import it
```

---

## 7. Routes Layer

```javascript
// routes/userRoutes.js
//
// Responsibility: MAP URLs + HTTP METHODS → CONTROLLER FUNCTIONS
//
// Rules for this file:
//   ✅ Import controllers and call them
//   ✅ Define URL patterns and HTTP methods
//   ✅ Apply route-level middleware (auth checks, validators)
//   ❌ No business logic
//   ❌ No data access (no DB calls, no arrays)
//   ❌ No res.json() or res.send() directly here

import { Router } from "express";
import {
  getHome,
  getAbout,
  getUserById,
  getUserByUsername,
} from "../controllers/userController.js";

const router = Router();

// ── Static Routes ─────────────────────────────────────────────
router.get("/",      getHome);   // GET /
router.get("/about", getAbout);  // GET /about

// ── Dynamic Route — Route Parameter (:id) ─────────────────────
// :id is a placeholder — matches any value in that URL position
// Accessed in the controller via req.params.id
router.get("/user/:id", getUserById);    // GET /user/42
                                         // GET /user/alice

// ── Query Parameter Route ─────────────────────────────────────
// No parameter in the path — ?username=john is optional in the URL
// Accessed in the controller via req.query.username
router.get("/user", getUserByUsername);  // GET /user?username=john

export default router;
```

### Route Parameter vs Query Parameter — when to use which

```
Route Parameter  →  /user/:id        →  Identifying a SPECIFIC resource
                    /posts/:postId       (you always need this value)

Query Parameter  →  /user?username=  →  FILTERING, SEARCHING, OPTIONAL info
                    /posts?page=2        (can be omitted without breaking route)
```

---

## 8. Controller Layer

```javascript
// controllers/userController.js
//
// Responsibility: HANDLE THE REQUEST AND SEND THE RESPONSE
//
// Rules for this file:
//   ✅ Access req.params, req.query, req.body
//   ✅ Call Model functions to get/save data
//   ✅ Send responses via res.json(), res.send(), res.status()
//   ✅ Handle errors (404, 400, 500) and call next(err) for unexpected ones
//   ❌ No raw data or hardcoded arrays (that's the Model's job)
//   ❌ No SQL queries or database code directly here

import {
  findUserById,
  findUserByUsername,
} from "../models/userModel.js";

// ── GET / ─────────────────────────────────────────────────────
export function getHome(req, res) {
  res.send("Hello, ExpressJS!");
}

// ── GET /about ────────────────────────────────────────────────
export function getAbout(req, res) {
  res.send("Hello, from About!");
}

// ── GET /user/:id ─────────────────────────────────────────────
// 1. Extract the id from the URL
// 2. Ask the Model for the matching user
// 3. Send 404 if not found, or send the user as JSON
export function getUserById(req, res) {
  const { id } = req.params;           // extract :id from /user/:id

  const user = findUserById(id);       // delegate data lookup to Model

  if (!user) {
    // Always return after sending an error — prevents "headers already sent" crash
    return res.status(404).json({ error: `User with ID '${id}' not found` });
  }

  res.json(user);                      // 200 OK — send user object as JSON
}

// ── GET /user?username=john ───────────────────────────────────
// 1. Extract the username from the query string
// 2. Validate it was provided
// 3. Ask the Model for the matching user
// 4. Send appropriate response
export function getUserByUsername(req, res) {
  const { username } = req.query;      // extract ?username= from the URL

  // Input validation — query params are always optional so we must check
  if (!username) {
    return res.status(400).json({ error: "'username' query parameter is required" });
  }

  const user = findUserByUsername(username);

  if (!user) {
    return res.status(404).json({ error: `User '${username}' not found` });
  }

  res.json(user);
}
```

### Async Controller (for real database calls)

```javascript
// When using a real database, controllers become async
// Always wrap in try/catch and call next(err) on failure

export async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await findUserById(id);  // await the DB call

    if (!user) {
      return res.status(404).json({ error: `User '${id}' not found` });
    }

    res.json(user);
  } catch (err) {
    next(err); // passes error to the global error handler in app.js
  }
}
```

---

## 9. Model Layer

```javascript
// models/userModel.js
//
// Responsibility: ALL DATA ACCESS LOGIC
//
// Rules for this file:
//   ✅ Store / retrieve / update / delete data
//   ✅ Talk to the database (or in-memory store for learning)
//   ✅ Return plain data — objects, arrays, null, undefined
//   ❌ No req or res objects here — Model knows nothing about HTTP
//   ❌ No res.json() or res.send() — that's the Controller's job
//   ❌ No route definitions
//
// When you switch from in-memory data to a real DB (MongoDB, PostgreSQL),
// ONLY THIS FILE CHANGES — routes and controllers stay exactly the same.

// In-memory data store — simulates a database for learning
// In production: replace with Mongoose, Prisma, Sequelize, etc.
const users = [
  { id: "1", username: "alice", email: "alice@example.com", role: "admin" },
  { id: "2", username: "john",  email: "john@example.com",  role: "user"  },
  { id: "3", username: "bob",   email: "bob@example.com",   role: "user"  },
];

// Find a user by their ID
// Returns: user object | undefined
export function findUserById(id) {
  return users.find(user => user.id === String(id));
  // String(id) ensures "1" === "1" even if id was passed as a number
}

// Find a user by username (case-insensitive)
// Returns: user object | undefined
export function findUserByUsername(username) {
  return users.find(
    user => user.username.toLowerCase() === username.toLowerCase()
  );
}

// Get all users (optionally filter by role)
// Returns: array of user objects
export function getAllUsers(role) {
  if (role) return users.filter(user => user.role === role);
  return users;
}
```

---

## 10. How All Layers Connect

### Request flow — step by step

```
Browser / Postman
      │
      │  GET /user/42
      ▼
┌─────────────────────────────────────────────────────┐
│  app.js — Global Middleware                         │
│  express.json() → parse body if any                 │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  routes/userRoutes.js                               │
│  router.get("/user/:id", getUserById)               │
│  → URL matches! call getUserById controller         │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  controllers/userController.js                      │
│  getUserById(req, res) {                            │
│    const { id } = req.params   // "42"              │
│    const user = findUserById(id) ──────────────┐    │
│    if (!user) → res.status(404).json(...)       │    │
│    res.json(user) ◄─────────────────────────────┘    │
│  }                                                  │
└────────────────────┬────────────────────────────────┘
                     │ calls findUserById("42")
                     ▼
┌─────────────────────────────────────────────────────┐
│  models/userModel.js                                │
│  findUserById("42") {                               │
│    return users.find(u => u.id === "42")            │
│    → { id: "42", username: "alice", ... }           │
│  }                                                  │
└─────────────────────────────────────────────────────┘
                     │
                     │ returns user object to controller
                     ▼
      HTTP Response: 200 OK
      { "id": "42", "username": "alice", "email": "..." }
```

---

## 11. Adding a New Resource (Step-by-Step)

Let's say you want to add a **Posts** resource. Here's exactly what to create:

### Step 1 — Create the Model

```javascript
// models/postModel.js
const posts = [
  { id: "1", title: "Learn Node.js",   userId: "1" },
  { id: "2", title: "Learn Express",   userId: "2" },
  { id: "3", title: "MVC in Practice", userId: "1" },
];

export function getAllPosts()    { return posts; }
export function findPostById(id){ return posts.find(p => p.id === String(id)); }
```

### Step 2 — Create the Controller

```javascript
// controllers/postController.js
import { getAllPosts, findPostById } from "../models/postModel.js";

export function getPosts(req, res) {
  res.json(getAllPosts());
}

export function getPostById(req, res) {
  const post = findPostById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
}
```

### Step 3 — Create the Router

```javascript
// routes/postRoutes.js
import { Router } from "express";
import { getPosts, getPostById } from "../controllers/postController.js";

const router = Router();

router.get("/",    getPosts);
router.get("/:id", getPostById);

export default router;
```

### Step 4 — Mount in app.js

```javascript
// app.js — add ONE line
import postRoutes from "./routes/postRoutes.js";

app.use("/api/posts", postRoutes);  // GET /api/posts, GET /api/posts/:id
```

That's it — **4 steps, 3 new files, 1 line added** to app.js.  
Routes, controllers, and models for other resources are untouched.

---

## 12. Connecting a Real Database

When you're ready to use a real database, **only the Model layer changes**.  
Routes and Controllers stay exactly the same.

### MongoDB with Mongoose

```javascript
// models/userModel.js — MongoDB version
import mongoose from "mongoose";

// Define the schema (shape of the data)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  role:     { type: String, default: "user" },
});

const User = mongoose.model("User", userSchema);

// Same function names as before — controller doesn't change at all!
export async function findUserById(id) {
  return await User.findById(id);
}

export async function findUserByUsername(username) {
  return await User.findOne({ username: new RegExp(`^${username}$`, "i") });
}

export async function getAllUsers() {
  return await User.find();
}
```

### Connect to MongoDB in server.js

```javascript
// server.js
import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const PORT   = process.env.PORT   || 3000;
const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/mydb";

// Connect to DB first, then start the server
mongoose.connect(DB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("DB connection failed:", err.message);
    process.exit(1); // exit if DB fails — no point running without it
  });
```

### What changed? Only the Model.

```
routes/userRoutes.js      ← NO CHANGES
controllers/userController.js  ← NO CHANGES (just add async/await + try/catch)
models/userModel.js       ← REPLACED with Mongoose queries
```

---

## 13. MVC Rules to Always Follow

### Model rules
```
✅ Only data access logic (find, create, update, delete)
✅ Return plain data — objects, arrays, null
✅ Know nothing about HTTP — no req, res, status codes
❌ No res.json() or res.send()
❌ No business rules that belong in the controller
```

### Controller rules
```
✅ Read from req (params, query, body, headers)
✅ Call Model functions
✅ Send response via res
✅ Handle errors — 400, 404, 500
✅ Call next(err) for unexpected errors
❌ No raw database queries directly
❌ No hardcoded data arrays
```

### Router rules
```
✅ Define HTTP method + path
✅ Call the right controller function
✅ Apply route-level middleware (auth, validation)
❌ No business logic
❌ No res.json() or data access directly
```

### The Golden Rule

> **Ask yourself: "If I switch from MongoDB to PostgreSQL tomorrow, which files change?"**
> The answer should always be: **only the Model files**.  
> If your answer is "the controller too" — your controller has too much database logic in it.

---

## 14. Quick Reference Cheatsheet

```
┌─────────────────────────────────────────────────────────────┐
│                    MVC FILE RESPONSIBILITIES                 │
├──────────────────┬──────────────────────────────────────────┤
│  server.js       │  app.listen() only                       │
│  app.js          │  middleware + mount routers               │
│  routes/*.js     │  URL + method → controller function       │
│  controllers/*.js│  req/res handling + call model           │
│  models/*.js     │  data access (DB queries / in-memory)    │
└──────────────────┴──────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  REQUEST OBJECT CHEATSHEET                  │
├──────────────────┬──────────────────────────────────────────┤
│  req.params.id   │  Route param    → GET /user/:id          │
│  req.query.name  │  Query param    → GET /user?name=alice   │
│  req.body.email  │  Request body   → POST /user (JSON)      │
│  req.headers     │  HTTP headers   → Authorization, etc.    │
│  req.method      │  HTTP verb      → GET, POST, PUT...      │
└──────────────────┴──────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 RESPONSE STATUS CODES                       │
├──────────────────┬──────────────────────────────────────────┤
│  200 OK          │  Request succeeded                       │
│  201 Created     │  New resource was created                │
│  204 No Content  │  Success, no body (e.g. DELETE)          │
│  400 Bad Request │  Missing/invalid input from client       │
│  401 Unauthorized│  Not authenticated                       │
│  403 Forbidden   │  Authenticated but not allowed           │
│  404 Not Found   │  Resource does not exist                 │
│  500 Server Error│  Unexpected error on the server          │
└──────────────────┴──────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ADDING A NEW RESOURCE CHECKLIST                │
├─────────────────────────────────────────────────────────────┤
│  □  models/postModel.js       → data functions              │
│  □  controllers/postController.js → req/res handlers        │
│  □  routes/postRoutes.js      → URL mappings                │
│  □  app.js                    → app.use("/api/posts", ...)   │
└─────────────────────────────────────────────────────────────┘
```

---

> **Summary:** MVC is not about complexity — it is about giving every piece of code exactly one job. A route maps URLs. A controller handles requests. A model manages data. When each layer does only its own job, your app becomes easy to read, easy to debug, and easy to scale.