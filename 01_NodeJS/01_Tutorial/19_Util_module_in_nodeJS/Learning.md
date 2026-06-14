# `util` Module in Node.js

The `util` module provides **utility functions** for debugging, formatting, type checking, and working with async code. It is mainly used internally by Node.js but has many useful tools for developers.

---

## Importing

```js
const util = require('util');
```

---

## 1. `util.format()` — String Formatting

Formats a string similar to `printf` in C:

```js
const util = require('util');

util.format('Hello, %s!', 'Arjun');
// 'Hello, Arjun!'

util.format('Age: %d', 25);
// 'Age: 25'

util.format('Object: %j', { name: 'Arjun' });
// 'Object: {"name":"Arjun"}'

util.format('Pi is %f', 3.14159);
// 'Pi is 3.14159'

// Extra args are appended
util.format('Hello', 'World', '!');
// 'Hello World !'

// No format string
util.format({ a: 1 }, [1, 2, 3]);
// "{ a: 1 } [ 1, 2, 3 ]"
```

### Format specifiers

| Specifier | Description |
|---|---|
| `%s` | String |
| `%d` | Integer |
| `%i` | Integer |
| `%f` | Float |
| `%j` | JSON |
| `%o` | Object (with options) |
| `%O` | Object (without options) |
| `%%` | Literal `%` |

---

## 2. `util.inspect()` — Deep Object Inspection

Converts any value to a **readable string** — great for debugging.

```js
const util = require('util');

const obj = {
  name: 'Arjun',
  address: { city: 'Kerala', country: 'India' },
  hobbies: ['coding', 'reading']
};

console.log(util.inspect(obj));
// { name: 'Arjun', address: { city: 'Kerala', country: 'India' }, hobbies: [ 'coding', 'reading' ] }

// With options
console.log(util.inspect(obj, {
  depth:   null,    // unlimited depth (default is 2)
  colors:  true,    // colorize the output
  compact: false,   // pretty print
}));
```

### Inspect a class instance

```js
class User {
  constructor(name, age) {
    this.name = name;
    this.age  = age;
  }
}

const user = new User('Arjun', 25);
console.log(util.inspect(user));
// User { name: 'Arjun', age: 25 }
```

### Custom inspect behavior

```js
class MyClass {
  [util.inspect.custom]() {
    return `MyClass(custom display)`;
  }
}

console.log(util.inspect(new MyClass()));
// MyClass(custom display)
```

---

## 3. `util.promisify()` — Convert Callback to Promise

Converts a callback-style function to one that returns a **Promise**.

```js
const util = require('util');
const fs   = require('fs');

// Original callback style
fs.readFile('file.txt', 'utf8', (err, data) => {
  console.log(data);
});

// Promisified version
const readFile = util.promisify(fs.readFile);

async function main() {
  const data = await readFile('file.txt', 'utf8');
  console.log(data);
}

main();
```

### Custom promisify

```js
// Any function with (err, result) callback can be promisified
function delay(ms, callback) {
  setTimeout(() => callback(null, `Done after ${ms}ms`), ms);
}

const delayAsync = util.promisify(delay);

async function run() {
  const result = await delayAsync(1000);
  console.log(result); // Done after 1000ms
}

run();
```

### Using `util.promisify.custom`

For functions with non-standard callback signatures:

```js
function myFunc(val, callback) {
  callback(null, val * 2);
}

myFunc[util.promisify.custom] = (val) => {
  return Promise.resolve(val * 2);
};

const myFuncAsync = util.promisify(myFunc);
myFuncAsync(5).then(console.log); // 10
```

---

## 4. `util.callbackify()` — Convert Promise to Callback

Opposite of `promisify` — turns an async function into a callback-style function.

```js
const util = require('util');

async function fetchUser(id) {
  return { id, name: 'Arjun' };
}

const fetchUserCb = util.callbackify(fetchUser);

fetchUserCb(1, (err, user) => {
  if (err) throw err;
  console.log(user); // { id: 1, name: 'Arjun' }
});
```

---

## 5. Type Checking — `util.types`

Check the type of values precisely:

```js
const { types } = require('util');

// Promises
types.isPromise(Promise.resolve());    // true
types.isPromise({});                   // false

// Date
types.isDate(new Date());              // true
types.isDate('2024-01-01');            // false

// Map / Set
types.isMap(new Map());                // true
types.isSet(new Set());                // true

// Typed Arrays
types.isUint8Array(new Uint8Array());  // true
types.isInt32Array(new Int32Array());  // true

// Generator / Async
types.isGeneratorFunction(function*(){}); // true
types.isAsyncFunction(async () => {});    // true

// RegExp
types.isRegExp(/abc/);                 // true

// ArrayBuffer
types.isArrayBuffer(new ArrayBuffer(8)); // true
```

---

## 6. `util.deprecate()` — Mark Functions as Deprecated

Wraps a function to emit a deprecation warning when called:

```js
const util = require('util');

const oldFunction = util.deprecate(
  function(x) { return x * 2; },
  'oldFunction() is deprecated. Use newFunction() instead.',
  'DEP0001'  // optional deprecation code
);

oldFunction(5);
// DeprecationWarning: oldFunction() is deprecated. Use newFunction() instead.
// Returns: 10
```

---

## 7. `util.isDeepStrictEqual()` — Deep Equality Check

```js
const util = require('util');

util.isDeepStrictEqual({ a: 1, b: 2 }, { a: 1, b: 2 });       // true
util.isDeepStrictEqual([1, 2, 3], [1, 2, 3]);                  // true
util.isDeepStrictEqual({ a: 1 }, { a: '1' });                   // false (strict)
util.isDeepStrictEqual(new Map([[1, 2]]), new Map([[1, 2]]));   // true
```

---

## 8. `util.TextEncoder` / `util.TextDecoder`

Encode and decode text as binary:

```js
const { TextEncoder, TextDecoder } = require('util');

// Encode string → Uint8Array
const encoder = new TextEncoder();
const encoded = encoder.encode('Hello, World!');
console.log(encoded); // Uint8Array [ 72, 101, 108, 108, 111, ... ]

// Decode Uint8Array → string
const decoder = new TextDecoder();
const decoded = decoder.decode(encoded);
console.log(decoded); // Hello, World!

// Decode with specific encoding
const utf16Decoder = new TextDecoder('utf-16');
```

---

## Real World Examples

### Promisify all fs methods

```js
const util = require('util');
const fs   = require('fs');

const readFile  = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const unlink    = util.promisify(fs.unlink);

async function processFile(input, output) {
  const data    = await readFile(input, 'utf8');
  const upper   = data.toUpperCase();
  await writeFile(output, upper);
  console.log(`Processed ${input} → ${output}`);
}

processFile('input.txt', 'output.txt');
```

### Debug logger using util.inspect

```js
const util = require('util');

function debugLog(label, value) {
  console.log(`\n[${label}]`);
  console.log(util.inspect(value, { depth: null, colors: true }));
}

const response = {
  status: 200,
  data: { users: [{ id: 1, name: 'Arjun' }] },
  meta: { page: 1, total: 100 }
};

debugLog('API Response', response);
```

---

## Quick Reference

| Method | What it does |
|---|---|
| `util.format(fmt, ...args)` | Format a string |
| `util.inspect(obj, opts?)` | Deep-inspect any value |
| `util.promisify(fn)` | Callback fn → Promise fn |
| `util.callbackify(fn)` | Async fn → Callback fn |
| `util.deprecate(fn, msg)` | Mark fn as deprecated |
| `util.isDeepStrictEqual(a, b)` | Deep equality check |
| `util.types.isPromise(v)` | Check if Promise |
| `util.types.isDate(v)` | Check if Date |
| `util.types.isMap(v)` | Check if Map |
| `util.TextEncoder` | String → Uint8Array |
| `util.TextDecoder` | Uint8Array → String |

---

## Summary

```
util = utility functions for Node.js development

Most used:
  util.promisify(fn)      → convert callback API to Promise
  util.inspect(obj)       → deep-inspect objects for debugging
  util.format(str, args)  → printf-style string formatting
  util.types.*            → precise type checking
  util.deprecate(fn, msg) → mark old APIs as deprecated
  util.isDeepStrictEqual  → deep equality comparison

Most important:
  util.promisify() → used constantly when working with
  older callback-based APIs (fs, dns, child_process...)
```