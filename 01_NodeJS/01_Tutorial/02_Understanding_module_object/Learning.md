# The `module` Object in Node.js

Every file in Node.js has its own `module` object — it represents the **current file/module**. Node.js automatically creates it for every file.

---

## What does it look like?

Create a file and just log it:

```js
// app.js
console.log(module);
```

**Output:**
```js
Module {
  id: '.',
  path: '/home/user/project',
  exports: {},
  parent: null,
  filename: '/home/user/project/app.js',
  loaded: false,
  children: [],
  paths: [
    '/home/user/project/node_modules',
    '/home/user/node_modules',
    '/home/node_modules',
    '/node_modules'
  ]
}
```

---

## All Properties of `module`

### 1. `module.id`
Unique identifier of the module. For the main file it's `'.'`, for others it's the full file path.

```js
console.log(module.id);
// '.'  ← if this is the entry file
// '/home/user/project/math.js'  ← if it's a required file
```

### 2. `module.filename`
The **full absolute path** of the current file.

```js
console.log(module.filename);
// /home/user/project/app.js
```

### 3. `module.loaded`
Boolean — whether the module has **finished loading** yet.

```js
console.log(module.loaded); // false ← still loading while code runs

setTimeout(() => {
  console.log(module.loaded); // true ← fully loaded now
}, 0);
```

### 4. `module.exports`
What gets **sent out** when another file does `require()`. This is the most used property.

```js
// math.js
function add(a, b) { return a + b; }

module.exports = { add };

console.log(module.exports); // { add: [Function: add] }
```

### 5. `module.parent` *(deprecated in Node 14+)*
The module that **first required** this file.

```js
// math.js
console.log(module.parent);
// Shows the module object of whoever required this file
// null if this file was run directly
```

> Use `require.main === module` instead (see below)

### 6. `module.children`
Array of all modules that **this file has required**.

```js
// index.js
const math   = require('./math');
const logger = require('./logger');

console.log(module.children);
// [ Module { filename: './math.js' }, Module { filename: './logger.js' } ]
```

### 7. `module.paths`
Array of directories Node searches when looking for modules.

```js
console.log(module.paths);
// [
//   '/home/user/project/node_modules',
//   '/home/user/node_modules',
//   '/home/node_modules',
//   '/node_modules'
// ]
```

Node walks **up the directory tree** until it finds the module or hits root.

---

## `module.exports` in Detail

This is the **heart** of the module object. Whatever you assign here is what `require()` returns.

```js
// Initially empty
console.log(module.exports); // {}

// After assignment
module.exports = { name: 'Node', version: 18 };
console.log(module.exports); // { name: 'Node', version: 18 }
```

### You can export anything:

```js
// Export an object
module.exports = { add, subtract };

// Export a function
module.exports = function greet(name) {
  return `Hello, ${name}!`;
};

// Export a class
module.exports = class User {
  constructor(name) { this.name = name; }
};

// Export a primitive
module.exports = 42;
module.exports = "Hello";
module.exports = true;
```

---

## `exports` vs `module.exports`

This confuses many beginners. Here's the full truth:

```js
// At the start, both point to the SAME empty object
console.log(exports === module.exports); // true ✅

//  ┌──────────┐        ┌──────────────┐
//  │ exports  │───────►│  {}  (same)  │◄───────│ module.exports │
//  └──────────┘        └──────────────┘
```

### Safe to use `exports`:
```js
// ✅ Adding properties — both still point to same object
exports.add      = (a, b) => a + b;
exports.subtract = (a, b) => a - b;
```

### Danger zone:
```js
// ❌ Reassigning exports breaks the link!
exports = { add, subtract };
// Now exports points to a NEW object
// module.exports still points to {}
// require() returns {} — not what you want!
```

### Always safe — use `module.exports`:
```js
// ✅ Always works
module.exports = { add, subtract };
module.exports = function() { ... };
module.exports = class User { ... };
```

**Rule:** Use `exports.x = ...` for individual properties. Use `module.exports = ...` when exporting a whole object, function, or class.

---

## Detecting if File is Run Directly

A very common and useful pattern:

```js
// app.js
function startServer() {
  console.log('Server started!');
}

// Was this file run directly? (node app.js)
if (require.main === module) {
  startServer(); // only runs if executed directly
}

// If required by another file, startServer() won't auto-run
module.exports = { startServer };
```

```bash
node app.js         # ✅ startServer() runs
```

```js
const app = require('./app'); // ❌ startServer() does NOT run
```

---

## Module Caching — `require.cache`

Every required module is **cached**. You can inspect or clear it:

```js
// Require a module
const math = require('./math');

// See the cache
console.log(require.cache);
// {
//   '/home/user/project/math.js': Module { ... }
// }

// Clear cache (force fresh reload)
delete require.cache[require.resolve('./math')];
const freshMath = require('./math'); // loads fresh
```

---

## The Module Wrapper

Every file is secretly wrapped in this function by Node before execution:

```js
(function(exports, require, module, __filename, __dirname) {
  // YOUR CODE IS HERE
});
```

That's why these are available everywhere without importing:

| Variable | Value |
|---|---|
| `exports` | Same as `module.exports` (initially) |
| `require` | Function to import modules |
| `module` | The module object for this file |
| `__filename` | Full path of this file |
| `__dirname` | Directory containing this file |

```js
console.log(__filename); // /home/user/project/app.js
console.log(__dirname);  // /home/user/project
```

---

## Full Working Example

```js
// math.js
console.log('math.js loading...');
console.log('module.id       :', module.id);
console.log('module.filename :', module.filename);
console.log('module.loaded   :', module.loaded); // false

const add      = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;

module.exports = { add, subtract, multiply };

console.log('module.exports  :', module.exports);
```

```js
// index.js
const math = require('./math');

console.log('\n--- In index.js ---');
console.log('math.add(5,3)      :', math.add(5, 3));
console.log('math.subtract(5,3) :', math.subtract(5, 3));
console.log('math.multiply(5,3) :', math.multiply(5, 3));
console.log('module.children    :', module.children.length); // 1
```

**Output:**
```
math.js loading...
module.id       : /home/user/project/math.js
module.filename : /home/user/project/math.js
module.loaded   : false
module.exports  : { add: [Function], subtract: [Function], multiply: [Function] }

--- In index.js ---
math.add(5,3)      : 8
math.subtract(5,3) : 2
math.multiply(5,3) : 15
module.children    : 1
```

---

## Summary

| Property | What it does |
|---|---|
| `module.id` | Unique ID of the module |
| `module.filename` | Full file path |
| `module.loaded` | Is it fully loaded? |
| `module.exports` | What you export to other files |
| `module.parent` | Who required this file (deprecated) |
| `module.children` | Modules this file has required |
| `module.paths` | Directories searched for modules |

```
module.exports  →  what you send out
require()       →  what you bring in
require.main === module  →  was this file run directly?
```