# Connecting to a Database in Express.js

> A comprehensive guide covering MongoDB, PostgreSQL, MySQL, and SQLite — with connection setup, models, CRUD operations, error handling, and production best practices.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Environment Variables Setup](#2-environment-variables-setup)
3. [MongoDB with Mongoose](#3-mongodb-with-mongoose)
4. [PostgreSQL with node-postgres (pg)](#4-postgresql-with-node-postgres-pg)
5. [MySQL with mysql2](#5-mysql-with-mysql2)
6. [SQLite with better-sqlite3](#6-sqlite-with-better-sqlite3)
7. [Using Sequelize ORM](#7-using-sequelize-orm)
8. [Using Prisma ORM](#8-using-prisma-orm)
9. [Database Error Handling](#9-database-error-handling)
10. [Connection Pooling](#10-connection-pooling)
11. [Structuring Your Project](#11-structuring-your-project)
12. [Quick Comparison](#12-quick-comparison)

---

## 1. Overview

Express.js is **database-agnostic** — it has no built-in database layer. You choose the driver or ORM that fits your needs.

### Driver vs ORM

| Approach   | What It Is                                         | Examples                    |
|------------|----------------------------------------------------|-----------------------------|
| **Driver** | Low-level, sends raw queries directly to the DB    | `pg`, `mysql2`, `mongodb`   |
| **ORM**    | Maps database tables/collections to JS objects     | `mongoose`, `sequelize`, `prisma` |

**When to use a Driver:** You want full control over queries, maximum performance, or are writing complex SQL.

**When to use an ORM:** You want faster development, model validation, and don't want to write raw SQL by hand.

---

## 2. Environment Variables Setup

Before connecting to any database, store credentials in environment variables — never hardcode them.

```bash
npm install dotenv
```

Create a `.env` file in the project root:

```env
# Server
PORT=3000

# MongoDB
MONGO_URI=mongodb://localhost:27017/myapp

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=myapp
PG_USER=postgres
PG_PASSWORD=yourpassword

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=myapp
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword

# SQLite
SQLITE_PATH=./database.sqlite
```

Load it at the very top of your entry file:

```js
// app.js or server.js — load env vars before anything else
import "dotenv/config";
```

Add `.env` to `.gitignore` so credentials are never committed:

```
node_modules/
.env
uploads/
```

---

## 3. MongoDB with Mongoose

MongoDB is a NoSQL document database. Mongoose provides schema-based modeling on top of the native MongoDB driver.

### 3.1 Installation

```bash
npm install mongoose
```

### 3.2 Connecting to MongoDB

```js
// db/mongo.js
import mongoose from "mongoose";

const connectMongo = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1); // Exit process on connection failure
  }
};

export default connectMongo;
```

Call it in your main app file:

```js
// app.js
import express from "express";
import "dotenv/config";
import connectMongo from "./db/mongo.js";

const app = express();
app.use(express.json());

// Connect to MongoDB before starting the server
await connectMongo();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
```

### 3.3 Handling Connection Events

```js
// Monitor connection state throughout the app lifecycle
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose disconnected from DB");
});

// Gracefully close connection when app terminates
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed on app termination");
  process.exit(0);
});
```

### 3.4 Defining a Schema and Model

```js
// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Exclude from query results by default
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const User = mongoose.model("User", userSchema);

export default User;
```

### 3.5 CRUD Operations

```js
// routes/users.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

// CREATE — POST /users
router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    // Handle duplicate key error (e.g. duplicate email)
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

// READ ALL — GET /users
router.get("/", async (req, res) => {
  try {
    // Exclude password field, sort by newest first
    const users = await User.find({ isActive: true })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE — GET /users/:id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE — PUT /users/:id
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,           // Return the updated document
        runValidators: true, // Run schema validators on update
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE — DELETE /users/:id
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

### 3.6 Mongoose Query Helpers

```js
// Filtering
User.find({ role: "admin", isActive: true });

// Pagination
const page  = parseInt(req.query.page)  || 1;
const limit = parseInt(req.query.limit) || 10;
const skip  = (page - 1) * limit;

User.find().skip(skip).limit(limit);

// Populate (join-like behaviour across collections)
const Post = mongoose.model("Post", new mongoose.Schema({
  title:  String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}));

Post.findById(id).populate("author", "name email");

// Aggregation
User.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: "$role", count: { $sum: 1 } } },
]);
```

---

## 4. PostgreSQL with node-postgres (pg)

PostgreSQL is a powerful relational database. The `pg` package provides a low-level driver with connection pool support.

### 4.1 Installation

```bash
npm install pg
```

### 4.2 Connection Pool Setup

```js
// db/postgres.js
import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

// A pool manages multiple connections efficiently
const pool = new Pool({
  host:     process.env.PG_HOST,
  port:     process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user:     process.env.PG_USER,
  password: process.env.PG_PASSWORD,

  // Pool configuration
  max:                10,    // Maximum number of connections in the pool
  idleTimeoutMillis:  30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Fail if a connection takes > 2 seconds
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("PostgreSQL connection error:", err.message);
    process.exit(1);
  }
  console.log("PostgreSQL connected successfully");
  release(); // Return the client to the pool
});

// Gracefully close pool on app exit
process.on("SIGINT", async () => {
  await pool.end();
  console.log("PostgreSQL pool closed");
  process.exit(0);
});

export default pool;
```

### 4.3 Creating Tables

```js
// db/migrate.js — Run once to set up the schema
import pool from "./postgres.js";

const createTables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(100)        NOT NULL,
      email      VARCHAR(150) UNIQUE NOT NULL,
      password   TEXT                NOT NULL,
      role       VARCHAR(20)         DEFAULT 'user',
      created_at TIMESTAMPTZ         DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS posts (
      id         SERIAL PRIMARY KEY,
      title      VARCHAR(200) NOT NULL,
      body       TEXT         NOT NULL,
      user_id    INT REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await pool.query(query);
  console.log("Tables created successfully");
};

createTables().catch(console.error);
```

### 4.4 CRUD Operations

```js
// routes/users.js
import express from "express";
import pool from "../db/postgres.js";

const router = express.Router();

// CREATE — POST /users
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Parameterized queries ($1, $2 ...) prevent SQL injection
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role, created_at`,
      [name, email, password]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    // PostgreSQL unique violation error code
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// READ ALL — GET /users
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE — GET /users/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE — PUT /users/:id
router.put("/:id", async (req, res) => {
  const { name, email } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2
       WHERE id = $3
       RETURNING id, name, email, role, created_at`,
      [name, email, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — DELETE /users/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

### 4.5 Transactions in PostgreSQL

Use transactions when multiple queries must all succeed or all fail together.

```js
router.post("/transfer", async (req, res) => {
  const { fromId, toId, amount } = req.body;

  // Grab a dedicated client from the pool for the transaction
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "UPDATE accounts SET balance = balance - $1 WHERE id = $2",
      [amount, fromId]
    );

    await client.query(
      "UPDATE accounts SET balance = balance + $1 WHERE id = $2",
      [amount, toId]
    );

    await client.query("COMMIT");

    res.json({ success: true, message: "Transfer complete" });
  } catch (err) {
    // Roll back all changes if anything fails
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    // Always release the client back to the pool
    client.release();
  }
});
```

---

## 5. MySQL with mysql2

`mysql2` is the modern, promise-based MySQL driver with prepared statement support.

### 5.1 Installation

```bash
npm install mysql2
```

### 5.2 Connection Pool Setup

```js
// db/mysql.js
import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  host:     process.env.MYSQL_HOST,
  port:     process.env.MYSQL_PORT,
  database: process.env.MYSQL_DATABASE,
  user:     process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,

  // Pool settings
  waitForConnections: true,  // Queue requests when pool is full
  connectionLimit:    10,    // Max simultaneous connections
  queueLimit:         0,     // 0 = unlimited queue size
});

// Test connection
const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log("MySQL connected successfully");
    conn.release(); // Return to pool immediately
  } catch (err) {
    console.error("MySQL connection error:", err.message);
    process.exit(1);
  }
};

testConnection();

export default pool;
```

### 5.3 CRUD Operations

```js
// routes/products.js
import express from "express";
import pool from "../db/mysql.js";

const router = express.Router();

// CREATE — POST /products
router.post("/", async (req, res) => {
  const { name, price, stock } = req.body;

  try {
    // mysql2 uses ? as placeholders (positional)
    const [result] = await pool.execute(
      "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
      [name, price, stock]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, name, price, stock },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ALL — GET /products
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM products ORDER BY id DESC"
    );

    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE — GET /products/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM products WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE — PUT /products/:id
router.put("/:id", async (req, res) => {
  const { name, price, stock } = req.body;

  try {
    const [result] = await pool.execute(
      "UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?",
      [name, price, stock, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ success: true, message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — DELETE /products/:id
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM products WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

### 5.4 MySQL Transactions

```js
router.post("/order", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Deduct stock
    await conn.execute(
      "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
      [quantity, productId, quantity]
    );

    // Create the order record
    const [order] = await conn.execute(
      "INSERT INTO orders (user_id, product_id, quantity) VALUES (?, ?, ?)",
      [userId, productId, quantity]
    );

    await conn.commit();

    res.status(201).json({ success: true, orderId: order.insertId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});
```

---

## 6. SQLite with better-sqlite3

SQLite is a file-based, serverless database — ideal for development, prototyping, or lightweight production apps.

### 6.1 Installation

```bash
npm install better-sqlite3
```

### 6.2 Connection Setup

```js
// db/sqlite.js
import Database from "better-sqlite3";
import path from "path";

// Opens the file, creates it if it doesn't exist
const db = new Database(process.env.SQLITE_PATH || "./database.sqlite", {
  verbose: console.log, // Log every SQL query (remove in production)
});

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Create tables on startup
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    UNIQUE NOT NULL,
    password   TEXT    NOT NULL,
    created_at TEXT    DEFAULT (datetime('now'))
  )
`);

console.log("SQLite connected and tables ready");

export default db;
```

### 6.3 CRUD Operations

`better-sqlite3` is **synchronous** — no async/await needed.

```js
// routes/users.js
import express from "express";
import db from "../db/sqlite.js";

const router = express.Router();

// CREATE — POST /users
router.post("/", (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Prepared statements are compiled once and reused
    const stmt = db.prepare(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
    );
    const result = stmt.run(name, email, password);

    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// READ ALL — GET /users
router.get("/", (req, res) => {
  const users = db.prepare(
    "SELECT id, name, email, created_at FROM users"
  ).all(); // .all() returns every row as an array

  res.json({ success: true, data: users });
});

// READ ONE — GET /users/:id
router.get("/:id", (req, res) => {
  const user = db.prepare(
    "SELECT id, name, email, created_at FROM users WHERE id = ?"
  ).get(req.params.id); // .get() returns first matching row or undefined

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ success: true, data: user });
});

// UPDATE — PUT /users/:id
router.put("/:id", (req, res) => {
  const { name, email } = req.body;

  const result = db.prepare(
    "UPDATE users SET name = ?, email = ? WHERE id = ?"
  ).run(name, email, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ success: true, message: "User updated" });
});

// DELETE — DELETE /users/:id
router.delete("/:id", (req, res) => {
  const result = db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ success: true, message: "User deleted" });
});

export default router;
```

---

## 7. Using Sequelize ORM

Sequelize is a mature ORM supporting PostgreSQL, MySQL, SQLite, and MSSQL. It abstracts away raw SQL with model-based queries.

### 7.1 Installation

```bash
# For PostgreSQL
npm install sequelize pg pg-hstore

# For MySQL
npm install sequelize mysql2

# For SQLite
npm install sequelize better-sqlite3
```

### 7.2 Connection Setup

```js
// db/sequelize.js
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host:    process.env.PG_HOST,
    dialect: "postgres",          // 'mysql' | 'sqlite' | 'mssql'
    logging: false,               // Set to console.log to see raw SQL

    pool: {
      max:     10,
      min:     0,
      acquire: 30000, // Max time (ms) to wait for a connection
      idle:    10000, // Time (ms) before releasing an idle connection
    },
  }
);

// Test the connection
try {
  await sequelize.authenticate();
  console.log("Sequelize connected to database");
} catch (err) {
  console.error("Sequelize connection failed:", err.message);
  process.exit(1);
}

export default sequelize;
```

### 7.3 Defining Models

```js
// models/User.js
import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    name: {
      type:      DataTypes.STRING(100),
      allowNull: false,
      validate:  { len: [2, 100] },
    },
    email: {
      type:      DataTypes.STRING(150),
      allowNull: false,
      unique:    true,
      validate:  { isEmail: true },
    },
    password: {
      type:      DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type:         DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
  },
  {
    tableName:  "users",
    timestamps: true,              // Adds createdAt and updatedAt
    underscored: true,             // Use snake_case column names
  }
);

export default User;
```

### 7.4 Associations

```js
// models/Post.js
import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";
import User from "./User.js";

const Post = sequelize.define("Post", {
  title: { type: DataTypes.STRING, allowNull: false },
  body:  { type: DataTypes.TEXT,   allowNull: false },
});

// Define associations
User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "userId" });

export default Post;
```

### 7.5 Syncing Models & CRUD

```js
// Sync all models with the database (alter: true updates existing tables safely)
await sequelize.sync({ alter: true });

// CREATE
const user = await User.create({ name: "Alice", email: "alice@example.com", password: "hashed" });

// READ ALL
const users = await User.findAll({
  attributes: { exclude: ["password"] },
  order: [["createdAt", "DESC"]],
});

// READ WITH INCLUDE (JOIN)
const posts = await Post.findAll({
  include: [{ model: User, attributes: ["name", "email"] }],
});

// READ ONE
const user = await User.findByPk(req.params.id);

// UPDATE
await User.update({ name: "Bob" }, { where: { id: 1 } });

// DELETE
await User.destroy({ where: { id: 1 } });
```

---

## 8. Using Prisma ORM

Prisma is a modern, type-safe ORM with auto-generated queries and a powerful schema system.

### 8.1 Installation

```bash
npm install prisma @prisma/client
npx prisma init
```

### 8.2 Define the Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"    // "mysql" | "sqlite" | "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  body      String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
}

enum Role {
  USER
  ADMIN
}
```

Run migration to apply the schema:

```bash
npx prisma migrate dev --name init
```

### 8.3 Prisma Client Setup

```js
// db/prisma.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"], // Log levels (remove 'query' in production)
});

export default prisma;
```

### 8.4 CRUD with Prisma

```js
import prisma from "../db/prisma.js";

// CREATE
const user = await prisma.user.create({
  data: { name: "Alice", email: "alice@example.com", password: "hashed" },
});

// READ ALL
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true, role: true },
  orderBy: { createdAt: "desc" },
});

// READ ONE
const user = await prisma.user.findUnique({
  where:   { id: Number(req.params.id) },
  include: { posts: true }, // Include related records
});

// UPDATE
const updated = await prisma.user.update({
  where: { id: 1 },
  data:  { name: "Bob" },
});

// DELETE
await prisma.user.delete({ where: { id: 1 } });
```

---

## 9. Database Error Handling

### 9.1 Centralized Error Handler

```js
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({ error: "Duplicate field value" });
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  // PostgreSQL unique violation
  if (err.code === "23505") {
    return res.status(400).json({ error: "Duplicate value" });
  }

  // PostgreSQL foreign key violation
  if (err.code === "23503") {
    return res.status(400).json({ error: "Referenced record does not exist" });
  }

  res.status(500).json({ error: "Internal server error" });
};

export default errorHandler;
```

Register it **after all routes** in `app.js`:

```js
import errorHandler from "./middleware/errorHandler.js";

// All routes above...
app.use(errorHandler);
```

---

## 10. Connection Pooling

A connection pool maintains a set of reusable database connections, avoiding the overhead of opening a new connection for every request.

```
Client Request
      │
      ▼
┌─────────────────────────┐
│     Connection Pool     │
│  ┌───┐ ┌───┐ ┌───┐     │
│  │ C1│ │ C2│ │ C3│ ... │  ← Idle connections waiting
│  └───┘ └───┘ └───┘     │
└─────────────────────────┘
      │
      ▼
   Database
```

### Recommended Pool Sizes

| Environment  | `max` Connections |
|--------------|-------------------|
| Development  | 2–5               |
| Staging      | 5–10              |
| Production   | 10–25             |

> **Rule of thumb:** Start with `max = (number of CPU cores) * 2 + 1` and tune from there.

---

## 11. Structuring Your Project

A clean folder structure for a database-backed Express app:

```
my-app/
├── db/
│   ├── mongo.js         # MongoDB connection
│   ├── postgres.js      # PostgreSQL pool
│   ├── mysql.js         # MySQL pool
│   └── prisma.js        # Prisma client
│
├── models/
│   ├── User.js          # Mongoose / Sequelize model
│   └── Post.js
│
├── routes/
│   ├── users.js         # Route handlers
│   └── posts.js
│
├── middleware/
│   ├── errorHandler.js  # Centralized error handling
│   └── auth.js          # Authentication guard
│
├── prisma/
│   └── schema.prisma    # Prisma schema file
│
├── .env                 # Environment variables (git-ignored)
├── .gitignore
├── app.js               # Express app setup
└── server.js            # Entry point (starts the server)
```

### app.js

```js
import express from "express";
import "dotenv/config";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.use(errorHandler); // Must be last

export default app;
```

### server.js

```js
import app from "./app.js";
import connectMongo from "./db/mongo.js";

const PORT = process.env.PORT || 3000;

await connectMongo();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## 12. Quick Comparison

| Feature              | MongoDB + Mongoose | PostgreSQL + pg | MySQL + mysql2 | SQLite          | Sequelize      | Prisma         |
|----------------------|--------------------|-----------------|----------------|-----------------|----------------|----------------|
| **Type**             | NoSQL (Document)   | Relational      | Relational     | Relational      | ORM            | ORM            |
| **Schema**           | Flexible           | Strict          | Strict         | Strict          | JS Models      | Schema file    |
| **Best For**         | Flexible data      | Complex queries | Wide support   | Dev / local     | Multi-DB apps  | Type-safe apps |
| **Async Style**      | async/await        | async/await     | async/await    | Synchronous     | async/await    | async/await    |
| **Joins**            | `populate()`       | SQL JOIN        | SQL JOIN       | SQL JOIN        | `include`      | `include`      |
| **Migrations**       | Manual             | Manual SQL      | Manual SQL     | Manual SQL      | Built-in       | Built-in CLI   |
| **TypeScript**       | Types available    | Types available | Types available| Types available | Good support   | Excellent      |
| **Production Ready** | ✅                 | ✅              | ✅             | ⚠️ Light use   | ✅             | ✅             |

---

### Common PostgreSQL Error Codes

| Code    | Meaning                    |
|---------|----------------------------|
| `23505` | Unique constraint violation|
| `23503` | Foreign key violation      |
| `23502` | Not null violation         |
| `42P01` | Table does not exist       |
| `08006` | Connection failure         |

---

*Always use parameterized queries (`$1`, `?`, or Prisma's typed methods) — never concatenate user input directly into SQL strings.*