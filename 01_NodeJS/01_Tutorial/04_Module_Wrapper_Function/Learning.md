# Module Wrapper in Node.js

Before Node.js executes any file, it **secretly wraps your code** inside a function. This is called the **Module Wrapper**.

---

## What is the Module Wrapper?

```js
// What you write:
const x = 10;
console.log(x);

// What Node.js actually runs:
(function(exports, require, module, __filename, __dirname) {
  const x = 10;
  console.log(x);
});
```

Node wraps every file in this **Immediately Invoked Function Expression (IIFE)** before running it.

---

## The Full Wrapper Function

```js
(function(exports, require, module, __filename, __dirname) {
  // ─────────────────────────────────────────
  //         YOUR FILE CODE RUNS HERE
  // ─────────────────────────────────────────
});
```

It receives **5 parameters** automatically:

| Parameter | Type | What it is |
|---|---|---|
| `exports` | Object | Shorthand for `module.exports` |
| `require` | Function | Import other modules |
| `module` | Object | Current module object |
| `__filename` | String | Full path of current file |
| `__dirname` | String | Directory of current file |

---

## Why Does Node Do This?

### 1. Keeps Variables Private (Scope Isolation)

Without the wrapper, every variable would be global:

```js
// Without wrapper — DANGEROUS
var name = 'Arjun'; // becomes global!
var age  = 25;      // becomes global!
```

```js
// With wrapper — SAFE
(function(exports, require, module, __filename, __dirname) {
  var name = 'Arjun'; // scoped to THIS file only
  var age  = 25;      // scoped to THIS file only
});
```

Two files can have the same variable names without conflict:

```js
// file1.js
var name = 'Arjun'; // stays in file1

// file2.js
var name = 'Kerala'; // stays in file2 — no conflict!
```

### 2. Provides Module-Specific Variables

These 5 variables are **specific to each file** — they can't be global:

```js
// app.js
console.log(__filename);
// /home/user/project/app.js

console.log(__dirname);
// /home/user/project

console.log(module.id);
// .

// math.js
console.log(__filename);
// /home/user/project/math.js  ← different!

console.log(__dirname);
// /home/user/project
```

Each file gets its **own** `module`, `exports`, `__filename`, `__dirname`.

### 3. Makes `require` Available Everywhere

You never import `require` — it just works. That's because it's **injected** via the wrapper:

```js
// You never do this:
import require from 'somewhere'; // ❌ not needed

// require just works because of the wrapper:
const fs = require('fs'); // ✅ injected automatically
```

---

## Seeing the Wrapper in Action

You can actually see Node's wrapper using:

```js
const Module = require('module');
console.log(Module.wrapper);
```

**Output:**
```js
[
  '(function(exports, require, module, __filename, __dirname) { ',
  '\n});'
]
```

---

## How Each Parameter Works

### `exports`
```js
(function(exports, ...) {
  // exports is pre-set to module.exports = {}
  exports.greet = function(name) {
    return `Hello, ${name}!`;
  };
});
```

### `require`
```js
(function(exports, require, ...) {
  // require is a function injected by Node
  const fs   = require('fs');
  const path = require('path');
  const math = require('./math');
});
```

### `module`
```js
(function(exports, require, module, ...) {
  // module represents this file
  console.log(module.id);        // file id
  console.log(module.loaded);    // false (still loading)
  console.log(module.filename);  // full file path

  module.exports = { add: (a, b) => a + b };
});
```

### `__filename`
```js
(function(exports, require, module, __filename, ...) {
  console.log(__filename);
  // /home/user/project/app.js
});
```

### `__dirname`
```js
(function(exports, require, module, __filename, __dirname) {
  console.log(__dirname);
  // /home/user/project

  // Commonly used with path.join:
  const path = require('path');
  const filePath = path.join(__dirname, 'data', 'file.txt');
  // /home/user/project/data/file.txt
});
```

---

## The Full Lifecycle

```
┌─────────────────────────────────────────────────────┐
│                  Node.js Lifecycle                  │
│                                                     │
│  1. You run:  node app.js                           │
│                    │                                │
│  2. Node reads app.js file                          │
│                    │                                │
│  3. Node WRAPS your code:                           │
│     (function(exports, require,                     │
│       module, __filename, __dirname) {              │
│         // your code                                │
│     });                                             │
│                    │                                │
│  4. Node CALLS the wrapper with arguments:          │
│     wrapper(exports, require, module,               │
│             filename, dirname)                      │
│                    │                                │
│  5. Your code runs inside the wrapper               │
│                    │                                │
│  6. module.exports is returned to require()         │
└─────────────────────────────────────────────────────┘
```

---

## Proof That Wrapper Exists

```js
// Try accessing arguments inside any .js file:
console.log(arguments);
```

**Output:**
```js
[Arguments] {
  '0': {},                          // exports
  '1': [Function: require],         // require
  '2': Module { ... },              // module
  '3': '/home/user/project/app.js', // __filename
  '4': '/home/user/project'         // __dirname
}
```

These are the 5 arguments passed into the wrapper function!

---

## Common Use Cases

### Using `__dirname` for file paths
```js
const path = require('path');
const fs   = require('fs');

// Always use __dirname for reliable paths
const data = fs.readFileSync(path.join(__dirname, 'data.txt'), 'utf8');
```

### Checking if file is run directly
```js
if (require.main === module) {
  // This file was run directly: node app.js
  console.log('Running directly!');
} else {
  // This file was required by another file
  console.log('Required as a module');
}
```

### Debugging module info
```js
console.log('File    :', __filename);
console.log('Folder  :', __dirname);
console.log('Module  :', module.id);
console.log('Loaded  :', module.loaded);
```

---

## Summary

```
Before running any file, Node wraps it in:

(function(exports, require, module, __filename, __dirname) {
  // your code
});

Why?
✅ Keeps variables private (no global pollution)
✅ Gives each file its own module, exports
✅ Makes require, __filename, __dirname available
✅ Enables the module system to work

The 5 parameters:
exports    → shorthand for module.exports
require    → function to import modules
module     → current file's module object
__filename → full path of this file
__dirname  → directory of this file
```