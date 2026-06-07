# Understanding `package.json`

`package.json` is the **heart of every Node.js project**. It stores metadata about your project, lists all dependencies, and defines scripts you can run.

---

## What is `package.json`?

```
package.json is a JSON file that:
✅ Describes your project (name, version, author)
✅ Lists all dependencies your project needs
✅ Defines scripts (start, test, build...)
✅ Configures tools (eslint, jest, babel...)
✅ Makes your project reproducible anywhere
```

---

## Creating `package.json`

```bash
npm init       # interactive — asks you questions
npm init -y    # instant — fills in defaults automatically
```

---

## A Complete `package.json`

```json
{
  "name": "my-node-app",
  "version": "1.0.0",
  "description": "A simple Node.js application",
  "main": "index.js",
  "scripts": {
    "start":  "node index.js",
    "dev":    "nodemon index.js",
    "test":   "jest",
    "build":  "tsc"
  },
  "keywords": ["node", "express", "api"],
  "author": "Arjun <arjun@email.com>",
  "license": "MIT",
  "dependencies": {
    "express":  "^4.18.2",
    "mongoose": "^7.5.0",
    "dotenv":   "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest":    "^29.6.0",
    "eslint":  "^8.48.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm":  ">=9.0.0"
  }
}
```

---

## Every Field Explained

### `name`
The name of your project. Must be lowercase, no spaces.

```json
"name": "my-node-app"
"name": "my-api-server"
```

Rules:
- All lowercase
- No spaces (use hyphens `-`)
- Must be unique if publishing to npm

---

### `version`
Follows **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`

```json
"version": "1.0.0"
"version": "2.3.1"
```

| Part | When to increment |
|---|---|
| `MAJOR` (1.x.x) | Breaking changes |
| `MINOR` (x.1.x) | New features (backward compatible) |
| `PATCH` (x.x.1) | Bug fixes |

---

### `main`
The **entry point** of your application — the file Node runs first.

```json
"main": "index.js"
"main": "src/app.js"
"main": "dist/index.js"
```

Used when someone does `require('your-package')`.

---

### `scripts`
Custom commands you can run with `npm run`.

```json
"scripts": {
  "start":   "node index.js",
  "dev":     "nodemon index.js",
  "test":    "jest --coverage",
  "build":   "tsc -p tsconfig.json",
  "lint":    "eslint . --ext .js",
  "clean":   "rm -rf dist"
}
```

```bash
npm start         # runs "node index.js"
npm test          # runs "jest --coverage"
npm run dev       # runs "nodemon index.js"
npm run build     # runs "tsc -p tsconfig.json"
npm run lint      # runs eslint
```

> `start` and `test` are special — they don't need `run`.
> All other scripts need `npm run scriptname`.

---

### `dependencies`
Packages your app **needs in production**.

```json
"dependencies": {
  "express":  "^4.18.2",
  "mongoose": "^7.5.0",
  "dotenv":   "^16.3.1",
  "axios":    "^1.5.0"
}
```

Install with:
```bash
npm install express      # auto-added to dependencies
```

---

### `devDependencies`
Packages only needed **during development**.

```json
"devDependencies": {
  "nodemon": "^3.0.1",
  "jest":    "^29.6.0",
  "eslint":  "^8.48.0"
}
```

Install with:
```bash
npm install nodemon --save-dev
npm install -D jest
```

> These are NOT installed when running `npm install --production`

---

### `keywords`
Array of strings to help people **find your package** on npm.

```json
"keywords": ["api", "rest", "express", "nodejs"]
```

---

### `author`
The creator of the package.

```json
"author": "Arjun"
"author": "Arjun <arjun@email.com>"
"author": {
  "name":  "Arjun",
  "email": "arjun@email.com",
  "url":   "https://arjun.dev"
}
```

---

### `license`
How others can use your code.

```json
"license": "MIT"       // free to use, open source
"license": "ISC"       // similar to MIT
"license": "UNLICENSED" // private, no sharing
```

---

### `engines`
Specify which Node/npm versions your app supports.

```json
"engines": {
  "node": ">=18.0.0",
  "npm":  ">=9.0.0"
}
```

---

### `private`
Prevents accidental publishing to npm.

```json
"private": true
```

---

## Version Symbols Explained

When you see versions in `dependencies`, the symbols matter:

```json
"dependencies": {
  "express": "^4.18.2",
  "lodash":  "~4.17.21",
  "dotenv":  "16.3.1"
}
```

| Symbol | Meaning | Example |
|---|---|---|
| `^` (caret) | Allow minor + patch updates | `^4.18.2` → any `4.x.x` |
| `~` (tilde) | Allow patch updates only | `~4.17.21` → any `4.17.x` |
| No symbol | Exact version only | `16.3.1` → only `16.3.1` |
| `*` | Any version | `*` → latest |
| `>=4.0.0` | Greater than or equal | any version ≥ 4.0.0 |

```json
"express": "^4.18.2"
// Installs: 4.18.2, 4.19.0, 4.20.0 ✅
// Won't install: 5.0.0 ❌ (major change)

"lodash": "~4.17.21"
// Installs: 4.17.21, 4.17.22 ✅
// Won't install: 4.18.0 ❌ (minor change)

"dotenv": "16.3.1"
// Installs: ONLY 16.3.1 ✅
```

---

## Scripts — Advanced Usage

### Chaining commands
```json
"scripts": {
  "build":      "npm run clean && npm run compile",
  "clean":      "rm -rf dist",
  "compile":    "tsc"
}
```

### Pre and Post hooks
```json
"scripts": {
  "prestart":  "echo 'Before start'",
  "start":     "node index.js",
  "poststart": "echo 'After start'"
}
```

```bash
npm start
# Output:
# Before start
# (server starts)
# After start
```

### Passing arguments
```bash
npm run test -- --watch       # passes --watch to jest
npm run lint -- --fix         # passes --fix to eslint
```

---

## `dependencies` vs `devDependencies`

```
dependencies:
  → Needed to RUN the app
  → Installed in production
  → Example: express, mongoose, dotenv

devDependencies:
  → Needed to BUILD / TEST the app
  → NOT installed in production
  → Example: nodemon, jest, eslint, typescript
```

```bash
# Install only production deps (for deployment)
npm install --production
NODE_ENV=production npm install
```

---

## Real Project Example

```json
{
  "name": "rest-api",
  "version": "1.0.0",
  "description": "A REST API built with Express and MongoDB",
  "main": "src/index.js",
  "private": true,
  "scripts": {
    "start":   "node src/index.js",
    "dev":     "nodemon src/index.js",
    "test":    "jest --coverage",
    "lint":    "eslint src/",
    "build":   "echo No build step needed"
  },
  "dependencies": {
    "express":        "^4.18.2",
    "mongoose":       "^7.5.0",
    "dotenv":         "^16.3.1",
    "bcrypt":         "^5.1.1",
    "jsonwebtoken":   "^9.0.2",
    "cors":           "^2.8.5"
  },
  "devDependencies": {
    "nodemon":        "^3.0.1",
    "jest":           "^29.6.0",
    "supertest":      "^6.3.3",
    "eslint":         "^8.48.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "author": "Arjun <arjun@email.com>",
  "license": "MIT"
}
```

---

## Summary

```
package.json = the project's identity card + instruction manual

Key fields:
name          → project name
version       → current version (SemVer)
main          → entry point file
scripts       → runnable commands
dependencies  → needed in production
devDependencies → needed only in development
engines       → required Node/npm version
private       → prevent accidental npm publish

Version symbols:
^  → allow minor + patch updates
~  → allow patch updates only
   → exact version (no symbol)

Commands:
npm init -y         → create package.json
npm install         → install all dependencies
npm run <script>    → run a script
```