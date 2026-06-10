# Browser vs Node.js

Both the Browser and Node.js run JavaScript — but they are very different environments with different capabilities, APIs, and purposes.

---

## The Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│                    JavaScript Engine (V8)                   │
│              (Same engine — different environment)          │
├──────────────────────────┬──────────────────────────────────┤
│        BROWSER           │           NODE.JS                │
│                          │                                  │
│  Runs JS on client side  │  Runs JS on server side          │
│  User interacts with UI  │  Handles files, APIs, DBs        │
│  Has DOM, window, fetch  │  Has fs, http, os, path          │
│  Sandboxed (secure)      │  Full system access              │
└──────────────────────────┴──────────────────────────────────┘
```

---

## 1. Purpose

### Browser
Runs JavaScript to **build and control user interfaces** in web pages.

```js
// Browser JS — manipulates the webpage
document.getElementById('btn').addEventListener('click', () => {
  document.body.style.backgroundColor = 'blue';
  alert('Button clicked!');
});
```

### Node.js
Runs JavaScript to **build servers, tools, and backend systems**.

```js
// Node.js — creates a web server
const http = require('http');

http.createServer((req, res) => {
  res.end('Hello from the server!');
}).listen(3000);
```

---

## 2. JavaScript Engine

Both use the **V8 engine** — but wrapped in different environments:

```
Chrome Browser                    Node.js
┌─────────────────────┐           ┌─────────────────────┐
│  V8 Engine          │           │  V8 Engine          │
│  + Browser APIs     │           │  + Node.js APIs     │
│    (DOM, fetch,     │           │    (fs, http,       │
│     localStorage)   │           │     os, path)       │
└─────────────────────┘           └─────────────────────┘
```

```
Same V8 → same JavaScript syntax, same performance
Different wrappers → different available APIs
```

---

## 3. Global Object

The **global object** is different in each environment:

### Browser — `window`
```js
// In the browser, the global object is "window"
console.log(window);            // the global object
console.log(window.innerWidth); // browser window width
console.log(window.location);   // current URL

// These are the same:
alert('Hello');
window.alert('Hello');

// Variables declared globally become window properties
var name = 'Arjun';
console.log(window.name); // 'Arjun'
```

### Node.js — `global`
```js
// In Node.js, the global object is "global"
console.log(global);

// Node-specific globals
console.log(global.process);  // process info
console.log(global.__dirname); // current directory
console.log(global.__filename); // current file path

// Variables do NOT become global properties in Node
var name = 'Arjun';
console.log(global.name); // undefined
```

### `globalThis` — Works in Both ✅
```js
// globalThis works everywhere — browser AND Node.js
console.log(globalThis);

// In browser  → same as window
// In Node.js  → same as global
```

---

## 4. DOM — Document Object Model

### Browser — Has DOM ✅
```js
// Full DOM access in the browser
document.title = 'My Page';
document.body.innerHTML = '<h1>Hello</h1>';

const div = document.createElement('div');
div.classList.add('container');
document.body.appendChild(div);

document.querySelector('#btn').addEventListener('click', () => {
  console.log('clicked!');
});
```

### Node.js — No DOM ❌
```js
// This throws ReferenceError in Node.js
document.querySelector('#btn'); // ❌ ReferenceError: document is not defined
window.alert('hello');          // ❌ ReferenceError: window is not defined
```

```
Browser → has document, window, DOM, BOM
Node.js → none of these exist
```

---

## 5. File System Access

### Browser — No File System Access ❌
```js
// Browsers CANNOT access your computer's files directly
// (security restriction — sandboxed environment)
const fs = require('fs'); // ❌ doesn't work in browser

// Only way is via user-triggered File Input:
<input type="file" onchange="handleFile(event)" />

function handleFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => console.log(e.target.result);
  reader.readAsText(file);
}
```

### Node.js — Full File System Access ✅
```js
// Node.js has complete access to the file system
const fs = require('fs/promises');

// Read files
const data = await fs.readFile('data.txt', 'utf8');

// Write files
await fs.writeFile('output.txt', 'Hello!');

// Delete files
await fs.unlink('old.txt');

// Create directories
await fs.mkdir('new-folder', { recursive: true });
```

---

## 6. Modules System

### Browser
Browsers support **ES Modules** natively (modern browsers):

```html
<!-- In HTML -->
<script type="module" src="app.js"></script>
```

```js
// app.js — ES Modules only in browser
import { add } from './math.js';
export function multiply(a, b) { return a * b; }

// ❌ require() does NOT work in browser
const fs = require('fs'); // ReferenceError!
```

### Node.js
Node.js supports **both** CommonJS and ES Modules:

```js
// CommonJS (default)
const fs   = require('fs');
const math = require('./math');
module.exports = { add };

// ES Modules (with "type":"module" in package.json)
import fs   from 'fs';
import math from './math.js';
export function add(a, b) { return a + b; }
```

---

## 7. APIs Available

### Browser-only APIs ❌ (not in Node.js)

```js
// DOM manipulation
document.querySelector('.btn');
document.createElement('div');

// Browser storage
localStorage.setItem('key', 'value');
sessionStorage.getItem('key');
indexedDB.open('myDB');
document.cookie;

// Browser UI
alert('Hello!');
confirm('Are you sure?');
prompt('Enter name:');

// Browser info
window.innerWidth;
window.location.href;
window.navigator.userAgent;
window.history.back();

// Browser media
navigator.mediaDevices.getUserMedia({ video: true });
navigator.geolocation.getCurrentPosition(cb);

// Canvas / WebGL
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Fetch API (available in modern Node too, but originated in browser)
fetch('https://api.example.com/data');
```

### Node.js-only APIs ❌ (not in browser)

```js
// File system
const fs = require('fs');
fs.readFile('file.txt', callback);

// Operating system info
const os = require('os');
os.platform(); // 'linux' / 'win32' / 'darwin'
os.cpus();     // CPU info
os.freemem();  // Available RAM

// Child processes
const { exec } = require('child_process');
exec('ls -la', (err, stdout) => console.log(stdout));

// HTTP server
const http = require('http');
http.createServer(handler).listen(3000);

// Process info
process.env.NODE_ENV;    // environment variables
process.argv;            // command line arguments
process.exit(0);         // exit the program
process.cwd();           // current working directory

// Path utilities
const path = require('path');
path.join(__dirname, 'file.txt');

// Crypto
const crypto = require('crypto');
crypto.createHash('sha256').update('password').digest('hex');

// Worker threads
const { Worker } = require('worker_threads');
```

### APIs Available in BOTH ✅

```js
// Console
console.log('works everywhere');
console.error('error!');
console.warn('warning!');

// Timers
setTimeout(() => {}, 1000);
setInterval(() => {}, 1000);
clearTimeout(id);
clearInterval(id);

// Promises & async/await
const data = await fetchSomething();
Promise.all([p1, p2, p3]);

// URL API
new URL('https://example.com/path?q=1');

// Fetch API (Node 18+)
fetch('https://api.example.com');

// Encoding
btoa('hello');  // base64 encode
atob('aGVsbG8='); // base64 decode

// Web Crypto API (Node 15+)
crypto.subtle.digest('SHA-256', data);

// Streams (similar but different implementations)
// Blob, File, FormData
// TextEncoder / TextDecoder
// AbortController
// EventTarget
```

---

## 8. Security Model

### Browser — Sandboxed (Restricted)
```
Browser security restrictions:
  ❌ Cannot access local files
  ❌ Cannot make requests to other domains (CORS)
  ❌ Cannot access OS resources
  ❌ Cannot run system commands
  ❌ Cannot access other browser tabs
  ✅ User is protected from malicious websites
```

### Node.js — Full System Access
```
Node.js has NO sandbox by default:
  ✅ Full file system access
  ✅ Can run system commands (exec, spawn)
  ✅ Can access environment variables
  ✅ Can open network connections
  ✅ Can access databases
  ⚠️ You are responsible for security!
```

---

## 9. `this` at Top Level

### Browser
```js
// In browser scripts, top-level "this" = window
console.log(this === window); // true
console.log(this);            // Window object

// In browser ES Modules, top-level "this" = undefined
// (inside <script type="module">)
console.log(this); // undefined
```

### Node.js
```js
// In Node.js CommonJS, top-level "this" = module.exports
console.log(this === module.exports); // true
console.log(this);                    // {}

// In Node.js ES Modules, top-level "this" = undefined
console.log(this); // undefined
```

---

## 10. Event Handling

### Browser — DOM Events
```js
// Browser events are tied to user actions and DOM
document.addEventListener('click', (e) => {
  console.log('Clicked:', e.target);
});

window.addEventListener('resize', () => {
  console.log('Window resized:', window.innerWidth);
});

document.addEventListener('keydown', (e) => {
  console.log('Key pressed:', e.key);
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM is ready!');
});
```

### Node.js — EventEmitter
```js
// Node.js events use the EventEmitter class
const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('data', (payload) => {
  console.log('Data received:', payload);
});

emitter.on('error', (err) => {
  console.error('Error:', err.message);
});

emitter.emit('data', { id: 1, name: 'Arjun' });

// Built-in Node events
process.on('exit', (code) => {
  console.log('Process exiting with code:', code);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught error:', err);
});
```

---

## 11. Debugging

### Browser
```
Tools: Chrome DevTools, Firefox DevTools
  → Sources tab  → set breakpoints in JS
  → Console tab  → run JS live
  → Network tab  → inspect HTTP requests
  → Performance  → profile JS execution
  → Memory       → detect memory leaks

Usage:
  → Open browser → F12 → DevTools
  → Or right-click → Inspect
```

### Node.js
```bash
# Built-in debugger
node --inspect index.js           # starts debugger
node --inspect-brk index.js       # break on first line

# Then open: chrome://inspect in Chrome

# Console debugging
console.log('value:', variable);
console.table(arrayOfObjects);
console.time('label');
console.timeEnd('label');

# External tools
# VS Code debugger (built-in)
# ndb (Node debugger)
```

---

## 12. Running JavaScript

### Browser
```html
<!-- Method 1: inline script -->
<script>
  console.log('Hello from browser!');
</script>

<!-- Method 2: external file -->
<script src="app.js"></script>

<!-- Method 3: ES Module -->
<script type="module" src="app.js"></script>
```

### Node.js
```bash
# Method 1: run a file
node index.js
node app.js

# Method 2: REPL (interactive)
node
> console.log('Hello!')
> 2 + 2

# Method 3: inline code
node -e "console.log('Hello from terminal!')"

# Method 4: with ES modules
node --input-type=module app.js
```

---

## Full Comparison Table

| Feature | Browser | Node.js |
|---|---|---|
| **Purpose** | UI / Frontend | Server / Backend |
| **JS Engine** | V8 (Chrome), SpiderMonkey (Firefox) | V8 only |
| **Global object** | `window` | `global` |
| **DOM access** | ✅ Yes | ❌ No |
| **File system** | ❌ No | ✅ Yes |
| **HTTP server** | ❌ No | ✅ Yes |
| **OS access** | ❌ No | ✅ Yes |
| **Module system** | ES Modules only | CommonJS + ESM |
| **`require()`** | ❌ No | ✅ Yes |
| **`import/export`** | ✅ Yes | ✅ Yes |
| **`__dirname`** | ❌ No | ✅ Yes |
| **`process`** | ❌ No | ✅ Yes |
| **`localStorage`** | ✅ Yes | ❌ No |
| **`document`** | ✅ Yes | ❌ No |
| **`fetch`** | ✅ Yes | ✅ Node 18+ |
| **`alert()`** | ✅ Yes | ❌ No |
| **Security** | Sandboxed | Full access |
| **Events** | DOM events | EventEmitter |
| **Debugging** | DevTools | `--inspect` + DevTools |
| **`setTimeout`** | ✅ Yes | ✅ Yes |
| **`console`** | ✅ Yes | ✅ Yes |
| **`Promise`** | ✅ Yes | ✅ Yes |
| **Top-level `this`** | `window` (scripts) | `module.exports` (CJS) |

---

## Summary

```
BROWSER                         NODE.JS
──────────────────────────────────────────────────
Purpose   → frontend UI         → backend / server
Global    → window              → global
DOM       → ✅ full access      → ❌ doesn't exist
Files     → ❌ sandboxed        → ✅ full access
OS/System → ❌ no access        → ✅ full access
Modules   → ES Modules only     → CommonJS + ESM
Security  → sandboxed, safe     → full power, your responsibility
Events    → DOM events          → EventEmitter
Run code  → <script> tag        → node filename.js

Shared:
  → Same V8 JS engine
  → Same JS syntax
  → console, setTimeout, Promise, fetch (Node 18+)
  → async/await, ES6+ features
  → globalThis works in both

Key rule:
  Browser = JavaScript for users
  Node.js = JavaScript for servers and systems
```