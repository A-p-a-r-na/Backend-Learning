# `events` Module in Node.js

The `events` module provides the **EventEmitter** class — the foundation of Node.js's event-driven architecture. Most built-in Node.js modules (like `fs`, `http`, `stream`) are built on top of EventEmitter.

---

## Importing

```js
const EventEmitter = require('events');
```

---

## Basic Usage

```js
const EventEmitter = require('events');

// Create an emitter instance
const emitter = new EventEmitter();

// Register a listener (subscribe)
emitter.on('greet', (name) => {
  console.log(`Hello, ${name}!`);
});

// Emit an event (publish)
emitter.emit('greet', 'Arjun'); // Hello, Arjun!
emitter.emit('greet', 'Kerala'); // Hello, Kerala!
```

---

## Core Methods

### `emitter.on(event, listener)` — Listen for an event

Registers a listener that runs **every time** the event fires.

```js
emitter.on('data', (value) => {
  console.log('Data received:', value);
});

emitter.emit('data', 42);  // Data received: 42
emitter.emit('data', 100); // Data received: 100
```

---

### `emitter.once(event, listener)` — Listen only once

Listener runs **only the first time** the event fires, then removes itself.

```js
emitter.once('connect', () => {
  console.log('Connected!'); // runs only once
});

emitter.emit('connect'); // Connected!
emitter.emit('connect'); // nothing — listener already removed
```

---

### `emitter.emit(event, ...args)` — Trigger an event

Fires all listeners for the given event, passing any arguments.

```js
emitter.on('message', (from, text) => {
  console.log(`${from}: ${text}`);
});

emitter.emit('message', 'Arjun', 'Hello World!');
// Arjun: Hello World!
```

---

### `emitter.off(event, listener)` — Remove a listener

Removes a specific listener from an event.

```js
function handleData(data) {
  console.log('Got:', data);
}

emitter.on('data', handleData);

emitter.emit('data', 'first');  // Got: first

emitter.off('data', handleData); // remove listener

emitter.emit('data', 'second'); // nothing — listener removed
```

---

### `emitter.removeAllListeners(event?)` — Remove all listeners

```js
emitter.on('update', () => console.log('Listener 1'));
emitter.on('update', () => console.log('Listener 2'));

emitter.removeAllListeners('update'); // removes both

emitter.emit('update'); // nothing

// Remove ALL listeners for ALL events
emitter.removeAllListeners();
```

---

### `emitter.listeners(event)` — Get all listeners

```js
emitter.on('test', () => console.log('A'));
emitter.on('test', () => console.log('B'));

console.log(emitter.listeners('test').length); // 2
```

---

### `emitter.listenerCount(event)` — Count listeners

```js
emitter.on('click', () => {});
emitter.on('click', () => {});

console.log(emitter.listenerCount('click')); // 2
```

---

### `emitter.eventNames()` — List all registered events

```js
emitter.on('start',   () => {});
emitter.on('stop',    () => {});
emitter.on('restart', () => {});

console.log(emitter.eventNames());
// ['start', 'stop', 'restart']
```

---

## The `error` Event — Special Handling

The `error` event is special. If emitted without a listener it **crashes the app**.

```js
// Without listener — CRASHES
emitter.emit('error', new Error('Something went wrong!'));
// UnhandledError: Something went wrong! (app crashes)

// With listener — SAFE
emitter.on('error', (err) => {
  console.error('Caught error:', err.message);
});

emitter.emit('error', new Error('Something went wrong!'));
// Caught error: Something went wrong!
```

---

## Max Listeners Warning

By default, Node.js warns if you add more than **10 listeners** to one event (memory leak warning).

```js
// Default max is 10 — adding 11+ triggers warning
for (let i = 0; i < 11; i++) {
  emitter.on('data', () => {});
}
// MaxListenersExceededWarning!

// Increase the limit
emitter.setMaxListeners(20);

// Set to 0 for unlimited (use carefully)
emitter.setMaxListeners(0);

// Check current limit
console.log(emitter.getMaxListeners()); // 10
```

---

## Extending EventEmitter (Most Common Pattern)

The real power is **extending EventEmitter** in your own classes:

```js
const EventEmitter = require('events');

class Database extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
  }

  connect() {
    // Simulate async connection
    setTimeout(() => {
      this.connected = true;
      this.emit('connect', { host: 'localhost', port: 5432 });
    }, 1000);
  }

  query(sql) {
    if (!this.connected) {
      this.emit('error', new Error('Not connected to database'));
      return;
    }
    // Simulate query
    setTimeout(() => {
      const result = [{ id: 1, name: 'Arjun' }];
      this.emit('result', result);
    }, 500);
  }

  disconnect() {
    this.connected = false;
    this.emit('disconnect');
  }
}

// Usage
const db = new Database();

db.on('connect',    (info)   => console.log('Connected to', info.host));
db.on('result',     (rows)   => console.log('Query result:', rows));
db.on('error',      (err)    => console.error('DB Error:', err.message));
db.on('disconnect', ()       => console.log('Disconnected'));

db.connect();

setTimeout(() => {
  db.query('SELECT * FROM users');
}, 1500);
```

**Output:**
```
Connected to localhost
Query result: [{ id: 1, name: 'Arjun' }]
```

---

## Real World — Event-Driven Logger

```js
const EventEmitter = require('events');
const fs           = require('fs/promises');

class Logger extends EventEmitter {
  constructor(logFile) {
    super();
    this.logFile = logFile;
    this.on('log', this._writeToFile.bind(this));
  }

  async _writeToFile({ level, message }) {
    const line = `[${new Date().toISOString()}] [${level}] ${message}\n`;
    await fs.appendFile(this.logFile, line);
  }

  info(message)  { this.emit('log', { level: 'INFO',  message }); }
  warn(message)  { this.emit('log', { level: 'WARN',  message }); }
  error(message) { this.emit('log', { level: 'ERROR', message }); }
}

const logger = new Logger('app.log');

logger.info('Server started');
logger.warn('High memory usage');
logger.error('Database connection failed');
```

---

## EventEmitter vs Callbacks

```
Callbacks:
  → One-time response
  → Tight coupling between caller and callee
  → Hard to add multiple handlers

EventEmitter:
  → Multiple listeners for same event
  → Loose coupling (emitter doesn't know who listens)
  → Easy to add/remove listeners dynamically
  → Built into most Node.js core modules
```

---

## Quick Reference

| Method | What it does |
|---|---|
| `emitter.on(event, fn)` | Add listener (runs every time) |
| `emitter.once(event, fn)` | Add listener (runs only once) |
| `emitter.emit(event, ...args)` | Fire all listeners for event |
| `emitter.off(event, fn)` | Remove specific listener |
| `emitter.removeAllListeners(event?)` | Remove all listeners |
| `emitter.listeners(event)` | Get array of listeners |
| `emitter.listenerCount(event)` | Count listeners for event |
| `emitter.eventNames()` | List all registered event names |
| `emitter.setMaxListeners(n)` | Set max listeners limit |

---

## Summary

```
events = built-in module for event-driven programming

Core pattern:
  emitter.on('event', handler)   → subscribe
  emitter.emit('event', data)    → publish
  emitter.off('event', handler)  → unsubscribe

Key rules:
  → Always handle the 'error' event (or app crashes)
  → Use once() for one-time events (connection, startup)
  → Extend EventEmitter in your own classes
  → Default max listeners = 10 (increase if needed)

Used everywhere in Node.js:
  fs streams, http servers, child processes, net sockets
  all extend EventEmitter under the hood
```