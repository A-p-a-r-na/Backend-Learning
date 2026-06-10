# `http` / `https` Module in Node.js

The `http` and `https` modules are built-in Node.js modules for creating **web servers** and making **HTTP/HTTPS requests** without any third-party libraries.

---

## Importing

```js
const http  = require('http');   // for HTTP
const https = require('https');  // for HTTPS (SSL)
```

---

## Part 1 — Creating HTTP Servers

### Basic HTTP Server

```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
```

---

### The `req` Object (IncomingMessage)

Contains everything about the **incoming request**:

```js
const http = require('http');

const server = http.createServer((req, res) => {
  console.log(req.method);      // GET, POST, PUT, DELETE
  console.log(req.url);         // /about, /api/users
  console.log(req.headers);     // { host, content-type, ... }
  console.log(req.httpVersion); // 1.1

  res.end('Request received!');
});

server.listen(3000);
```

---

### The `res` Object (ServerResponse)

Used to **send back a response** to the client:

```js
const server = http.createServer((req, res) => {
  // Set status code and headers
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'MyValue'
  });

  // OR set them separately
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');

  // Send response body
  res.write('<h1>Hello</h1>');    // write in chunks
  res.write('<p>World</p>');
  res.end();                       // finish the response

  // OR send everything at once
  res.end('<h1>Hello World</h1>');
});
```

---

### Routing — Handle Different URLs

```js
const http = require('http');

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // Home page
  if (url === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Home Page</h1>');
  }

  // About page
  else if (url === '/about' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>About Page</h1>');
  }

  // API endpoint
  else if (url === '/api/users' && method === 'GET') {
    const users = [
      { id: 1, name: 'Arjun' },
      { id: 2, name: 'Kerala' }
    ];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  }

  // 404 Not Found
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

server.listen(3000, () => {
  console.log('Server on http://localhost:3000');
});
```

---

### Handling POST Request Body

```js
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/users') {

    let body = '';

    // Data comes in chunks — collect them
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    // All data received
    req.on('end', () => {
      const user = JSON.parse(body);
      console.log('New user:', user);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User created', user }));
    });

  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000);
```

---

### Serving HTML Files

```js
const http = require('http');
const fs   = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    const filePath = path.join(__dirname, 'index.html');

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
});

server.listen(3000);
```

---

### Common HTTP Status Codes

```js
res.writeHead(200); // OK
res.writeHead(201); // Created
res.writeHead(204); // No Content
res.writeHead(301); // Moved Permanently (redirect)
res.writeHead(302); // Found (temporary redirect)
res.writeHead(400); // Bad Request
res.writeHead(401); // Unauthorized
res.writeHead(403); // Forbidden
res.writeHead(404); // Not Found
res.writeHead(500); // Internal Server Error
```

---

### Server Events

```js
const server = http.createServer(handler);

server.listen(3000, () => {
  console.log('Server started!');
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
});

server.on('close', () => {
  console.log('Server closed!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server shut down gracefully');
    process.exit(0);
  });
});
```

---

## Part 2 — Making HTTP Requests

### `http.get()` — Simple GET Request

```js
const http = require('http');

http.get('http://jsonplaceholder.typicode.com/posts/1', (res) => {
  let data = '';

  // Collect response chunks
  res.on('data', (chunk) => {
    data += chunk;
  });

  // Response fully received
  res.on('end', () => {
    const post = JSON.parse(data);
    console.log(post.title);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
```

---

### `https.get()` — HTTPS GET Request

```js
const https = require('https');

https.get('https://jsonplaceholder.typicode.com/users/1', (res) => {
  let data = '';

  res.on('data', (chunk) => { data += chunk; });

  res.on('end', () => {
    const user = JSON.parse(data);
    console.log('User:', user.name);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
```

---

### `http.request()` — Full Control (POST, PUT, DELETE)

```js
const https = require('https');

const postData = JSON.stringify({
  title:  'My Post',
  body:   'Hello World',
  userId: 1
});

const options = {
  hostname: 'jsonplaceholder.typicode.com',
  port:     443,
  path:     '/posts',
  method:   'POST',
  headers: {
    'Content-Type':   'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';

  console.log('Status:', res.statusCode); // 201

  res.on('data', (chunk) => { data += chunk; });

  res.on('end', () => {
    console.log('Response:', JSON.parse(data));
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
});

// Send the request body
req.write(postData);
req.end();
```

---

## Part 3 — HTTPS Server

### Creating an HTTPS Server

Requires SSL certificate and private key:

```js
const https = require('https');
const fs    = require('fs');

const options = {
  key:  fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem')
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('Secure Hello!');
});

server.listen(443, () => {
  console.log('HTTPS Server on https://localhost:443');
});
```

---

## http vs https

| Feature | `http` | `https` |
|---|---|---|
| Port | 80 (default) | 443 (default) |
| Encryption | ❌ No | ✅ SSL/TLS |
| Certificate needed | ❌ No | ✅ Yes |
| Production use | ❌ Not recommended | ✅ Always use |
| URL prefix | `http://` | `https://` |

---

## Real World — Mini REST API

```js
const http = require('http');

// In-memory data store
let users = [
  { id: 1, name: 'Arjun' },
  { id: 2, name: 'Kerala' }
];

function getBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body ? JSON.parse(body) : {}));
  });
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  res.setHeader('Content-Type', 'application/json');

  // GET all users
  if (method === 'GET' && url === '/users') {
    res.writeHead(200);
    res.end(JSON.stringify(users));
  }

  // GET one user
  else if (method === 'GET' && url.startsWith('/users/')) {
    const id   = parseInt(url.split('/')[2]);
    const user = users.find(u => u.id === id);
    if (user) {
      res.writeHead(200);
      res.end(JSON.stringify(user));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'User not found' }));
    }
  }

  // POST create user
  else if (method === 'POST' && url === '/users') {
    const body = await getBody(req);
    const user = { id: users.length + 1, ...body };
    users.push(user);
    res.writeHead(201);
    res.end(JSON.stringify(user));
  }

  // DELETE user
  else if (method === 'DELETE' && url.startsWith('/users/')) {
    const id = parseInt(url.split('/')[2]);
    users    = users.filter(u => u.id !== id);
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Deleted' }));
  }

  // 404
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(3000, () => {
  console.log('API running on http://localhost:3000');
});
```

---

## Summary

```
http/https = built-in modules for web servers and HTTP requests

Creating a server:
  http.createServer((req, res) => { ... }).listen(3000)

req object:
  req.method    → GET, POST, PUT, DELETE
  req.url       → /path/to/resource
  req.headers   → request headers
  req.on('data') → read request body chunks

res object:
  res.writeHead(statusCode, headers)
  res.setHeader(key, value)
  res.write(data)
  res.end(data)

Making requests:
  http.get(url, callback)          → simple GET
  https.get(url, callback)         → secure GET
  http.request(options, callback)  → full control (POST/PUT/DELETE)

http  → port 80,  no encryption
https → port 443, SSL/TLS encryption (use in production)
```