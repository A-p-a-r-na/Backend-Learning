# 3 Types of Modules in Node.js

Every module you use in Node.js falls into one of **3 categories**:

```
┌──────────────────────────────────────────────────┐
│                Node.js Modules                   │
├────────────────┬─────────────────┬───────────────┤
│   Built-in     │      Local      │  Third-Party  │
│  (Core)        │   (User-made)   │    (npm)      │
└────────────────┴─────────────────┴───────────────┘
```

---

## 1. 🔧 Built-in (Core) Modules

Modules that come **pre-installed with Node.js**. No installation needed — just `require()` and use.

### How to use
```js
const fs   = require('fs');
const path = require('path');
const http = require('http');
const os   = require('os');
```

### Common Core Modules

#### `fs` — File System
Read, write, delete, and manage files.

```js
const fs = require('fs');

// Read a file
fs.readFile('hello.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Write a file
fs.writeFile('hello.txt', 'Hello Kerala!', (err) => {
  if (err) throw err;
  console.log('File written!');
});

// Delete a file
fs.unlink('hello.txt', (err) => {
  if (err) throw err;
  console.log('File deleted!');
});
```

#### `http` — Create Web Servers
```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node!');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
```

#### `path` — File Path Utilities
```js
const path = require('path');

console.log(path.join('folder', 'sub', 'file.txt'));
// folder/sub/file.txt

console.log(path.extname('index.html'));
// .html

console.log(path.basename('/home/user/app.js'));
// app.js

console.log(path.dirname('/home/user/app.js'));
// /home/user
```

#### `os` — Operating System Info
```js
const os = require('os');

console.log(os.platform());   // linux / win32 / darwin
console.log(os.arch());       // x64 / arm64
console.log(os.totalmem());   // total RAM in bytes
console.log(os.freemem());    // free RAM in bytes
console.log(os.hostname());   // machine name
console.log(os.cpus());       // CPU info array
```

#### `events` — Event Emitter
```js
const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('greet', (name) => {
  console.log(`Hello, ${name}!`);
});

emitter.emit('greet', 'Arjun'); // Hello, Arjun!
```

#### `crypto` — Hashing & Encryption
```js
const crypto = require('crypto');

const hash = crypto
  .createHash('sha256')
  .update('mypassword')
  .digest('hex');

console.log(hash); // hashed string
```

### Full List of Common Core Modules

| Module | Purpose |
|---|---|
| `fs` | Read / write files |
| `http` / `https` | Web servers |
| `path` | File path utilities |
| `os` | System information |
| `events` | Event-driven programming |
| `crypto` | Hashing, encryption |
| `url` | Parse and format URLs |
| `stream` | Handle streaming data |
| `buffer` | Handle binary data |
| `timers` | `setTimeout`, `setInterval` |
| `child_process` | Run shell commands |
| `util` | Utility functions |
| `readline` | Read input line by line |

---

## 2. 📁 Local (User-defined) Modules

Files **you create yourself** and share between parts of your project.

### Folder Structure
```
project/
├── index.js
├── math.js
├── logger.js
└── user.js
```

### Creating and Exporting
```js
// math.js
const add      = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;

module.exports = { add, subtract, multiply };
```

```js
// logger.js
module.exports = function(msg) {
  const time = new Date().toISOString();
  console.log(`[${time}] ${msg}`);
};
```

```js
// user.js
class User {
  constructor(name, age) {
    this.name = name;
    this.age  = age;
  }
  greet() {
    return `Hi, I'm ${this.name}, age ${this.age}`;
  }
}

module.exports = User;
```

### Importing Local Modules
```js
// index.js
const { add, subtract, multiply } = require('./math');
const log  = require('./logger');
const User = require('./user');

log('App started');
log(`5 + 3 = ${add(5, 3)}`);
log(`5 - 3 = ${subtract(5, 3)}`);
log(`5 x 3 = ${multiply(5, 3)}`);

const u = new User('Arjun', 25);
log(u.greet());
```

**Output:**
```
[2024-01-01T00:00:00.000Z] App started
[2024-01-01T00:00:00.000Z] 5 + 3 = 8
[2024-01-01T00:00:00.000Z] 5 - 3 = 2
[2024-01-01T00:00:00.000Z] 5 x 3 = 15
[2024-01-01T00:00:00.000Z] Hi, I'm Arjun, age 25
```

### Path Rules for Local Modules
```js
require('./math')      // same folder
require('../math')     // one folder up
require('../../math')  // two folders up
require('./utils/math') // inside a subfolder
```

> Always start with `./` or `../` for local modules.
> Without it, Node thinks it's a core or npm module.

---

## 3. 📦 Third-Party Modules (npm)

Packages built by the **community**, installed via npm (Node Package Manager).

### Install and Use
```bash
npm install express      # web framework
npm install lodash       # utility functions
npm install axios        # HTTP requests
npm install dotenv       # environment variables
npm install mongoose     # MongoDB ODM
```

### Example — Express
```js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(3000, () => console.log('Server on port 3000'));
```

### Example — dotenv
```bash
# .env
PORT=3000
DB_NAME=mydb
SECRET=abc123
```

```js
require('dotenv').config();

console.log(process.env.PORT);    // 3000
console.log(process.env.DB_NAME); // mydb
```

### Example — axios
```js
const axios = require('axios');

async function getUser() {
  const res = await axios.get('https://api.github.com/users/octocat');
  console.log(res.data.name);
}

getUser();
```

### Popular npm Packages

| Package | Purpose |
|---|---|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `axios` | HTTP requests |
| `dotenv` | Environment variables |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT authentication |
| `nodemon` | Auto-restart on file change |
| `lodash` | Utility functions |
| `cors` | Enable CORS headers |
| `multer` | File uploads |
| `socket.io` | Real-time communication |
| `jest` | Testing framework |

---

## How Node Resolves Modules

When you call `require('something')`, Node checks in this order:

```
1. Is it a core module? (fs, path, http...)
   ✅ Yes → load it immediately

2. Does it start with ./ or ../ ?
   ✅ Yes → it's a local file → find the file

3. None of the above?
   → Look in node_modules folder
   → Walk up directories until found
   → Throw error if not found
```

```js
require('fs');        // ✅ core module
require('./math');    // ✅ local file
require('express');   // ✅ node_modules
require('unknown');   // ❌ Error: Cannot find module
```

---

## Summary

| Type | Source | Needs Install | How to Require |
|---|---|---|---|
| **Built-in** | Ships with Node | ❌ No | `require('fs')` |
| **Local** | Your own files | ❌ No | `require('./file')` |
| **Third-party** | npm registry | ✅ Yes | `require('express')` |

```
Built-in    → Node's own tools (fs, http, path, os...)
Local       → Your files     (./math, ./logger, ./user...)
Third-party → npm packages   (express, axios, lodash...)
```