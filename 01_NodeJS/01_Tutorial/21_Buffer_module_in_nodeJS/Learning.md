# `buffer` Module in Node.js

The `Buffer` class handles **binary data** directly in memory. It is used when working with files, network streams, images, cryptography, and any raw binary data.

---

## What is a Buffer?

```
A Buffer is a fixed-size chunk of memory (outside of V8 heap)
used to store raw binary data.

Like an array of bytes:
Buffer: [ 72, 101, 108, 108, 111 ]
String:   H    e    l    l    o
```

`Buffer` is a **global class** — no import needed.

---

## 1. Creating Buffers

### `Buffer.alloc()` — Safe, zero-filled (recommended)

```js
// Create a 10-byte buffer filled with zeros
const buf = Buffer.alloc(10);
console.log(buf); // <Buffer 00 00 00 00 00 00 00 00 00 00>

// Fill with a specific value
const buf2 = Buffer.alloc(5, 0xff);
console.log(buf2); // <Buffer ff ff ff ff ff>
```

### `Buffer.allocUnsafe()` — Fast, uninitialized (may contain old data)

```js
// Faster but contains random old memory — use with caution
const buf = Buffer.allocUnsafe(10);
console.log(buf); // <Buffer xx xx xx xx ...> (unpredictable)

// Always fill before use
buf.fill(0);
```

### `Buffer.from()` — From existing data

```js
// From a string
const buf1 = Buffer.from('Hello, World!');
console.log(buf1);           // <Buffer 48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21>
console.log(buf1.length);    // 13

// From a string with encoding
const buf2 = Buffer.from('Hello', 'utf8');
const buf3 = Buffer.from('SGVsbG8=', 'base64');

// From an array of bytes
const buf4 = Buffer.from([72, 101, 108, 108, 111]);
console.log(buf4.toString()); // Hello

// From another Buffer (copy)
const original = Buffer.from('Hello');
const copy     = Buffer.from(original);
```

---

## 2. Reading from Buffers

### `.toString()` — Convert to string

```js
const buf = Buffer.from('Hello, Node.js!');

console.log(buf.toString());          // Hello, Node.js!  (default: utf8)
console.log(buf.toString('utf8'));     // Hello, Node.js!
console.log(buf.toString('hex'));      // 48656c6c6f2c204e6f64652e6a7321
console.log(buf.toString('base64'));   // SGVsbG8sIE5vZGUuanMh

// Read a slice
console.log(buf.toString('utf8', 0, 5)); // Hello
```

### Accessing bytes

```js
const buf = Buffer.from('Hello');

console.log(buf[0]); // 72  (ASCII for 'H')
console.log(buf[1]); // 101 (ASCII for 'e')
console.log(buf[4]); // 111 (ASCII for 'o')

// Iterate
for (const byte of buf) {
  console.log(byte);
}
```

---

## 3. Writing to Buffers

```js
const buf = Buffer.alloc(10);

// Write a string
buf.write('Hello');
console.log(buf.toString()); // Hello (rest is 00 bytes)

// Write at an offset
buf.write('World', 5); // write at position 5
console.log(buf.toString()); // HelloWorld

// Direct index assignment
const buf2 = Buffer.alloc(3);
buf2[0] = 65; // 'A'
buf2[1] = 66; // 'B'
buf2[2] = 67; // 'C'
console.log(buf2.toString()); // ABC
```

---

## 4. Buffer Properties

```js
const buf = Buffer.from('Hello World');

console.log(buf.length);     // 11  (number of bytes)
console.log(buf.byteLength); // 11

// Check if Buffer
console.log(Buffer.isBuffer(buf));   // true
console.log(Buffer.isBuffer('str')); // false

// Buffer byte length of a string
console.log(Buffer.byteLength('Hello'));       // 5
console.log(Buffer.byteLength('Hello', 'utf8')); // 5
console.log(Buffer.byteLength('€'));           // 3  (UTF-8 multibyte)
```

---

## 5. Slicing and Copying

### `buf.slice()` / `buf.subarray()` — Get a portion

```js
const buf = Buffer.from('Hello World');

// slice returns a reference (shares memory)
const slice = buf.slice(0, 5);
console.log(slice.toString()); // Hello

// subarray (recommended, same as slice)
const sub = buf.subarray(6, 11);
console.log(sub.toString()); // World
```

### `buf.copy()` — Copy to another Buffer

```js
const source = Buffer.from('Hello World');
const target = Buffer.alloc(5);

source.copy(target, 0, 0, 5);
console.log(target.toString()); // Hello
```

### `Buffer.concat()` — Merge Buffers

```js
const buf1 = Buffer.from('Hello, ');
const buf2 = Buffer.from('World!');

const combined = Buffer.concat([buf1, buf2]);
console.log(combined.toString()); // Hello, World!

// With total length
const combined2 = Buffer.concat([buf1, buf2], buf1.length + buf2.length);
```

---

## 6. Comparing Buffers

```js
const buf1 = Buffer.from('ABC');
const buf2 = Buffer.from('ABC');
const buf3 = Buffer.from('XYZ');

// Compare
console.log(buf1.equals(buf2)); // true
console.log(buf1.equals(buf3)); // false

// Compare (returns -1, 0, 1)
console.log(Buffer.compare(buf1, buf2)); // 0  (equal)
console.log(Buffer.compare(buf1, buf3)); // -1 (buf1 < buf3)
console.log(Buffer.compare(buf3, buf1)); // 1  (buf3 > buf1)

// Use for sorting
const buffers = [Buffer.from('z'), Buffer.from('a'), Buffer.from('m')];
buffers.sort(Buffer.compare);
console.log(buffers.map(b => b.toString())); // ['a', 'm', 'z']
```

---

## 7. Encodings

| Encoding | Description |
|---|---|
| `utf8` | Default, Unicode text |
| `ascii` | 7-bit ASCII only |
| `hex` | Hexadecimal string |
| `base64` | Base64 encoded |
| `base64url` | URL-safe Base64 |
| `binary` / `latin1` | ISO-8859-1 |
| `ucs2` / `utf16le` | UTF-16 little-endian |

```js
const buf = Buffer.from('Hello');

console.log(buf.toString('utf8'));    // Hello
console.log(buf.toString('hex'));     // 48656c6c6f
console.log(buf.toString('base64')); // SGVsbG8=
console.log(buf.toString('ascii'));  // Hello
```

---

## 8. Reading/Writing Numbers

Buffers can store and read numbers in various formats:

```js
const buf = Buffer.alloc(4);

// Write a 32-bit unsigned integer
buf.writeUInt32BE(12345678, 0); // Big-Endian
console.log(buf.readUInt32BE(0)); // 12345678

buf.writeUInt32LE(12345678, 0); // Little-Endian
console.log(buf.readUInt32LE(0)); // 12345678

// Float
const fbuf = Buffer.alloc(4);
fbuf.writeFloatBE(3.14, 0);
console.log(fbuf.readFloatBE(0)); // 3.140000104904175
```

---

## Real World Examples

### Convert image to base64

```js
const fs     = require('fs');
const buffer = fs.readFileSync('image.png');

const base64 = buffer.toString('base64');
const dataUrl = `data:image/png;base64,${base64}`;

console.log(dataUrl.substring(0, 50) + '...');
// data:image/png;base64,iVBORw0KGgo...
```

### Copy a binary file

```js
const fs     = require('fs');
const source = fs.readFileSync('source.pdf');
const copy   = Buffer.from(source);
fs.writeFileSync('copy.pdf', copy);
console.log('File copied!');
```

### Hex encoding for tokens

```js
const crypto = require('crypto');

const token = crypto.randomBytes(32).toString('hex');
console.log(token); // 64-character hex string
// a3f8b2c1d4e5...

// Decode
const buf = Buffer.from(token, 'hex');
console.log(buf.length); // 32 bytes
```

---

## Quick Reference

| Method | What it does |
|---|---|
| `Buffer.alloc(n)` | Create n-byte zero-filled buffer |
| `Buffer.allocUnsafe(n)` | Create n-byte uninitialized buffer |
| `Buffer.from(str, enc?)` | Create from string/array/Buffer |
| `Buffer.concat([b1, b2])` | Merge multiple buffers |
| `Buffer.isBuffer(obj)` | Check if value is a Buffer |
| `Buffer.byteLength(str)` | Get byte size of string |
| `buf.toString(enc?, start?, end?)` | Convert to string |
| `buf.length` | Buffer size in bytes |
| `buf.write(str, offset?)` | Write string to buffer |
| `buf.copy(target, ...)` | Copy to another buffer |
| `buf.slice(start, end)` | Get sub-buffer (shared memory) |
| `buf.subarray(start, end)` | Get sub-buffer (recommended) |
| `buf.equals(other)` | Deep equality check |
| `buf.fill(value)` | Fill buffer with value |

---

## Summary

```
Buffer = fixed-size binary data storage (outside V8 heap)

Creating:
  Buffer.alloc(10)              → safe, zero-filled
  Buffer.allocUnsafe(10)        → fast, uninitialized
  Buffer.from('Hello')          → from string
  Buffer.from([72, 101, 108])   → from byte array

Reading:
  buf.toString()                → to string (utf8)
  buf.toString('hex')           → to hex string
  buf.toString('base64')        → to base64
  buf[0]                        → first byte (number)

Writing:
  buf.write('Hello')            → write string
  buf[0] = 72                   → write byte

Operations:
  Buffer.concat([b1, b2])       → merge buffers
  buf.slice(0, 5)               → get portion
  buf.equals(other)             → compare

Used for: files, images, streams, crypto, network data
```