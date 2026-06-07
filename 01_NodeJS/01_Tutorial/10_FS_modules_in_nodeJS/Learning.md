# The `fs` Module in Node.js

The `fs` (File System) module is a **built-in Node.js module** that lets you work with files and folders on your computer — read, write, update, delete, rename, and more.

---

## Importing fs

```js
// CommonJS
const fs = require('fs');

// ES Modules
import fs from 'fs';

// Promises API (modern — recommended)
const fs = require('fs/promises');
import fs from 'fs/promises';
```

---

## Two Styles — Async vs Sync

Every `fs` method comes in **two versions**:

```
Async (non-blocking) → fs.readFile()     ← USE THIS
Sync  (blocking)     → fs.readFileSync() ← avoid in production
```

```js
// ✅ Async — doesn't block other code
fs.readFile('file.txt', 'utf8', (err, data) => {
  console.log(data);
});
console.log('This runs first!'); // doesn't wait

// ⚠️ Sync — blocks everything until done
const data = fs.readFileSync('file.txt', 'utf8');
console.log(data);
console.log('This runs after file is read');
```

### Three API styles in fs

```js
// Style 1 — Callback (traditional)
const fs = require('fs');
fs.readFile('file.txt', 'utf8', (err, data) => { ... });

// Style 2 — Promises (modern, recommended)
const fs = require('fs/promises');
const data = await fs.readFile('file.txt', 'utf8');

// Style 3 — Sync (blocking, avoid in servers)
const fs = require('fs');
const data = fs.readFileSync('file.txt', 'utf8');
```

---

## 1. Reading Files

### `fs.readFile()` — Async Callback
```js
const fs = require('fs');

fs.readFile('hello.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err.message);
    return;
  }
  console.log(data);
});
```

### `fs.readFile()` — Promises
```js
const fs = require('fs/promises');

async function readFile() {
  try {
    const data = await fs.readFile('hello.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

readFile();
```

### `fs.readFileSync()` — Synchronous
```js
const fs = require('fs');

try {
  const data = fs.readFileSync('hello.txt', 'utf8');
  console.log(data);
} catch (err) {
  console.error('Error:', err.message);
}
```

### Reading as Buffer (no encoding)
```js
const fs = require('fs');

fs.readFile('image.png', (err, buffer) => {
  if (err) throw err;
  console.log(buffer);        // <Buffer 89 50 4e 47 ...>
  console.log(buffer.length); // file size in bytes
});
```

---

## 2. Writing Files

### `fs.writeFile()` — Creates or Overwrites
```js
const fs = require('fs');

// Callback style
fs.writeFile('output.txt', 'Hello, Node.js!', 'utf8', (err) => {
  if (err) throw err;
  console.log('File written!');
});

// Promises style
const fs = require('fs/promises');

async function writeFile() {
  try {
    await fs.writeFile('output.txt', 'Hello, Node.js!', 'utf8');
    console.log('File written!');
  } catch (err) {
    console.error('Error:', err.message);
  }
}
```

> ⚠️ `writeFile` **overwrites** the file if it already exists!

### `fs.writeFileSync()` — Synchronous
```js
const fs = require('fs');

fs.writeFileSync('output.txt', 'Hello World!', 'utf8');
console.log('Done!');
```

### Writing JSON to a file
```js
const fs = require('fs/promises');

const user = {
  name: 'Arjun',
  age: 25,
  city: 'Kerala'
};

async function saveUser() {
  await fs.writeFile('user.json', JSON.stringify(user, null, 2), 'utf8');
  console.log('User saved!');
}

saveUser();
```

**Output in `user.json`:**
```json
{
  "name": "Arjun",
  "age": 25,
  "city": "Kerala"
}
```

---

## 3. Appending to Files

### `fs.appendFile()` — Add to end of file
```js
const fs = require('fs');

// Callback
fs.appendFile('log.txt', 'New log entry\n', 'utf8', (err) => {
  if (err) throw err;
  console.log('Log appended!');
});

// Promises
const fs = require('fs/promises');

async function addLog(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  await fs.appendFile('log.txt', line, 'utf8');
}

addLog('Server started');
addLog('User logged in');
```

**Output in `log.txt`:**
```
[2024-01-01T10:00:00.000Z] Server started
[2024-01-01T10:05:00.000Z] User logged in
```

### `fs.appendFileSync()` — Synchronous
```js
const fs = require('fs');

fs.appendFileSync('log.txt', 'Another entry\n', 'utf8');
```

---

## 4. Deleting Files

### `fs.unlink()` — Delete a file
```js
const fs = require('fs');

// Callback
fs.unlink('old-file.txt', (err) => {
  if (err) throw err;
  console.log('File deleted!');
});

// Promises
const fs = require('fs/promises');

async function deleteFile(path) {
  try {
    await fs.unlink(path);
    console.log(`${path} deleted!`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('File not found');
    } else {
      throw err;
    }
  }
}

deleteFile('old-file.txt');
```

---

## 5. Renaming / Moving Files

### `fs.rename()` — Rename or move a file
```js
const fs = require('fs');

// Rename
fs.rename('old-name.txt', 'new-name.txt', (err) => {
  if (err) throw err;
  console.log('File renamed!');
});

// Move (rename with different path)
fs.rename('file.txt', 'archive/file.txt', (err) => {
  if (err) throw err;
  console.log('File moved!');
});

// Promises
const fs = require('fs/promises');

await fs.rename('draft.txt', 'final.txt');
```

---

## 6. Copying Files

### `fs.copyFile()` — Copy a file
```js
const fs = require('fs');

// Callback
fs.copyFile('source.txt', 'destination.txt', (err) => {
  if (err) throw err;
  console.log('File copied!');
});

// Promises
const fs = require('fs/promises');

await fs.copyFile('config.json', 'config.backup.json');
console.log('Backup created!');
```

### Copy flags
```js
const { COPYFILE_EXCL } = fs.constants;

// COPYFILE_EXCL — fails if destination already exists
fs.copyFile('source.txt', 'dest.txt', COPYFILE_EXCL, (err) => {
  if (err) throw err; // throws if dest.txt exists
  console.log('Copied!');
});
```

---

## 7. Checking if File Exists

### `fs.access()` — Check file accessibility
```js
const fs = require('fs');

fs.access('file.txt', fs.constants.F_OK, (err) => {
  if (err) {
    console.log('File does NOT exist');
  } else {
    console.log('File exists');
  }
});

// Check read permission
fs.access('file.txt', fs.constants.R_OK, (err) => {
  console.log(err ? 'Cannot read' : 'Can read');
});
```

### Promises style
```js
const fs = require('fs/promises');

async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

const exists = await fileExists('config.json');
console.log('Exists:', exists); // true or false
```

---

## 8. File Stats (Info)

### `fs.stat()` — Get file information
```js
const fs = require('fs');

fs.stat('file.txt', (err, stats) => {
  if (err) throw err;

  console.log('Is file?      ', stats.isFile());       // true
  console.log('Is directory? ', stats.isDirectory());   // false
  console.log('Size (bytes)  ', stats.size);            // 1024
  console.log('Created       ', stats.birthtime);       // Date
  console.log('Modified      ', stats.mtime);           // Date
});

// Promises
const fs = require('fs/promises');

const stats = await fs.stat('file.txt');
console.log('Size:', stats.size, 'bytes');
console.log('Modified:', stats.mtime);
```

### `stats` properties

| Property | What it returns |
|---|---|
| `stats.isFile()` | `true` if it's a file |
| `stats.isDirectory()` | `true` if it's a folder |
| `stats.size` | Size in bytes |
| `stats.birthtime` | When it was created |
| `stats.mtime` | When it was last modified |
| `stats.atime` | When it was last accessed |
| `stats.mode` | File permissions |

---

## 9. Working with Directories

### `fs.mkdir()` — Create a folder
```js
const fs = require('fs');

// Create one folder
fs.mkdir('new-folder', (err) => {
  if (err) throw err;
  console.log('Folder created!');
});

// Create nested folders (recursive)
fs.mkdir('parent/child/grandchild', { recursive: true }, (err) => {
  if (err) throw err;
  console.log('Nested folders created!');
});

// Promises
const fs = require('fs/promises');

await fs.mkdir('logs/2024/january', { recursive: true });
```

### `fs.readdir()` — List folder contents
```js
const fs = require('fs');

// Callback
fs.readdir('.', (err, files) => {
  if (err) throw err;
  console.log(files);
  // ['index.js', 'package.json', 'node_modules', ...]
});

// With file types
fs.readdir('.', { withFileTypes: true }, (err, entries) => {
  entries.forEach(entry => {
    if (entry.isFile())      console.log('FILE:', entry.name);
    if (entry.isDirectory()) console.log('DIR: ', entry.name);
  });
});

// Promises
const fs = require('fs/promises');

const files = await fs.readdir('./src');
console.log(files);
```

### `fs.rmdir()` / `fs.rm()` — Delete a folder
```js
const fs = require('fs');

// Delete empty folder
fs.rmdir('empty-folder', (err) => {
  if (err) throw err;
  console.log('Deleted!');
});

// Delete folder with contents (recursive)
fs.rm('folder-with-files', { recursive: true, force: true }, (err) => {
  if (err) throw err;
  console.log('Folder and contents deleted!');
});

// Promises
const fs = require('fs/promises');

await fs.rm('dist', { recursive: true, force: true });
console.log('dist folder cleaned!');
```

---

## 10. Watching Files

### `fs.watch()` — Watch for changes
```js
const fs = require('fs');

fs.watch('file.txt', (eventType, filename) => {
  console.log(`Event: ${eventType}`);   // 'rename' or 'change'
  console.log(`File: ${filename}`);     // file.txt
});

console.log('Watching file.txt for changes...');
```

### Watch a folder
```js
const fs = require('fs');

fs.watch('./src', { recursive: true }, (eventType, filename) => {
  console.log(`[${eventType}] ${filename}`);
});
```

---

## 11. Streams — Reading/Writing Large Files

For large files, use **streams** instead of `readFile` to avoid loading everything into memory.

### Readable Stream
```js
const fs = require('fs');

const readStream = fs.createReadStream('large-file.txt', 'utf8');

readStream.on('data', (chunk) => {
  console.log('Chunk received:', chunk.length, 'bytes');
});

readStream.on('end', () => {
  console.log('Finished reading!');
});

readStream.on('error', (err) => {
  console.error('Error:', err.message);
});
```

### Writable Stream
```js
const fs = require('fs');

const writeStream = fs.createWriteStream('output.txt');

writeStream.write('Line 1\n');
writeStream.write('Line 2\n');
writeStream.write('Line 3\n');
writeStream.end();

writeStream.on('finish', () => {
  console.log('Writing complete!');
});
```

### Piping Streams (copy large file efficiently)
```js
const fs = require('fs');

const readStream  = fs.createReadStream('big-input.txt');
const writeStream = fs.createWriteStream('big-output.txt');

readStream.pipe(writeStream);

writeStream.on('finish', () => {
  console.log('File copied via stream!');
});
```

---

## 12. Common Error Codes

```js
fs.readFile('missing.txt', 'utf8', (err, data) => {
  if (err) {
    switch (err.code) {
      case 'ENOENT':
        console.log('File not found');
        break;
      case 'EACCES':
        console.log('Permission denied');
        break;
      case 'EISDIR':
        console.log('Expected a file, got a directory');
        break;
      case 'EEXIST':
        console.log('File already exists');
        break;
      default:
        console.log('Unknown error:', err.message);
    }
  }
});
```

| Error Code | Meaning |
|---|---|
| `ENOENT` | File or directory not found |
| `EACCES` | Permission denied |
| `EEXIST` | File already exists |
| `EISDIR` | Expected file, got directory |
| `ENOTDIR` | Expected directory, got file |
| `EMFILE` | Too many open files |

---

## Real World Example — Simple Logger

```js
// logger.js
const fs   = require('fs/promises');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'app.log');

async function log(level, message) {
  const timestamp = new Date().toISOString();
  const line      = `[${timestamp}] [${level}] ${message}\n`;

  // Print to console
  console.log(line.trim());

  // Append to log file
  await fs.appendFile(LOG_FILE, line, 'utf8');
}

async function readLogs() {
  try {
    const content = await fs.readFile(LOG_FILE, 'utf8');
    return content.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

async function clearLogs() {
  await fs.writeFile(LOG_FILE, '', 'utf8');
  console.log('Logs cleared!');
}

module.exports = { log, readLogs, clearLogs };
```

```js
// index.js
const { log, readLogs, clearLogs } = require('./logger');

async function main() {
  await log('INFO',  'Server started on port 3000');
  await log('INFO',  'Database connected');
  await log('WARN',  'Memory usage above 80%');
  await log('ERROR', 'Failed to fetch user data');

  console.log('\n--- All Logs ---');
  const logs = await readLogs();
  logs.forEach(l => console.log(l));
}

main();
```

**Output:**
```
[2024-01-01T10:00:00.000Z] [INFO]  Server started on port 3000
[2024-01-01T10:00:01.000Z] [INFO]  Database connected
[2024-01-01T10:00:02.000Z] [WARN]  Memory usage above 80%
[2024-01-01T10:00:03.000Z] [ERROR] Failed to fetch user data

--- All Logs ---
[2024-01-01T10:00:00.000Z] [INFO]  Server started on port 3000
...
```

---

## fs Methods — Quick Reference

| Method | What it does |
|---|---|
| `fs.readFile()` | Read file contents |
| `fs.writeFile()` | Write / create file (overwrites) |
| `fs.appendFile()` | Add content to end of file |
| `fs.unlink()` | Delete a file |
| `fs.rename()` | Rename or move a file |
| `fs.copyFile()` | Copy a file |
| `fs.access()` | Check if file exists / is accessible |
| `fs.stat()` | Get file info (size, dates...) |
| `fs.mkdir()` | Create a folder |
| `fs.readdir()` | List folder contents |
| `fs.rm()` | Delete folder (with contents) |
| `fs.watch()` | Watch file/folder for changes |
| `fs.createReadStream()` | Read large files in chunks |
| `fs.createWriteStream()` | Write large files in chunks |

---

## Summary

```
fs = built-in module for file system operations

Import:
  const fs = require('fs');           // callbacks
  const fs = require('fs/promises');  // async/await (recommended)

Three API styles:
  Callback  → fs.readFile(path, cb)
  Promises  → await fs.readFile(path)    ← recommended
  Sync      → fs.readFileSync(path)      ← avoid in servers

Key operations:
  Read    → fs.readFile()
  Write   → fs.writeFile()     (overwrites)
  Append  → fs.appendFile()    (adds to end)
  Delete  → fs.unlink()        (files)
  Delete  → fs.rm()            (folders)
  Rename  → fs.rename()
  Copy    → fs.copyFile()
  Exists  → fs.access()
  Info    → fs.stat()
  List    → fs.readdir()
  Watch   → fs.watch()
  Stream  → fs.createReadStream() / createWriteStream()

Always handle errors — files may not exist, permissions may be missing!
```