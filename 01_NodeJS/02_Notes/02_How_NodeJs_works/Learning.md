# How Node.js Works

Understanding how Node.js works internally helps you write better, faster, and more efficient code.

---

## The Big Picture

```
Your JS Code
     │
     ▼
┌─────────────────────────────────────────┐
│              Node.js                    │
│                                         │
│  ┌──────────┐      ┌─────────────────┐  │
│  │ V8 Engine│      │   libuv         │  │
│  │ (JS →    │      │ (Async I/O,     │  │
│  │  Machine │      │  Thread Pool,   │  │
│  │  Code)   │      │  Event Loop)    │  │
│  └──────────┘      └─────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │    Node.js Core APIs             │   │
│  │  (fs, http, path, os, crypto...) │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
     │
     ▼
Operating System (Windows / Linux / macOS)
```

---

## Two Core Components

### 1. V8 Engine (by Google)
- Compiles JavaScript → Machine Code
- Written in C++
- Makes JavaScript execution extremely fast
- Handles: variables, functions, objects, arrays, closures

### 2. libuv (by Node.js)
- Written in C
- Handles all **asynchronous operations**
- Provides: Event Loop, Thread Pool, I/O operations
- Works across all operating systems

```
V8      → executes your JavaScript
libuv   → handles async I/O, file system, networking
```

---

## Blocking vs Non-Blocking

This is the most important concept in Node.js.

### Blocking (Traditional Servers)
```js
// Each line WAITS for the previous to finish
const data1 = readFileSYNC('file1.txt'); // waits 100ms
const data2 = readFileSYNC('file2.txt'); // waits 100ms
const data3 = readFileSYNC('file3.txt'); // waits 100ms
// Total time: 300ms
```

```
Thread: ──[read file1]──[read file2]──[read file3]──► done
Time:      100ms          100ms          100ms     = 300ms
```

### Non-Blocking (Node.js)
```js
// All three start at the same time — don't wait for each other
fs.readFile('file1.txt', cb1); // starts, moves on
fs.readFile('file2.txt', cb2); // starts, moves on
fs.readFile('file3.txt', cb3); // starts, moves on
// Total time: ~100ms (all run in parallel)
```

```
Thread: ──[start all 3]──────────────────────► done
           file1 ──────────────────► cb1()
           file2 ──────────────► cb2()
           file3 ──────────────────────► cb3()
Time:      ~100ms (fastest of the 3)
```

---

## The Event Loop — Heart of Node.js

The **Event Loop** is what makes Node.js non-blocking. It constantly checks: *"Is there any work to do?"* and processes it.

### How the Event Loop Works

```
┌─────────────────────────────────────┐
│           Event Loop                │
│                                     │
│  ┌──────────┐                       │
│  │  timers  │  setTimeout, setInterval
│  └────┬─────┘                       │
│       │                             │
│  ┌────▼─────┐                       │
│  │ pending  │  I/O callbacks        │
│  │callbacks │                       │
│  └────┬─────┘                       │
│       │                             │
│  ┌────▼─────┐                       │
│  │  poll    │  new I/O events       │
│  └────┬─────┘                       │
│       │                             │
│  ┌────▼─────┐                       │
│  │  check   │  setImmediate         │
│  └────┬─────┘                       │
│       │                             │
│  ┌────▼─────┐                       │
│  │  close   │  close callbacks      │
│  │callbacks │                       │
│  └────┬─────┘                       │
│       │                             │
│       └──────── (repeat) ───────────┘
└─────────────────────────────────────┘
```

### Event Loop — Simple Version

```
┌──────────────────────────────────────────────┐
│                                              │
│   Call Stack empty?                          │
│         │                                    │
│         ▼                                    │
│   Check Event Queue                          │
│         │                                    │
│         ▼                                    │
│   Callback waiting? ──► Push to Call Stack  │
│         │                                    │
│         ▼                                    │
│   Execute callback                           │
│         │                                    │
│         └──────────────── (repeat) ──────────┘
│                                              │
└──────────────────────────────────────────────┘
```

---

## Call Stack, Web APIs, Callback Queue

These three work together to handle async code:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Call Stack  │    │  Node APIs   │    │  Callback    │
│              │    │  (libuv)     │    │  Queue       │
│ main()       │    │              │    │              │
│ readFile()   │───►│ doing I/O... │    │              │
│              │    │              │───►│  callback()  │
│              │◄───┼──────────────┼────┤              │
│ callback()   │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
      ▲                                        │
      │           Event Loop                   │
      └────────────────────────────────────────┘
         (moves callbacks to call stack when empty)
```

---

## Step-by-Step Code Execution

```js
console.log('1 - Start');

setTimeout(() => {
  console.log('3 - setTimeout callback');
}, 0);

console.log('2 - End');
```

**Output:**
```
1 - Start
2 - End
3 - setTimeout callback
```

**Why?** Step by step:

```
Step 1: console.log('1 - Start')
        → pushed to Call Stack
        → executed immediately
        → prints "1 - Start"
        → removed from Call Stack

Step 2: setTimeout(..., 0)
        → pushed to Call Stack
        → handed off to Node API (libuv timer)
        → removed from Call Stack immediately
        → Node.js moves on

Step 3: console.log('2 - End')
        → pushed to Call Stack
        → executed immediately
        → prints "2 - End"
        → removed from Call Stack

Step 4: Call Stack is now EMPTY
        → Event Loop checks Callback Queue
        → finds setTimeout callback
        → pushes it to Call Stack

Step 5: console.log('3 - setTimeout callback')
        → executes
        → prints "3 - setTimeout callback"
```

---

## Single-Threaded — But Not Really

Node.js runs JavaScript on **one thread** (the main thread). But it uses **multiple threads** under the hood via libuv's Thread Pool for heavy operations.

```
Main Thread (JavaScript)
      │
      │── handles: your JS code, event loop
      │
      ├── libuv Thread Pool (4 threads by default)
      │       │── file system operations
      │       │── DNS lookups
      │       │── crypto operations
      │       └── compression
      │
      └── OS Kernel (handles network I/O directly)
              │── TCP/UDP sockets
              └── HTTP requests
```

```js
// This runs in libuv's thread pool — NOT the main thread
fs.readFile('big-file.txt', callback); // offloaded to thread pool

// This runs in OS kernel directly
http.get('https://api.example.com', callback); // kernel handles it
```

---

## The Thread Pool

libuv has a **thread pool** (default: 4 threads) for operations the OS can't handle asynchronously:

```bash
# Increase thread pool size (default is 4)
UV_THREADPOOL_SIZE=8 node index.js
```

```
Operations using Thread Pool:
  ✅ fs.readFile / writeFile
  ✅ crypto.pbkdf2
  ✅ dns.lookup
  ✅ zlib (compression)

Operations using OS Kernel (no thread pool):
  ✅ http/https requests
  ✅ TCP/UDP sockets
  ✅ Child processes
  ✅ Pipes
```

---

## How Node Handles 10,000 Requests

Traditional server (e.g., Apache):
```
Request 1 → Thread 1 (waiting for DB...)
Request 2 → Thread 2 (waiting for DB...)
Request 3 → Thread 3 (waiting for DB...)
...
Request 100 → No threads left! ❌ Queue or reject
```

Node.js:
```
Request 1  ─┐
Request 2  ─┤
Request 3  ─┤──► Single Thread + Event Loop
...        ─┤        │
Request 10k─┘        │
                      ├── I/O offloaded to libuv
                      ├── Callbacks queued
                      └── Handled one by one (very fast)
```

Node handles all 10,000 requests on one thread because most requests spend time **waiting** (for DB, file, API) — not actually computing. Node uses that waiting time to handle other requests.

---

## Phases of the Event Loop in Detail

```
Phase 1: TIMERS
  → Executes setTimeout() and setInterval() callbacks
  → Runs callbacks whose delay has expired

Phase 2: PENDING CALLBACKS
  → Executes I/O callbacks deferred to next iteration
  → e.g., TCP errors

Phase 3: IDLE / PREPARE
  → Internal use only

Phase 4: POLL
  → Retrieves new I/O events
  → Executes I/O-related callbacks
  → Will block here if queue is empty (waiting for events)

Phase 5: CHECK
  → Executes setImmediate() callbacks
  → Always runs after poll phase

Phase 6: CLOSE CALLBACKS
  → Executes close event callbacks
  → e.g., socket.on('close', ...)
```

### Priority Order

```
process.nextTick()   ← highest priority (runs before everything)
Promise callbacks    ← second priority (microtask queue)
setTimeout()         ← timer phase
setImmediate()       ← check phase
```

```js
console.log('1');

setTimeout(() => console.log('4 - setTimeout'), 0);

setImmediate(() => console.log('5 - setImmediate'));

Promise.resolve().then(() => console.log('3 - Promise'));

process.nextTick(() => console.log('2 - nextTick'));

console.log('1.5');
```

**Output:**
```
1
1.5
2 - nextTick
3 - Promise
4 - setTimeout
5 - setImmediate
```

---

## Summary

```
How Node.js Works:

1. V8 Engine
   → Compiles JS to machine code
   → Fast execution

2. libuv
   → Provides Event Loop
   → Thread Pool (4 threads) for heavy I/O
   → Async, non-blocking operations

3. Event Loop
   → Constantly checks: "any callbacks ready?"
   → Moves callbacks from queue → call stack
   → Phases: timers → I/O → poll → check → close

4. Single Thread (JavaScript)
   → One thread runs your JS code
   → I/O offloaded to libuv / OS kernel
   → Never blocks — always moving

5. Why it's fast:
   → No waiting around
   → I/O handled in background
   → Handles thousands of connections on one thread
   → V8 compiles JS to fast machine code

Priority:
   process.nextTick > Promises > setTimeout > setImmediate
```