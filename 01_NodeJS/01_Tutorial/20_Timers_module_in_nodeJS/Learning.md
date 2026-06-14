# `timers` Module in Node.js

The `timers` module provides functions for scheduling code to run at a future point in time. These functions are available **globally** — you don't need to require them.

---

## Available Globally (No Import Needed)

```js
// These work without require:
setTimeout()
setInterval()
setImmediate()
clearTimeout()
clearInterval()
clearImmediate()
queueMicrotask()
process.nextTick()
```

```js
// But you can import if needed (e.g., for promises API)
const timers = require('timers');
const { setTimeout: setTimeoutPromise } = require('timers/promises');
```

---

## 1. `setTimeout()` — Run Once After Delay

Runs a function **once** after a specified delay (in milliseconds).

```js
setTimeout(() => {
  console.log('Runs after 2 seconds');
}, 2000);

console.log('This runs first!'); // executes before setTimeout callback
```

### With arguments

```js
setTimeout((name, age) => {
  console.log(`Hello ${name}, you are ${age}`);
}, 1000, 'Arjun', 25);
// Hello Arjun, you are 25
```

### Cancel with `clearTimeout()`

```js
const timer = setTimeout(() => {
  console.log('This will NOT run');
}, 3000);

// Cancel before it fires
clearTimeout(timer);
console.log('Timer cancelled!');
```

### Minimum delay

```js
// delay of 0 doesn't run immediately — waits for call stack to clear
setTimeout(() => {
  console.log('2. setTimeout 0ms');
}, 0);

console.log('1. Synchronous code');
// Output:
// 1. Synchronous code
// 2. setTimeout 0ms
```

---

## 2. `setInterval()` — Run Repeatedly

Runs a function **repeatedly** at a fixed interval.

```js
let count = 0;

const interval = setInterval(() => {
  count++;
  console.log(`Tick #${count}`);

  if (count >= 5) {
    clearInterval(interval); // stop after 5 ticks
    console.log('Stopped!');
  }
}, 1000);
```

**Output:**
```
Tick #1  (after 1s)
Tick #2  (after 2s)
Tick #3  (after 3s)
Tick #4  (after 4s)
Tick #5  (after 5s)
Stopped!
```

### Cancel with `clearInterval()`

```js
const interval = setInterval(() => {
  console.log('Running...');
}, 500);

// Stop after 3 seconds
setTimeout(() => {
  clearInterval(interval);
  console.log('Interval cleared!');
}, 3000);
```

---

## 3. `setImmediate()` — Run After I/O

Runs a function **after the current event loop iteration** (after I/O events but before `setTimeout`).

```js
setImmediate(() => {
  console.log('3. setImmediate');
});

setTimeout(() => {
  console.log('4. setTimeout 0ms');
}, 0);

process.nextTick(() => {
  console.log('2. nextTick');
});

console.log('1. Synchronous');
```

**Output:**
```
1. Synchronous
2. nextTick
3. setImmediate
4. setTimeout 0ms
```

### Cancel with `clearImmediate()`

```js
const immediate = setImmediate(() => {
  console.log('Will NOT run');
});

clearImmediate(immediate);
```

---

## 4. `process.nextTick()` — Highest Priority

Runs a function **before any I/O events**, before `setImmediate` and `setTimeout`. Part of the **microtask queue**.

```js
process.nextTick(() => {
  console.log('nextTick: runs before everything async');
});

setTimeout(() => console.log('setTimeout'), 0);
setImmediate(() => console.log('setImmediate'));

console.log('synchronous');
```

**Output:**
```
synchronous
nextTick: runs before everything async
setImmediate
setTimeout
```

### Nested nextTick (caution!)

```js
// WARNING: too many nested nextTicks can starve I/O
function recursiveNextTick(n) {
  if (n <= 0) return;
  process.nextTick(() => {
    console.log(`nextTick ${n}`);
    recursiveNextTick(n - 1);
  });
}

recursiveNextTick(5);
// nextTick 5, 4, 3, 2, 1  (all before any I/O)
```

---

## 5. `queueMicrotask()` — Queue a Microtask

Similar to `process.nextTick()` but uses the **standard Web-compatible microtask queue** (Promises use this too).

```js
queueMicrotask(() => {
  console.log('microtask');
});

process.nextTick(() => {
  console.log('nextTick');
});

console.log('sync');
```

**Output:**
```
sync
nextTick        ← nextTick runs before queueMicrotask
microtask
```

---

## 6. Execution Order — Full Priority

```js
console.log('1 - sync start');

setTimeout(()    => console.log('7 - setTimeout'),   0);
setImmediate(()  => console.log('6 - setImmediate'));
Promise.resolve().then(() => console.log('4 - Promise'));
queueMicrotask(() => console.log('5 - queueMicrotask'));
process.nextTick(() => console.log('3 - nextTick'));

console.log('2 - sync end');
```

**Output:**
```
1 - sync start
2 - sync end
3 - nextTick
4 - Promise
5 - queueMicrotask
6 - setImmediate
7 - setTimeout
```

### Priority order

```
1. Synchronous code           (call stack)
2. process.nextTick()         (nextTick queue)
3. Promise callbacks          (microtask queue)
4. queueMicrotask()           (microtask queue)
5. setImmediate()             (check phase)
6. setTimeout() / setInterval() (timers phase)
```

---

## 7. `timers/promises` — Async/Await Timers (Node 15+)

Promise-based versions of timer functions:

```js
const { setTimeout, setInterval, setImmediate } = require('timers/promises');

// Wait 2 seconds
async function main() {
  console.log('Start...');
  await setTimeout(2000);
  console.log('2 seconds later!');
}

main();
```

### With a return value

```js
const { setTimeout } = require('timers/promises');

async function delayed() {
  const result = await setTimeout(1000, 'hello after 1s');
  console.log(result); // hello after 1s
}

delayed();
```

### setInterval as async iterator

```js
const { setInterval } = require('timers/promises');

async function ticker() {
  let count = 0;
  for await (const _ of setInterval(500, null)) {
    count++;
    console.log(`Tick ${count}`);
    if (count >= 5) break;
  }
  console.log('Done!');
}

ticker();
```

---

## Real World Examples

### Debounce function

```js
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const onSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);

// Called rapidly — only last one fires after 300ms pause
onSearch('n');
onSearch('no');
onSearch('nod');
onSearch('node'); // ← only this one fires
```

### Throttle function

```js
function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

const onScroll = throttle(() => {
  console.log('Scroll handler fired');
}, 200); // fires at most once every 200ms
```

### Polling with setInterval

```js
const { promisify } = require('util');
const sleep = promisify(setTimeout);

async function pollServer(url, intervalMs, maxAttempts) {
  for (let i = 1; i <= maxAttempts; i++) {
    console.log(`Attempt ${i}: checking server...`);
    // check server health here
    const isUp = Math.random() > 0.7; // simulate check
    if (isUp) {
      console.log('Server is up!');
      return true;
    }
    await sleep(intervalMs);
  }
  console.log('Server did not respond');
  return false;
}

pollServer('http://localhost:3000', 1000, 5);
```

---

## Quick Reference

| Function | What it does |
|---|---|
| `setTimeout(fn, ms, ...args)` | Run once after delay |
| `setInterval(fn, ms, ...args)` | Run repeatedly at interval |
| `setImmediate(fn)` | Run after current I/O |
| `clearTimeout(id)` | Cancel setTimeout |
| `clearInterval(id)` | Cancel setInterval |
| `clearImmediate(id)` | Cancel setImmediate |
| `process.nextTick(fn)` | Highest priority async |
| `queueMicrotask(fn)` | Web-compatible microtask |
| `timers/promises setTimeout` | Awaitable setTimeout |
| `timers/promises setInterval` | Async iterable interval |

---

## Summary

```
timers = global functions for scheduling code execution

Functions:
  setTimeout(fn, ms)     → run once after delay
  setInterval(fn, ms)    → run repeatedly
  setImmediate(fn)       → run after I/O, this iteration
  process.nextTick(fn)   → run before any I/O (highest priority)
  queueMicrotask(fn)     → standard microtask queue

Cancelling:
  clearTimeout(id)
  clearInterval(id)
  clearImmediate(id)

Priority order (fastest to slowest):
  sync code → nextTick → Promises → queueMicrotask
  → setImmediate → setTimeout/setInterval

Modern async (Node 15+):
  const { setTimeout } = require('timers/promises');
  await setTimeout(1000); // awaitable sleep!
```