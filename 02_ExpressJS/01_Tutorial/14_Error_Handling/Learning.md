# Error Handling in Express.js

Error handling is one of the most important parts of building a robust API. Express.js has a built-in mechanism for catching and handling errors — both synchronous and asynchronous.

---

## Why Error Handling Matters

```
Without error handling:
  → Unhandled errors crash the server
  → Users see ugly HTML error pages
  → Stack traces leak to the client (security risk)
  → No consistent error format

With error handling:
  → Server stays running
  → Clean JSON error responses
  → Errors logged for debugging
  → Consistent format across all routes
```

---

## Types of Errors in Express

```
1. Synchronous Errors   → thrown in route handlers
2. Asynchronous Errors  → rejected Promises, async/await
3. Operational Errors   → expected (404, 400, 401...)
4. Programming Errors   → bugs (undefined variable, type error)
5. Validation Errors    → bad user input
6. Database Errors      → connection failed, query error
```

---

## Part 1 — Synchronous Error Handling

Express **automatically** catches synchronous errors thrown inside route handlers.

```js
import express from 'express';
const app = express();

// ✅ Express catches this automatically
app.get('/sync-error', (req, res) => {
  throw new Error('Something went wrong!'); // Express catches this
});

// Global error handler — catches it
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

app.listen(3000);
```

---

## Part 2 — Asynchronous Error Handling

Express **does NOT** automatically catch async errors. You must handle them manually.

### ❌ Wrong — async errors NOT caught by Express

```js
// Express 4 does NOT catch this automatically
app.get('/async-error', async (req, res) => {
  const data = await someAsyncFunction(); // if this throws...
  res.json(data);                         // ...Express never catches it
  // Server crashes with UnhandledPromiseRejection!
});
```

### ✅ Option 1 — try/catch in every handler

```js
app.get('/users', async (req, res, next) => {
  try {
    const users = await db.getUsers();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err); // pass error to Express error handler
  }
});

app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});
```

> `next(err)` — passing anything to `next()` tells Express it's an error and skips to the error handler.

---

### ✅ Option 2 — `asyncHandler` wrapper (recommended)

Wrap every async route handler to automatically catch errors:

```js
// src/middleware/asyncHandler.js

// Wraps an async function and forwards any errors to next()
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
```

```js
import asyncHandler from '../middleware/asyncHandler.js';

// ✅ No try/catch needed — asyncHandler catches all errors
app.get('/users', asyncHandler(async (req, res) => {
  const users = await db.getUsers();
  res.status(200).json({ success: true, data: users });
}));

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await db.getUserById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  res.status(200).json({ success: true, data: user });
}));
```

---

### ✅ Option 3 — Express 5 (auto async handling)

Express 5 handles async errors automatically — no wrapper needed:

```bash
npm install express@5
```

```js
// Express 5 — async errors caught automatically!
app.get('/users', async (req, res) => {
  const users = await db.getUsers(); // if this throws, Express catches it
  res.json(users);
});
```

---

## Part 3 — Custom Error Class

Create a custom error class to attach HTTP status codes to errors:

```js
// src/errors/AppError.js

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);           // pass message to Error class

    this.statusCode  = statusCode;
    this.status      = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // mark as expected/operational error

    // Capture the stack trace (excludes this constructor)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
```

```js
// Using AppError in controllers
import AppError from '../errors/AppError.js';

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = db.users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    throw new AppError('User not found', 404);       // 404 Not Found
  }

  res.status(200).json({ success: true, data: user });
}));

app.post('/users', asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    throw new AppError('Name and email are required', 400); // 400 Bad Request
  }

  const exists = db.users.find(u => u.email === email);
  if (exists) {
    throw new AppError('Email already in use', 409);        // 409 Conflict
  }

  // create user...
}));
```

---

## Part 4 — Global Error Handler Middleware

The global error handler must have **exactly 4 parameters**: `(err, req, res, next)`.
It must be registered **after all routes**.

```js
// src/middleware/errorHandler.js
import AppError from '../errors/AppError.js';

const errorHandler = (err, req, res, next) => {

  // Default values
  err.statusCode = err.statusCode || 500;
  err.message    = err.message    || 'Internal Server Error';

  // ── Development: send full error details ────────────────────
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success:    false,
      status:     err.status,
      message:    err.message,
      stack:      err.stack,       // show stack trace in dev
      error:      err,
    });
  }

  // ── Production: only send safe info ────────────────────────
  if (process.env.NODE_ENV === 'production') {

    // Operational errors (AppError) — safe to show to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        status:  err.status,
        message: err.message,
      });
    }

    // Programming or unknown errors — don't leak details
    console.error('💥 UNEXPECTED ERROR:', err);
    return res.status(500).json({
      success: false,
      status:  'error',
      message: 'Something went wrong. Please try again.',
    });
  }
};

export default errorHandler;
```

```js
// src/app.js
import express      from 'express';
import router       from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
app.use(express.json());

// ── All routes ───────────────────────────────────────────────
app.use('/api/v1', router);

// ── 404 — must be AFTER all routes ──────────────────────────
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// ── Global error handler — must be LAST ─────────────────────
app.use(errorHandler);

export default app;
```

---

## Part 5 — Handling Specific Error Types

Handle different types of errors differently in the error handler:

```js
// src/middleware/errorHandler.js
import AppError from '../errors/AppError.js';

// Handle specific known error types
const handleCastError       = (err) => new AppError(`Invalid ${err.path}: ${err.value}`, 400);
const handleDuplicateFields = (err) => new AppError(`Duplicate value: ${JSON.stringify(err.keyValue)}`, 409);
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map(e => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 422);
};
const handleJWTError        = ()    => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = ()    => new AppError('Token expired. Please log in again.', 401);
const handleSyntaxError     = ()    => new AppError('Invalid JSON in request body', 400);

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  let error = { ...err, message: err.message };

  // ── Identify and transform specific errors ─────────────────

  // MongoDB invalid ObjectId
  if (err.name === 'CastError')              error = handleCastError(err);

  // MongoDB duplicate key (unique constraint)
  if (err.code === 11000)                    error = handleDuplicateFields(err);

  // Mongoose validation error
  if (err.name === 'ValidationError')        error = handleValidationError(err);

  // JWT errors
  if (err.name === 'JsonWebTokenError')      error = handleJWTError();
  if (err.name === 'TokenExpiredError')      error = handleJWTExpiredError();

  // JSON parse error (malformed request body)
  if (err instanceof SyntaxError)            error = handleSyntaxError();

  // ── Send response ──────────────────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
      stack:   err.stack,
    });
  } else {
    if (error.isOperational) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      console.error('💥 CRITICAL ERROR:', err);
      res.status(500).json({
        success: false,
        message: 'Something went wrong.',
      });
    }
  }
};

export default errorHandler;
```

---

## Part 6 — 404 Not Found Handler

Handle requests to routes that don't exist:

```js
// src/app.js

// ── 404 Handler ──────────────────────────────────────────────
// Must come AFTER all routes but BEFORE the error handler
app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

// ── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);
```

**Response for unknown route:**
```json
{
  "success": false,
  "status":  "fail",
  "message": "Cannot GET /api/v1/unknown-route"
}
```

---

## Part 7 — Unhandled Rejections & Exceptions

Handle errors that escape Express entirely:

```js
// src/index.js
import app from './app.js';

const PORT   = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});

// ── Unhandled Promise Rejections ─────────────────────────────
// Catches: async errors outside of Express (DB connection, etc.)
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION:', err.name, err.message);
  console.error(err.stack);

  // Gracefully shut down the server
  server.close(() => {
    console.log('Server closed due to unhandled rejection');
    process.exit(1); // exit with failure
  });
});

// ── Uncaught Exceptions ──────────────────────────────────────
// Catches: synchronous errors outside of Express
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err.name, err.message);
  console.error(err.stack);

  // Must exit after uncaughtException — process is in undefined state
  process.exit(1);
});

// ── SIGTERM — graceful shutdown (for Docker / PM2) ───────────
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});
```

---

## Part 8 — Validation Errors

Handle input validation errors cleanly:

```js
// src/middleware/validate.js

// Simple manual validation
export const validateUserInput = (req, res, next) => {
  const { name, email, age } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push({ field: 'email', message: 'Email format is invalid' });
  }

  if (age !== undefined && (isNaN(age) || age < 0 || age > 120)) {
    errors.push({ field: 'age', message: 'Age must be between 0 and 120' });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};
```

```js
// Use in routes
router.post('/users', validateUserInput, createUser);
router.put('/users/:id', validateUserInput, updateUser);
```

**Response on validation error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "name",  "message": "Name must be at least 2 characters" },
    { "field": "email", "message": "Email format is invalid" }
  ]
}
```

---

## Part 9 — Error Logging

Log errors properly for debugging and monitoring:

```js
// src/utils/logger.js

const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level:     'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },

  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level:     'warn',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },

  error: (message, err = {}, meta = {}) => {
    console.error(JSON.stringify({
      level:     'error',
      message,
      timestamp: new Date().toISOString(),
      error: {
        name:    err.name,
        message: err.message,
        stack:   err.stack,
      },
      ...meta,
    }));
  },
};

export default logger;
```

```js
// Use in error handler
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error('Request failed', err, {
    method: req.method,
    url:    req.originalUrl,
    body:   req.body,
    user:   req.user?.id,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
};
```

---

## Part 10 — Complete Error Handling Setup

```js
// src/errors/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode    = statusCode;
    this.status        = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
export default AppError;
```

```js
// src/middleware/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
```

```js
// src/middleware/errorHandler.js
import AppError from '../errors/AppError.js';

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message    = err.message || 'Internal Server Error';

  // Handle specific errors
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired, please log in again',
    });
  }

  // Development — full error details
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack:   err.stack,
    });
  }

  // Production — operational errors only
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unknown production error
  console.error('💥 CRITICAL:', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong.',
  });
};

export default errorHandler;
```

```js
// src/app.js
import express      from 'express';
import AppError     from './errors/AppError.js';
import errorHandler from './middleware/errorHandler.js';
import router       from './routes/index.js';

const app = express();
app.use(express.json());
app.use('/api/v1', router);

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
```

```js
// src/controllers/userController.js
import asyncHandler from '../middleware/asyncHandler.js';
import AppError     from '../errors/AppError.js';
import { db }       from '../data/db.js';

export const getUser = asyncHandler(async (req, res) => {
  const id   = parseInt(req.params.id);
  const user = db.users.find(u => u.id === id);

  if (!user) throw new AppError(`User ${id} not found`, 404);

  res.status(200).json({ success: true, data: user });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email)
    throw new AppError('Name and email are required', 400);

  const exists = db.users.find(u => u.email === email);
  if (exists)
    throw new AppError('Email already in use', 409);

  const user = { id: db.nextId++, name, email };
  db.users.push(user);

  res.status(201).json({ success: true, data: user });
});
```

---

## Error Response Examples

```json
// 400 Bad Request
{
  "success": false,
  "message": "Name and email are required"
}

// 401 Unauthorized
{
  "success": false,
  "message": "Invalid token. Please log in again."
}

// 404 Not Found
{
  "success": false,
  "message": "User 99 not found"
}

// 409 Conflict
{
  "success": false,
  "message": "Email already in use"
}

// 422 Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email format is invalid" }
  ]
}

// 500 Server Error (production)
{
  "success": false,
  "message": "Something went wrong."
}

// 500 Server Error (development)
{
  "success": false,
  "message": "Cannot read property 'id' of undefined",
  "stack":   "TypeError: Cannot read...\n  at getUserById..."
}
```

---

## Middleware Order — Critical

```js
// ✅ Correct order in app.js

app.use(express.json());         // 1. parse body
app.use(logger);                 // 2. log requests
app.use('/api/v1', router);      // 3. routes
app.use(notFoundHandler);        // 4. catch unknown routes (404)
app.use(errorHandler);           // 5. handle all errors (MUST BE LAST)
```

```
Request flow:
  express.json()    → parse body
       ↓
  logger            → log request
       ↓
  router            → match route + run controller
       ↓ (if error)
  next(err)         → skip to error handler
       ↓
  notFoundHandler   → 404 if no route matched
       ↓
  errorHandler      → format and send error response
```

---

## Quick Reference

| Concept | Code |
|---|---|
| Throw operational error | `throw new AppError('Not found', 404)` |
| Pass error to handler | `next(err)` |
| Wrap async handler | `asyncHandler(async (req, res) => { })` |
| Global error handler | `app.use((err, req, res, next) => { })` |
| 404 handler | `app.use((req, res, next) => { next(new AppError(..., 404)) })` |
| Unhandled rejections | `process.on('unhandledRejection', handler)` |
| Uncaught exceptions | `process.on('uncaughtException', handler)` |

---

## Summary

```
Error Handling in Express = catch → classify → respond

Key tools:
  AppError       → custom error class with statusCode
  asyncHandler   → wraps async routes, forwards errors to next()
  errorHandler   → global middleware (4 params), must be LAST
  next(err)      → pass any error to the error handler

Flow:
  Route throws / rejects
       ↓
  asyncHandler catches it
       ↓
  next(err) called
       ↓
  errorHandler formats response
       ↓
  Client gets clean JSON error

Types of errors:
  400 → Bad Request     (invalid input)
  401 → Unauthorized    (not authenticated)
  403 → Forbidden       (no permission)
  404 → Not Found       (missing resource)
  409 → Conflict        (duplicate)
  422 → Validation      (failed validation)
  500 → Server Error    (unexpected crash)

Rules:
  → Always use try/catch OR asyncHandler for async code
  → Never send stack traces to client in production
  → Register error handler LAST in app.js
  → Handle unhandledRejection and uncaughtException
  → Use different responses for dev vs production
```