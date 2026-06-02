# `import.meta` in Node.js

`import.meta` is a special object available in **ES Modules (ESM)** that provides metadata about the current module. It is the ESM equivalent of `__filename` and `__dirname` in CommonJS.

---

## Basic Syntax

```js
console.log(import.meta);
// [Object: null prototype] {
//   url: 'file:///home/user/project/app.js'
// }
```

> `import.meta` is only available in ES Modules (`.mjs` files or `"type": "module"` in package.json).
> Using it in CommonJS will throw a **SyntaxError**.

---

## Properties of `import.meta`

### 1. `import.meta.url`
The **full URL** of the current module file.

```js
// app.js
console.log(import.meta.url);
// file:///home/user/project/app.js
```

It always starts with `file://` for local files.

---

### 2. `import.meta.filename` *(Node.js v21.2+)*
The **full absolute path** of the current file — like `__filename` in CommonJS.

```js
console.log(import.meta.filename);
// /home/user/project/app.js
```

---

### 3. `import.meta.dirname` *(Node.js v21.2+)*
The **directory path** of the current file — like `__dirname` in CommonJS.

```js
console.log(import.meta.dirname);
// /home/user/project
```

---

### 4. `import.meta.resolve()`
Resolves a module specifier to a full URL relative to the current file.

```js
const resolvedPath = import.meta.resolve('./math.js');
console.log(resolvedPath);
// file:///home/user/project/math.js

const resolvedPkg = import.meta.resolve('express');
console.log(resolvedPkg);
// file:///home/user/project/node_modules/express/index.js
```

---

## Recreating `__filename` and `__dirname`

Before Node v21.2, `import.meta` didn't have `filename` and `dirname`. Here's the classic workaround:

```js
import { fileURLToPath } from 'url';
import { dirname }       from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

console.log(__filename); // /home/user/project/app.js
console.log(__dirname);  // /home/user/project
```

### Step-by-step breakdown:
```js
// Step 1: import.meta.url gives you the file URL
console.log(import.meta.url);
// file:///home/user/project/app.js

// Step 2: fileURLToPath converts URL → file path
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
// /home/user/project/app.js

// Step 3: dirname extracts the folder
import { dirname } from 'path';
const __dirname = dirname(__filename);
// /home/user/project
```

---

## Using `__dirname` for File Paths in ESM

```js
import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';
import { readFileSync }   from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// Safely join paths
const dataPath = join(__dirname, 'data', 'file.txt');
const content  = readFileSync(dataPath, 'utf8');

console.log(content);
```

---

## Node.js Version Comparison

| Feature | Node Version | Example |
|---|---|---|
| `import.meta.url` | v12+ | `file:///home/user/app.js` |
| `import.meta.resolve()` | v20.6+ | resolves module paths |
| `import.meta.filename` | v21.2+ | `/home/user/app.js` |
| `import.meta.dirname` | v21.2+ | `/home/user` |

---

## `import.meta` vs CommonJS Variables

| CommonJS | ESM (`import.meta`) |
|---|---|
| `__filename` | `import.meta.filename` (v21.2+) or workaround |
| `__dirname` | `import.meta.dirname` (v21.2+) or workaround |
| `require` | `import` statement |
| `module.url` | `import.meta.url` |

---

## Real World Example

```js
// server.js (ESM)
import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';
import { readFileSync }   from 'fs';
import express            from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app  = express();
const port = 3000;

// Serve static files relative to current directory
app.use(express.static(join(__dirname, 'public')));

// Read config file relative to current directory
const config = JSON.parse(
  readFileSync(join(__dirname, 'config.json'), 'utf8')
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Serving from: ${__dirname}`);
  console.log(`Module URL  : ${import.meta.url}`);
});
```

---

## Common Mistakes

### ❌ Using `import.meta` in CommonJS
```js
// app.js (CommonJS — no "type":"module")
console.log(import.meta.url); // SyntaxError!
```

### ✅ Fix — use in ESM only
```js
// app.mjs OR package.json has "type": "module"
console.log(import.meta.url); // works!
```

### ❌ Forgetting `file://` prefix
```js
// import.meta.url is a URL, not a plain path
const url = import.meta.url;
// file:///home/user/project/app.js

// You can't use this directly as a file path
const fs = require('fs');
fs.readFileSync(url); // ❌ Error!

// ✅ Convert it first
import { fileURLToPath } from 'url';
fs.readFileSync(fileURLToPath(url)); // ✅
```

---

## Summary

```
import.meta         → metadata object for current ES module

Properties:
import.meta.url       → full file:// URL of current file
import.meta.filename  → full file path (Node v21.2+)
import.meta.dirname   → directory path (Node v21.2+)
import.meta.resolve() → resolve module path to full URL

Workaround for older Node:
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

Only works in ES Modules — not in CommonJS!
```