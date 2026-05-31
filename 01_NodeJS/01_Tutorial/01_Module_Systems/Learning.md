# Module Systems in Node.js

Node.js has **2 module systems**:

```
┌─────────────────────────────────────────────┐
│           Node.js Module Systems            │
├─────────────────────┬───────────────────────┤
│   CommonJS (CJS)    │   ES Modules (ESM)    │
│   (Traditional)     │      (Modern)         │
│   require()         │      import/export    │
│   Default in Node   │   Needs configuration │
└─────────────────────┴───────────────────────┘
```

---

## 1. CommonJS (CJS) — The Default

The original Node.js module system. Uses `require()` and `module.exports`.

### Basic Syntax

```js
// ── Exporting ──────────────────────────
// math.js
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }

module.exports = { add, subtract };


// ── Importing ──────────────────────────
// index.js
const { add, subtract } = require('./math');

console.log(add(10, 5));      // 15
console.log(subtract(10, 5)); // 5
```

### All Export Styles

```js
// 1. Export multiple things
module.exports = { add, subtract };

// 2. Export single function
module.exports = function(x) { return x * 2; };

// 3. Export a class
module.exports = class Animal { ... };

// 4. Add exports one by one
exports.add      = (a, b) => a + b;
exports.subtract = (a, b) => a - b;
```

### Key Characteristics

```
✅ Default in Node.js — works out of the box
✅ Synchronous loading — simple and predictable
✅ Cached — each file loaded only once
✅ Dynamic — require() can be used anywhere in code
❌ Not supported in browsers natively
```

---

## 2. ES Modules (ESM) — The Modern Way

The official JavaScript standard. Uses `import` and `export`. Introduced in Node.js 12+.

### How to Enable ESM

**Option A — Rename file to `.mjs`:**
```
math.mjs
index.mjs
```

**Option B — Add to `package.json`:**
```json
{
  "name": "my-app",
  "type": "module"
}
```

### Basic Syntax

```js
// ── Exporting ──────────────────────────
// math.js
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }


// ── Importing ──────────────────────────
// index.js
import { add, subtract } from './math.js'; // .js extension required!

console.log(add(10, 5));      // 15
console.log(subtract(10, 5)); // 5
```

---

### All Export Styles in ESM

#### Named Exports

```js
// utils.js — export multiple named things
export const PI = 3.14159;
export function square(x) { return x * x; }
export class Circle {
  constructor(r) { this.r = r; }
  area() { return PI * this.r * this.r; }
}
```

```js
// index.js — import by exact name
import { PI, square, Circle } from './utils.js';

console.log(PI);          // 3.14159
console.log(square(4));   // 16

const c = new Circle(5);
console.log(c.area());    // 78.53...
```

#### Default Export

```js
// logger.js — one default export per file
export default function log(msg) {
  console.log(`[LOG]: ${msg}`);
}
```

```js
// index.js — import with ANY name you like
import log from './logger.js';
import printMessage from './logger.js'; // also valid

log('Server started!');
```

#### Rename on Export / Import

```js
// math.js
export { add as addition, subtract as minus };
```

```js
// index.js
import { addition, minus } from './math.js';

// OR rename on import side
import { add as sum } from './math.js';
```

#### Export Everything at Once

```js
// math.js
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }

export { add, subtract, multiply };
```

#### Import Everything as One Object

```js
import * as Math from './math.js';

console.log(Math.add(2, 3));       // 5
console.log(Math.subtract(10, 4)); // 6
console.log(Math.multiply(3, 3));  // 9
```

#### Mix Default + Named Exports

```js
// user.js
export default class User {
  constructor(name) { this.name = name; }
}

export const MAX_USERS = 100;
export function createUser(name) { return new User(name); }
```

```js
// index.js
import User, { MAX_USERS, createUser } from './user.js';

const u = createUser('Arjun');
console.log(u.name);     // Arjun
console.log(MAX_USERS);  // 100
```

### Dynamic Import (Lazy Loading)

Load a module **only when needed** — great for performance:

```js
// index.js
async function loadMath() {
  const math = await import('./math.js'); // loads on demand
  console.log(math.add(5, 3)); // 8
}

loadMath();
```

---

## CJS vs ESM — Full Comparison

| Feature | CommonJS | ES Modules |
|---|---|---|
| Syntax | `require()` / `module.exports` | `import` / `export` |
| File extension | `.js` | `.mjs` or `.js` with config |
| Loading type | **Synchronous** | **Asynchronous** |
| Default in Node | ✅ Yes | ❌ Needs setup |
| Works in browser | ❌ No | ✅ Yes |
| Dynamic imports | ✅ `require()` anywhere | ✅ `import()` function |
| Top-level `await` | ❌ No | ✅ Yes |
| Tree shaking | ❌ No | ✅ Yes |
| `__dirname` / `__filename` | ✅ Available | ❌ Not available (workaround needed) |

---

### `__dirname` workaround in ESM

```js
// ESM doesn't have __dirname, but you can recreate it:
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

console.log(__dirname); // works like before
```

---

## Can You Mix Both?

**CJS can import CJS** ✅
```js
const math = require('./math'); // both CJS — works fine
```

**ESM can import CJS** ✅
```js
import math from './math.cjs'; // ESM importing CJS — works
```

**CJS cannot `require()` ESM** ❌
```js
const math = require('./math.mjs'); // ERROR!
// Use dynamic import instead:
const math = await import('./math.mjs'); // ✅
```

---

## Which One Should You Use?

```
Building a backend API?        → CommonJS (safer, widely supported)
Building a modern app/library? → ES Modules (future standard)
Using TypeScript?              → ES Modules (TypeScript prefers ESM)
Working with React/Vue/Vite?   → ES Modules (frontend ecosystem)
Beginner just learning Node?   → Start with CommonJS
```

---

## Real Project Example — ESM

```
project/
├── package.json      ← "type": "module"
├── index.js
├── math.js
└── config.js
```

```js
// config.js
export const PORT     = 3000;
export const APP_NAME = 'MyApp';
```

```js
// math.js
export const add      = (a, b) => a + b;
export const multiply = (a, b) => a * b;
```

```js
// index.js
import { PORT, APP_NAME } from './config.js';
import { add, multiply }  from './math.js';

console.log(`${APP_NAME} running on port ${PORT}`);
console.log(`5 + 3  = ${add(5, 3)}`);
console.log(`5 x 3  = ${multiply(5, 3)}`);
```

**Output:**
```
MyApp running on port 3000
5 + 3  = 8
5 x 3  = 15
```

---

## Summary

```
CommonJS  → require() / module.exports → Default → Synchronous
ES Modules → import / export           → Modern  → Asynchronous

For beginners    → CommonJS
For modern apps  → ES Modules
```