# `stream` Module in Node.js

Streams are one of the most powerful features in Node.js. They allow you to **process data piece by piece (chunks)** instead of loading everything into memory at once — essential for large files, network data, and real-time processing.

---

## What is a Stream?

```
Without Streams:
  Read entire file → store in memory → process → done
  ❌ 1GB file = 1GB RAM used

With Streams:
  Read chunk → process chunk → read next chunk → ...
  ✅ 1GB file = only a few KB of RAM used at a time
```

```
Real world analogy:
  Without streams → fill a bucket completely, then carry it
  With streams    → water flows through a pipe continuously
```

---

## Importing

```js
const stream = require('stream');

// Or use specific stream classes
const { Readable, Writable, Transform, Duplex, pipeline, finished } = require('stream');
```

---

## 4 Types of Streams

```
┌─────────────────────────────────────────────────────┐
│                  Stream Types                       │
├──────────────┬───────────┬─────────────────────────┤
│   Readable   │  Writable │  Duplex  │  Transform   │
│              │           │          │              │
│  Read data   │ Write data│ Read AND │ Read, modify │
│  from source │ to dest   │  Write   │ and Write    │
│              │           │          │              │
│  fs.Read     │ fs.Write  │  TCP     │  zlib.gzip   │
│  Stream      │ Stream    │  socket  │  crypto      │
│  http.req    │ http.res  │          │  csv-parser  │
└──────────────┴───────────┴──────────┴──────────────┘
```

---

## Part 1 — Readable Streams

A Readable stream is a **source of data** you can read from.

### Reading a file with a Readable Stream

```js
const fs = require('fs');

const readStream = fs.createReadStream('large-file.txt', {
  encoding:  'utf8',   // decode chunks as strings
  highWaterMark: 64 * 1024  // chunk size: 64KB (default 64KB)
});

// 'data' event — fires for each chunk
readStream.on('data', (chunk) => {
  console.log(`Received chunk: ${chunk.length} chars`);
  console.log(chunk.substring(0, 50) + '...');
});

// 'end' event — all data has been read
readStream.on('end', () => {
  console.log('Finished reading file!');
});

// 'error' event — something went wrong
readStream.on('error', (err) => {
  console.error('Error:', err.message);
});
```

---

### Readable Stream Modes

```
Flowing mode  → data flows automatically via 'data' event
Paused mode   → data must be pulled manually via .read()
```

```js
const fs = require('fs');

const stream = fs.createReadStream('file.txt', 'utf8');

// ── Flowing mode (automatic) ──────────────────
stream.on('data', (chunk) => {
  console.log(chunk);
});

// ── Paused mode (manual) ──────────────────────
stream.on('readable', () => {
  let chunk;
  while ((chunk = stream.read(1024)) !== null) {
    console.log('Read:', chunk.length, 'bytes');
  }
});

// Pause and resume
stream.pause();
setTimeout(() => stream.resume(), 2000);
```

---

### Creating a Custom Readable Stream

```js
const { Readable } = require('stream');

class CounterStream extends Readable {
  constructor(max) {
    super();
    this.current = 1;
    this.max     = max;
  }

  _read() {
    if (this.current <= this.max) {
      this.push(`Number: ${this.current}\n`);
      this.current++;
    } else {
      this.push(null); // null signals end of stream
    }
  }
}

const counter = new CounterStream(5);

counter.on('data',  (chunk) => process.stdout.write(chunk));
counter.on('end',   ()      => console.log('Done!'));
```

**Output:**
```
Number: 1
Number: 2
Number: 3
Number: 4
Number: 5
Done!
```

### Readable from array / generator

```js
const { Readable } = require('stream');

// From array
const stream = Readable.from(['Hello\n', 'World\n', 'Node.js\n']);
stream.on('data', (chunk) => process.stdout.write(chunk));

// From async generator
async function* generateNumbers() {
  for (let i = 1; i <= 5; i++) {
    yield `${i}\n`;
  }
}

const numStream = Readable.from(generateNumbers());
numStream.pipe(process.stdout);
```

---

## Part 2 — Writable Streams

A Writable stream is a **destination** you can write data to.

### Writing to a file with a Writable Stream

```js
const fs = require('fs');

const writeStream = fs.createWriteStream('output.txt', {
  encoding: 'utf8',
  flags:    'w'  // 'w' = overwrite, 'a' = append
});

// Write chunks
writeStream.write('Line 1\n');
writeStream.write('Line 2\n');
writeStream.write('Line 3\n');

// Signal end of writing
writeStream.end('Last line\n');

// 'finish' event — all data flushed to disk
writeStream.on('finish', () => {
  console.log('All data written to file!');
});

// 'error' event
writeStream.on('error', (err) => {
  console.error('Write error:', err.message);
});
```

---

### Backpressure — Handling `write()` Return Value

`write()` returns `false` when the internal buffer is full — you should stop writing until the `drain` event fires.

```js
const fs = require('fs');

const writeStream = fs.createWriteStream('big-output.txt');

function writeData(i) {
  while (i <= 1000000) {
    const data = `Line ${i}\n`;
    const canContinue = writeStream.write(data);

    if (!canContinue) {
      // Buffer is full — wait for drain
      console.log('Buffer full, pausing...');
      writeStream.once('drain', () => {
        console.log('Buffer drained, resuming...');
        writeData(i + 1); // continue from where we left off
      });
      return;
    }
    i++;
  }

  writeStream.end();
}

writeData(1);
```

---

### Creating a Custom Writable Stream

```js
const { Writable } = require('stream');

class LoggerStream extends Writable {
  constructor() {
    super();
    this.logs = [];
  }

  _write(chunk, encoding, callback) {
    const line = chunk.toString().trim();
    this.logs.push(`[${new Date().toISOString()}] ${line}`);
    console.log('Logged:', line);
    callback(); // MUST call callback when done
  }
}

const logger = new LoggerStream();

logger.write('Server started\n');
logger.write('User logged in\n');
logger.write('Request received\n');
logger.end();

logger.on('finish', () => {
  console.log('\nAll logs:', logger.logs);
});
```

---

## Part 3 — Pipe — Connecting Streams

`pipe()` connects a Readable to a Writable — data flows automatically with backpressure handled.

### Basic pipe

```js
const fs = require('fs');

const readStream  = fs.createReadStream('input.txt');
const writeStream = fs.createWriteStream('output.txt');

// Pipe: read from input.txt → write to output.txt
readStream.pipe(writeStream);

writeStream.on('finish', () => {
  console.log('File copied!');
});
```

### Chain multiple pipes

```js
const fs   = require('fs');
const zlib = require('zlib');

// Compress a file: read → gzip → write
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())                        // compress
  .pipe(fs.createWriteStream('input.txt.gz'));    // write compressed

console.log('Compressing...');
```

### Decompress

```js
const fs   = require('fs');
const zlib = require('zlib');

// Decompress: read .gz → gunzip → write
fs.createReadStream('input.txt.gz')
  .pipe(zlib.createGunzip())
  .pipe(fs.createWriteStream('input-restored.txt'));
```

---

## Part 4 — Transform Streams

A Transform stream **reads input, transforms it, and outputs it**. It is both Readable and Writable.

### Built-in Transform streams

```js
const zlib = require('zlib');

// zlib.createGzip()    → compress
// zlib.createGunzip()  → decompress
// crypto streams       → encrypt / decrypt
```

### Creating a Custom Transform Stream

```js
const { Transform } = require('stream');

// Transform: convert text to uppercase
class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    const upper = chunk.toString().toUpperCase();
    this.push(upper); // push transformed data
    callback();       // signal done with this chunk
  }
}

const fs        = require('fs');
const upperCase = new UpperCaseTransform();

fs.createReadStream('input.txt')
  .pipe(upperCase)
  .pipe(fs.createWriteStream('output.txt'));
```

### Multiple Transforms in a chain

```js
const { Transform } = require('stream');
const fs = require('fs');

// Transform 1: remove blank lines
class RemoveBlankLines extends Transform {
  _transform(chunk, encoding, callback) {
    const result = chunk.toString()
      .split('\n')
      .filter(line => line.trim() !== '')
      .join('\n');
    this.push(result);
    callback();
  }
}

// Transform 2: add line numbers
class AddLineNumbers extends Transform {
  constructor() {
    super();
    this.lineNumber = 1;
  }

  _transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n');
    const numbered = lines
      .map(line => `${this.lineNumber++}: ${line}`)
      .join('\n');
    this.push(numbered);
    callback();
  }
}

// Chain: read → remove blanks → add numbers → write
fs.createReadStream('input.txt')
  .pipe(new RemoveBlankLines())
  .pipe(new AddLineNumbers())
  .pipe(fs.createWriteStream('output.txt'));
```

---

## Part 5 — Duplex Streams

A Duplex stream is **both Readable and Writable** but the two sides are independent (unlike Transform).

```js
const { Duplex } = require('stream');

class MyDuplex extends Duplex {
  constructor() {
    super();
    this.data = ['chunk1', 'chunk2', 'chunk3'];
  }

  // Readable side
  _read() {
    const chunk = this.data.shift();
    this.push(chunk || null);
  }

  // Writable side
  _write(chunk, encoding, callback) {
    console.log('Received:', chunk.toString());
    callback();
  }
}

const duplex = new MyDuplex();
duplex.on('data', (chunk) => console.log('Read:', chunk.toString()));
duplex.write('Hello from writable side');
```

---

## Part 6 — `pipeline()` — Safe Piping (Recommended)

`pipeline()` is the **safe alternative to `.pipe()`** — it properly handles errors and cleans up all streams.

```js
const { pipeline } = require('stream');
const { promisify } = require('util');
const fs   = require('fs');
const zlib = require('zlib');

const pipelineAsync = promisify(pipeline);

// Compress a file safely
async function compressFile(input, output) {
  await pipelineAsync(
    fs.createReadStream(input),
    zlib.createGzip(),
    fs.createWriteStream(output)
  );
  console.log('Compression done!');
}

compressFile('big-file.txt', 'big-file.txt.gz');
```

### `stream.pipeline` with error handling

```js
const { pipeline } = require('stream');
const fs   = require('fs');
const zlib = require('zlib');

pipeline(
  fs.createReadStream('file.txt'),
  zlib.createGzip(),
  fs.createWriteStream('file.gz'),
  (err) => {
    if (err) {
      console.error('Pipeline failed:', err.message);
    } else {
      console.log('Pipeline succeeded!');
    }
  }
);
```

### Node 15+ — `stream/promises`

```js
const { pipeline } = require('stream/promises');
const fs   = require('fs');
const zlib = require('zlib');

async function compress() {
  await pipeline(
    fs.createReadStream('file.txt'),
    zlib.createGzip(),
    fs.createWriteStream('file.gz')
  );
  console.log('Done!');
}

compress();
```

---

## Part 7 — Stream Events

### Readable Events

| Event | When it fires |
|---|---|
| `data` | A chunk of data is available |
| `end` | No more data to read |
| `readable` | Data available to read manually |
| `error` | An error occurred |
| `close` | Stream and underlying resource closed |
| `pause` | Stream was paused |
| `resume` | Stream resumed from paused state |

### Writable Events

| Event | When it fires |
|---|---|
| `finish` | All data has been flushed |
| `drain` | Buffer emptied — safe to write again |
| `error` | An error occurred |
| `close` | Stream and underlying resource closed |
| `pipe` | A readable stream was piped to this |
| `unpipe` | A readable stream was unpiped |

---

## Part 8 — `.pipe()` vs `pipeline()`

```
.pipe()                         pipeline()
──────────────────────────────────────────────────────
Simple syntax                   More verbose
Error in middle? source keeps   Cleans up ALL streams
flowing (memory leak!)          on error or completion
Manual error handling           Automatic cleanup
No cleanup on finish            Properly destroys streams
res.pipe(writeStream)           For production code
```

```js
// ❌ .pipe() — memory leak on error
readStream
  .pipe(transformStream)
  .pipe(writeStream);
// if transformStream errors → readStream keeps reading!

// ✅ pipeline() — always use this
pipeline(readStream, transformStream, writeStream, (err) => {
  if (err) console.error(err);
});
```

---

## Real World Examples

### Stream HTTP response to file

```js
const https    = require('https');
const fs       = require('fs');
const { pipeline } = require('stream');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      pipeline(
        response,
        fs.createWriteStream(dest),
        (err) => err ? reject(err) : resolve()
      );
    });
  });
}

downloadFile('https://example.com/large-file.zip', 'download.zip')
  .then(() => console.log('Downloaded!'))
  .catch(console.error);
```

### Process a large CSV file line by line

```js
const fs       = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input:    fs.createReadStream('data.csv'),
  terminal: false
});

let count = 0;

rl.on('line', (line) => {
  const [id, name, email] = line.split(',');
  count++;
  // process each row without loading entire file
});

rl.on('close', () => {
  console.log(`Processed ${count} rows`);
});
```

### Compress and encrypt a file

```js
const fs     = require('fs');
const zlib   = require('zlib');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');

async function compressAndEncrypt(inputFile, outputFile, password) {
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv  = crypto.randomBytes(16);

  await pipeline(
    fs.createReadStream(inputFile),
    zlib.createGzip(),
    crypto.createCipheriv('aes-256-cbc', key, iv),
    fs.createWriteStream(outputFile)
  );

  console.log('Compressed and encrypted!');
}

compressAndEncrypt('data.txt', 'data.txt.gz.enc', 'mypassword');
```

---

## Quick Reference

| Class / Method | What it does |
|---|---|
| `fs.createReadStream(path)` | Readable stream from file |
| `fs.createWriteStream(path)` | Writable stream to file |
| `zlib.createGzip()` | Transform: compress |
| `zlib.createGunzip()` | Transform: decompress |
| `readable.pipe(writable)` | Connect streams |
| `pipeline(...streams, cb)` | Safe pipe with cleanup |
| `stream/promises pipeline` | Async/await pipeline |
| `readable.on('data', fn)` | Handle each chunk |
| `readable.on('end', fn)` | Handle stream end |
| `writable.write(chunk)` | Write a chunk |
| `writable.end()` | Signal end of writing |
| `writable.on('finish', fn)` | All data written |
| `writable.on('drain', fn)` | Buffer empty, resume |
| `Readable.from(iterable)` | Stream from array/generator |

---

## Summary

```
stream = process data in chunks, not all at once

4 types:
  Readable   → source  (fs.createReadStream, http request)
  Writable   → dest    (fs.createWriteStream, http response)
  Transform  → modify  (zlib.gzip, crypto, uppercase)
  Duplex     → both    (TCP socket, net.Socket)

Key methods:
  readable.pipe(writable)  → connect (simple)
  pipeline(r, t, w, cb)    → connect safely (recommended)

Key events:
  Readable: 'data', 'end', 'error'
  Writable: 'finish', 'drain', 'error'

Why use streams?
  ✅ Memory efficient (chunks vs whole file)
  ✅ Time efficient (process while reading)
  ✅ Composable (pipe multiple transforms)
  ✅ Built into Node's core (http, fs, crypto, zlib)

Always use pipeline() over .pipe() in production!
```