# CommonJS vs ES6 Modules (ESM)

Node.js supports two module systems. Here is a complete breakdown of every difference between them.

---

## Quick Overview

| | CommonJS (CJS) | ES6 Modules (ESM) |
|---|---|---|
| Syntax | `require` / `module.exports` | `import` / `export` |
| Default in Node | ✅ Yes | ❌ Needs config |
| Loading | Synchronous | Asynchronous |
| Works in browser | ❌ No | ✅ Yes |
| `__dirname` | ✅ Available | ❌ Use workaround |
| Top-level `await` | ❌ No | ✅ Yes |
| Tree shaking | ❌ No | ✅ Yes |

---

## 1. Syntax

### CommonJS
```js
// Exporting
module.exports = { add, subtract };
exports.add = (a, b) => a + b;

// Importing
const math            = require('./math');
const { add }         = require('./math');
const fs              = require('fs');
```

### ES6 Modules
```js
// Exporting
export function add(a, b) { return a + b; }
export default class User { ... }
export { add, subtract };

// Importing
import math           from './math.js';
import { add }        from './math.js';
import * as Math      from './math.js';
import fs             from 'fs';
```

---

## 2. How to Enable

### CommonJS
Works by default — no setup needed.

```js
// Just use require() and it works
const fs = require('fs');
```

### ES6 Modules
Requires one of these:

```json
// Option A — package.json
{
  "type": "module"
}
```

```
// Option B — use .mjs extension
app.mjs
math.mjs
```

```bash
# Option C — run with flag
node --input-type=module app.js
```

---

## 3. Loading — Sync vs Async

### CommonJS — Synchronous
Modules load **one by one**, blocking execution until done.

```js
// Loads immediately, blocks until done
const fs   = require('fs');   // waits
const path = require('path'); // then this
const math = require('./math'); // then this

console.log('All loaded!');
```

```
Timeline:
──► load fs ──► load path ──► load math ──► continue
```

### ES6 Modules — Asynchronous
Modules are **parsed and loaded in parallel** before execution.

```js
// All imports are hoisted and loaded in parallel
import fs   from 'fs';
import path from 'path';
import math from './math.js';

console.log('All loaded!');
```

```
Timeline:
──► parse all imports
    ├── load fs
    ├── load path       (parallel)
    └── load math
──► execute code
```

---

## 4. Static vs Dynamic

### CommonJS — Dynamic
`require()` can be called **anywhere** in the code — inside functions, loops, conditionals.

```js
// ✅ require() anywhere
if (process.env.NODE_ENV === 'development') {
  const logger = require('./logger');
  logger.debug('Dev mode');
}

function loadPlugin(name) {
  return require(`./plugins/${name}`); // dynamic path ✅
}

for (let i = 0; i < plugins.length; i++) {
  require(plugins[i]); // inside loop ✅
}
```

### ES6 Modules — Static
`import` must be at the **top level** — not inside functions or conditions.

```js
// ❌ These will throw SyntaxError
if (condition) {
  import math from './math.js'; // ERROR!
}

function load() {
  import fs from 'fs'; // ERROR!
}
```

```js
// ✅ Must be at top level
import math from './math.js';
import fs   from 'fs';

// ✅ Dynamic import() function works anywhere
async function loadPlugin(name) {
  const plugin = await import(`./plugins/${name}.js`);
  return plugin;
}
```

---

## 5. `__filename` and `__dirname`

### CommonJS — Built-in ✅
```js
console.log(__filename); // /home/user/project/app.js
console.log(__dirname);  // /home/user/project
```

### ES6 Modules — Not Available ❌
```js
console.log(__filename); // ReferenceError!
console.log(__dirname);  // ReferenceError!
```

```js
// ✅ Workaround using import.meta
import { fileURLToPath } from 'url';
import { dirname }       from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

console.log(__filename); // /home/user/project/app.js
console.log(__dirname);  // /home/user/project
```

Or use Node v21.2+ shorthand:
```js
console.log(import.meta.filename); // /home/user/project/app.js
console.log(import.meta.dirname);  // /home/user/project
```

---

## 6. Top-level `await`

### CommonJS — Not Supported ❌
```js
// ❌ SyntaxError in CommonJS
const data = await fetchData();
```

```js
// ✅ Must wrap in async function
async function main() {
  const data = await fetchData();
  console.log(data);
}
main();
```

### ES6 Modules — Supported ✅
```js
// ✅ Works at top level in ESM
const data = await fetchData();
console.log(data);
```

---

## 7. Named vs Default Exports

### CommonJS
```js
// Only one export style — module.exports
module.exports = { add, subtract };       // object
module.exports = function greet() { ... } // function
module.exports = class User { ... }       // class
```

```js
// Importing
const math   = require('./math');
const { add } = require('./math');
```

### ES6 Modules
```js
// Named exports
export function add(a, b)      { return a + b; }
export function subtract(a, b) { return a - b; }
export const PI = 3.14;

// Default export
export default class User {
  constructor(name) { this.name = name; }
}
```

```js
// Importing named
import { add, subtract, PI } from './math.js';

// Importing default
import User from './User.js';

// Importing both
import User, { PI } from './user.js';

// Import all as namespace
import * as Math from './math.js';
Math.add(2, 3);
```

---

## 8. Tree Shaking

### CommonJS — No Tree Shaking ❌
Bundlers can't easily remove unused code because `require()` is dynamic.

```js
const _ = require('lodash'); // entire lodash loaded
_.add(1, 2);                 // even unused parts loaded
```

### ES6 Modules — Tree Shaking ✅
Bundlers (Webpack, Rollup, Vite) can remove unused exports at build time.

```js
import { add } from 'lodash-es'; // ONLY add is bundled
// unused functions are removed from final bundle
```

---

## 9. Circular Dependencies

### CommonJS
Returns a **partially loaded** module (no error, but may be empty `{}`).

```js
// a.js
const b = require('./b');
console.log('a:', b.name); // may be undefined

module.exports = { name: 'A' };

// b.js
const a = require('./a');
console.log('b:', a.name); // may be undefined

module.exports = { name: 'B' };
```

### ES6 Modules
Handles circular dependencies **better** using live bindings — values update when they're set.

```js
// a.js
import { name } from './b.js';
export const nameA = 'A';

// b.js
import { nameA } from './a.js';
export const name = 'B';
```

---

## 10. `this` at Top Level

### CommonJS
`this` at the top level refers to `module.exports`.

```js
console.log(this === module.exports); // true
console.log(this);                    // {}
```

### ES6 Modules
`this` at the top level is `undefined`.

```js
console.log(this); // undefined
```

---

## 11. File Extensions

### CommonJS
```js
require('./math');       // ✅ .js extension optional
require('./math.js');    // ✅ works
require('./data.json');  // ✅ JSON auto-parsed
```

### ES6 Modules
```js
import math from './math.js';  // ✅ extension required!
import math from './math';     // ❌ may fail in Node
```

---

## 12. Interoperability (Mixing Both)

```js
// ✅ CJS can require CJS
const math = require('./math'); // both CommonJS

// ✅ ESM can import CJS
import math from './math.cjs';

// ✅ ESM can dynamic import CJS
const math = await import('./math.cjs');

// ❌ CJS cannot require ESM
const math = require('./math.mjs'); // ERR_REQUIRE_ESM!

// ✅ CJS can dynamic import ESM
async function load() {
  const math = await import('./math.mjs'); // works!
}
```

---

## Side-by-Side Code Example

### CommonJS version
```js
// math.js
function add(a, b)      { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }

module.exports = { add, subtract, multiply };

// index.js
const { add, subtract, multiply } = require('./math');
const path = require('path');

console.log(__dirname);
console.log(add(5, 3));       // 8
console.log(subtract(5, 3));  // 2
console.log(multiply(5, 3));  // 15
```

### ES6 Modules version
```js
// math.js
export function add(a, b)      { return a + b; }
export function subtract(a, b) { return a - b; }
export function multiply(a, b) { return a * b; }

// index.js
import { add, subtract, multiply } from './math.js';
import { fileURLToPath } from 'url';
import { dirname }       from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log(__dirname);
console.log(add(5, 3));       // 8
console.log(subtract(5, 3));  // 2
console.log(multiply(5, 3));  // 15
```

---

## When to Use Which?

```
Use CommonJS when:
✅ Building a Node.js backend / API
✅ Working on older codebases
✅ Using packages that don't support ESM yet
✅ You're a beginner just learning Node

Use ES Modules when:
✅ Building modern apps or libraries
✅ Sharing code between Node and browser
✅ Using TypeScript (prefers ESM)
✅ Working with Vite, Rollup, or modern bundlers
✅ You need top-level await
✅ You want tree shaking for smaller bundles
```

---

## Full Difference Table

| Feature | CommonJS | ES6 Modules |
|---|---|---|
| Syntax | `require` / `module.exports` | `import` / `export` |
| File extension | `.js` (default) | `.mjs` or `"type":"module"` |
| Loading | Synchronous | Asynchronous |
| Default in Node | ✅ Yes | ❌ Needs config |
| Works in browser | ❌ No | ✅ Yes |
| `__dirname` | ✅ Built-in | ❌ Workaround needed |
| `__filename` | ✅ Built-in | ❌ Workaround needed |
| Top-level `await` | ❌ No | ✅ Yes |
| Tree shaking | ❌ No | ✅ Yes |
| Dynamic `require` | ✅ Anywhere | ❌ Use `import()` |
| Static analysis | ❌ Hard | ✅ Easy |
| `this` at top level | `module.exports` | `undefined` |
| JSON import | ✅ Auto-parsed | ⚠️ Needs assertion |
| Circular deps | Partial object | Live bindings |
| Can import CJS | ✅ Yes | ✅ Yes |
| Can import ESM | ❌ (use dynamic) | ✅ Yes |

---

## Summary

```
CommonJS  → Traditional, default, synchronous, dynamic
           require() / module.exports
           Best for: Node backends, older projects

ES Modules → Modern, standard, asynchronous, static
            import / export
            Best for: Modern apps, libraries, browser+Node sharing

Key differences:
1. Syntax         → require vs import
2. Loading        → sync vs async
3. Where to use   → top-level only for import
4. __dirname      → built-in vs workaround
5. Top-level await → ❌ vs ✅
6. Tree shaking   → ❌ vs ✅
7. Browser support → ❌ vs ✅
```