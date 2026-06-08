# Node.js Architecture

Node.js has a unique architecture that makes it fast, scalable, and efficient for handling thousands of concurrent connections.

---

## Full Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                    Your Application                        │
│              (JavaScript Code you write)                   │
└───────────────────────────┬────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────┐
│                    Node.js Core                            │
│                                                            │
│   ┌─────────────────────────────────────────────────┐      │
│   │              Node.js APIs                       │      │
│   │     fs, http, path, os, crypto, events...       │      │
│   └─────────────────────────────────────────────────┘      │
│                                                            │
│   ┌──────────────────┐    ┌───────────────────────────┐    │
│   │   V8 Engine      │    │        libuv              │    │
│   │                  │    │                           │    │
│   │  JS → Machine    │    │  ┌─────────────────────┐  │    │
│   │  Code            │    │  │    Event Loop        │  │    │
│   │                  │    │  └─────────────────────┘  │    │
│   │  Heap Memory     │    │  ┌─────────────────────┐  │    │
│   │  Call Stack      │    │  │   Thread Pool (4)    │  │    │
│   │  Garbage Collect │    │  └─────────────────────┘  │    │
│   └──────────────────┘    │  ┌─────────────────────┐  │    │
│                           │  │   Async I/O          │  │    │
│                           │  └─────────────────────┘  │    │
│                           └───────────────────────────┘    │
└───────────────────────────┬────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────┐
│                  Operating System                          │
│         (Windows / Linux / macOS)                          │
│                                                            │
│   File System    Network Stack    DNS    Processes         │
└────────────────────────────────────────────────────────────┘
```

---

## Layer 1 — Your JavaScript Application

The code you write lives at the top layer:

```js
// This is YOUR layer
const express = require('express');
const fs      = require('fs');

const app = express();

app.get('/', async (req, res) => {
  const data = await fs.promises.readFile('data.txt', 'utf8');
  res.send(data);
});

app.listen(3000);
```

This layer only knows JavaScript. It calls Node.js APIs which handle everything underneath.

---

## Layer 2 — Node.js Core APIs

Built-in modules written in a mix of **JavaScript and C++**:

```
┌────────────────────────────────────────────────┐
│              Node.js Core APIs                 │
│                                                │
│  fs       → File system operations            │
│  http     → HTTP server and client            │
│  https    → HTTPS (secure HTTP)               │
│  path     → File path utilities               │
│  os       → Operating system info             │
│  events   → EventEmitter pattern              │
│  stream   → Streaming data                    │
│  crypto   → Encryption and hashing            │
│  buffer   → Binary data handling              │
│  url      → URL parsing                       │
│  net      → TCP networking                    │
│  dns      → DNS lookups                       │
│  child_process → Spawn subprocesses           │
│  worker_threads → Multi-threading             │
└────────────────────────────────────────────────┘
```

These APIs act as a **bridge** between your JS code and the lower layers (V8 + libuv).

---

## Layer 3A — V8 Engine

Google's JavaScript engine — the brain that **executes your JavaScript**:

```
┌────────────────────────────────────────┐
│              V8 Engine                 │
│                                        │
│  1. Parser                             │
│     → Reads your JS code               │
│     → Converts to AST (syntax tree)    │
│                                        │
│  2. Ignition (Interpreter)             │
│     → Converts AST → Bytecode          │
│     → Starts executing immediately     │
│                                        │
│  3. TurboFan (JIT Compiler)            │
│     → Watches for "hot" code           │
│     → Compiles hot code → Machine Code │
│     → Much faster execution            │
│                                        │
│  4. Heap Memory                        │
│     → Stores objects, arrays, closures │
│                                        │
│  5. Call Stack                         │
│     → Tracks function execution order  │
│                                        │
│  6. Garbage Collector                  │
│     → Auto-frees unused memory         │
└────────────────────────────────────────┘
```

### How V8 executes your code

```
Your JS Code
     │
     ▼
  Parser → AST (Abstract Syntax Tree)
     │
     ▼
  Ignition → Bytecode (interpreted)
     │
     ▼
  TurboFan → Machine Code (compiled, for hot paths)
     │
     ▼
  CPU executes Machine Code
```

---

## Layer 3B — libuv

The **async powerhouse** of Node.js. Written in C, works on all operating systems:

```
┌────────────────────────────────────────────┐
│                  libuv                     │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │           Event Loop                 │  │
│  │                                      │  │
│  │  timers → I/O → poll → check → close │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │         Thread Pool                  │  │
│  │                                      │  │
│  │  Thread 1 │ Thread 2 │ Thread 3 │ T4 │  │
│  │  (fs I/O) │ (crypto) │ (dns)    │ ..  │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │      Async I/O (OS Kernel)           │  │
│  │                                      │  │
│  │  epoll (Linux)                       │  │
│  │  kqueue (macOS)                      │  │
│  │  IOCP (Windows)                      │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

### What libuv handles

```
Via Thread Pool (4 threads):
  ✅ File system (fs.readFile, fs.writeFile...)
  ✅ DNS lookups (dns.lookup)
  ✅ CPU-intensive crypto (crypto.pbkdf2)
  ✅ zlib compression

Via OS Kernel (no threads needed):
  ✅ Network I/O (http, https, TCP, UDP)
  ✅ Sockets
  ✅ Pipes
  ✅ Child processes
```

---

## The Event Loop Architecture

The Event Loop is the core of Node's non-blocking nature:

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                    Event Loop                          │
│                                                        │
│   ┌──────────────────────────────────────────────┐     │
│   │  Phase 1: TIMERS                             │     │
│   │  Runs: setTimeout(), setInterval() callbacks │     │
│   └──────────────────────┬───────────────────────┘     │
│                          │                             │
│   ┌──────────────────────▼───────────────────────┐     │
│   │  Phase 2: PENDING I/O CALLBACKS              │     │
│   │  Runs: deferred I/O callbacks                │     │
│   └──────────────────────┬───────────────────────┘     │
│                          │                             │
│   ┌──────────────────────▼───────────────────────┐     │
│   │  Phase 3: IDLE / PREPARE                     │     │
│   │  Internal use only                           │     │
│   └──────────────────────┬───────────────────────┘     │
│                          │                             │
│   ┌──────────────────────▼───────────────────────┐     │
│   │  Phase 4: POLL                               │     │
│   │  Retrieves new I/O events                    │     │
│   │  Executes I/O callbacks                      │     │
│   │  Waits here if queue is empty                │     │
│   └──────────────────────┬───────────────────────┘     │
│                          │                             │
│   ┌──────────────────────▼───────────────────────┐     │
│   │  Phase 5: CHECK                              │     │
│   │  Runs: setImmediate() callbacks              │     │
│   └──────────────────────┬───────────────────────┘     │
│                          │                             │
│   ┌──────────────────────▼───────────────────────┐     │
│   │  Phase 6: CLOSE CALLBACKS                    │     │
│   │  Runs: socket.on('close'), etc.              │     │
│   └──────────────────────┬───────────────────────┘     │
│                          │                             │
│                          └────── (next tick) ──────────┘
│                                                        │
└────────────────────────────────────────────────────────┘

Between each phase (microtask queue runs first):
  → process.nextTick() callbacks
  → Promise.resolve() callbacks
```

---

## Request Handling Architecture

How Node.js handles an incoming HTTP request:

```
Client (Browser)
     │
     │  HTTP Request
     ▼
┌──────────────────────────────────────────────┐
│              Node.js HTTP Server             │
│                                              │
│  1. OS receives the TCP connection           │
│     └── hands to libuv                      │
│                                              │
│  2. libuv emits a connection event           │
│     └── pushed to Event Queue               │
│                                              │
│  3. Event Loop picks it up                  │
│     └── runs your request handler (JS)      │
│                                              │
│  4. Handler does async work                  │
│     └── DB query / file read / API call     │
│         └── offloaded to libuv              │
│                                              │
│  5. libuv completes the work                 │
│     └── callback pushed to Event Queue      │
│                                              │
│  6. Event Loop picks up callback            │
│     └── sends HTTP response to client       │
└──────────────────────────────────────────────┘
     │
     │  HTTP Response
     ▼
Client (Browser)
```

---

## Memory Architecture

```
┌────────────────────────────────────────────┐
│           V8 Memory Structure              │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │          Heap Memory                 │  │
│  │                                      │  │
│  │  New Space  │  Old Space             │  │
│  │  (young     │  (long-lived           │  │
│  │  objects)   │  objects)              │  │
│  │             │                        │  │
│  │  Large Object Space                  │  │
│  │  Code Space                          │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │          Call Stack                  │  │
│  │                                      │  │
│  │  main()                              │  │
│  │  readFile()                          │  │
│  │  callback()                          │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

---

## Concurrency Model

```
Traditional Multi-threaded Server:
┌─────────────────────────────────┐
│  Request 1 → Thread 1           │
│  Request 2 → Thread 2           │
│  Request 3 → Thread 3           │
│  Request 4 → Thread 4           │
│  Request 5 → WAIT (no threads)  │
└─────────────────────────────────┘
  Each thread: ~1MB memory
  1000 requests = ~1GB RAM!

Node.js Event-Driven Model:
┌─────────────────────────────────┐
│  All requests → 1 main thread   │
│                                 │
│  Request 1 ─┐                   │
│  Request 2 ─┤──► Event Loop     │
│  Request 3 ─┤    (non-blocking) │
│  Request 4 ─┤                   │
│  Request 5 ─┘                   │
└─────────────────────────────────┘
  1000 requests = very little RAM
  Handles I/O waiting efficiently
```

---

## Node.js Architecture — Component Summary

| Component | Written in | Role |
|---|---|---|
| **V8 Engine** | C++ | Executes JavaScript |
| **libuv** | C | Async I/O, Event Loop, Thread Pool |
| **Node.js Bindings** | C++ | Bridge between JS and C++ |
| **Node.js Core APIs** | JS + C++ | fs, http, path, os... |
| **npm** | JavaScript | Package management |
| **Event Loop** | C (libuv) | Non-blocking async execution |
| **Thread Pool** | C (libuv) | Heavy I/O operations (4 threads) |
| **V8 Heap** | C++ | Memory storage for JS objects |
| **Call Stack** | C++ (V8) | Function execution tracking |

---

## Summary

```
Node.js Architecture has 4 main parts:

1. V8 Engine
   → Parses and compiles JavaScript
   → Manages memory (Heap) and execution (Call Stack)
   → JIT compiles hot code for speed

2. libuv
   → Provides the Event Loop
   → Thread Pool (4 threads) for heavy operations
   → Uses OS-level async I/O for networking

3. Node.js Core APIs
   → Built-in modules: fs, http, path, os, crypto...
   → Written in JS + C++ bindings
   → Bridge between your code and V8/libuv

4. Event Loop (inside libuv)
   → 6 phases: timers, I/O, poll, check, close
   → Microtask queue: nextTick > Promises (run between phases)
   → Enables non-blocking, single-threaded concurrency

Key design principle:
   → Single JS thread + async I/O = handles thousands of connections
   → I/O waiting time is used to handle other requests
   → Never block the Event Loop with heavy CPU work!
```