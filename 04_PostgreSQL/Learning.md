# DBMS and SQL — Beginner to Advanced

---

## Table of Contents

1. [What is a Database?](#1-what-is-a-database)
2. [Database vs DBMS](#2-database-vs-dbms)
3. [What is RDBMS?](#3-what-is-rdbms)
4. [SQL vs PostgreSQL](#4-sql-vs-postgresql)
5. [Database vs Schema vs Tables](#5-database-vs-schema-vs-tables)
6. [Database — Create, DROP, List & Switch](#6-database--create-drop-list--switch)
7. [What is CRUD?](#7-what-is-crud)
8. [Data Types](#8-data-types)
9. [Constraints](#9-constraints)
10. [RDBMS Core Concepts](#10-rdbms-core-concepts)
11. [Relationships and Their Types](#11-relationships-and-their-types)
12. [SQL Command Categories](#12-sql-command-categories)
13. [DDL — Creating & Modifying Structure](#13-ddl--creating--modifying-structure)
14. [DML — Manipulating Data](#14-dml--manipulating-data)
15. [Clauses](#15-clauses)
16. [Relational Operators](#16-relational-operators)
17. [Logical Operators](#17-logical-operators)
18. [Aggregate Functions](#18-aggregate-functions)
19. [GROUP BY and HAVING](#19-group-by-and-having)
20. [String Functions](#20-string-functions)
21. [Numeric Functions](#21-numeric-functions)
22. [Date Functions](#22-date-functions)
23. [Conditional Expressions — CASE](#23-conditional-expressions--case)
24. [Foreign Keys](#24-foreign-keys)
25. [JOINS and Their Types](#25-joins-and-their-types)
26. [Subqueries](#26-subqueries)
27. [Views](#27-views)
28. [Window Functions](#28-window-functions)
29. [CTEs — Common Table Expressions](#29-ctes--common-table-expressions)
30. [Indexes](#30-indexes)
31. [Transactions](#31-transactions)
32. [Stored Procedures](#32-stored-procedures)
33. [Triggers](#33-triggers)
34. [ACID Properties](#34-acid-properties)
35. [Normalization](#35-normalization)
36. [Query Optimization](#36-query-optimization)
37. [Common Patterns](#37-common-patterns)
38. [Quick Reference](#38-quick-reference)
39. [Summary](#39-summary)

---

## 1. What is a Database?

```
A database is an organized collection of structured data
stored electronically and accessed via a computer system.

Think of it as a digital filing cabinet where data is
stored in a structured, organized way so it can be
easily retrieved, updated, and managed.

Real-world examples:
  → User accounts on a website
  → Products listed in an online store
  → Orders placed by customers
  → Bank transactions and balances
  → Hospital patient records
  → Employee payroll information
```

### Why Do We Need Databases?

```
Without a database:            With a database:
  → Data stored in files         → Data stored centrally
  → Hard to search               → Fast querying with SQL
  → No access control            → Role-based permissions
  → Duplicate data               → No redundancy (normalization)
  → Can't handle multiple users  → Concurrent multi-user access
  → No crash recovery            → ACID-compliant transactions
```

---

## 2. Database vs DBMS

```
┌──────────────────────────────────────────────────────────┐
│                    DATABASE                              │
│                                                          │
│  The actual collection of data — the raw information    │
│  stored on disk (tables, rows, columns, files).         │
│                                                          │
│  Example: the "myapp" database containing users,        │
│  orders, products tables and all their data.            │
└──────────────────────────────────────────────────────────┘
                          ▲
                          │  managed by
                          │
┌──────────────────────────────────────────────────────────┐
│                      DBMS                                │
│            (Database Management System)                  │
│                                                          │
│  The software layer that sits between the user and the  │
│  database. It handles storage, retrieval, security,     │
│  concurrency, and integrity.                            │
│                                                          │
│  Examples: PostgreSQL, MySQL, SQLite, Oracle            │
└──────────────────────────────────────────────────────────┘
```

### Key Differences

| Feature              | Database                          | DBMS                                      |
|----------------------|-----------------------------------|-------------------------------------------|
| What it is           | Collection of data                | Software to manage that data              |
| Analogy              | The filing cabinet                | The office manager who runs the cabinet   |
| Stores               | Tables, rows, columns             | Query engine, storage engine, auth system |
| Can it run queries?  | No — it is just data              | Yes — it processes SQL queries            |
| Examples             | `myapp` database, `shop` database | PostgreSQL, MySQL, Oracle, SQLite         |

```
User / Application
       │
       │ sends SQL query
       ▼
    [ DBMS ]          ← interprets queries, enforces rules
       │
       │ reads/writes
       ▼
  [ Database ]        ← the actual stored data on disk
```

### What a DBMS Provides

```
✅ Create and manage databases and tables
✅ Store and retrieve data efficiently
✅ Control access with users and permissions
✅ Ensure data integrity with constraints
✅ Handle concurrent access by multiple users
✅ Backup, recovery, and crash protection
✅ Transaction management (ACID)
```

---

## 3. What is RDBMS?

```
RDBMS = Relational Database Management System

A DBMS where data is stored in TABLES (rows and columns)
and tables can be RELATED to each other using keys.

"Relational" comes from the mathematical concept of
"relations" (tables), defined by Edgar F. Codd in 1970.
```

### DBMS vs RDBMS

| Feature              | DBMS                          | RDBMS                              |
|----------------------|-------------------------------|------------------------------------|
| Data storage         | Files, hierarchical, network  | Tables (rows and columns)          |
| Relationships        | Not natively supported        | Tables linked via foreign keys     |
| Query language       | Custom / proprietary          | SQL (Structured Query Language)    |
| Normalization        | Not required                  | Encouraged / enforced              |
| ACID compliance      | Partial or none               | Full ACID support                  |
| Examples             | XML stores, old file DBs      | PostgreSQL, MySQL, Oracle, SQLite  |

### How an RDBMS Organises Data

```
RDBMS
├── Database: myapp
│   ├── Table: users
│   │   ├── Row 1: (1, 'Arjun',  'arjun@email.com')
│   │   ├── Row 2: (2, 'Kerala', 'kerala@email.com')
│   │   └── Row 3: (3, 'Node',   'node@email.com')
│   │
│   ├── Table: posts
│   │   ├── Row 1: (1, 1, 'First Post')
│   │   └── Row 2: (2, 1, 'Second Post')
│   │
│   └── Table: orders
│       └── ...
│
└── Database: shop
    └── ...
```

### Popular RDBMS Systems

```
PostgreSQL   → powerful, open-source, feature-rich, best for production
MySQL        → most popular open-source, widely used in web apps
SQLite       → lightweight, file-based, no server needed (dev/mobile)
SQL Server   → Microsoft's enterprise RDBMS
Oracle DB    → enterprise-grade, very feature-rich, paid
MariaDB      → MySQL-compatible fork, fully open-source
```

---

## 4. SQL vs PostgreSQL

```
┌──────────────────────────────────────────────────────────┐
│                        SQL                               │
│                                                          │
│  A LANGUAGE — not a database.                           │
│  Structured Query Language.                             │
│  Used to communicate with any relational database.      │
│  Standardized by ANSI/ISO.                              │
│                                                          │
│  SELECT * FROM users WHERE id = 1;                      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                     PostgreSQL                           │
│                                                          │
│  A DATABASE SYSTEM — not a language.                    │
│  An open-source RDBMS that USES SQL.                    │
│  Has its own extensions on top of standard SQL.         │
│  Often called "Postgres" or "psql".                     │
└──────────────────────────────────────────────────────────┘
```

### Key Differences

| Feature               | SQL                               | PostgreSQL                           |
|-----------------------|-----------------------------------|--------------------------------------|
| What it is            | A language (standard)             | A database system (software)         |
| Who defines it        | ANSI / ISO standards body         | PostgreSQL Global Development Group  |
| Can it run alone?     | No — needs a DBMS to run          | Yes — it is the DBMS                 |
| Portability           | Works across all RDBMS (mostly)   | Has Postgres-specific extensions     |
| Extra features        | Standard syntax only              | JSONB, arrays, full-text search, CTEs, UUID, extensions |

### SQL Standard vs PostgreSQL Extensions

```sql
-- Standard SQL (works everywhere)
SELECT * FROM users WHERE id = 1;
INSERT INTO users (name, email) VALUES ('Arjun', 'a@email.com');

-- PostgreSQL-specific extensions
SELECT * FROM users WHERE data @> '{"role": "admin"}';  -- JSONB query
SELECT gen_random_uuid();                                -- UUID generation
SELECT * FROM users WHERE name ILIKE '%arjun%';         -- case-insensitive LIKE
SELECT ARRAY[1, 2, 3];                                  -- native array type
SELECT NOW()::DATE;                                     -- casting with ::
```

### Other RDBMS and their SQL dialects

```
PostgreSQL   → standard SQL + rich extensions
MySQL        → standard SQL + MySQL-specific (e.g. LIMIT syntax, AUTO_INCREMENT)
SQLite       → limited SQL subset (no stored procedures, limited ALTER)
SQL Server   → T-SQL (Transact-SQL) — Microsoft's dialect
Oracle       → PL/SQL — Oracle's dialect
```

---

## 5. Database vs Schema vs Tables

These three are often confused. They are nested containers:

```
Server (PostgreSQL instance)
└── Database  (myapp)
    └── Schema  (public)
        └── Tables  (users, posts, orders)
            └── Rows  (individual records)
                └── Columns  (individual fields)
```

### Database

```
The top-level container. Holds everything for one application.
Each database is isolated — you can't JOIN across databases easily.

Examples:
  myapp_db        ← production database
  myapp_test_db   ← test database
  shop_db         ← another application's database
```

### Schema

```
A namespace INSIDE a database that groups related tables.
One database can have many schemas.

Default schema in PostgreSQL: "public"
You can create separate schemas for organisation:

  myapp_db
  ├── schema: public       ← default, general tables
  ├── schema: auth         ← users, sessions, tokens
  ├── schema: payments     ← orders, invoices, transactions
  └── schema: analytics    ← reports, events, metrics
```

### Table

```
The actual data structure inside a schema.
Consists of columns (structure) and rows (data).

  public.users            ← schema.table notation
  auth.sessions
  payments.orders
```

### Practical Comparison

| Concept   | Analogy              | Contains        | Example                    |
|-----------|----------------------|-----------------|----------------------------|
| Database  | A building           | Schemas         | `myapp`                    |
| Schema    | A floor in building  | Tables          | `public`, `auth`           |
| Table     | A room on that floor | Rows + Columns  | `users`, `orders`          |
| Row       | A file in the room   | Column values   | `(1, 'Arjun', 'a@e.com')`  |
| Column    | A field on the file  | Data type + val | `name VARCHAR(100)`        |

```sql
-- PostgreSQL: create and use schemas
CREATE SCHEMA auth;
CREATE TABLE auth.sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    INT  NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Access tables with schema notation
SELECT * FROM auth.sessions;
SELECT * FROM public.users;

-- Set default schema for session
SET search_path TO auth, public;
```

---

## 6. Database — Create, DROP, List & Switch

### PostgreSQL

```sql
-- Create a database
CREATE DATABASE myapp;
CREATE DATABASE myapp_test;

-- Create with specific settings
CREATE DATABASE myapp
  ENCODING    'UTF8'
  LC_COLLATE  'en_US.UTF-8'
  LC_CTYPE    'en_US.UTF-8';

-- List all databases
\l                    -- in psql terminal
\list                 -- same as \l

-- Also via SQL:
SELECT datname FROM pg_database;

-- Switch / connect to a database
\c myapp              -- in psql terminal
\connect myapp        -- same as \c

-- Drop a database (PERMANENT — all data deleted)
DROP DATABASE myapp;
DROP DATABASE IF EXISTS myapp;   -- no error if it doesn't exist

-- You cannot drop a database you are currently connected to
-- Switch to another DB first, then drop
\c postgres
DROP DATABASE myapp;
```

### MySQL

```sql
-- Create
CREATE DATABASE myapp;
CREATE DATABASE IF NOT EXISTS myapp;

-- List all databases
SHOW DATABASES;

-- Switch / use
USE myapp;

-- Drop
DROP DATABASE myapp;
DROP DATABASE IF EXISTS myapp;

-- Show current database
SELECT DATABASE();
```

### Schema Operations (PostgreSQL)

```sql
-- Create schema
CREATE SCHEMA auth;
CREATE SCHEMA IF NOT EXISTS payments;

-- List all schemas
\dn                               -- in psql terminal
SELECT schema_name FROM information_schema.schemata;

-- Drop schema
DROP SCHEMA auth;
DROP SCHEMA auth CASCADE;         -- also drop all tables inside it

-- Show current schema
SELECT current_schema();

-- List tables in a specific schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- In psql: list tables in current schema
\dt
\dt auth.*      -- tables in auth schema
```

---

## 7. What is CRUD?

```
CRUD = the four fundamental operations on any database

C → CREATE   — add new data        → INSERT
R → READ     — retrieve data       → SELECT
U → UPDATE   — modify existing data→ UPDATE
D → DELETE   — remove data         → DELETE
```

### CRUD in SQL

```sql
-- CREATE — add new records
INSERT INTO users (name, email, age)
VALUES ('Arjun', 'arjun@email.com', 25);

-- READ — retrieve records
SELECT * FROM users;
SELECT id, name FROM users WHERE id = 1;

-- UPDATE — modify records
UPDATE users
SET name = 'Arjun Updated', age = 26
WHERE id = 1;

-- DELETE — remove records
DELETE FROM users WHERE id = 1;
```

### CRUD in a REST API context

```
HTTP Method → SQL Operation → Description
──────────────────────────────────────────────────────
POST        → INSERT        → Create a new user
GET         → SELECT        → Read user(s)
PUT / PATCH → UPDATE        → Update user info
DELETE      → DELETE        → Delete a user
```

---

## 8. Data Types

Data types define what kind of data a column can hold.

### Numeric Types

```sql
INT           -- integer          (-2,147,483,648 to 2,147,483,647)
BIGINT        -- large integer    (very large numbers, use for IDs in big apps)
SMALLINT      -- small integer    (-32,768 to 32,767)
SERIAL        -- auto-incrementing INT (PostgreSQL)
BIGSERIAL     -- auto-incrementing BIGINT (PostgreSQL)
DECIMAL(p,s)  -- exact decimal    (p = total digits, s = decimal places)
              -- e.g. DECIMAL(10,2) = 12345678.90
NUMERIC(p,s)  -- same as DECIMAL (preferred in PostgreSQL)
FLOAT         -- floating point   (approximate, use for scientific values)
DOUBLE        -- double precision
REAL          -- 4-byte floating point (PostgreSQL)

-- Examples:
price       DECIMAL(10, 2)   -- e.g. 9999999.99
age         INT
salary      NUMERIC(12, 2)
rating      FLOAT
```

### String / Text Types

```sql
VARCHAR(n)    -- variable-length string (up to n characters) — most common
CHAR(n)       -- fixed-length string (always n characters, padded with spaces)
TEXT          -- unlimited length text (no size limit)
TINYTEXT      -- up to 255 characters (MySQL)
MEDIUMTEXT    -- up to 16MB (MySQL)
LONGTEXT      -- up to 4GB (MySQL)

-- When to use:
name        VARCHAR(100)     -- names vary in length
country_code CHAR(2)         -- always exactly 2 chars: 'IN', 'US'
bio         TEXT             -- long, variable content
description VARCHAR(500)
```

### Date and Time Types

```sql
DATE          -- YYYY-MM-DD                          e.g. 2024-01-15
TIME          -- HH:MM:SS                            e.g. 10:30:00
DATETIME      -- YYYY-MM-DD HH:MM:SS                (MySQL)
TIMESTAMP     -- YYYY-MM-DD HH:MM:SS                (stores in UTC, auto-updates)
TIMESTAMPTZ   -- TIMESTAMP WITH TIME ZONE           (PostgreSQL, recommended)
INTERVAL      -- duration                           e.g. '2 hours', '3 days'
YEAR          -- YYYY (MySQL only)

-- Examples:
birthdate     DATE
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
duration      INTERVAL
```

### Boolean Type

```sql
BOOLEAN       -- TRUE or FALSE
              -- PostgreSQL: stores as true/false
              -- MySQL: stored as TINYINT(1) — 1 or 0

is_active     BOOLEAN DEFAULT TRUE
is_verified   BOOLEAN DEFAULT FALSE
```

### Other Types

```sql
-- PostgreSQL specific
UUID          -- universally unique identifier
              -- e.g. 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
JSONB         -- binary JSON (indexable, preferred over JSON)
JSON          -- plain JSON text
ARRAY         -- native array e.g. INT[], TEXT[]
ENUM          -- one value from a defined list

-- Examples:
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
metadata      JSONB
tags          TEXT[]
status        VARCHAR(20) CHECK (status IN ('active', 'inactive', 'banned'))

-- MySQL ENUM
status        ENUM('active', 'inactive', 'banned') DEFAULT 'active'
```

### Choosing the Right Type

```
Need                        Use
───────────────────────────────────────────────────
Whole numbers               INT or BIGINT
Money / prices              DECIMAL(10,2) or NUMERIC
Names, titles               VARCHAR(100–255)
Long text, descriptions     TEXT
Dates only                  DATE
Date + time                 TIMESTAMPTZ (PostgreSQL) / DATETIME (MySQL)
True/False flags             BOOLEAN
Unique IDs                  UUID (PostgreSQL) or BIGINT AUTO_INCREMENT
Fixed-size codes            CHAR(2) for country codes, CHAR(6) for OTP
```

---

## 9. Constraints

Constraints enforce rules on the data in a table — they prevent invalid data from being inserted.

### NOT NULL

```sql
-- Column must always have a value — cannot be empty
CREATE TABLE users (
  id    INT          PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,     -- name is required
  email VARCHAR(255) NOT NULL      -- email is required
);

-- Trying to insert without name will fail:
INSERT INTO users (id, email) VALUES (1, 'a@e.com');
-- ERROR: null value in column "name" violates not-null constraint
```

### PRIMARY KEY

```sql
-- Uniquely identifies each row
-- Automatically: NOT NULL + UNIQUE
-- Each table should have exactly one PRIMARY KEY

-- Integer primary key (auto-increment)
CREATE TABLE users (
  id   SERIAL       PRIMARY KEY,   -- PostgreSQL
  name VARCHAR(100) NOT NULL
);

-- MySQL auto-increment
CREATE TABLE users (
  id   INT          PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL
);

-- UUID primary key (PostgreSQL)
CREATE TABLE users (
  id   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL
);

-- Composite primary key (two columns together form the unique key)
CREATE TABLE order_items (
  order_id   INT,
  product_id INT,
  quantity   INT DEFAULT 1,
  PRIMARY KEY (order_id, product_id)  -- combination must be unique
);
```

### UNIQUE

```sql
-- Values in this column must be unique across all rows
-- Unlike PRIMARY KEY: can be NULL (one NULL allowed)
-- A table can have multiple UNIQUE constraints

CREATE TABLE users (
  id       SERIAL       PRIMARY KEY,
  email    VARCHAR(255) NOT NULL UNIQUE,  -- no two users same email
  username VARCHAR(50)  UNIQUE            -- no two users same username
);

-- Named unique constraint
CREATE TABLE users (
  id    SERIAL       PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  CONSTRAINT unique_email UNIQUE (email)
);

-- Composite unique constraint
CREATE TABLE enrollments (
  user_id   INT,
  course_id INT,
  UNIQUE (user_id, course_id)   -- one user can't enroll in same course twice
);
```

### CHECK

```sql
-- Validates data against a condition before inserting/updating
-- Row is rejected if CHECK returns FALSE

CREATE TABLE users (
  id    SERIAL       PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  age   INT          CHECK (age >= 0 AND age <= 120),
  email VARCHAR(255) CHECK (email LIKE '%@%')
);

CREATE TABLE products (
  id       SERIAL        PRIMARY KEY,
  name     VARCHAR(100)  NOT NULL,
  price    DECIMAL(10,2) CHECK (price >= 0),           -- price can't be negative
  discount DECIMAL(5,2)  CHECK (discount BETWEEN 0 AND 100)
);

-- Named CHECK constraint
CREATE TABLE orders (
  id     SERIAL      PRIMARY KEY,
  status VARCHAR(20) NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'delivered'))
);

-- Add CHECK constraint to existing table
ALTER TABLE users ADD CONSTRAINT check_age CHECK (age >= 0);
```

### DEFAULT

```sql
-- Provides a default value when no value is specified on INSERT

CREATE TABLE users (
  id         SERIAL       PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  role       VARCHAR(50)  DEFAULT 'user',         -- default role is 'user'
  is_active  BOOLEAN      DEFAULT TRUE,            -- active by default
  created_at TIMESTAMPTZ  DEFAULT NOW(),           -- auto-set to current time
  score      INT          DEFAULT 0
);

-- INSERT without specifying role, is_active, created_at:
INSERT INTO users (name) VALUES ('Arjun');
-- → role='user', is_active=TRUE, created_at=<now>
```

### Constraints Summary Table

| Constraint    | Purpose                              | NULL allowed? | Multiple per table? |
|---------------|--------------------------------------|---------------|---------------------|
| `PRIMARY KEY` | Unique row identifier                | ❌ No         | Only 1              |
| `NOT NULL`    | Column must have a value             | ❌ No         | ✅ Yes              |
| `UNIQUE`      | No duplicate values                  | ✅ Yes (1)    | ✅ Yes              |
| `CHECK`       | Value must satisfy a condition       | ✅ Yes        | ✅ Yes              |
| `DEFAULT`     | Fallback value when none provided    | ✅ Yes        | ✅ Yes              |
| `FOREIGN KEY` | Links to another table's primary key | ✅ Yes        | ✅ Yes              |

---

## 10. RDBMS Core Concepts

### Tables, Rows, Columns

```
Table = users

┌────┬───────────┬─────────────────────┬─────┬────────┐
│ id │   name    │        email        │ age │  role  │
├────┼───────────┼─────────────────────┼─────┼────────┤
│  1 │ Arjun     │ arjun@email.com     │  25 │ admin  │
│  2 │ Kerala    │ kerala@email.com    │  30 │ user   │
│  3 │ Node      │ node@email.com      │  28 │ user   │
└────┴───────────┴─────────────────────┴─────┴────────┘

Table   = entity being stored (a "thing")
Row     = one record (one user)
Column  = one attribute of that entity
```

### Keys

```
Primary Key (PK):
  → Uniquely identifies each row
  → Cannot be NULL
  → Each table should have one
  → Usually SERIAL / AUTO_INCREMENT integer or UUID

Foreign Key (FK):
  → Links one table to another
  → References the Primary Key of another table
  → Enforces referential integrity

Unique Key:
  → Values must be unique in the column
  → Can be NULL (unlike PK)
  → A table can have multiple unique keys

Composite Key:
  → Primary key made of TWO or more columns
  → Used when no single column uniquely identifies a row

Candidate Key:
  → Any column (or set) that COULD be the primary key
  → One is chosen as the PK, others are alternate keys

Super Key:
  → Any set of columns that can uniquely identify a row
  → Superset of candidate keys
```

---

## 11. Relationships and Their Types

A **relationship** defines how data in one table connects to data in another.

### One-to-One (1:1)

```
One record in Table A corresponds to exactly one record in Table B.

Example: one user has one profile

users          profiles
──────         ────────────────
id  ◄──────── user_id (FK, UNIQUE)
name           bio
email          avatar_url

Real-world examples:
  → User ↔ Passport
  → Employee ↔ Company laptop
  → Person ↔ National ID
```

```sql
CREATE TABLE users (
  id   SERIAL       PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE profiles (
  id         SERIAL  PRIMARY KEY,
  user_id    INT     UNIQUE NOT NULL,   -- UNIQUE enforces 1:1
  bio        TEXT,
  avatar_url VARCHAR(500),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### One-to-Many (1:N)

```
One record in Table A corresponds to MANY records in Table B.
The most common relationship type.

Example: one user has many posts

users          posts
──────         ──────────────────
id  ◄──────── user_id (FK)     ← many posts can belong to one user
name           title
email          body

Real-world examples:
  → One customer → many orders
  → One teacher → many students
  → One category → many products
  → One post → many comments
```

```sql
CREATE TABLE users (
  id   SERIAL       PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE posts (
  id      SERIAL       PRIMARY KEY,
  user_id INT          NOT NULL,        -- NO UNIQUE here = one-to-many
  title   VARCHAR(255) NOT NULL,
  body    TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Many-to-Many (M:N)

```
Many records in Table A correspond to many records in Table B.
Resolved using a JUNCTION TABLE (also called pivot table).

Example: students enroll in many courses,
         courses have many students

students         student_courses        courses
──────────       ───────────────────    ──────────
id  ◄────────── student_id (FK)        id
name             course_id (FK) ──────► name
                 enrolled_at            instructor

Real-world examples:
  → Students ↔ Courses
  → Users ↔ Roles (RBAC)
  → Products ↔ Tags
  → Actors ↔ Movies
```

```sql
CREATE TABLE students (
  id   SERIAL       PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE courses (
  id   SERIAL       PRIMARY KEY,
  name VARCHAR(200) NOT NULL
);

-- Junction table resolves the M:N relationship
CREATE TABLE student_courses (
  student_id  INT  NOT NULL,
  course_id   INT  NOT NULL,
  enrolled_at DATE DEFAULT CURRENT_DATE,
  PRIMARY KEY (student_id, course_id),   -- composite PK prevents duplicates
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
);
```

### Relationship Summary

| Type          | Example                | FK Location           | UNIQUE on FK? |
|---------------|------------------------|-----------------------|---------------|
| One-to-One    | User ↔ Profile         | Child table           | ✅ Yes        |
| One-to-Many   | User → Posts           | "Many" table          | ❌ No         |
| Many-to-Many  | Students ↔ Courses     | Junction table        | Composite PK  |

---

## 12. SQL Command Categories

```
DDL (Data Definition Language)   → CREATE, ALTER, DROP, TRUNCATE  (structure)
DML (Data Manipulation Language) → INSERT, UPDATE, DELETE          (data)
DQL (Data Query Language)        → SELECT                          (querying)
DCL (Data Control Language)      → GRANT, REVOKE                   (permissions)
TCL (Transaction Control)        → BEGIN, COMMIT, ROLLBACK, SAVEPOINT
```

---

## 13. DDL — Creating & Modifying Structure

### CREATE TABLE

```sql
CREATE TABLE users (
  id         SERIAL        PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(255)  NOT NULL UNIQUE,
  age        INT           CHECK (age >= 0 AND age <= 120),
  role       VARCHAR(50)   DEFAULT 'user',
  is_active  BOOLEAN       DEFAULT TRUE,
  created_at TIMESTAMPTZ   DEFAULT NOW(),
  updated_at TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE posts (
  id         SERIAL        PRIMARY KEY,
  user_id    INT           NOT NULL,
  title      VARCHAR(255)  NOT NULL,
  body       TEXT,
  created_at TIMESTAMPTZ   DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### ALTER TABLE — Modify Structure

```sql
-- Add a column
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN bio TEXT;

-- Modify / change a column type
ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(200);   -- PostgreSQL
ALTER TABLE users MODIFY COLUMN name VARCHAR(200) NOT NULL;  -- MySQL

-- Set / remove NOT NULL
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;       -- PostgreSQL
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- Set / remove DEFAULT
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'member';
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Rename a column
ALTER TABLE users RENAME COLUMN phone TO phone_number;

-- Drop a column
ALTER TABLE users DROP COLUMN bio;

-- Add a constraint
ALTER TABLE users ADD CONSTRAINT check_age CHECK (age >= 0);
ALTER TABLE users ADD CONSTRAINT unique_phone UNIQUE (phone);

-- Drop a constraint (PostgreSQL)
ALTER TABLE users DROP CONSTRAINT check_age;
ALTER TABLE users DROP CONSTRAINT unique_phone;

-- Drop index / constraint (MySQL)
ALTER TABLE users DROP INDEX unique_phone;

-- Rename a table
ALTER TABLE users RENAME TO app_users;          -- PostgreSQL
RENAME TABLE users TO app_users;                -- MySQL
```

### DROP & TRUNCATE

```sql
-- Drop table (delete table structure + all data — permanent)
DROP TABLE users;
DROP TABLE IF EXISTS users;

-- TRUNCATE — delete all rows but keep the table structure
TRUNCATE TABLE users;
-- Faster than DELETE FROM users
-- Resets AUTO_INCREMENT / SERIAL counter
-- Cannot be rolled back in MySQL (can in PostgreSQL)

-- Drop database
DROP DATABASE myapp;
DROP DATABASE IF EXISTS myapp;
```

---

## 14. DML — Manipulating Data

### INSERT

```sql
-- Insert one row
INSERT INTO users (name, email, age, role)
VALUES ('Arjun', 'arjun@email.com', 25, 'admin');

-- Insert multiple rows
INSERT INTO users (name, email, age)
VALUES
  ('Kerala', 'kerala@email.com', 30),
  ('Node',   'node@email.com',   28),
  ('SQL',    'sql@email.com',    35);

-- Insert using defaults (role defaults to 'user')
INSERT INTO users (name, email)
VALUES ('Test', 'test@email.com');

-- Insert from SELECT (copy rows from one table to another)
INSERT INTO archived_users (name, email)
SELECT name, email FROM users WHERE is_active = FALSE;

-- PostgreSQL: return the inserted row
INSERT INTO users (name, email)
VALUES ('Arjun', 'a@email.com')
RETURNING id, name, created_at;
```

### UPDATE

```sql
-- Update one column for one row
UPDATE users
SET name = 'Arjun Updated'
WHERE id = 1;

-- Update multiple columns
UPDATE users
SET name  = 'New Name',
    email = 'new@email.com',
    role  = 'moderator'
WHERE id = 1;

-- Update all rows (no WHERE — affects every row!)
UPDATE users SET is_active = TRUE;

-- Update with calculation
UPDATE products
SET price = price * 1.10      -- increase all electronics prices by 10%
WHERE category = 'electronics';

-- Update based on another table (PostgreSQL)
UPDATE orders
SET status = 'cancelled'
FROM users
WHERE orders.user_id = users.id
  AND users.is_active = FALSE;
```

### DELETE

```sql
-- Delete one specific row
DELETE FROM users WHERE id = 1;

-- Delete with condition
DELETE FROM users WHERE is_active = FALSE;

-- Delete all rows (dangerous — no WHERE)
DELETE FROM users;

-- Delete with JOIN (MySQL)
DELETE o FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.role = 'banned';

-- PostgreSQL: return deleted rows
DELETE FROM users WHERE id = 1 RETURNING *;
```

---

## 15. Clauses

### SELECT — Basic Queries

```sql
-- Select all columns
SELECT * FROM users;

-- Select specific columns
SELECT id, name, email FROM users;

-- Select with alias
SELECT
  id,
  name       AS full_name,
  email      AS email_address,
  created_at AS joined_on
FROM users;

-- Select distinct values
SELECT DISTINCT role FROM users;

-- Select with expression
SELECT
  name,
  age,
  age + 5       AS age_in_5_years,
  UPPER(name)   AS name_upper
FROM users;
```

### WHERE — Filtering Rows

```sql
-- Exact match
SELECT * FROM users WHERE age = 25;
SELECT * FROM users WHERE role = 'admin';

-- Comparison
SELECT * FROM users WHERE age > 18;
SELECT * FROM users WHERE age >= 18;
SELECT * FROM users WHERE age < 65;
SELECT * FROM users WHERE age != 30;
SELECT * FROM users WHERE age <> 30;   -- same as !=

-- Range
SELECT * FROM users WHERE age >= 18 AND age <= 30;
SELECT * FROM products WHERE price BETWEEN 100 AND 500;    -- inclusive

-- List of values
SELECT * FROM users WHERE role IN ('admin', 'moderator');
SELECT * FROM users WHERE role NOT IN ('banned', 'suspended');

-- NULL checks
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;
```

### DISTINCT — Remove Duplicates

```sql
-- Without DISTINCT — returns all rows including duplicates
SELECT role FROM users;
-- admin, user, user, admin, user, moderator

-- With DISTINCT — returns only unique values
SELECT DISTINCT role FROM users;
-- admin, user, moderator

-- DISTINCT on multiple columns
SELECT DISTINCT role, is_active FROM users;
-- unique combinations of role + is_active

-- Count of distinct values
SELECT COUNT(DISTINCT role) FROM users;
```

### ORDER BY — Sorting Results

```sql
-- Sort ascending (default)
SELECT * FROM users ORDER BY name;
SELECT * FROM users ORDER BY name ASC;

-- Sort descending
SELECT * FROM users ORDER BY created_at DESC;

-- Sort by multiple columns
SELECT * FROM users
ORDER BY role ASC, name ASC;

-- Sort NULLs (PostgreSQL)
SELECT * FROM users ORDER BY phone ASC NULLS LAST;   -- NULLs at end
SELECT * FROM users ORDER BY phone ASC NULLS FIRST;  -- NULLs at start
```

### LIMIT — Restrict Number of Rows

```sql
-- Get only the first 10 rows
SELECT * FROM users LIMIT 10;

-- Get top 5 most expensive products
SELECT * FROM products ORDER BY price DESC LIMIT 5;

-- OFFSET — skip N rows (used for pagination)
SELECT * FROM users LIMIT 10 OFFSET 0;    -- page 1
SELECT * FROM users LIMIT 10 OFFSET 10;   -- page 2
SELECT * FROM users LIMIT 10 OFFSET 20;   -- page 3

-- Pagination formula:
-- Page N: LIMIT 10 OFFSET (N - 1) * 10
```

### LIKE — Pattern Matching

```sql
-- % matches zero or more characters
SELECT * FROM users WHERE name LIKE 'A%';       -- starts with A
SELECT * FROM users WHERE name LIKE '%n';       -- ends with n
SELECT * FROM users WHERE name LIKE '%jun%';    -- contains 'jun'

-- _ matches exactly ONE character
SELECT * FROM users WHERE name LIKE '_r%';      -- second char is 'r'
SELECT * FROM users WHERE name LIKE '__a%';     -- third char is 'a'

-- NOT LIKE
SELECT * FROM users WHERE email NOT LIKE '%@gmail.com';

-- PostgreSQL: ILIKE — case-insensitive LIKE
SELECT * FROM users WHERE name ILIKE '%arjun%';  -- matches 'Arjun', 'ARJUN', 'arjun'

-- Escape special characters
SELECT * FROM products WHERE name LIKE '100\%';  -- literal % in name
```

### HAVING — Filter After Grouping

```sql
-- HAVING filters GROUPS (after GROUP BY)
-- WHERE filters ROWS (before GROUP BY)

-- Roles that have more than 5 users
SELECT role, COUNT(*) AS count
FROM users
GROUP BY role
HAVING COUNT(*) > 5;

-- Users who spent more than $1000 total
SELECT user_id, SUM(amount) AS total_spent
FROM orders
GROUP BY user_id
HAVING SUM(amount) > 1000
ORDER BY total_spent DESC;

-- Combining WHERE and HAVING
SELECT role, COUNT(*) AS count
FROM users
WHERE is_active = TRUE         -- filter rows BEFORE grouping
GROUP BY role
HAVING COUNT(*) > 2;           -- filter groups AFTER grouping
```

### SQL Execution Order

```
The order SQL processes a query (NOT the order you write it):

1. FROM          → which table(s)
2. JOIN          → combine tables
3. WHERE         → filter rows
4. GROUP BY      → group rows
5. HAVING        → filter groups
6. SELECT        → choose columns / expressions
7. DISTINCT      → remove duplicate rows
8. ORDER BY      → sort results
9. LIMIT/OFFSET  → paginate
```

---

## 16. Relational Operators

Relational (comparison) operators compare two values and return TRUE or FALSE.

Used inside `WHERE`, `HAVING`, `CHECK`, and `CASE` clauses.

```sql
-- Equality
=       equal to
!=      not equal to
<>      not equal to (same as !=, SQL standard)

-- Comparison
>       greater than
<       less than
>=      greater than or equal to
<=      less than or equal to
```

### Examples

```sql
-- Equal to
SELECT * FROM users WHERE role = 'admin';

-- Not equal to
SELECT * FROM users WHERE role != 'banned';
SELECT * FROM users WHERE role <> 'banned';   -- same thing

-- Greater / less than
SELECT * FROM products WHERE price > 100;
SELECT * FROM products WHERE price < 50;
SELECT * FROM users    WHERE age >= 18;
SELECT * FROM orders   WHERE amount <= 500;

-- Used in UPDATE
UPDATE products SET stock = 0 WHERE stock < 0;

-- Used in CHECK constraint
price DECIMAL(10,2) CHECK (price >= 0)
age   INT           CHECK (age > 0 AND age <= 120)

-- Used in HAVING
HAVING COUNT(*) > 5
HAVING SUM(amount) >= 1000
```

### Special Relational Operators

```sql
-- BETWEEN — range check (inclusive)
SELECT * FROM products WHERE price BETWEEN 10 AND 100;
SELECT * FROM users WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';

-- IN — matches any value in a list
SELECT * FROM users WHERE role IN ('admin', 'moderator', 'editor');

-- NOT IN — does not match any value in list
SELECT * FROM orders WHERE status NOT IN ('cancelled', 'refunded');

-- IS NULL / IS NOT NULL
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;

-- LIKE / ILIKE — pattern matching
SELECT * FROM users WHERE name LIKE 'A%';
```

---

## 17. Logical Operators

Logical operators combine multiple conditions in a WHERE clause.

```
AND   → ALL conditions must be TRUE
OR    → AT LEAST ONE condition must be TRUE
NOT   → REVERSES the condition (TRUE → FALSE, FALSE → TRUE)
```

### AND

```sql
-- All conditions must be true
SELECT * FROM users
WHERE age > 18 AND role = 'user';

SELECT * FROM products
WHERE price > 100 AND price < 500 AND stock > 0;

SELECT * FROM orders
WHERE status = 'pending' AND created_at > '2024-01-01';
```

### OR

```sql
-- At least one condition must be true
SELECT * FROM users
WHERE role = 'admin' OR role = 'moderator';

SELECT * FROM products
WHERE category = 'electronics' OR category = 'computers';

-- Equivalent to IN:
SELECT * FROM users WHERE role IN ('admin', 'moderator');
```

### NOT

```sql
-- Reverses the condition
SELECT * FROM users WHERE NOT role = 'banned';
SELECT * FROM users WHERE NOT is_active;           -- active = FALSE

-- NOT with LIKE
SELECT * FROM users WHERE name NOT LIKE 'A%';

-- NOT with IN
SELECT * FROM users WHERE role NOT IN ('banned', 'suspended');

-- NOT with NULL
SELECT * FROM users WHERE phone IS NOT NULL;
```

### Combining Logical Operators

Use parentheses `()` to control evaluation order:

```sql
-- Without parentheses (AND binds tighter than OR):
SELECT * FROM users WHERE role = 'admin' OR role = 'user' AND is_active = TRUE;
-- equivalent to: role = 'admin' OR (role = 'user' AND is_active = TRUE)

-- With parentheses (explicit intent):
SELECT * FROM users
WHERE (role = 'admin' OR role = 'user') AND is_active = TRUE;
-- only active admins and active users

-- Complex example:
SELECT * FROM products
WHERE
  (category = 'electronics' OR category = 'computers')
  AND price < 1000
  AND stock > 0
  AND NOT is_discontinued;
```

### Operator Precedence (highest to lowest)

```
1. NOT
2. AND
3. OR

Always use parentheses when mixing AND and OR to be explicit.
```

---

## 18. Aggregate Functions

Aggregate functions perform calculations on a set of rows and return a single value.

```sql
-- COUNT — count rows
SELECT COUNT(*) FROM users;                    -- total rows (includes NULLs)
SELECT COUNT(phone) FROM users;               -- non-NULL phone values only
SELECT COUNT(DISTINCT role) FROM users;       -- count unique roles

-- SUM — total of numeric column
SELECT SUM(amount) FROM orders;
SELECT SUM(price * quantity) FROM order_items;

-- AVG — average value
SELECT AVG(age) FROM users;
SELECT ROUND(AVG(price), 2) FROM products;   -- round to 2 decimal places

-- MIN — smallest value
SELECT MIN(price) FROM products;
SELECT MIN(created_at) AS first_signup FROM users;

-- MAX — largest value
SELECT MAX(price) FROM products;
SELECT MAX(age) FROM users;

-- Multiple aggregates in one query
SELECT
  COUNT(*)       AS total_users,
  AVG(age)       AS avg_age,
  MIN(age)       AS youngest,
  MAX(age)       AS oldest,
  SUM(age)       AS total_age
FROM users;
```

### Aggregate with WHERE

```sql
-- Aggregate only active users
SELECT COUNT(*), AVG(age)
FROM users
WHERE is_active = TRUE;

-- Total revenue from completed orders
SELECT SUM(amount)
FROM orders
WHERE status = 'completed';
```

---

## 19. GROUP BY and HAVING

### GROUP BY — Group Rows for Aggregation

```sql
-- Count users by role
SELECT role, COUNT(*) AS count
FROM users
GROUP BY role;

-- Result:
-- role       | count
-- admin      | 3
-- user       | 47
-- moderator  | 5

-- Average order amount by user
SELECT
  user_id,
  COUNT(*)       AS total_orders,
  SUM(amount)    AS total_spent,
  AVG(amount)    AS avg_order,
  MAX(amount)    AS largest_order
FROM orders
GROUP BY user_id;

-- Group by multiple columns
SELECT
  role,
  is_active,
  COUNT(*) AS count
FROM users
GROUP BY role, is_active
ORDER BY role;
```

### HAVING — Filter Groups

```sql
-- Roles with more than 5 users
SELECT role, COUNT(*) AS count
FROM users
GROUP BY role
HAVING COUNT(*) > 5;

-- Users who spent more than $1000 total
SELECT user_id, SUM(amount) AS total_spent
FROM orders
GROUP BY user_id
HAVING SUM(amount) > 1000
ORDER BY total_spent DESC;

-- Categories with average price above $200
SELECT category, AVG(price) AS avg_price
FROM products
GROUP BY category
HAVING AVG(price) > 200;
```

---

## 20. String Functions

```sql
-- Case conversion
SELECT UPPER('hello');                          -- 'HELLO'
SELECT LOWER('HELLO');                          -- 'hello'

-- Length
SELECT LENGTH('Hello');                         -- 5 (bytes)
SELECT CHAR_LENGTH('Hello');                    -- 5 (characters — multibyte safe)

-- Trimming whitespace
SELECT TRIM('  Hello  ');                       -- 'Hello'
SELECT LTRIM('  Hello');                        -- 'Hello'
SELECT RTRIM('Hello  ');                        -- 'Hello'

-- Extracting part of string
SELECT SUBSTRING('Hello World', 1, 5);          -- 'Hello'
SELECT SUBSTR('Hello World', 7);                -- 'World'
SELECT LEFT('Hello World', 5);                  -- 'Hello'
SELECT RIGHT('Hello World', 5);                 -- 'World'

-- Search and replace
SELECT REPLACE('Hello World', 'World', 'SQL'); -- 'Hello SQL'
SELECT POSITION('World' IN 'Hello World');     -- 7
SELECT INSTR('Hello World', 'World');          -- 7 (MySQL)

-- Concatenation
SELECT CONCAT('Hello', ' ', 'World');          -- 'Hello World'
SELECT CONCAT_WS(', ', 'Arjun', 'Kerala');     -- 'Arjun, Kerala'
SELECT 'Hello' || ' ' || 'World';             -- 'Hello World' (PostgreSQL)

-- Padding
SELECT LPAD('5', 4, '0');                      -- '0005'
SELECT RPAD('5', 4, '0');                      -- '5000'

-- Reversing
SELECT REVERSE('Hello');                        -- 'olleH'

-- Repeat
SELECT REPEAT('ab', 3);                         -- 'ababab'

-- Format numbers
SELECT FORMAT(1234567.891, 2);                  -- '1,234,567.89' (MySQL)
SELECT TO_CHAR(1234567.891, 'FM999,999,999.00'); -- PostgreSQL

-- Split (PostgreSQL)
SELECT SPLIT_PART('a,b,c', ',', 2);            -- 'b'

-- Practical examples
SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM employees;
SELECT LOWER(TRIM(email)) AS normalized_email FROM users;
SELECT LEFT(description, 100) || '...' AS preview FROM posts;
```

---

## 21. Numeric Functions

```sql
SELECT ROUND(3.14159, 2);      -- 3.14   (round to N decimal places)
SELECT ROUND(3.5);             -- 4      (round to nearest integer)
SELECT CEIL(3.2);              -- 4      (round UP)
SELECT CEILING(3.2);           -- 4      (same as CEIL)
SELECT FLOOR(3.9);             -- 3      (round DOWN)
SELECT ABS(-42);               -- 42     (absolute value)
SELECT MOD(10, 3);             -- 1      (remainder of 10 ÷ 3)
SELECT POWER(2, 10);           -- 1024   (2 to the power of 10)
SELECT SQRT(16);               -- 4      (square root)
SELECT RANDOM();               -- 0.xxx  (random float 0–1, PostgreSQL)
SELECT RAND();                 -- 0.xxx  (MySQL)
SELECT TRUNCATE(3.14159, 2);   -- 3.14   (truncate, no rounding — MySQL)
SELECT TRUNC(3.14159, 2);      -- 3.14   (PostgreSQL)
SELECT SIGN(-5);               -- -1     (-1, 0, or 1)
SELECT GREATEST(3, 9, 1, 7);  -- 9      (max of list)
SELECT LEAST(3, 9, 1, 7);     -- 1      (min of list)
```

---

## 22. Date Functions

```sql
-- Current date and time
SELECT NOW();                               -- 2024-01-15 10:30:00+05:30
SELECT CURRENT_TIMESTAMP;                   -- same as NOW()
SELECT CURRENT_DATE;                        -- 2024-01-15
SELECT CURRENT_TIME;                        -- 10:30:00

-- Extract parts from date
SELECT EXTRACT(YEAR  FROM NOW());           -- 2024
SELECT EXTRACT(MONTH FROM NOW());           -- 1
SELECT EXTRACT(DAY   FROM NOW());           -- 15
SELECT EXTRACT(HOUR  FROM NOW());           -- 10

-- PostgreSQL shorthand
SELECT DATE_PART('year',  NOW());           -- 2024
SELECT DATE_PART('month', NOW());           -- 1

-- MySQL functions
SELECT YEAR(NOW());                         -- 2024
SELECT MONTH(NOW());                        -- 1
SELECT DAY(NOW());                          -- 15
SELECT DAYNAME(NOW());                      -- Monday
SELECT MONTHNAME(NOW());                    -- January

-- Format dates
SELECT TO_CHAR(NOW(), 'DD/MM/YYYY');        -- 15/01/2024 (PostgreSQL)
SELECT DATE_FORMAT(NOW(), '%d/%m/%Y');      -- 15/01/2024 (MySQL)

-- Add / subtract dates
SELECT NOW() + INTERVAL '7 days';          -- 7 days from now (PostgreSQL)
SELECT NOW() - INTERVAL '1 month';         -- 1 month ago
SELECT DATE_ADD(NOW(), INTERVAL 7 DAY);    -- MySQL
SELECT DATE_SUB(NOW(), INTERVAL 1 MONTH);  -- MySQL

-- Difference between dates
SELECT AGE(NOW(), '1995-06-15');            -- years/months/days (PostgreSQL)
SELECT DATEDIFF('2024-12-31', '2024-01-01'); -- 365 days (MySQL)

-- Age calculation
SELECT EXTRACT(YEAR FROM AGE(birthdate)) AS age FROM users; -- PostgreSQL
SELECT TIMESTAMPDIFF(YEAR, birthdate, NOW()) AS age FROM users; -- MySQL

-- Cast
SELECT NOW()::DATE;           -- 2024-01-15 (PostgreSQL casting)
SELECT CAST(NOW() AS DATE);   -- standard SQL
```

---

## 23. Conditional Expressions — CASE

`CASE` is SQL's if-else — it returns different values based on conditions.

### Searched CASE (most flexible)

```sql
-- Basic CASE
SELECT
  name,
  age,
  CASE
    WHEN age < 18 THEN 'Minor'
    WHEN age < 65 THEN 'Adult'
    ELSE 'Senior'
  END AS age_group
FROM users;

-- CASE with multiple conditions
SELECT
  name,
  salary,
  CASE
    WHEN salary < 30000  THEN 'Entry Level'
    WHEN salary < 70000  THEN 'Mid Level'
    WHEN salary < 120000 THEN 'Senior Level'
    ELSE 'Executive'
  END AS salary_band
FROM employees;

-- CASE in WHERE clause
SELECT * FROM orders
WHERE
  CASE
    WHEN status = 'urgent' THEN priority > 8
    ELSE priority > 3
  END;
```

### Simple CASE (match against one column)

```sql
SELECT
  name,
  role,
  CASE role
    WHEN 'admin'     THEN 'Administrator'
    WHEN 'moderator' THEN 'Moderator'
    WHEN 'user'      THEN 'Regular User'
    ELSE 'Unknown'
  END AS role_label
FROM users;
```

### CASE in Aggregation

```sql
-- Count by status using CASE
SELECT
  COUNT(*) AS total,
  SUM(CASE WHEN status = 'active'   THEN 1 ELSE 0 END) AS active,
  SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive,
  SUM(CASE WHEN status = 'banned'   THEN 1 ELSE 0 END) AS banned
FROM users;

-- Pivot table with CASE
SELECT
  user_id,
  SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) AS pending,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
FROM orders
GROUP BY user_id;
```

### IF, IFNULL, COALESCE, NULLIF

```sql
-- IF (MySQL shorthand for simple CASE)
SELECT name, IF(is_active, 'Active', 'Inactive') AS status FROM users;

-- IFNULL — return fallback if value is NULL (MySQL)
SELECT name, IFNULL(phone, 'No phone') AS phone FROM users;

-- COALESCE — return FIRST non-NULL value (standard SQL, works everywhere)
SELECT COALESCE(phone, mobile, email, 'No contact') AS contact FROM users;
SELECT COALESCE(nickname, first_name, 'Anonymous') AS display_name FROM users;

-- NULLIF — return NULL if two values are equal (avoid division by zero)
SELECT total / NULLIF(count, 0) AS avg FROM stats;  -- returns NULL instead of ÷0 error
SELECT NULLIF(score, 0) AS score FROM results;      -- turns 0 into NULL
```

---

## 24. Foreign Keys

A Foreign Key (FK) is a column (or group of columns) in one table that references the Primary Key of another table. It enforces **referential integrity** — you can't have an order for a user that doesn't exist.

```
users (parent / referenced table)
  id ◄─────────────────────────────┐
  name                             │ FK references PK
  email                            │
                                   │
orders (child / referencing table) │
  id                               │
  user_id ─────────────────────────┘
  amount
  status
```

### Creating Foreign Keys

```sql
-- Method 1: inline during CREATE TABLE
CREATE TABLE orders (
  id      SERIAL        PRIMARY KEY,
  user_id INT           NOT NULL,
  amount  DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Method 2: named constraint (recommended — easier to manage)
CREATE TABLE orders (
  id      SERIAL        PRIMARY KEY,
  user_id INT           NOT NULL,
  amount  DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add FK to existing table
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user
FOREIGN KEY (user_id) REFERENCES users(id);

-- Drop a FK constraint
ALTER TABLE orders DROP CONSTRAINT fk_orders_user;   -- PostgreSQL
ALTER TABLE orders DROP FOREIGN KEY fk_orders_user;  -- MySQL
```

### ON DELETE and ON UPDATE Actions

Controls what happens to child rows when the parent row is deleted or its PK is updated.

```sql
CREATE TABLE posts (
  id      SERIAL  PRIMARY KEY,
  user_id INT     NOT NULL,
  title   TEXT    NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE    -- if user deleted, delete their posts too
    ON UPDATE CASCADE    -- if user.id changes, update posts.user_id too
);
```

| Action        | ON DELETE behaviour                                       |
|---------------|-----------------------------------------------------------|
| `CASCADE`     | Delete child rows automatically when parent is deleted    |
| `SET NULL`    | Set FK column to NULL when parent is deleted              |
| `SET DEFAULT` | Set FK column to its DEFAULT value                        |
| `RESTRICT`    | Prevent deletion of parent if child rows exist (default)  |
| `NO ACTION`   | Same as RESTRICT (checked at end of transaction)          |

```sql
-- Examples of different actions:

-- CASCADE — delete orders when user is deleted
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- SET NULL — keep post but remove author reference
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL

-- RESTRICT — prevent deleting a user who has orders
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
```

### Referential Integrity in Action

```sql
-- These will SUCCEED:
INSERT INTO users (id, name) VALUES (1, 'Arjun');
INSERT INTO orders (user_id, amount) VALUES (1, 250.00);  -- user 1 exists

-- These will FAIL:
INSERT INTO orders (user_id, amount) VALUES (999, 100.00);
-- ERROR: insert or update on table "orders" violates foreign key constraint
-- user 999 does not exist in users table

DELETE FROM users WHERE id = 1;
-- ERROR: update or delete on table "users" violates foreign key constraint
-- (if ON DELETE RESTRICT — which is the default)
```

---

## 25. JOINS and Their Types

Joins combine rows from two or more tables based on a related column.

### Sample Tables

```sql
-- users
┌────┬────────┬─────────────────────┐
│ id │  name  │        email        │
├────┼────────┼─────────────────────┤
│  1 │ Arjun  │ arjun@email.com     │
│  2 │ Kerala │ kerala@email.com    │
│  3 │ Node   │ node@email.com      │
└────┴────────┴─────────────────────┘

-- posts
┌────┬─────────┬──────────────────────┐
│ id │ user_id │       title          │
├────┼─────────┼──────────────────────┤
│  1 │       1 │ First Post           │
│  2 │       1 │ Second Post          │
│  3 │       2 │ Kerala's Post        │
│  4 │    NULL │ Orphan Post          │
└────┴─────────┴──────────────────────┘
```

### INNER JOIN — Matching rows only

```sql
-- Only rows that have a match in BOTH tables
SELECT u.name, p.title
FROM users u
INNER JOIN posts p ON u.id = p.user_id;

-- Result:
-- Arjun  | First Post
-- Arjun  | Second Post
-- Kerala | Kerala's Post
-- (Node has no posts → excluded)
-- (Orphan Post has no user → excluded)
```

### LEFT JOIN — All rows from left table

```sql
-- All users, even those with no posts
SELECT u.name, p.title
FROM users u
LEFT JOIN posts p ON u.id = p.user_id;

-- Result:
-- Arjun  | First Post
-- Arjun  | Second Post
-- Kerala | Kerala's Post
-- Node   | NULL          ← Node has no posts, still appears
```

### RIGHT JOIN — All rows from right table

```sql
-- All posts, even those with no user
SELECT u.name, p.title
FROM users u
RIGHT JOIN posts p ON u.id = p.user_id;

-- Result:
-- Arjun  | First Post
-- Arjun  | Second Post
-- Kerala | Kerala's Post
-- NULL   | Orphan Post   ← post with no user still appears
```

### FULL OUTER JOIN — All rows from both tables

```sql
-- PostgreSQL
SELECT u.name, p.title
FROM users u
FULL OUTER JOIN posts p ON u.id = p.user_id;

-- MySQL workaround (no FULL OUTER JOIN support)
SELECT u.name, p.title FROM users u LEFT JOIN posts p ON u.id = p.user_id
UNION
SELECT u.name, p.title FROM users u RIGHT JOIN posts p ON u.id = p.user_id;
```

### CROSS JOIN — Cartesian product

```sql
-- Every combination of rows from both tables
SELECT u.name, p.name AS product
FROM users u
CROSS JOIN products p;
-- 3 users × 5 products = 15 rows
```

### SELF JOIN — Join a table with itself

```sql
-- Find employees and their manager (both in same table)
SELECT
  e.name  AS employee,
  m.name  AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

### Multiple JOINs

```sql
-- Users → Orders → Order Items → Products
SELECT
  u.name        AS customer,
  o.id          AS order_id,
  p.name        AS product,
  oi.quantity,
  oi.price
FROM users u
JOIN orders o       ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p     ON p.id = oi.product_id
WHERE u.id = 1
ORDER BY o.id;
```

### JOIN Types — Visual Summary

```
Table A: users        Table B: posts
    1 Arjun               1 (user 1) First Post
    2 Kerala              2 (user 1) Second Post
    3 Node                3 (user 2) Kerala's Post
                          4 (NULL)   Orphan Post

INNER JOIN   → Arjun+posts, Kerala+post  (matching only)
LEFT JOIN    → All users + matching posts (Node with NULL)
RIGHT JOIN   → Matching users + all posts (NULL + Orphan)
FULL OUTER   → All users + all posts (both NULLs included)
CROSS JOIN   → Every user × every post (12 combinations)
```

---

## 26. Subqueries

A subquery is a query nested inside another query.

```sql
-- Users who have placed at least one order
SELECT name FROM users
WHERE id IN (
  SELECT DISTINCT user_id FROM orders
);

-- Users who spent more than average
SELECT name FROM users
WHERE id IN (
  SELECT user_id FROM orders
  GROUP BY user_id
  HAVING SUM(amount) > (SELECT AVG(amount) FROM orders)
);

-- Most expensive product per category (correlated subquery)
SELECT * FROM products p1
WHERE price = (
  SELECT MAX(price) FROM products p2
  WHERE p2.category = p1.category
);

-- Subquery in FROM (derived table)
SELECT AVG(order_count) AS avg_orders_per_user
FROM (
  SELECT user_id, COUNT(*) AS order_count
  FROM orders
  GROUP BY user_id
) AS user_order_counts;

-- EXISTS — check if subquery returns any rows
SELECT name FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- NOT EXISTS
SELECT name FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

---

## 27. Views

A view is a **saved SQL query stored in the database** that acts like a virtual table. The data is not stored — it is computed when you query the view.

### Why Use Views?

```
✅ Simplify complex queries — write once, use anywhere
✅ Security — expose only certain columns to certain users
✅ Abstraction — hide complex JOINs from application code
✅ Consistency — all users query the same logic
```

### Create a View

```sql
-- Simple view
CREATE VIEW active_users AS
SELECT id, name, email, role
FROM users
WHERE is_active = TRUE;

-- Query the view like a table
SELECT * FROM active_users;
SELECT * FROM active_users WHERE role = 'admin';

-- View with JOIN
CREATE VIEW user_order_summary AS
SELECT
  u.id,
  u.name,
  COUNT(o.id)   AS total_orders,
  SUM(o.amount) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- Use it
SELECT * FROM user_order_summary ORDER BY total_spent DESC;
SELECT * FROM user_order_summary WHERE total_orders > 5;
```

### Update a View

```sql
-- Replace view definition
CREATE OR REPLACE VIEW active_users AS
SELECT id, name, email, role, created_at
FROM users
WHERE is_active = TRUE;

-- PostgreSQL: ALTER VIEW to rename
ALTER VIEW active_users RENAME TO active_users_view;
```

### Drop a View

```sql
DROP VIEW active_users;
DROP VIEW IF EXISTS active_users;
```

### Updatable Views

Simple views (on one table, no GROUP BY, no aggregates) can accept INSERT/UPDATE/DELETE:

```sql
CREATE VIEW basic_users AS
SELECT id, name, email FROM users;

-- This works on a simple view:
UPDATE basic_users SET name = 'New Name' WHERE id = 1;

-- This does NOT work (aggregates involved):
UPDATE user_order_summary SET total_orders = 0;  -- ERROR
```

### Materialized Views (PostgreSQL only)

A materialized view **stores the result** on disk — much faster for complex queries, but data can be stale.

```sql
-- Create materialized view
CREATE MATERIALIZED VIEW monthly_revenue AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  SUM(amount) AS revenue
FROM orders
WHERE status = 'completed'
GROUP BY 1
ORDER BY 1;

-- Query it (reads from stored snapshot)
SELECT * FROM monthly_revenue;

-- Refresh the data manually (re-runs the query)
REFRESH MATERIALIZED VIEW monthly_revenue;

-- Refresh without locking (concurrent reads still work)
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_revenue;

-- Drop
DROP MATERIALIZED VIEW monthly_revenue;
```

| Feature            | Regular View           | Materialized View            |
|--------------------|------------------------|------------------------------|
| Data stored?       | No (computed on query) | Yes (snapshot on disk)       |
| Always current?    | ✅ Yes                 | ❌ Must refresh manually     |
| Query speed        | Depends on complexity  | Fast (pre-computed)          |
| Use for            | Simple/medium queries  | Heavy aggregations, reports  |

---

## 28. Window Functions

Window functions perform calculations **across a set of rows related to the current row** — without collapsing them like GROUP BY does.

```sql
-- ROW_NUMBER — unique sequential number per partition
SELECT
  name, role,
  ROW_NUMBER() OVER (PARTITION BY role ORDER BY name) AS row_num
FROM users;

-- RANK — same value = same rank (gaps in sequence)
SELECT name, age, RANK() OVER (ORDER BY age DESC) AS age_rank
FROM users;

-- DENSE_RANK — same value = same rank (no gaps)
SELECT name, age, DENSE_RANK() OVER (ORDER BY age DESC) AS age_rank
FROM users;

-- LAG / LEAD — access previous / next row
SELECT
  name, salary,
  LAG(salary)  OVER (ORDER BY salary) AS prev_salary,
  LEAD(salary) OVER (ORDER BY salary) AS next_salary,
  salary - LAG(salary) OVER (ORDER BY salary) AS diff_from_prev
FROM employees;

-- Running total
SELECT
  order_date, amount,
  SUM(amount) OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING) AS running_total,
  AVG(amount) OVER (ORDER BY order_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg
FROM orders;

-- NTILE — divide rows into N equal buckets
SELECT name, salary,
  NTILE(4) OVER (ORDER BY salary) AS quartile
FROM employees;

-- FIRST_VALUE / LAST_VALUE — value from first or last row in window
SELECT
  name, department, salary,
  FIRST_VALUE(name) OVER (PARTITION BY department ORDER BY salary DESC) AS top_earner
FROM employees;
```

---

## 29. CTEs — Common Table Expressions

CTEs make complex queries more readable by naming intermediate results.

```sql
-- Basic CTE
WITH active_users AS (
  SELECT * FROM users WHERE is_active = TRUE
)
SELECT * FROM active_users WHERE role = 'admin';

-- Multiple CTEs
WITH
  active_users AS (
    SELECT id, name FROM users WHERE is_active = TRUE
  ),
  user_orders AS (
    SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total
    FROM orders GROUP BY user_id
  )
SELECT
  u.name,
  COALESCE(uo.order_count, 0) AS orders,
  COALESCE(uo.total, 0)       AS total_spent
FROM active_users u
LEFT JOIN user_orders uo ON u.id = uo.user_id
ORDER BY total_spent DESC;

-- Recursive CTE — hierarchical data (org chart, categories)
WITH RECURSIVE employee_hierarchy AS (
  SELECT id, name, manager_id, 0 AS level
  FROM employees WHERE manager_id IS NULL       -- base case: top of tree
  UNION ALL
  SELECT e.id, e.name, e.manager_id, eh.level + 1
  FROM employees e
  JOIN employee_hierarchy eh ON e.manager_id = eh.id  -- recursive case
)
SELECT * FROM employee_hierarchy ORDER BY level, name;
```

---

## 30. Indexes

Indexes speed up `SELECT` queries but add overhead to `INSERT`/`UPDATE`/`DELETE`.

```sql
-- Create single-column index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Composite index (column order matters!)
CREATE INDEX idx_users_role_name ON users(role, name);
-- Helps queries like: WHERE role = 'admin' ORDER BY name

-- Unique index
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Partial index (PostgreSQL) — index only a subset of rows
CREATE INDEX idx_active_users ON users(email) WHERE is_active = TRUE;

-- Full-text index (MySQL)
CREATE FULLTEXT INDEX idx_posts_body ON posts(title, body);

-- Drop an index
DROP INDEX idx_users_email;                     -- PostgreSQL
DROP INDEX idx_users_email ON users;            -- MySQL

-- View indexes
\d users                                        -- psql: show table with indexes
SHOW INDEXES FROM users;                        -- MySQL

-- When to index:
-- ✅ Columns in WHERE clauses
-- ✅ Columns in JOIN ON conditions
-- ✅ Columns in ORDER BY
-- ✅ Foreign key columns
-- ❌ Small tables (full scan is faster)
-- ❌ Columns rarely queried
-- ❌ Columns updated very frequently
```

---

## 31. Transactions

Group multiple statements into a single atomic unit — all succeed or all fail.

```sql
-- Bank transfer — both updates must succeed
BEGIN;

  UPDATE accounts SET balance = balance - 500 WHERE id = 1;  -- debit
  UPDATE accounts SET balance = balance + 500 WHERE id = 2;  -- credit

COMMIT;   -- save both changes

-- On error, rollback everything
BEGIN;

  UPDATE accounts SET balance = balance - 500 WHERE id = 1;
  -- something went wrong...

ROLLBACK;  -- undo everything

-- SAVEPOINT — partial rollback
BEGIN;

  INSERT INTO orders VALUES (...);
  SAVEPOINT after_order;

  INSERT INTO order_items VALUES (...);
  -- error here...

  ROLLBACK TO after_order;  -- undo only to savepoint
  COMMIT;                    -- commit everything before savepoint
```

---

## 32. Stored Procedures

Reusable SQL programs stored in the database.

```sql
-- Create stored procedure
DELIMITER //
CREATE PROCEDURE GetUserWithPosts(IN userId INT)
BEGIN
  SELECT u.*, COUNT(p.id) AS post_count
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  WHERE u.id = userId
  GROUP BY u.id;
END //
DELIMITER ;

-- Call it
CALL GetUserWithPosts(1);

-- Procedure with OUT parameter
DELIMITER //
CREATE PROCEDURE GetUserCount(OUT total INT)
BEGIN
  SELECT COUNT(*) INTO total FROM users;
END //
DELIMITER ;

CALL GetUserCount(@count);
SELECT @count;
```

---

## 33. Triggers

Automatically run SQL when a table event occurs.

```sql
-- Log every deletion
CREATE TRIGGER before_user_delete
BEFORE DELETE ON users
FOR EACH ROW
BEGIN
  INSERT INTO user_deletion_log (user_id, name, deleted_at)
  VALUES (OLD.id, OLD.name, NOW());
END;

-- Auto-set updated_at
CREATE TRIGGER before_user_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END;

-- Validate before insert
CREATE TRIGGER before_user_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  IF NEW.age < 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Age cannot be negative';
  END IF;
END;
```

---

## 34. ACID Properties

```
ACID = guarantees that database transactions are reliable

A — Atomicity
    → Transaction is ALL or NOTHING
    → If part fails, entire transaction rolls back
    → Example: bank transfer (debit + credit must both succeed or both fail)

C — Consistency
    → Database moves from one valid state to another valid state
    → All rules, constraints, and cascades are enforced
    → Data always satisfies all defined rules

I — Isolation
    → Concurrent transactions don't interfere with each other
    → Results of a transaction are invisible until committed
    → Prevents dirty reads, non-repeatable reads, phantom reads

D — Durability
    → Once committed, data persists even after system failure
    → Written to disk / non-volatile storage
    → A crash won't undo committed transactions
```

---

## 35. Normalization

Normalization removes **data redundancy** and improves data integrity by organising data into well-structured tables.

```
Unnormalized (bad):
  order_id | customer_name | customer_email | product | price
  1        | Arjun         | a@email.com    | Laptop  | 999
  1        | Arjun         | a@email.com    | Mouse   | 29
  2        | Kerala        | k@email.com    | Phone   | 699

Problems:
  → customer_name and email repeated → update anomaly
  → Deleting order 2 loses Kerala's contact info → delete anomaly
```

### Normal Forms

```
1NF — Each column has atomic (indivisible) values; no repeating groups
2NF — In 1NF + every non-key column depends on the ENTIRE primary key
3NF — In 2NF + no transitive dependencies (non-key → non-key)
BCNF — Every determinant must be a candidate key (stricter 3NF)
```

---

## 36. Query Optimization

```sql
-- ✅ Select specific columns (not *)
SELECT id, name, email FROM users;   -- ✅
SELECT * FROM users;                 -- ❌ fetches unnecessary data

-- ✅ Use indexes on WHERE and JOIN columns
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- ✅ Use EXISTS instead of IN for large subqueries
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);  -- faster

-- ❌ Avoid functions on indexed columns in WHERE
SELECT * FROM users WHERE YEAR(created_at) = 2024;          -- no index used
SELECT * FROM users WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';  -- ✅

-- ✅ EXPLAIN — analyse query execution plan
EXPLAIN SELECT * FROM users WHERE email = 'arjun@email.com';
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 1;      -- PostgreSQL

-- ✅ Use LIMIT for large result sets
SELECT * FROM logs ORDER BY created_at DESC LIMIT 100;
```

---

## 37. Common Patterns

### Find Duplicates

```sql
SELECT email, COUNT(*) AS count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
```

### Delete Duplicates (keep lowest id)

```sql
DELETE FROM users
WHERE id NOT IN (
  SELECT MIN(id) FROM users GROUP BY email
);
```

### Nth Highest Value

```sql
-- 3rd highest salary
SELECT DISTINCT salary
FROM employees
ORDER BY salary DESC
LIMIT 1 OFFSET 2;
```

### Running Total

```sql
SELECT
  order_date, amount,
  SUM(amount) OVER (ORDER BY order_date ROWS UNBOUNDED PRECEDING) AS running_total
FROM orders;
```

### Pivot with CASE

```sql
SELECT
  user_id,
  SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) AS pending,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
FROM orders
GROUP BY user_id;
```

---

## 38. Quick Reference

```sql
-- Create
CREATE TABLE t (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL);

-- Insert
INSERT INTO t (name) VALUES ('Arjun');

-- Select
SELECT * FROM t;
SELECT id, name FROM t WHERE id = 1;
SELECT * FROM t ORDER BY name LIMIT 10 OFFSET 0;

-- Update
UPDATE t SET name = 'New' WHERE id = 1;

-- Delete
DELETE FROM t WHERE id = 1;

-- Join
SELECT u.name, p.title FROM users u JOIN posts p ON u.id = p.user_id;

-- Aggregate
SELECT role, COUNT(*) FROM users GROUP BY role HAVING COUNT(*) > 1;

-- Index
CREATE INDEX idx_name ON users(name);

-- Transaction
BEGIN; UPDATE ...; UPDATE ...; COMMIT;

-- View
CREATE VIEW v AS SELECT id, name FROM users WHERE is_active = TRUE;
SELECT * FROM v;

-- Window Function
SELECT name, RANK() OVER (ORDER BY salary DESC) AS rank FROM employees;

-- CTE
WITH cte AS (SELECT * FROM users WHERE is_active = TRUE)
SELECT * FROM cte;
```

---

## 39. Summary

```
DBMS = software to create, manage, and query databases
RDBMS = DBMS that organises data into related tables
SQL = language used to talk to an RDBMS
PostgreSQL = specific RDBMS that uses and extends SQL

Containers (largest to smallest):
  Database → Schema → Table → Row → Column

SQL command types:
  DDL → CREATE, ALTER, DROP, TRUNCATE    (structure)
  DML → INSERT, UPDATE, DELETE           (data)
  DQL → SELECT                           (query)
  TCL → BEGIN, COMMIT, ROLLBACK          (transactions)

Constraints:
  PRIMARY KEY   → unique row identifier
  NOT NULL      → column must have a value
  UNIQUE        → no duplicates allowed
  CHECK         → value must satisfy a condition
  DEFAULT       → fallback value when none provided
  FOREIGN KEY   → links tables, enforces referential integrity

CRUD:
  CREATE → INSERT
  READ   → SELECT
  UPDATE → UPDATE
  DELETE → DELETE

Query execution order:
  FROM → JOIN → WHERE → GROUP BY → HAVING
  → SELECT → DISTINCT → ORDER BY → LIMIT

Operators:
  Relational → = != > < >= <=
  Logical    → AND, OR, NOT
  Special    → BETWEEN, IN, NOT IN, LIKE, IS NULL

Joins:
  INNER JOIN   → matching rows only
  LEFT JOIN    → all left + matching right
  RIGHT JOIN   → all right + matching left
  FULL OUTER   → all rows from both tables
  CROSS JOIN   → every combination (cartesian product)
  SELF JOIN    → table joined with itself

Relationships:
  One-to-One   → UNIQUE FK in child table
  One-to-Many  → FK in child table (no UNIQUE)
  Many-to-Many → junction table with two FKs

Advanced:
  Window Functions → ROW_NUMBER, RANK, LAG, LEAD, SUM OVER
  CTEs             → WITH name AS (query) SELECT ...
  Views            → saved queries as virtual tables
  Materialized     → stored views (refresh manually)
  Indexes          → speed up reads, slow down writes
  Transactions     → atomic groups of statements (ACID)
  Stored Procs     → reusable SQL programs
  Triggers         → auto-run on INSERT/UPDATE/DELETE
```