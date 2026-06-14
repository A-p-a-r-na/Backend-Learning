# `url` Module in Node.js

The `url` module provides utilities for **URL parsing, formatting, and manipulation**. Node.js also provides the WHATWG `URL` class globally (no import needed in modern Node).

---

## Two APIs

```
Legacy API  → require('url') → url.parse(), url.format()
Modern API  → URL class      → new URL() (recommended)
```

---

## Importing

```js
const url = require('url');

// URL class is global in Node 10+ (no import needed)
const myUrl = new URL('https://example.com');
```

---

## Part 1 — Modern WHATWG URL API (Recommended)

### `new URL(input, base?)` — Parse a URL

```js
const myUrl = new URL('https://www.example.com:8080/path/page?name=arjun&age=25#section');

console.log(myUrl.href);       // https://www.example.com:8080/path/page?name=arjun&age=25#section
console.log(myUrl.protocol);   // https:
console.log(myUrl.host);       // www.example.com:8080
console.log(myUrl.hostname);   // www.example.com
console.log(myUrl.port);       // 8080
console.log(myUrl.pathname);   // /path/page
console.log(myUrl.search);     // ?name=arjun&age=25
console.log(myUrl.hash);       // #section
console.log(myUrl.origin);     // https://www.example.com:8080
```

### URL with relative path

```js
const base     = 'https://example.com/products/';
const relative = new URL('item?id=1', base);

console.log(relative.href);
// https://example.com/products/item?id=1
```

---

### `url.searchParams` — Query Parameters

The `searchParams` property is a `URLSearchParams` object for working with query strings.

```js
const myUrl = new URL('https://example.com/search?name=arjun&city=kerala&age=25');

// Get a value
console.log(myUrl.searchParams.get('name'));    // arjun
console.log(myUrl.searchParams.get('city'));    // kerala
console.log(myUrl.searchParams.get('missing')); // null

// Check if exists
console.log(myUrl.searchParams.has('name'));  // true
console.log(myUrl.searchParams.has('email')); // false

// Get all values for a key (e.g., ?tag=js&tag=node)
const tagsUrl = new URL('https://example.com?tag=js&tag=node&tag=react');
console.log(tagsUrl.searchParams.getAll('tag')); // ['js', 'node', 'react']

// Iterate over all params
for (const [key, value] of myUrl.searchParams) {
  console.log(`${key}: ${value}`);
}
// name: arjun
// city: kerala
// age: 25

// Convert to plain object
const params = Object.fromEntries(myUrl.searchParams);
console.log(params); // { name: 'arjun', city: 'kerala', age: '25' }
```

### Modifying searchParams

```js
const myUrl = new URL('https://example.com/search');

// Add params
myUrl.searchParams.set('name', 'Arjun');
myUrl.searchParams.set('page', '1');
myUrl.searchParams.append('tag', 'node');
myUrl.searchParams.append('tag', 'js');

console.log(myUrl.href);
// https://example.com/search?name=Arjun&page=1&tag=node&tag=js

// Delete a param
myUrl.searchParams.delete('page');

// Sort params alphabetically
myUrl.searchParams.sort();

console.log(myUrl.search);
// ?name=Arjun&tag=node&tag=js
```

---

### Modifying URL Parts

```js
const myUrl = new URL('https://example.com/old-path?a=1');

myUrl.pathname = '/new-path';
myUrl.search   = '?b=2';
myUrl.hash     = '#top';

console.log(myUrl.href);
// https://example.com/new-path?b=2#top
```

---

## Part 2 — `URLSearchParams` Standalone

Build query strings without a full URL:

```js
const params = new URLSearchParams();

params.set('name', 'Arjun');
params.set('city', 'Kerala');
params.append('tag', 'node');
params.append('tag', 'js');

console.log(params.toString());
// name=Arjun&city=Kerala&tag=node&tag=js

// From an object
const params2 = new URLSearchParams({ name: 'Arjun', page: '2' });
console.log(params2.toString());
// name=Arjun&page=2

// From a string
const params3 = new URLSearchParams('name=Arjun&age=25');
console.log(params3.get('name')); // Arjun
```

---

## Part 3 — Legacy `url` Module

The older API — still works but use the modern `URL` class instead.

### `url.parse()` — Parse a URL (Legacy)

```js
const url    = require('url');
const parsed = url.parse('https://example.com:8080/path?name=arjun#section', true);

console.log(parsed.protocol); // https:
console.log(parsed.host);     // example.com:8080
console.log(parsed.hostname); // example.com
console.log(parsed.port);     // 8080
console.log(parsed.pathname); // /path
console.log(parsed.query);    // { name: 'arjun' }  (parsed as object when true)
console.log(parsed.hash);     // #section
```

### `url.format()` — Build URL from Object (Legacy)

```js
const url = require('url');

const built = url.format({
  protocol: 'https',
  hostname: 'example.com',
  port:     8080,
  pathname: '/api/users',
  query:    { page: 1, limit: 10 }
});

console.log(built);
// https://example.com:8080/api/users?page=1&limit=10
```

---

## Part 4 — `url.fileURLToPath()` and `url.pathToFileURL()`

Used for converting between file URLs and file paths (important in ESM).

```js
const { fileURLToPath, pathToFileURL } = require('url');

// file URL → file path
const filePath = fileURLToPath('file:///home/user/project/app.js');
console.log(filePath); // /home/user/project/app.js

// file path → file URL
const fileUrl = pathToFileURL('/home/user/project/app.js');
console.log(fileUrl.href); // file:///home/user/project/app.js

// Common ESM pattern for __dirname
import { fileURLToPath } from 'url';
import { dirname }       from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
```

---

## Real World Examples

### Build an API URL dynamically

```js
function buildApiUrl(base, endpoint, params = {}) {
  const url = new URL(endpoint, base);
  Object.entries(params).forEach(([key, val]) => {
    url.searchParams.set(key, val);
  });
  return url.href;
}

buildApiUrl('https://api.example.com', '/users', { page: 1, limit: 10, sort: 'name' });
// https://api.example.com/users?page=1&limit=10&sort=name
```

### Parse query string from a request

```js
const http = require('http');

const server = http.createServer((req, res) => {
  const baseUrl = `http://${req.headers.host}`;
  const myUrl   = new URL(req.url, baseUrl);

  const page  = myUrl.searchParams.get('page')  || '1';
  const limit = myUrl.searchParams.get('limit') || '10';
  const sort  = myUrl.searchParams.get('sort')  || 'id';

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ page, limit, sort }));
});

server.listen(3000);
// GET /users?page=2&limit=5 → { page: '2', limit: '5', sort: 'id' }
```

---

## Quick Reference

| Method / Property | What it does |
|---|---|
| `new URL(input, base?)` | Parse a URL |
| `url.href` | Full URL string |
| `url.protocol` | `https:` |
| `url.host` | `example.com:8080` |
| `url.hostname` | `example.com` |
| `url.port` | `8080` |
| `url.pathname` | `/path/page` |
| `url.search` | `?key=value` |
| `url.hash` | `#section` |
| `url.searchParams` | `URLSearchParams` object |
| `searchParams.get(key)` | Get query param value |
| `searchParams.set(key, val)` | Set query param |
| `searchParams.append(key, val)` | Add query param |
| `searchParams.delete(key)` | Remove query param |
| `searchParams.has(key)` | Check if param exists |
| `fileURLToPath(fileUrl)` | File URL → path |
| `pathToFileURL(path)` | Path → file URL |

---

## Summary

```
url = module for URL parsing and manipulation

Modern API (recommended):
  new URL('https://example.com/path?key=val')
  url.pathname, url.hostname, url.searchParams...

Query params:
  url.searchParams.get('key')
  url.searchParams.set('key', 'value')
  url.searchParams.toString()

Legacy API (avoid in new code):
  url.parse(urlString, true)
  url.format(urlObject)

ESM helper:
  fileURLToPath(import.meta.url)  → get __filename equivalent
```