# Library vs CLI Packages + Local vs Global Packages

Understanding the difference between these helps you install and use npm packages correctly every time.

---

## Part 1 — Library vs CLI Packages

npm packages fall into two categories based on **how they are used**:

```
┌──────────────────────────────────────────────┐
│              npm Packages                    │
├───────────────────────┬──────────────────────┤
│   Library Packages    │    CLI Packages       │
│  (used in your code)  │  (used in terminal)  │
└───────────────────────┴──────────────────────┘
```

---

### 📚 Library Packages

Packages you **import into your code** using `require()` or `import`. They provide functions, classes, or utilities your application uses at runtime.

#### How to install
```bash
npm install express
npm install lodash
npm install axios
```

#### How to use
```js
// You import them in your code
const express = require('express');
const _       = require('lodash');
const axios   = require('axios');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello!');
});
```

#### Examples of Library Packages

| Package | What it provides |
|---|---|
| `express` | Web server framework |
| `mongoose` | MongoDB database ODM |
| `axios` | HTTP requests |
| `lodash` | Utility functions (arrays, objects) |
| `dotenv` | Load environment variables |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT tokens |
| `cors` | CORS middleware |
| `socket.io` | Real-time websockets |
| `react` | UI component library |

#### Key characteristics
```
✅ Imported with require() or import
✅ Used inside your application code
✅ Installed locally in node_modules/
✅ Listed in package.json dependencies
❌ Not meant to be run directly in terminal
```

---

### 🖥️ CLI Packages (Command Line Interface)

Packages that provide a **terminal command** you run directly. They don't get imported into your code — they run as standalone tools.

#### How to install
```bash
npm install -g nodemon          # global (most common for CLI)
npm install -g typescript
npm install -g @angular/cli
```

#### How to use
```bash
# You run them as commands in the terminal
nodemon index.js
tsc --init
ng new my-app
create-react-app my-app
```

#### Examples of CLI Packages

| Package | Terminal Command | What it does |
|---|---|---|
| `nodemon` | `nodemon index.js` | Auto-restarts server on file change |
| `typescript` | `tsc` | Compiles TypeScript to JavaScript |
| `@angular/cli` | `ng new app` | Creates Angular projects |
| `create-react-app` | `npx create-react-app` | Creates React projects |
| `eslint` | `eslint .` | Lints your code |
| `prettier` | `prettier --write .` | Formats your code |
| `http-server` | `http-server` | Quick static file server |
| `pm2` | `pm2 start app.js` | Production process manager |
| `jest` | `jest` | Runs tests |

#### Key characteristics
```
✅ Run directly in the terminal as a command
✅ Usually installed globally (-g)
✅ Don't need to be required() in code
✅ Add an executable to your system PATH
❌ Not imported inside application code
```

---

### Some Packages Are Both

Some packages work as **both a library and a CLI tool**:

```bash
# jest — CLI tool
jest                         # run tests in terminal

# jest — also a library
const { expect } = require('jest'); // use in code
```

```bash
# eslint — CLI tool
eslint .                     # lint from terminal

# eslint — also a library
const { ESLint } = require('eslint'); // use in code
```

---

## Part 2 — Local vs Global Packages

This is about **where** the package is installed on your machine.

```
┌──────────────────────────────────────────────┐
│           Installation Scope                 │
├───────────────────────┬──────────────────────┤
│    Local Package      │    Global Package    │
│  (per project)        │   (entire system)    │
└───────────────────────┴──────────────────────┘
```

---

### 📁 Local Packages

Installed **inside your project folder** in `node_modules/`. Only available to that specific project.

#### How to install
```bash
npm install express         # local (default)
npm install -D nodemon      # local dev dependency
```

#### Where it goes
```
my-project/
├── node_modules/
│   ├── express/         ← installed here
│   └── lodash/
├── package.json
└── index.js
```

#### How to use
```js
// Only works inside this project
const express = require('express');
```

#### Key characteristics
```
✅ Project-specific — doesn't affect other projects
✅ Listed in package.json
✅ Installed in node_modules/
✅ Different projects can use different versions
✅ Deleted when you delete the project
❌ Not available as a terminal command (by default)
```

---

### 🌍 Global Packages

Installed **system-wide** on your machine. Available in the terminal from any folder.

#### How to install
```bash
npm install -g nodemon
npm install -g typescript
npm install -g http-server
npm install --global pm2     # --global is same as -g
```

#### Where it goes
```bash
# Linux / Mac
/usr/local/lib/node_modules/nodemon/

# Windows
C:\Users\<user>\AppData\Roaming\npm\node_modules\nodemon\
```

#### How to use
```bash
# Available anywhere in your terminal
cd ~/Desktop
nodemon app.js       # works!

cd /any/other/folder
nodemon server.js    # still works!
```

#### Key characteristics
```
✅ Available as terminal command anywhere
✅ Great for tools you use across all projects
✅ Only one version installed system-wide
❌ Not listed in package.json
❌ Can cause version conflicts between projects
❌ Other developers must install it separately
```

---

### Local vs Global — Side by Side

| | Local | Global |
|---|---|---|
| Install command | `npm install pkg` | `npm install -g pkg` |
| Install location | `./node_modules/` | system-wide folder |
| Listed in `package.json` | ✅ Yes | ❌ No |
| Available in terminal | ❌ No (without npx) | ✅ Yes |
| Use in code (`require`) | ✅ Yes | ❌ Not directly |
| Per-project versions | ✅ Yes | ❌ One version only |
| Best for | Libraries, frameworks | CLI tools |

---

### Listing Installed Packages

```bash
# List local packages
npm list --depth=0

# List global packages
npm list -g --depth=0
```

---

### Running Local CLI Tools

Even locally installed CLI tools can be run using `npx` or via `package.json` scripts:

```bash
# Without npx (doesn't work)
nodemon index.js     # ❌ command not found (if not global)

# With npx (works for local packages)
npx nodemon index.js # ✅ runs local version

# Via package.json script (best practice)
```

```json
"scripts": {
  "dev": "nodemon index.js"   // ✅ npm run dev works!
}
```

> npm scripts automatically look inside `node_modules/.bin/` for locally installed CLI tools.

---

## Combining Everything — Decision Guide

```
What kind of package is it?
│
├── Library (used in code with require/import)?
│   └── Install LOCALLY
│       npm install express
│
├── CLI tool (run in terminal)?
│   │
│   ├── Used only in this project?
│   │   └── Install LOCALLY + use via npm scripts
│   │       npm install -D nodemon
│   │       (add "dev": "nodemon" to scripts)
│   │
│   └── Used across ALL projects?
│       └── Install GLOBALLY
│           npm install -g typescript
│           npm install -g pm2
```

---

## Real Project Example

```bash
# Libraries → local
npm install express mongoose dotenv bcrypt jsonwebtoken

# Dev tools → local dev dependency
npm install -D nodemon jest eslint

# System-wide tools → global
npm install -g typescript
npm install -g pm2
```

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev":   "nodemon src/index.js",
    "test":  "jest",
    "lint":  "eslint src/"
  },
  "dependencies": {
    "express":      "^4.18.2",
    "mongoose":     "^7.5.0",
    "dotenv":       "^16.3.1",
    "bcrypt":       "^5.1.1",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest":    "^29.6.0",
    "eslint":  "^8.48.0"
  }
}
```

---

## Summary

```
LIBRARY vs CLI:
  Library  → require() in code  → express, axios, lodash
  CLI      → run in terminal    → nodemon, tsc, eslint

LOCAL vs GLOBAL:
  Local    → npm install pkg    → in node_modules/, in package.json
  Global   → npm install -g pkg → system-wide, terminal command

Best practices:
  Libraries          → always local
  Project CLI tools  → local + npm scripts
  System CLI tools   → global
  Never install libraries globally!
```