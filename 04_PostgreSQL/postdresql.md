# PostgreSQL with Node.js & Express — A Detailed Guide

---

## Table of Contents

1. [What is PostgreSQL?](#1-what-is-postgresql)
2. [Installation & Setup](#2-installation--setup)
3. [Connecting Node.js to PostgreSQL](#3-connecting-nodejs-to-postgresql)
4. [Connection Pooling](#4-connection-pooling)
5. [Basic SQL — CRUD Operations](#5-basic-sql--crud-operations)
6. [Parameterized Queries — Preventing SQL Injection](#6-parameterized-queries--preventing-sql-injection)
7. [PostgreSQL Data Types](#7-postgresql-data-types)
8. [Creating Tables & Schema Design](#8-creating-tables--schema-design)
9. [Relationships — Foreign Keys & Joins](#9-relationships--foreign-keys--joins)
10. [Transactions](#10-transactions)
11. [Full Express + PostgreSQL REST API](#11-full-express--postgresql-rest-api)
12. [Using an ORM — Sequelize](#12-using-an-orm--sequelize)
13. [Using an ORM — Prisma](#13-using-an-orm--prisma)
14. [Environment Variables & Configuration](#14-environment-variables--configuration)
15. [Common Mistakes](#15-common-mistakes)
16. [Quick Reference Cheatsheet](#16-quick-reference-cheatsheet)

---

## 1. What is PostgreSQL?

**PostgreSQL** (often called "Postgres") is a powerful, open-source
**relational database management system (RDBMS)**. Data is stored in
**tables** made up of **rows** and **columns**, with strict relationships
between tables enforced through keys and constraints.

```
┌─────────────────────────────────────────────────────────────────┐
│                    RELATIONAL DATABASE                          │
├─────────────────────────────────────────────────────────────────┤
│  users table                                                    │
│  ┌────┬─────────┬──────────────────────┬──────────┐           │
│  │ id │ name    │ email                │ role     │           │
│  ├────┼─────────┼──────────────────────┼──────────┤           │
│  │ 1  │ Alice   │ alice@example.com    │ admin    │           │
│  │ 2  │ John    │ john@example.com     │ user     │           │
│  └────┴─────────┴──────────────────────┴──────────┘           │
│                                                                 │
│  posts table                                                   │
│  ┌────┬───────────────┬──────────┐                            │
│  │ id │ title         │ user_id  │ ← foreign key → users.id    │
│  ├────┼───────────────┼──────────┤                            │
│  │ 1  │ Hello World   │ 1        │                            │
│  │ 2  │ Learning SQL  │ 2        │                            │
│  └────┴───────────────┴──────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### Why PostgreSQL?

```
┌──────────────────────┬──────────────────────────────────────────┐
│ Feature              │ Why it matters                           │
├──────────────────────┼──────────────────────────────────────────┤
│ ACID compliant       │ Reliable transactions — no partial writes │
│ Open source & free   │ No licensing costs                       │
│ JSON/JSONB support   │ Combines relational + NoSQL flexibility  │
│ Strong typing        │ Data integrity enforced at DB level      │
│ Extensible           │ PostGIS (geo), full-text search, etc.    │
│ Mature & battle-tested│ Used by Instagram, Spotify, Reddit       │
└──────────────────────┴──────────────────────────────────────────┘
```

### PostgreSQL vs MongoDB (relational vs document)

```
PostgreSQL (SQL/Relational)        MongoDB (NoSQL/Document)
─────────────────────────────      ─────────────────────────────
Data in tables/rows/columns         Data in collections/documents (JSON-like)
Schema enforced (fixed structure)   Schema-less (flexible structure)
Relationships via foreign keys      Relationships via embedding/references
Strong consistency (ACID)           Eventual consistency (often)
Best for: structured data,          Best for: rapidly changing data,
  complex relationships,              flexible schemas, horizontal scaling
  financial systems
```

---

## 2. Installation & Setup

### Installing PostgreSQL

```bash
# macOS (using Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download installer from https://www.postgresql.org/download/windows/
```

### Creating a database and user

```bash
# Access the PostgreSQL command-line tool
psql postgres

# Inside psql shell:
CREATE DATABASE myapp;
CREATE USER myapp_user WITH ENCRYPTED PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE myapp TO myapp_user;

# Connect to the new database
\c myapp

# List all databases
\l

# List all tables in current database
\dt

# Describe a table's structure
\d users

# Exit psql
\q
```

### Using Docker (recommended for development)

```bash
# Run PostgreSQL in a Docker container
docker run --name myapp-postgres \
  -e POSTGRES_USER=myapp_user \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=myapp \
  -p 5432:5432 \
  -d postgres:16

# Connect to it
docker exec -it myapp-postgres psql -U myapp_user -d myapp
```

---

## 3. Connecting Node.js to PostgreSQL

The official Node.js driver for PostgreSQL is **node-postgres** (`pg`).

### Installation

```bash
npm install pg
```

### Basic connection

```javascript
// db.js
import { Client } from "pg";

// Create a client instance with connection details
const client = new Client({
  user:     "myapp_user",
  password: "mypassword",
  host:     "localhost",
  port:     5432,
  database: "myapp",
});

// Connect to the database
await client.connect();
console.log("Connected to PostgreSQL!");

// Run a simple query
const result = await client.query("SELECT NOW()");
console.log(result.rows); // → [ { now: 2026-06-14T10:30:00.000Z } ]

// Always close the connection when done
await client.end();
```

### Connection using a connection string (URI)

```javascript
import { Client } from "pg";

// Connection string format:
// postgresql://username:password@host:port/database
const client = new Client({
  connectionString: "postgresql://myapp_user:mypassword@localhost:5432/myapp",
});

await client.connect();
```

### Anatomy of the query result object

```javascript
const result = await client.query("SELECT * FROM users");

console.log(result.rows);         // array of row objects — the actual data
console.log(result.rowCount);     // number of rows returned/affected
console.log(result.fields);       // column metadata (name, dataTypeID, etc.)
console.log(result.command);      // "SELECT", "INSERT", "UPDATE", "DELETE"

// Example result.rows:
// [
//   { id: 1, name: "Alice", email: "alice@example.com", role: "admin" },
//   { id: 2, name: "John",  email: "john@example.com",  role: "user"  },
// ]
```

---

## 4. Connection Pooling

A single `Client` connection is fine for scripts, but a real Express
app handles many requests concurrently. A **connection pool** maintains
multiple reusable connections, avoiding the overhead of opening a new
connection for every query.

```
┌─────────────────────────────────────────────────────────────────┐
│                    WITHOUT POOLING (❌)                          │
│                                                                  │
│  Request 1 → open connection → query → close connection         │
│  Request 2 → open connection → query → close connection         │
│  Request 3 → open connection → query → close connection         │
│                                                                  │
│  Opening/closing connections is SLOW — adds latency to          │
│  every single request                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    WITH POOLING (✅)                             │
│                                                                  │
│              ┌──────────────────────────────┐                   │
│              │   Pool (e.g. 20 connections)  │                   │
│              │  [C1] [C2] [C3] ... [C20]      │                   │
│              └──────────────────────────────┘                   │
│  Request 1 → borrow C1 → query → return C1 to pool              │
│  Request 2 → borrow C2 → query → return C2 to pool              │
│  Request 3 → borrow C1 → query → return C1 to pool              │
│                                                                  │
│  Connections are REUSED — much faster                           │
└─────────────────────────────────────────────────────────────────┘
```

### Setting up a pool

```javascript
// db.js
import { Pool } from "pg";
import "dotenv/config";

// Create a pool — shared across the entire application
const pool = new Pool({
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host:     process.env.DB_HOST || "localhost",
  port:     process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,

  // ── Pool configuration ──────────────────────────────────────
  max:                   20,    // maximum number of clients in the pool
  idleTimeoutMillis:     30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // error if connection takes longer than 2s
});

// Listen for unexpected errors on idle clients
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

export default pool;
```

### Using the pool

```javascript
// userModel.js
import pool from "./db.js";

// pool.query() automatically:
//   1. Borrows a client from the pool
//   2. Runs the query
//   3. Returns the client to the pool
// You never manually connect/disconnect with pool.query()
export async function getAllUsers() {
  const result = await pool.query("SELECT id, name, email, role FROM users");
  return result.rows;
}

export async function getUserById(id) {
  const result = await pool.query(
    "SELECT id, name, email, role FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0]; // undefined if not found
}
```

---

## 5. Basic SQL — CRUD Operations

### CREATE (INSERT)

```javascript
// Insert a single row
const result = await pool.query(
  `INSERT INTO users (name, email, password, role)
   VALUES ($1, $2, $3, $4)
   RETURNING id, name, email, role`,
  // RETURNING clause sends back the inserted row (including auto-generated id)
  ["Alice", "alice@example.com", hashedPassword, "user"]
);

const newUser = result.rows[0];
console.log(newUser); // → { id: 1, name: "Alice", email: "alice@example.com", role: "user" }
```

### READ (SELECT)

```javascript
// Get all rows
const all = await pool.query("SELECT * FROM users");

// Get with a WHERE condition
const byEmail = await pool.query(
  "SELECT * FROM users WHERE email = $1",
  ["alice@example.com"]
);

// Get with multiple conditions
const filtered = await pool.query(
  "SELECT * FROM users WHERE role = $1 AND created_at > $2",
  ["admin", "2024-01-01"]
);

// Ordering, limiting, pagination
const paginated = await pool.query(
  `SELECT id, name, email FROM users
   ORDER BY created_at DESC
   LIMIT $1 OFFSET $2`,
  [10, 0] // page 1: limit 10, offset 0
);

// Counting rows
const countResult = await pool.query("SELECT COUNT(*) FROM users");
const totalUsers  = parseInt(countResult.rows[0].count, 10);
// Note: COUNT(*) returns a string in PostgreSQL — must parse to number
```

### UPDATE

```javascript
// Update specific fields of a row
const updated = await pool.query(
  `UPDATE users
   SET name = $1, email = $2, updated_at = NOW()
   WHERE id = $3
   RETURNING id, name, email, role`,
  ["Alice Smith", "alice.smith@example.com", 1]
);

if (updated.rowCount === 0) {
  console.log("No user found with that ID");
} else {
  console.log("Updated user:", updated.rows[0]);
}

// Partial update — only update fields that are provided
async function patchUser(id, fields) {
  // Build SET clause dynamically: "name = $1, role = $2"
  const keys   = Object.keys(fields);
  const values = Object.values(fields);

  const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");

  const query = `
    UPDATE users
    SET ${setClause}, updated_at = NOW()
    WHERE id = $${keys.length + 1}
    RETURNING *
  `;

  const result = await pool.query(query, [...values, id]);
  return result.rows[0];
}

// Usage: only updates "role" — name and email stay unchanged
await patchUser(1, { role: "admin" });
```

### DELETE

```javascript
// Delete a single row
const deleted = await pool.query(
  "DELETE FROM users WHERE id = $1 RETURNING id, name",
  [1]
);

if (deleted.rowCount === 0) {
  console.log("No user found with that ID");
} else {
  console.log("Deleted user:", deleted.rows[0]);
}

// Delete with a condition affecting multiple rows
const deletedInactive = await pool.query(
  "DELETE FROM users WHERE last_login < $1 RETURNING id",
  ["2023-01-01"]
);
console.log(`Deleted ${deletedInactive.rowCount} inactive users`);
```

---

## 6. Parameterized Queries — Preventing SQL Injection

**Never** build SQL queries by concatenating user input directly into
the query string. Always use **parameterized queries** with `$1`, `$2`, etc.

```javascript
// ❌ DANGEROUS — SQL Injection vulnerability
const email = req.body.email; // attacker input: "x' OR '1'='1"

const query = `SELECT * FROM users WHERE email = '${email}'`;
// Becomes: SELECT * FROM users WHERE email = 'x' OR '1'='1'
// → Returns ALL users! Attacker bypasses authentication.

await pool.query(query); // ❌ NEVER DO THIS


// ✅ SAFE — Parameterized query
const email = req.body.email;

const query = "SELECT * FROM users WHERE email = $1";
await pool.query(query, [email]);
// $1 is replaced safely by the driver — special characters are escaped
// "x' OR '1'='1" is treated as a literal string, not SQL code
```

### How parameterized queries work

```
Query template:  "SELECT * FROM users WHERE email = $1 AND role = $2"
Values array:    ["alice@example.com", "admin"]

The driver sends the QUERY and VALUES separately to PostgreSQL.
PostgreSQL treats values as DATA, never as executable SQL — even
if the value contains quotes, semicolons, or SQL keywords.
```

### Multiple parameters

```javascript
// $1, $2, $3... correspond to array positions (1-indexed)
await pool.query(
  `INSERT INTO posts (title, content, user_id, status)
   VALUES ($1, $2, $3, $4)`,
  ["My First Post", "Hello world!", 1, "published"]
  //  $1               $2              $3  $4
);
```

---

## 7. PostgreSQL Data Types

```
┌─────────────────────┬───────────────────────────────────────────┐
│  Category           │  Types                                    │
├─────────────────────┼───────────────────────────────────────────┤
│  Numeric            │  INTEGER, BIGINT, SMALLINT,               │
│                     │  DECIMAL/NUMERIC, REAL, DOUBLE PRECISION  │
│  Auto-increment     │  SERIAL, BIGSERIAL (auto-incrementing int)│
│  Text               │  VARCHAR(n), TEXT, CHAR(n)                │
│  Boolean            │  BOOLEAN (true/false)                     │
│  Date/Time          │  DATE, TIME, TIMESTAMP, TIMESTAMPTZ        │
│  UUID               │  UUID (with uuid-ossp extension)          │
│  JSON               │  JSON, JSONB (binary JSON — faster)       │
│  Arrays             │  INTEGER[], TEXT[], etc.                  │
│  Enum               │  Custom enumerated types                  │
└─────────────────────┴───────────────────────────────────────────┘
```

### Common type choices

```sql
-- Auto-incrementing primary key
id SERIAL PRIMARY KEY              -- 1, 2, 3, 4... (32-bit)
id BIGSERIAL PRIMARY KEY           -- for very large tables (64-bit)
id UUID PRIMARY KEY DEFAULT gen_random_uuid()  -- random unique ID

-- Text
name VARCHAR(100)        -- limited length string
bio TEXT                  -- unlimited length string
status CHAR(1)            -- fixed-length string (rarely used)

-- Numbers
age INTEGER
price DECIMAL(10, 2)      -- 10 total digits, 2 after decimal — for money
rating REAL               -- floating point

-- Boolean
is_active BOOLEAN DEFAULT true

-- Dates
created_at TIMESTAMP DEFAULT NOW()
created_at TIMESTAMPTZ DEFAULT NOW()  -- timezone-aware (recommended)
birth_date DATE

-- JSON — store flexible/nested data
metadata JSONB            -- JSONB is indexed and faster than JSON
preferences JSONB DEFAULT '{}'

-- Arrays
tags TEXT[]               -- e.g. ['nodejs', 'postgres', 'tutorial']

-- Enum — restrict to specific values
CREATE TYPE user_role AS ENUM ('user', 'editor', 'admin');
role user_role DEFAULT 'user'
```

### Working with JSONB

```javascript
// Insert JSONB data — stringify the object
await pool.query(
  "INSERT INTO users (name, preferences) VALUES ($1, $2)",
  ["Alice", JSON.stringify({ theme: "dark", notifications: true })]
);

// Query inside JSONB using -> and ->>
// -> returns JSON, ->> returns TEXT
const result = await pool.query(
  `SELECT name, preferences->>'theme' AS theme
   FROM users
   WHERE preferences->>'notifications' = 'true'`
);

// Update a single key inside a JSONB column
await pool.query(
  `UPDATE users
   SET preferences = jsonb_set(preferences, '{theme}', '"light"')
   WHERE id = $1`,
  [1]
);
```

---

## 8. Creating Tables & Schema Design

### Basic table creation

```sql
-- users.sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password      VARCHAR(255)  NOT NULL,
  role          VARCHAR(20)   NOT NULL DEFAULT 'user',
  is_active     BOOLEAN       DEFAULT true,
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- Add an index for faster lookups on email (used frequently in WHERE clauses)
CREATE INDEX idx_users_email ON users(email);
```

### Constraints explained

```sql
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,                    -- auto-incrementing unique ID

  name        VARCHAR(200) NOT NULL,                 -- NOT NULL = required field

  sku         VARCHAR(50)  NOT NULL UNIQUE,          -- UNIQUE = no duplicates allowed

  price       DECIMAL(10,2) NOT NULL CHECK (price >= 0),
              -- CHECK = custom validation rule at the DB level

  category_id INTEGER REFERENCES categories(id),
              -- REFERENCES = foreign key — must match an id in categories table

  stock       INTEGER DEFAULT 0,                     -- DEFAULT = value if not provided

  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Running migrations from Node.js

```javascript
// migrate.js — run this once to set up your database schema
import pool from "./db.js";

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(255) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      role       VARCHAR(20)  NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ  DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id         SERIAL PRIMARY KEY,
      title      VARCHAR(255) NOT NULL,
      content    TEXT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log("Migration complete!");
  await pool.end();
}

migrate().catch(console.error);
```

```bash
# Run the migration script
node migrate.js
```

> **Production tip:** Use a proper migration tool like `node-pg-migrate`
> or an ORM's migration system (Sequelize/Prisma) instead of raw scripts —
> they track which migrations have run and allow rollbacks.

---

## 9. Relationships — Foreign Keys & Joins

### One-to-Many relationship

```sql
-- One user can have MANY posts
-- Each post belongs to ONE user

CREATE TABLE users (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE posts (
  id      SERIAL PRIMARY KEY,
  title   VARCHAR(255) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
  -- ON DELETE CASCADE → if the user is deleted, their posts are deleted too
  -- ON DELETE SET NULL → posts remain but user_id becomes NULL
  -- ON DELETE RESTRICT → prevents deleting a user who has posts (default)
);
```

### JOIN — combining data from multiple tables

```javascript
// Get all posts WITH the author's name (INNER JOIN)
const result = await pool.query(`
  SELECT
    posts.id,
    posts.title,
    posts.content,
    users.name  AS author_name,
    users.email AS author_email
  FROM posts
  INNER JOIN users ON posts.user_id = users.id
  ORDER BY posts.created_at DESC
`);

console.log(result.rows);
// → [
//     { id: 1, title: "Hello World", content: "...", author_name: "Alice", author_email: "alice@example.com" },
//     { id: 2, title: "Learning SQL", content: "...", author_name: "John",  author_email: "john@example.com" },
//   ]
```

### Types of JOINs

```sql
-- INNER JOIN — only rows that match in BOTH tables
SELECT * FROM posts
INNER JOIN users ON posts.user_id = users.id;
-- Posts without a valid user_id are excluded

-- LEFT JOIN — all rows from the left table, matched rows from the right
-- (NULL for unmatched right-side columns)
SELECT users.name, posts.title
FROM users
LEFT JOIN posts ON posts.user_id = users.id;
-- Includes users with NO posts (posts.title will be NULL for them)

-- Aggregate with JOIN — count posts per user
SELECT
  users.name,
  COUNT(posts.id) AS post_count
FROM users
LEFT JOIN posts ON posts.user_id = users.id
GROUP BY users.id, users.name
ORDER BY post_count DESC;
```

### Many-to-Many relationship

```sql
-- Posts can have MANY tags, tags can belong to MANY posts
-- Requires a JUNCTION (join) table

CREATE TABLE tags (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)  -- composite primary key — prevents duplicates
);
```

```javascript
// Get all tags for a specific post
const result = await pool.query(`
  SELECT tags.id, tags.name
  FROM tags
  INNER JOIN post_tags ON tags.id = post_tags.tag_id
  WHERE post_tags.post_id = $1
`, [postId]);

// Get all posts that have a specific tag
const postsWithTag = await pool.query(`
  SELECT posts.id, posts.title
  FROM posts
  INNER JOIN post_tags ON posts.id = post_tags.post_id
  INNER JOIN tags ON tags.id = post_tags.tag_id
  WHERE tags.name = $1
`, ["nodejs"]);
```

---

## 10. Transactions

A **transaction** groups multiple queries into a single all-or-nothing
unit. If any query fails, ALL changes are rolled back — the database
returns to its state before the transaction started.

```
┌─────────────────────────────────────────────────────────────────┐
│              EXAMPLE: TRANSFERRING MONEY                        │
│                                                                  │
│  BEGIN TRANSACTION                                              │
│    UPDATE accounts SET balance = balance - 100 WHERE id = 1;   │
│    UPDATE accounts SET balance = balance + 100 WHERE id = 2;   │
│  COMMIT                                                         │
│                                                                  │
│  If step 2 fails (e.g. account 2 doesn't exist):               │
│  ROLLBACK — step 1 is UNDONE too                                │
│  → Account 1 never loses the $100 ✅                            │
│                                                                  │
│  Without a transaction:                                         │
│  → Account 1 loses $100, account 2 never gets it ❌ (data loss) │
└─────────────────────────────────────────────────────────────────┘
```

### Using transactions with node-postgres

```javascript
// IMPORTANT: transactions require a SINGLE client, not pool.query()
// because BEGIN/COMMIT must run on the same connection

async function transferMoney(fromAccountId, toAccountId, amount) {
  // Get a dedicated client from the pool for this transaction
  const client = await pool.connect();

  try {
    // Start the transaction
    await client.query("BEGIN");

    // Deduct from sender — check sufficient balance
    const sender = await client.query(
      "SELECT balance FROM accounts WHERE id = $1 FOR UPDATE",
      [fromAccountId]
      // FOR UPDATE locks this row until the transaction ends
      // prevents race conditions from concurrent transfers
    );

    if (sender.rows.length === 0) {
      throw new Error("Sender account not found");
    }

    if (sender.rows[0].balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Deduct from sender
    await client.query(
      "UPDATE accounts SET balance = balance - $1 WHERE id = $2",
      [amount, fromAccountId]
    );

    // Add to receiver
    const receiver = await client.query(
      "UPDATE accounts SET balance = balance + $1 WHERE id = $2 RETURNING id",
      [amount, toAccountId]
    );

    if (receiver.rows.length === 0) {
      throw new Error("Receiver account not found");
    }

    // Log the transaction
    await client.query(
      `INSERT INTO transactions (from_account, to_account, amount, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [fromAccountId, toAccountId, amount]
    );

    // All queries succeeded — commit (make permanent)
    await client.query("COMMIT");

    return { success: true, message: "Transfer completed" };

  } catch (err) {
    // Something failed — undo ALL changes made in this transaction
    await client.query("ROLLBACK");
    throw err; // re-throw so the caller knows it failed

  } finally {
    // ALWAYS release the client back to the pool
    // (whether success or failure)
    client.release();
  }
}

// Usage in an Express route
app.post("/transfer", async (req, res) => {
  const { fromAccountId, toAccountId, amount } = req.body;

  try {
    const result = await transferMoney(fromAccountId, toAccountId, amount);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

---

## 11. Full Express + PostgreSQL REST API

```javascript
// db.js
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => console.error("Unexpected pool error", err));

export default pool;
```

```javascript
// models/userModel.js
import pool from "../db.js";

export async function getAllUsers({ role, limit = 10, offset = 0 } = {}) {
  let query  = "SELECT id, name, email, role, created_at FROM users";
  const params = [];

  // Conditionally add WHERE clause if role filter is provided
  if (role) {
    params.push(role);
    query += ` WHERE role = $${params.length}`;
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
}

export async function getUserById(id) {
  const result = await pool.query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

export async function findUserByEmail(email) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
}

export async function createUser({ name, email, hashedPassword, role = "user" }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, hashedPassword, role]
  );
  return result.rows[0];
}

export async function updateUser(id, fields) {
  const keys   = Object.keys(fields);
  if (keys.length === 0) return getUserById(id);

  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const values     = Object.values(fields);

  const result = await pool.query(
    `UPDATE users SET ${setClause}, updated_at = NOW()
     WHERE id = $${keys.length + 1}
     RETURNING id, name, email, role, updated_at`,
    [...values, id]
  );
  return result.rows[0] || null;
}

export async function deleteUser(id) {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id",
    [id]
  );
  return result.rowCount > 0;
}
```

```javascript
// controllers/userController.js
import bcrypt from "bcrypt";
import {
  getAllUsers, getUserById, findUserByEmail,
  createUser, updateUser, deleteUser,
} from "../models/userModel.js";

export async function listUsers(req, res, next) {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const users = await getAllUsers({ role, limit: Number(limit), offset });
    res.json({ page: Number(page), limit: Number(limit), data: users });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function registerUser(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }

    const existing = await findUserByEmail(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await createUser({ name, email: email.toLowerCase(), hashedPassword });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function patchUser(req, res, next) {
  try {
    const allowedFields = ["name", "email", "role"];
    const updates = {};

    // Only allow specific fields to be updated
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updated = await updateUser(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: "User not found" });

    res.json(updated);
  } catch (err) {
    // Handle unique constraint violation (duplicate email)
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already in use" });
    }
    next(err);
  }
}

export async function removeUser(req, res, next) {
  try {
    const deleted = await deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
```

```javascript
// routes/userRoutes.js
import { Router } from "express";
import {
  listUsers, getUser, registerUser, patchUser, removeUser,
} from "../controllers/userController.js";

const router = Router();

router.get("/",       listUsers);
router.get("/:id",    getUser);
router.post("/",      registerUser);
router.patch("/:id",  patchUser);
router.delete("/:id", removeUser);

export default router;
```

```javascript
// app.js
import express     from "express";
import userRoutes  from "./routes/userRoutes.js";

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);

// PostgreSQL-specific error codes
app.use((err, req, res, next) => {
  console.error(err);

  // PostgreSQL error code reference:
  //   23505 → unique_violation (duplicate value)
  //   23503 → foreign_key_violation
  //   23502 → not_null_violation
  //   22P02 → invalid_text_representation (e.g. invalid UUID/integer)

  if (err.code === "23505") return res.status(409).json({ error: "Duplicate entry" });
  if (err.code === "23503") return res.status(400).json({ error: "Referenced record does not exist" });
  if (err.code === "23502") return res.status(400).json({ error: "Required field missing" });

  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
```

```javascript
// server.js
import "dotenv/config";
import app  from "./app.js";

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## 12. Using an ORM — Sequelize

An **ORM (Object-Relational Mapper)** lets you work with JavaScript
objects and classes instead of writing raw SQL.

### Installation

```bash
npm install sequelize pg pg-hstore
```

### Setup and model definition

```javascript
// db.js
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // set to console.log to see generated SQL
});

export default sequelize;
```

```javascript
// models/User.js
import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("user", "editor", "admin"),
    defaultValue: "user",
  },
}, {
  tableName: "users",
  timestamps: true, // adds createdAt and updatedAt automatically
});

export default User;
```

```javascript
// models/Post.js
import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import User from "./User.js";

const Post = sequelize.define("Post", {
  title:   { type: DataTypes.STRING,  allowNull: false },
  content: { type: DataTypes.TEXT },
}, {
  tableName: "posts",
  timestamps: true,
});

// Define relationships
User.hasMany(Post,    { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User,  { foreignKey: "userId" });

export default Post;
```

### CRUD with Sequelize

```javascript
import User from "./models/User.js";
import bcrypt from "bcrypt";

// CREATE
const user = await User.create({
  name:     "Alice",
  email:    "alice@example.com",
  password: await bcrypt.hash("password123", 12),
});

// READ — find all
const allUsers = await User.findAll({
  attributes: ["id", "name", "email", "role"], // select specific columns
  where:      { role: "admin" },
  order:      [["createdAt", "DESC"]],
  limit:      10,
  offset:     0,
});

// READ — find one
const found = await User.findOne({ where: { email: "alice@example.com" } });
const byId  = await User.findByPk(1); // find by primary key

// UPDATE
const userToUpdate = await User.findByPk(1);
if (userToUpdate) {
  userToUpdate.name = "Alice Smith";
  await userToUpdate.save();
}

// or update directly
await User.update(
  { role: "admin" },
  { where: { id: 1 } }
);

// DELETE
await User.destroy({ where: { id: 1 } });

// Relationships — include related data (JOIN)
import Post from "./models/Post.js";

const userWithPosts = await User.findByPk(1, {
  include: [{ model: Post }],
});
console.log(userWithPosts.Posts); // array of the user's posts
```

### Syncing models with the database

```javascript
// server.js
import sequelize from "./db.js";
import "./models/User.js";
import "./models/Post.js";

// Creates tables based on model definitions if they don't exist
// ⚠️ Use migrations in production — sync() can be destructive with { force: true }
await sequelize.sync();
console.log("Database synced");
```

---

## 13. Using an ORM — Prisma

**Prisma** is a modern, type-safe ORM with auto-generated TypeScript types
and an intuitive schema file.

### Installation

```bash
npm install prisma @prisma/client
npx prisma init
```

### Schema definition

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)
  posts     Post[]            // one-to-many relation
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users") // maps to "users" table in the database
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    Int
  createdAt DateTime @default(now())

  @@map("posts")
}

enum Role {
  USER
  EDITOR
  ADMIN
}
```

```bash
# Generate and apply migration based on schema
npx prisma migrate dev --name init

# Generate the Prisma Client (type-safe database client)
npx prisma generate
```

### CRUD with Prisma

```javascript
// db.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export default prisma;
```

```javascript
import prisma from "./db.js";
import bcrypt from "bcrypt";

// CREATE
const user = await prisma.user.create({
  data: {
    name:     "Alice",
    email:    "alice@example.com",
    password: await bcrypt.hash("password123", 12),
  },
});

// READ — find many with filters, pagination, sorting
const users = await prisma.user.findMany({
  where:   { role: "ADMIN" },
  select:  { id: true, name: true, email: true, role: true }, // select specific fields
  orderBy: { createdAt: "desc" },
  take:    10,  // limit
  skip:    0,   // offset
});

// READ — find unique
const found = await prisma.user.findUnique({ where: { email: "alice@example.com" } });
const byId  = await prisma.user.findUnique({ where: { id: 1 } });

// UPDATE
const updated = await prisma.user.update({
  where: { id: 1 },
  data:  { name: "Alice Smith" },
});

// DELETE
await prisma.user.delete({ where: { id: 1 } });

// Relations — include related data (JOIN)
const userWithPosts = await prisma.user.findUnique({
  where:   { id: 1 },
  include: { posts: true },
});
console.log(userWithPosts.posts); // array of related posts

// Transactions
const [user1, user2] = await prisma.$transaction([
  prisma.user.update({ where: { id: 1 }, data: { balance: { decrement: 100 } } }),
  prisma.user.update({ where: { id: 2 }, data: { balance: { increment: 100 } } }),
]);
```

### Sequelize vs Prisma

```
┌──────────────────────┬─────────────────┬─────────────────────────┐
│ Feature              │ Sequelize       │ Prisma                  │
├──────────────────────┼─────────────────┼─────────────────────────┤
│ Schema definition    │ JS classes/models│ Dedicated .prisma file │
│ Type safety          │ Limited          │ Excellent (auto-types)  │
│ Migration system     │ Built-in CLI     │ Built-in CLI            │
│ Query syntax         │ Method chains    │ Object-based, intuitive │
│ Learning curve       │ Moderate         │ Easy                    │
│ Maturity             │ Very mature      │ Newer but widely adopted│
└──────────────────────┴─────────────────┴─────────────────────────┘
```

---

## 14. Environment Variables & Configuration

Never hardcode database credentials in your code.

```bash
# .env (add to .gitignore — never commit!)
DATABASE_URL=postgresql://myapp_user:mypassword@localhost:5432/myapp

# Or individual variables
DB_USER=myapp_user
DB_PASSWORD=mypassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp

NODE_ENV=development
```

```javascript
// db.js
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // SSL required for most cloud providers (Heroku, Render, Supabase, etc.)
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

export default pool;
```

### Checking the connection on startup

```javascript
// server.js
import pool from "./db.js";
import app  from "./app.js";

const PORT = process.env.PORT || 3000;

// Test the database connection before starting the server
pool.query("SELECT NOW()")
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); // exit if DB connection fails
  });
```

---

## 15. Common Mistakes

### Mistake 1 — String concatenation (SQL injection)

```javascript
// ❌ NEVER concatenate user input into queries
const query = `SELECT * FROM users WHERE id = ${req.params.id}`;

// ✅ Always use parameterized queries
const query = "SELECT * FROM users WHERE id = $1";
await pool.query(query, [req.params.id]);
```

### Mistake 2 — Not releasing clients

```javascript
// ❌ Client borrowed from pool but never released — pool exhausts
const client = await pool.connect();
const result = await client.query("SELECT * FROM users");
// client.release() never called — connection leaked!

// ✅ Always release in a finally block
const client = await pool.connect();
try {
  const result = await client.query("SELECT * FROM users");
} finally {
  client.release();
}

// ✅ Or simply use pool.query() — it handles connect/release automatically
const result = await pool.query("SELECT * FROM users");
```

### Mistake 3 — Forgetting COUNT(*) returns a string

```javascript
const result = await pool.query("SELECT COUNT(*) FROM users");

// ❌ This is a STRING, not a number
console.log(result.rows[0].count + 1);  // → "51" (string concatenation!)

// ✅ Parse to a number first
const count = parseInt(result.rows[0].count, 10);
console.log(count + 1);  // → 51 (correct addition)
```

### Mistake 4 — Not handling unique constraint errors

```javascript
// ❌ Generic 500 error for duplicate email
app.post("/users", async (req, res) => {
  const user = await pool.query("INSERT INTO users (email) VALUES ($1)", [req.body.email]);
  res.json(user.rows[0]);
  // If email already exists → throws → unhandled → 500 error, no clear message
});

// ✅ Catch the specific PostgreSQL error code
app.post("/users", async (req, res) => {
  try {
    const user = await pool.query("INSERT INTO users (email) VALUES ($1)", [req.body.email]);
    res.status(201).json(user.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});
```

### Mistake 5 — Running transactions with pool.query()

```javascript
// ❌ Each pool.query() may use a DIFFERENT connection
// BEGIN on connection A, COMMIT on connection B → doesn't work as a transaction!
await pool.query("BEGIN");
await pool.query("UPDATE accounts SET balance = balance - 100 WHERE id = 1");
await pool.query("COMMIT");

// ✅ Use a single dedicated client for the whole transaction
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("UPDATE accounts SET balance = balance - 100 WHERE id = 1");
  await client.query("COMMIT");
} finally {
  client.release();
}
```

### Mistake 6 — Storing money as floating point

```sql
-- ❌ FLOAT/REAL — rounding errors with money
price REAL  -- 19.99 + 0.01 might become 20.000000001

-- ✅ DECIMAL/NUMERIC — exact precision for currency
price DECIMAL(10, 2)  -- always exactly 19.99
```

---

## 16. Quick Reference Cheatsheet

```
┌──────────────────────────────────────────────────────────────────┐
│                    SETUP                                        │
├──────────────────────────────────────────────────────────────────┤
│  npm install pg                                                  │
│  import { Pool } from "pg";                                      │
│  const pool = new Pool({ connectionString: process.env.DB_URL });│
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    CRUD QUERIES                                  │
├──────────────────────────────────────────────────────────────────┤
│  CREATE:                                                          │
│   INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *    │
│                                                                   │
│  READ:                                                            │
│   SELECT * FROM users WHERE id = $1                              │
│   SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2│
│                                                                   │
│  UPDATE:                                                          │
│   UPDATE users SET name = $1 WHERE id = $2 RETURNING *           │
│                                                                   │
│  DELETE:                                                          │
│   DELETE FROM users WHERE id = $1 RETURNING id                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              RESULT OBJECT                                       │
├──────────────────────────────────────────────────────────────────┤
│  result.rows       → array of returned rows                      │
│  result.rowCount   → number of rows affected/returned            │
│  result.command    → "SELECT" | "INSERT" | "UPDATE" | "DELETE"   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              POSTGRESQL ERROR CODES                              │
├──────────────────────┬─────────────────────────────────────────┤
│  23505               │ unique_violation (duplicate)             │
│  23503               │ foreign_key_violation                    │
│  23502               │ not_null_violation                       │
│  22P02               │ invalid_text_representation              │
└──────────────────────┴─────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              TRANSACTION TEMPLATE                                │
├──────────────────────────────────────────────────────────────────┤
│  const client = await pool.connect();                            │
│  try {                                                           │
│    await client.query("BEGIN");                                  │
│    // ... multiple queries ...                                    │
│    await client.query("COMMIT");                                 │
│  } catch (err) {                                                  │
│    await client.query("ROLLBACK");                               │
│    throw err;                                                    │
│  } finally {                                                      │
│    client.release();                                             │
│  }                                                                │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              ORM QUICK PICK                                      │
├──────────────────────────────────────────────────────────────────┤
│  Raw SQL (pg)   → full control, best performance, more code       │
│  Sequelize      → mature, flexible, good for complex queries      │
│  Prisma         → modern, type-safe, best developer experience    │
└──────────────────────────────────────────────────────────────────┘
```

---

> **Summary:** PostgreSQL is a robust relational database that pairs
> naturally with Express via `node-postgres`. Always use connection
> pooling for production apps, parameterized queries (`$1`, `$2`) to
> prevent SQL injection, transactions for multi-step operations that
> must succeed or fail together, and proper foreign keys to maintain
> data integrity. Once comfortable with raw SQL, ORMs like Sequelize
> or Prisma can speed up development with type safety and less
> boilerplate.