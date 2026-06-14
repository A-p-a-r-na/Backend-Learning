# Building RESTful APIs with Express.js

A **REST API** (Representational State Transfer) is a way of building web services that communicate using standard HTTP methods. Express.js is the most popular Node.js framework for building REST APIs.

---

## What is a RESTful API?

```
REST = architectural style for designing networked applications

Key principles:
  ✅ Stateless       → each request contains all needed info
  ✅ Client-Server   → frontend and backend are separate
  ✅ Uniform Interface → consistent URL structure and HTTP methods
  ✅ Resource-based  → URLs represent resources (nouns, not verbs)
  ✅ JSON            → standard data format for requests/responses
```

### REST URL Design Rules

```
✅ Use nouns (resources), not verbs
  /users          ✅
  /getUsers       ❌
  /fetchAllUsers  ❌

✅ Use plural nouns
  /users     ✅
  /user      ❌

✅ Use nesting for relationships
  /users/42/posts      → posts belonging to user 42
  /users/42/posts/7    → post 7 of user 42

✅ Use HTTP methods for actions
  GET    /users        → get all users
  POST   /users        → create a user
  GET    /users/42     → get user 42
  PUT    /users/42     → replace user 42
  PATCH  /users/42     → update user 42
  DELETE /users/42     → delete user 42

✅ Use query strings for filtering, sorting, pagination
  /users?page=2&limit=10&sort=name&role=admin
```

---

## Project Setup

```bash
mkdir rest-api
cd rest-api
npm init -y
npm install express
npm install -D nodemon
```

```json
// package.json
{
  "name": "rest-api",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev":   "nodemon src/index.js"
  }
}
```

### Project Structure

```
rest-api/
├── src/
│   ├── index.js              ← entry point
│   ├── app.js                ← express app setup
│   ├── routes/
│   │   ├── index.js          ← combine all routes
│   │   ├── userRoutes.js     ← user routes
│   │   └── postRoutes.js     ← post routes
│   ├── controllers/
│   │   ├── userController.js ← user logic
│   │   └── postController.js ← post logic
│   ├── middleware/
│   │   ├── errorHandler.js   ← global error handler
│   │   ├── validate.js       ← request validation
│   │   └── auth.js           ← authentication
│   └── data/
│       └── db.js             ← in-memory "database"
├── .env
└── package.json
```

---

## Part 1 — App Setup

```js
// src/app.js
import express from 'express';
import router  from './routes/index.js';

const app = express();

// ── Core Middleware ──────────────────────────────────────────
// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────
app.use('/api/v1', router); // version your API

// ── 404 Handler ──────────────────────────────────────────────
// Catch any routes that don't match
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:   'Route not found',
  });
});

// ── Global Error Handler ─────────────────────────────────────
// Must have 4 parameters — Express recognizes it as error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error:   err.message || 'Internal Server Error',
  });
});

export default app;
```

```js
// src/index.js
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## Part 2 — In-Memory Database

```js
// src/data/db.js
// Simulates a database using plain arrays
// Replace with MongoDB/PostgreSQL in production

export const db = {
  users: [
    { id: 1, name: 'Arjun',  email: 'arjun@email.com',  age: 25, role: 'admin' },
    { id: 2, name: 'Kerala', email: 'kerala@email.com', age: 30, role: 'user'  },
    { id: 3, name: 'Node',   email: 'node@email.com',   age: 28, role: 'user'  },
  ],
  posts: [
    { id: 1, userId: 1, title: 'First Post',  body: 'Hello World',     tags: ['js', 'node'] },
    { id: 2, userId: 1, title: 'Second Post', body: 'Express is great', tags: ['express']    },
    { id: 3, userId: 2, title: 'My Post',     body: 'Learning REST',    tags: ['api', 'rest']},
  ],
  nextId: {
    users: 4,
    posts: 4,
  }
};
```

---

## Part 3 — Routes

```js
// src/routes/index.js
import { Router }    from 'express';
import userRoutes    from './userRoutes.js';
import postRoutes    from './postRoutes.js';

const router = Router();

// Mount sub-routers
router.use('/users', userRoutes);
router.use('/posts', postRoutes);

// API health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
```

```js
// src/routes/userRoutes.js
import { Router }       from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
  getUserPosts,
} from '../controllers/userController.js';

const router = Router();

// Collection routes
router.get('/',    getAllUsers);   // GET    /api/v1/users
router.post('/',   createUser);   // POST   /api/v1/users

// Single resource routes
router.get('/:id',    getUserById); // GET    /api/v1/users/:id
router.put('/:id',    updateUser);  // PUT    /api/v1/users/:id
router.patch('/:id',  patchUser);   // PATCH  /api/v1/users/:id
router.delete('/:id', deleteUser);  // DELETE /api/v1/users/:id

// Nested resource — user's posts
router.get('/:id/posts', getUserPosts); // GET /api/v1/users/:id/posts

export default router;
```

---

## Part 4 — Controllers

```js
// src/controllers/userController.js
import { db } from '../data/db.js';

// ── GET /users ────────────────────────────────────────────────
// Supports: filtering, sorting, pagination via query strings
// GET /users?role=admin&sort=name&page=1&limit=2
export const getAllUsers = (req, res) => {
  let users = [...db.users];

  // ── Filtering ──────────────────────────────────────────────
  const { role, name } = req.query;

  if (role) {
    users = users.filter(u => u.role === role);
  }

  if (name) {
    users = users.filter(u =>
      u.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // ── Sorting ────────────────────────────────────────────────
  const { sort, order = 'asc' } = req.query;

  if (sort) {
    users.sort((a, b) => {
      if (order === 'desc') return b[sort] > a[sort] ? 1 : -1;
      return a[sort] > b[sort] ? 1 : -1;
    });
  }

  // ── Pagination ─────────────────────────────────────────────
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const end   = start + limit;

  const paginatedUsers = users.slice(start, end);

  // ── Response ───────────────────────────────────────────────
  res.status(200).json({
    success: true,
    count:   paginatedUsers.length,
    total:   users.length,
    page,
    pages:   Math.ceil(users.length / limit),
    data:    paginatedUsers,
  });
};

// ── GET /users/:id ────────────────────────────────────────────
export const getUserById = (req, res) => {
  const id   = parseInt(req.params.id);
  const user = db.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error:   `User with id ${id} not found`,
    });
  }

  res.status(200).json({
    success: true,
    data:    user,
  });
};

// ── POST /users ───────────────────────────────────────────────
export const createUser = (req, res) => {
  const { name, email, age, role = 'user' } = req.body;

  // Validate required fields
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error:   'Name and email are required',
    });
  }

  // Check for duplicate email
  const exists = db.users.find(u => u.email === email);
  if (exists) {
    return res.status(409).json({
      success: false,
      error:   'Email already in use',
    });
  }

  // Create new user
  const newUser = {
    id: db.nextId.users++,
    name,
    email,
    age:  age || null,
    role,
  };

  db.users.push(newUser);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data:    newUser,
  });
};

// ── PUT /users/:id ─────────────────────────────────────────────
// Replace the entire user (all fields required)
export const updateUser = (req, res) => {
  const id    = parseInt(req.params.id);
  const index = db.users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error:   `User with id ${id} not found`,
    });
  }

  const { name, email, age, role } = req.body;

  // PUT requires ALL fields
  if (!name || !email || !age || !role) {
    return res.status(400).json({
      success: false,
      error:   'PUT requires all fields: name, email, age, role',
    });
  }

  // Replace entire user (keep original id)
  db.users[index] = { id, name, email, age, role };

  res.status(200).json({
    success: true,
    message: 'User replaced successfully',
    data:    db.users[index],
  });
};

// ── PATCH /users/:id ──────────────────────────────────────────
// Update only the provided fields
export const patchUser = (req, res) => {
  const id    = parseInt(req.params.id);
  const index = db.users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error:   `User with id ${id} not found`,
    });
  }

  // Merge existing user with provided updates
  db.users[index] = { ...db.users[index], ...req.body };

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data:    db.users[index],
  });
};

// ── DELETE /users/:id ─────────────────────────────────────────
export const deleteUser = (req, res) => {
  const id    = parseInt(req.params.id);
  const index = db.users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error:   `User with id ${id} not found`,
    });
  }

  const deleted = db.users.splice(index, 1)[0];

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data:    deleted,
  });
};

// ── GET /users/:id/posts ──────────────────────────────────────
// Nested resource — get all posts for a specific user
export const getUserPosts = (req, res) => {
  const userId = parseInt(req.params.id);
  const user   = db.users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error:   `User with id ${userId} not found`,
    });
  }

  const posts = db.posts.filter(p => p.userId === userId);

  res.status(200).json({
    success: true,
    count:   posts.length,
    data:    posts,
  });
};
```

---

## Part 5 — Middleware

### Request Validation

```js
// src/middleware/validate.js

// Validate user input before reaching the controller
export const validateUser = (req, res, next) => {
  const { name, email, age } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || !email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (age && (isNaN(age) || age < 0 || age > 120)) {
    errors.push('Age must be a number between 0 and 120');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next(); // validation passed — proceed to controller
};

// Validate ID param is a number
export const validateId = (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error:   'ID must be a positive integer',
    });
  }

  req.params.id = id; // ensure id is a number
  next();
};
```

```js
// Use in routes
router.post('/',   validateUser, createUser);
router.put('/:id', validateId, validateUser, updateUser);
```

---

### Error Handler

```js
// src/middleware/errorHandler.js

// Custom error class
export class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Async wrapper — catches errors from async controllers
// Without this, unhandled promise rejections crash the server
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler middleware (4 params — required by Express)
export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  // Handle specific error types
  if (err.name === 'SyntaxError') {
    return res.status(400).json({
      success: false,
      error:   'Invalid JSON in request body',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error:   err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

```js
// Use asyncHandler in controllers for async functions
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export const getUserById = asyncHandler(async (req, res) => {
  const user = db.users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    throw new AppError(`User not found`, 404); // auto-caught by asyncHandler
  }

  res.status(200).json({ success: true, data: user });
});
```

---

### Logger Middleware

```js
// src/middleware/logger.js
export const logger = (req, res, next) => {
  const start  = Date.now();
  const { method, url } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status   = res.statusCode;
    const color    = status >= 500 ? '\x1b[31m'  // red
                   : status >= 400 ? '\x1b[33m'  // yellow
                   : status >= 200 ? '\x1b[32m'  // green
                   : '\x1b[0m';                   // default

    console.log(
      `${color}[${new Date().toISOString()}] ${method} ${url} ${status} - ${duration}ms\x1b[0m`
    );
  });

  next();
};
```

```js
// Use in app.js
import { logger } from './middleware/logger.js';
app.use(logger);

// Output:
// [2024-01-01T10:00:00.000Z] GET /api/v1/users 200 - 3ms
// [2024-01-01T10:00:01.000Z] POST /api/v1/users 201 - 5ms
// [2024-01-01T10:00:02.000Z] GET /api/v1/users/99 404 - 2ms
```

---

## Part 6 — Standard API Response Format

Always return a **consistent response structure**:

```js
// src/utils/response.js

// Success response
export const successResponse = (res, data, message = 'Success', status = 200) => {
  return res.status(status).json({
    success:   true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

// Error response
export const errorResponse = (res, message = 'Error', status = 500, errors = null) => {
  return res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  });
};

// Paginated response
export const paginatedResponse = (res, data, total, page, limit) => {
  return res.status(200).json({
    success: true,
    count:   data.length,
    total,
    page,
    pages:   Math.ceil(total / limit),
    data,
    timestamp: new Date().toISOString(),
  });
};
```

```js
// Use in controllers
import { successResponse, errorResponse } from '../utils/response.js';

export const getUserById = (req, res) => {
  const user = db.users.find(u => u.id === parseInt(req.params.id));

  if (!user) return errorResponse(res, 'User not found', 404);

  return successResponse(res, user, 'User retrieved successfully');
};
```

---

## Part 7 — Filtering, Sorting & Pagination

```js
// src/utils/queryHelpers.js

export function applyFilters(data, query) {
  let result = [...data];

  // Filter by any matching field
  const reserved = ['sort', 'order', 'page', 'limit', 'fields'];

  Object.entries(query).forEach(([key, value]) => {
    if (!reserved.includes(key)) {
      result = result.filter(item =>
        String(item[key]).toLowerCase().includes(value.toLowerCase())
      );
    }
  });

  return result;
}

export function applySort(data, sort, order = 'asc') {
  if (!sort) return data;

  return [...data].sort((a, b) => {
    const valA = String(a[sort]).toLowerCase();
    const valB = String(b[sort]).toLowerCase();
    const dir  = order === 'desc' ? -1 : 1;
    return valA > valB ? dir : valA < valB ? -dir : 0;
  });
}

export function applyPagination(data, page = 1, limit = 10) {
  const start = (page - 1) * limit;
  return data.slice(start, start + limit);
}

export function applyFieldSelection(data, fields) {
  if (!fields) return data;
  const selected = fields.split(',').map(f => f.trim());
  return data.map(item =>
    Object.fromEntries(
      Object.entries(item).filter(([key]) => selected.includes(key))
    )
  );
}
```

```js
// Usage in controller
// GET /users?role=admin&sort=name&order=asc&page=1&limit=5&fields=id,name,email
import { applyFilters, applySort, applyPagination, applyFieldSelection } from '../utils/queryHelpers.js';

export const getAllUsers = (req, res) => {
  const { sort, order, page = 1, limit = 10, fields } = req.query;

  let users = applyFilters(db.users, req.query);
  users     = applySort(users, sort, order);

  const total      = users.length;
  users            = applyPagination(users, parseInt(page), parseInt(limit));
  users            = applyFieldSelection(users, fields);

  res.status(200).json({
    success: true,
    total,
    page:    parseInt(page),
    pages:   Math.ceil(total / limit),
    count:   users.length,
    data:    users,
  });
};
```

---

## Part 8 — HTTP Status Codes

```js
// ── 2xx Success ───────────────────────────────────────────────
res.status(200) // OK            → GET, PUT, PATCH success
res.status(201) // Created       → POST success
res.status(204) // No Content    → DELETE success (no body)

// ── 3xx Redirect ─────────────────────────────────────────────
res.status(301) // Moved Permanently
res.status(302) // Found (temporary redirect)

// ── 4xx Client Errors ─────────────────────────────────────────
res.status(400) // Bad Request    → invalid input / malformed JSON
res.status(401) // Unauthorized   → not authenticated
res.status(403) // Forbidden      → authenticated but no permission
res.status(404) // Not Found      → resource doesn't exist
res.status(405) // Method Not Allowed → wrong HTTP method
res.status(409) // Conflict       → duplicate entry / version conflict
res.status(422) // Unprocessable Entity → validation failed
res.status(429) // Too Many Requests   → rate limit exceeded

// ── 5xx Server Errors ─────────────────────────────────────────
res.status(500) // Internal Server Error → unhandled exception
res.status(502) // Bad Gateway           → upstream server error
res.status(503) // Service Unavailable   → server overloaded / down
```

---

## Part 9 — Complete API Endpoints

```
Base URL: http://localhost:3000/api/v1

── Users ──────────────────────────────────────────────────────
GET    /users                  → Get all users (filter/sort/paginate)
GET    /users?role=admin        → Filter by role
GET    /users?sort=name&order=asc → Sort by name
GET    /users?page=2&limit=5   → Pagination
GET    /users?fields=id,name   → Field selection
POST   /users                  → Create a user
GET    /users/:id              → Get one user
PUT    /users/:id              → Replace entire user
PATCH  /users/:id              → Partially update user
DELETE /users/:id              → Delete user
GET    /users/:id/posts        → Get user's posts

── Posts ──────────────────────────────────────────────────────
GET    /posts                  → Get all posts
POST   /posts                  → Create a post
GET    /posts/:id              → Get one post
PUT    /posts/:id              → Replace post
PATCH  /posts/:id              → Update post
DELETE /posts/:id              → Delete post

── Health ─────────────────────────────────────────────────────
GET    /health                 → API health check
```

---

## Part 10 — Testing the API

### With curl

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Get all users
curl http://localhost:3000/api/v1/users

# Filter, sort, paginate
curl "http://localhost:3000/api/v1/users?role=admin&sort=name&page=1&limit=5"

# Get one user
curl http://localhost:3000/api/v1/users/1

# Create user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Arjun","email":"arjun@email.com","age":25}'

# Update user (PATCH)
curl -X PATCH http://localhost:3000/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# Replace user (PUT)
curl -X PUT http://localhost:3000/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Full Replace","email":"new@email.com","age":30,"role":"user"}'

# Delete user
curl -X DELETE http://localhost:3000/api/v1/users/1

# Get user posts
curl http://localhost:3000/api/v1/users/1/posts
```

---

## Part 11 — REST API Best Practices

### URL Design

```
✅ Use plural nouns         /users, /posts, /products
✅ Use lowercase            /api/users (not /API/Users)
✅ Use hyphens not underscores  /blog-posts (not /blog_posts)
✅ Version your API         /api/v1/users
✅ Nest related resources   /users/:id/posts
✅ Query strings for options /users?sort=name&page=2

❌ Avoid verbs in URLs      /getUsers, /deleteUser, /createPost
❌ Avoid deep nesting       /users/1/posts/2/comments/3/likes (too deep)
```

### Response Design

```js
// ✅ Always return consistent structure
{
  "success": true,
  "data":    { ... },
  "message": "User created successfully"
}

// ✅ Include pagination metadata
{
  "success": true,
  "total":   100,
  "page":    2,
  "pages":   10,
  "count":   10,
  "data":    [ ... ]
}

// ✅ Meaningful error responses
{
  "success": false,
  "error":   "User with id 99 not found"
}

// ❌ Don't send raw data without wrapping
[{ id: 1, name: "Arjun" }]

// ❌ Don't send HTML errors from Express
"Error: Cannot GET /users"
```

### Security

```js
// ✅ Validate all input
// ✅ Use environment variables for secrets
// ✅ Rate limiting
npm install express-rate-limit

import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      100,             // 100 requests per window
  message:  { success: false, error: 'Too many requests' }
});

app.use('/api', limiter);

// ✅ Use helmet for security headers
npm install helmet

import helmet from 'helmet';
app.use(helmet());

// ✅ Enable CORS for frontend access
npm install cors

import cors from 'cors';
app.use(cors({
  origin:  'http://localhost:5173', // your frontend URL
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
```

---

## Quick Reference

```
REST API Cheat Sheet:

HTTP Methods:
  GET    → read    → 200 OK
  POST   → create  → 201 Created
  PUT    → replace → 200 OK (send all fields)
  PATCH  → update  → 200 OK (send changed fields only)
  DELETE → remove  → 200 OK or 204 No Content

Where data lives:
  req.params  → /users/:id  → { id: '42' }
  req.query   → ?page=2     → { page: '2' }
  req.body    → JSON body   → { name: 'Arjun' }
  req.headers → Authorization: Bearer token

Status codes:
  200 OK          201 Created      204 No Content
  400 Bad Request 401 Unauthorized 403 Forbidden
  404 Not Found   409 Conflict     422 Validation
  500 Server Error

URL patterns:
  GET    /users           → all users
  POST   /users           → create user
  GET    /users/:id       → one user
  PUT    /users/:id       → replace user
  PATCH  /users/:id       → update user
  DELETE /users/:id       → delete user
  GET    /users/:id/posts → user's posts
```

---

## Summary

```
RESTful API with Express = resources + HTTP methods + JSON

Setup:
  npm install express
  app.use(express.json())
  app.use('/api/v1', router)

Structure:
  routes/      → URL definitions
  controllers/ → business logic
  middleware/  → validation, auth, errors, logging
  utils/       → helpers (query, response formatters)

Key principles:
  → Nouns not verbs in URLs (/users not /getUsers)
  → Correct HTTP method for each action
  → Consistent JSON response format
  → Proper status codes (200, 201, 400, 404, 500)
  → Validate input before processing
  → Handle errors with global error middleware
  → Filter / sort / paginate large collections
  → Version your API (/api/v1)
```