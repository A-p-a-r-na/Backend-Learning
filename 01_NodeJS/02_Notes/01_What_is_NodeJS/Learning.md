# What is Node.js?

Node.js is a **JavaScript runtime environment** that allows you to run JavaScript code **outside of the browser** — on your computer, a server, or anywhere else.

---

## Simple Definition

```
Before Node.js:
  JavaScript → only ran inside browsers (Chrome, Firefox...)

After Node.js:
  JavaScript → runs anywhere (servers, computers, IoT devices...)
```

Node.js is NOT a programming language.
Node.js is NOT a framework.
Node.js IS a **runtime** — an environment that executes JavaScript.

---

## What is a Runtime?

A runtime is the environment that provides everything needed to **execute code**:

```
JavaScript Code
      │
      ▼
┌─────────────────────────────┐
│        Node.js Runtime      │
│                             │
│  ┌─────────┐  ┌──────────┐  │
│  │  V8     │  │  APIs    │  │
│  │ Engine  │  │ (fs,http)│  │
│  └─────────┘  └──────────┘  │
└─────────────────────────────┘
      │
      ▼
  Output / Result
```

---

## Built On V8 Engine

Node.js is built on **Google's V8 JavaScript Engine** — the same engine that powers Google Chrome.

```
V8 Engine:
  → Written in C++
  → Developed by Google
  → Compiles JavaScript directly to machine code
  → Extremely fast execution
  → Powers both Chrome browser and Node.js
```

```
Chrome Browser          Node.js
┌────────────┐          ┌────────────┐
│ V8 Engine  │          │ V8 Engine  │
│ DOM APIs   │          │ fs, http   │
│ window     │          │ os, path   │
│ document   │          │ process    │
└────────────┘          └────────────┘
   Runs JS in             Runs JS on
   the browser            the server
```

---

## Who Created Node.js?

```
Creator   : Ryan Dahl
Year      : 2009
Written in: C++ and JavaScript
License   : MIT (open source)
Managed by: OpenJS Foundation
```

Ryan Dahl created Node.js because he was frustrated with how Apache HTTP Server handled concurrent connections — it was slow and blocking. Node.js was built to solve that.

---

## What Can You Build With Node.js?

### REST APIs and Web Servers
```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Hello from Node.js server!');
});

server.listen(3000);
```

### Real-time Applications
- Chat applications (WhatsApp-like)
- Live notifications
- Collaborative tools (Google Docs-like)
- Online gaming servers

### Command Line Tools
```bash
# Tools built with Node.js
npm        # package manager
eslint     # code linter
prettier   # code formatter
webpack    # module bundler
```

### Microservices
- Small, independent services
- Each service handles one job
- Communicate over HTTP or message queues

### File System Tools
```js
const fs = require('fs');

// Read, write, delete, copy files
fs.readFile('data.txt', 'utf8', (err, data) => {
  console.log(data);
});
```

### Streaming Applications
- Video streaming (Netflix-like)
- Audio streaming
- Large file processing

---

## Key Features of Node.js

### 1. JavaScript Everywhere
```
Frontend  → JavaScript (React, Vue, Angular)
Backend   → JavaScript (Node.js)
Database  → JavaScript (MongoDB queries)

One language for the entire stack!
```

### 2. Non-blocking / Asynchronous I/O
Node.js doesn't wait for one task to finish before starting another.

```js
// Node starts reading the file
fs.readFile('big-file.txt', (err, data) => {
  console.log('File read!'); // runs later
});

// This runs IMMEDIATELY — doesn't wait for file
console.log('I run right away!');
```

### 3. Single-threaded Event Loop
Node runs on a **single thread** but handles thousands of connections simultaneously using the Event Loop.

```
Traditional Servers     →   one thread per request
Node.js                 →   one thread, many requests (via event loop)
```

### 4. Fast Execution
- Powered by V8 — compiles JS to machine code
- Non-blocking I/O — no waiting around
- Handles thousands of requests per second

### 5. npm Ecosystem
Access to **2 million+ packages** via npm:

```bash
npm install express    # web framework
npm install mongoose   # database
npm install axios      # HTTP requests
```

### 6. Cross-platform
```
✅ Windows
✅ macOS
✅ Linux
✅ Raspberry Pi
✅ Docker containers
```

---

## Node.js vs Browser JavaScript

| Feature | Browser JS | Node.js |
|---|---|---|
| Runs in | Browser | Server / Computer |
| Can access DOM | ✅ Yes | ❌ No |
| Can access files | ❌ No | ✅ Yes |
| `window` object | ✅ Yes | ❌ No |
| `process` object | ❌ No | ✅ Yes |
| `document` object | ✅ Yes | ❌ No |
| HTTP servers | ❌ No | ✅ Yes |
| Module system | ES Modules | CommonJS + ESM |
| npm packages | Limited | ✅ Full access |

---

## When TO Use Node.js

```
✅ REST APIs and GraphQL APIs
✅ Real-time apps (chat, live updates)
✅ Streaming data (video, audio, files)
✅ Microservices architecture
✅ Command line tools
✅ Serverless functions
✅ I/O heavy applications
✅ Proxy servers
```

## When NOT to Use Node.js

```
❌ CPU-intensive tasks (video encoding, image processing)
❌ Heavy mathematical computations
❌ Machine learning model training
❌ Tasks requiring multi-threading by default

(For CPU-heavy work, Python, Go, or Java are better choices)
```

---

## Node.js Versions

Node.js releases two types of versions:

```
LTS (Long Term Support)  → stable, recommended for production
Current                  → latest features, may not be stable
```

```bash
# Check your Node version
node -v       # v20.x.x (LTS)
node --version
```

---

## Summary

```
Node.js is:
  → A JavaScript runtime (not a language or framework)
  → Built on Google's V8 engine
  → Created by Ryan Dahl in 2009
  → Non-blocking and asynchronous
  → Single-threaded with Event Loop
  → Used for servers, APIs, CLI tools, real-time apps

Key strengths:
  → JavaScript everywhere (frontend + backend)
  → Fast and scalable
  → Massive npm ecosystem (2M+ packages)
  → Perfect for I/O heavy applications

Not ideal for:
  → CPU-intensive / heavy computation tasks
```