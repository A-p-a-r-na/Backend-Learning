// Import the built-in 'http' module from Node.js
// This module allows us to create HTTP servers and handle requests/responses
import http from "http";

// ─────────────────────────────────────────────
// EXAMPLE 1: Plain Text Response
// ─────────────────────────────────────────────
// const server = http.createServer((req, res) => {
//   // req  → incoming request object (contains URL, headers, method, body, etc.)
//   // res  → outgoing response object (used to send data back to the client)

//   // writeHead() sets the HTTP status code and response headers
//   // 200 means "OK" (request was successful)
//   // "Content-Type: text/plain" tells the browser to expect plain text
//   res.writeHead(200, { "Content-Type": "text/plain" });

//   // res.end() sends the response body and signals that the response is complete
//   res.end("Hello, World!");
// });

// ─────────────────────────────────────────────
// EXAMPLE 2: JSON Response
// ─────────────────────────────────────────────
// const server = http.createServer((req, res) => {
//   // A plain JavaScript object to send as the response
//   const test = {
//     name: "John Doe",
//     age: 30,
//     city: "New York",
//   };

//   // "Content-Type: application/json" tells the client to expect JSON data
//   res.writeHead(200, { "Content-Type": "application/json" });

//   // JSON.stringify() converts the JS object → JSON string before sending
//   // because res.end() only accepts strings or Buffers, not raw objects
//   res.end(JSON.stringify(test));
// });

// ─────────────────────────────────────────────
// EXAMPLE 3: Inline HTML Response
// ─────────────────────────────────────────────
// const server = http.createServer((req, res) => {
//   // "Content-Type: text/html" tells the browser to render this as HTML
//   res.writeHead(200, { "Content-Type": "text/html" });

//   // You can pass an HTML string directly — the browser will render it
//   res.end("<h1>Hello, World!</h1><p>This is an HTML response from the Node.js HTTP server.</p>");
// });

// ─────────────────────────────────────────────
// EXAMPLE 4: Serve an HTML File from Disk
// ─────────────────────────────────────────────
// import fs from "fs/promises";
// // fs/promises gives us the async/await-friendly version of the file system module

// const server = http.createServer((req, res) => {
//   res.writeHead(200, { "Content-Type": "text/html" });

//   // fs.readFile() asynchronously reads the file contents as a UTF-8 string
//   fs.readFile(
//     "01_NodeJS/01_Tutorial/13_HTTP_module_in_nodeJS/index.html",
//     "utf8",   // encoding — returns a string instead of a raw Buffer
//   )
//     .then((content) => {
//       // 'content' holds the full HTML file as a string — send it as the response
//       res.end(content);
//     })
//     .catch((err) => {
//       // If the file doesn't exist or can't be read, log the error
//       // Note: you should also send an error response to the client here
//       console.error("Error reading HTML file:", err);
//     });
// });

// server.listen() starts the server and makes it listen for incoming connections
// 3000 is the port number — you can access it at http://localhost:3000 in your browser
// The callback function runs once the server has successfully started
server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
