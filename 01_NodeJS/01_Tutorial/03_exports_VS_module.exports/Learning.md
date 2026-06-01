# `exports` vs `module.exports` in Node.js

This is one of the **most confusing** topics for beginners. Let's break it down completely.

---

## The Core Truth

```js
// When Node creates your file, it does this internally:
var exports = module.exports = {};

// So at the start:
console.log(exports === module.exports); // true ✅
// Both point to the SAME empty object in memory
```

```
Memory:
┌─────────────────┐
│  exports  ──────┼──────────► { }  ◄──────── module.exports
└─────────────────┘
```

---

## What `require()` Actually Returns

This is the key:

```js
// require() ALWAYS returns module.exports — NOT exports
return module.exports;
```

`exports` is just a **shorthand convenience reference** to `module.exports`. The moment you break that link, `exports` becomes useless.

---

## Case 1 — Adding Properties (Both Work ✅)

```js
// Using exports
exports.add      = (a, b) => a + b;
exports.subtract = (a, b) => a - b;

// Using module.exports
module.exports.add      = (a, b) => a + b;
module.exports.subtract = (a, b) => a - b;
```

Both work because you're **adding to the same object** — not replacing it.

```
Memory:
┌──────────┐
│ exports  │──────────► { add: fn, subtract: fn }
└──────────┘                        ▲
┌────────────────┐                  │
│ module.exports │──────────────────┘
└────────────────┘
```

```js
// index.js
const math = require('./math');
console.log(math.add(5, 3)); // 8 ✅
```

---

## Case 2 — Reassigning `exports` (BREAKS ❌)

```js
// math.js
exports = { add: (a, b) => a + b }; // ❌ WRONG!
```

What happens in memory:

```
Before:
exports  ──────────► { }  ◄──────── module.exports

After reassigning exports:
exports  ──────────► { add: fn }   (new object)
module.exports ────► { }           (still empty!)
```

```js
// index.js
const math = require('./math');
console.log(math.add); // undefined ❌
console.log(math);     // {} ← empty!
```

`require()` returns `module.exports` which is still `{}` — your exported function is **lost**.

---

## Case 3 — Reassigning `module.exports` (Always Works ✅)

```js
// math.js
module.exports = { add: (a, b) => a + b }; // ✅ CORRECT
```

```
Memory:
exports  ──────────► { }            (orphaned, ignored)
module.exports ────► { add: fn }    (this is returned)
```

```js
// index.js
const math = require('./math');
console.log(math.add(5, 3)); // 8 ✅
```

---

## Case 4 — Mixing Both (DANGER ⚠️)

```js
// math.js
exports.multiply = (a, b) => a * b;   // adds to shared object

module.exports = { add: (a, b) => a + b }; // replaces the object!

exports.subtract = (a, b) => a - b;   // adds to OLD orphaned object
```

```js
// index.js
const math = require('./math');
console.log(math.add);      // ✅ works
console.log(math.multiply); // ❌ undefined — lost when module.exports was replaced
console.log(math.subtract); // ❌ undefined — added to orphaned exports
```

**Rule: Never mix both styles in the same file.**

---

## Side-by-Side Comparison

```js
// ✅ exports — safe way (individual properties)
exports.add      = (a, b) => a + b;
exports.subtract = (a, b) => a - b;
exports.PI       = 3.14;

// ✅ module.exports — export whole object
module.exports = {
  add:      (a, b) => a + b,
  subtract: (a, b) => a - b,
  PI:       3.14
};

// ✅ module.exports — export a function
module.exports = function greet(name) {
  return `Hello, ${name}!`;
};

// ✅ module.exports — export a class
module.exports = class User {
  constructor(name) { this.name = name; }
};

// ❌ exports — NEVER reassign
exports = { add, subtract };        // broken!
exports = function greet() { ... }; // broken!
exports = class User { ... };       // broken!
```

---

## Full Comparison Table

| | `exports.x = ...` | `module.exports = ...` |
|---|---|---|
| Works for individual props | ✅ | ✅ |
| Works for whole object | ❌ (don't reassign) | ✅ |
| Works for function export | ❌ | ✅ |
| Works for class export | ❌ | ✅ |
| Safe to reassign | ❌ Never | ✅ Always |
| What `require()` returns | ❌ Not this | ✅ Always this |

---

## The Golden Rules

```
1. require() ALWAYS returns module.exports

2. exports is just a shortcut to module.exports

3. Use exports.x = ...     → for adding individual properties
   Use module.exports = ... → for exporting objects, functions, classes

4. NEVER reassign exports directly
   exports = { ... }  ❌

5. NEVER mix both styles in the same file
```

---

## Real World Usage

```js
// config.js — individual props with exports
exports.PORT     = 3000;
exports.HOST     = 'localhost';
exports.DB_URL   = 'mongodb://localhost/mydb';
```

```js
// math.js — whole object with module.exports
module.exports = {
  add:      (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide:   (a, b) => a / b
};
```

```js
// logger.js — single function with module.exports
module.exports = function(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
};
```

```js
// User.js — class with module.exports
module.exports = class User {
  constructor(name, age) {
    this.name = name;
    this.age  = age;
  }
  greet() { return `Hi, I'm ${this.name}`; }
};
```

```js
// index.js — using all of them
const config = require('./config');
const math   = require('./math');
const log    = require('./logger');
const User   = require('./User');

log(`Starting on port ${config.PORT}`);
log(`5 + 3 = ${math.add(5, 3)}`);

const u = new User('Arjun', 25);
log(u.greet());
```

**Output:**
```
[2024-01-01T00:00:00.000Z] Starting on port 3000
[2024-01-01T00:00:00.000Z] 5 + 3 = 8
[2024-01-01T00:00:00.000Z] Hi, I'm Arjun
```

---

## Summary

```
exports          →  shorthand, only use for exports.x = value
module.exports   →  the real deal, always returned by require()

Safe:    exports.name = value
Safe:    module.exports = { ... }
UNSAFE:  exports = { ... }  ← breaks the reference!
```