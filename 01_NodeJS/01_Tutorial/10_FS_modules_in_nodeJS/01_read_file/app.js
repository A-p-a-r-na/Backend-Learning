// ============================================================
// FS MODULE — THREE WAYS TO READ A FILE IN NODE.JS
// ============================================================

// ── METHOD 1: readFileSync (Synchronous / Blocking) ──────────
// import fs from "fs";

// readFileSync BLOCKS the entire program until the file is read
// "base64" encoding is used here — returns file as base64 string
// const contentBuffer = fs.readFileSync(
//   "01_NodeJS/01_Tutorial/10_FS_modules_in_nodeJS/index.html", "base64"
// );

// readFileSync returns a Buffer by default
// .toString() converts the Buffer → readable string
// const content = contentBuffer.toString();
// console.log(content);




// ── METHOD 2: readFile (Asynchronous / Callback) ─────────────
// import fs from "fs";

// readFile is NON-BLOCKING — it takes a callback function
// Node.js registers the callback and moves on immediately
// The callback runs LATER when the file is fully read
// fs.readFile(
//   "01_NodeJS/01_Tutorial/10_FS_modules_in_nodeJS/index.html",
//   (err, data) => {
//     // err  → contains error object if something went wrong (null if success)
//     // data → contains the file content as a Buffer
//     const content = data.toString(); // convert Buffer → string
//     console.log(content);
//   },
// );

// This line runs BEFORE the file content is printed
// because readFile is async — it doesn't wait for the file
// console.log("This will be printed before the content of the file");




// ── METHOD 3: fs/promises with async/await (Modern / Recommended) ──

// Import fs from "fs/promises" — the Promise-based version of fs
// This allows us to use async/await instead of callbacks
import fs from "fs/promises";

// Top-level await — works only in ES Modules ("type": "module" in package.json)
// fs.readFile() here returns a Promise
// "await" pauses execution until the Promise resolves (file is fully read)
// No callback needed — cleaner and more readable than Method 2
const a = await fs.readFile(
    "01_NodeJS/01_Tutorial/10_FS_modules_in_nodeJS/index.html",
  // No encoding specified → returns a Buffer by default
);

// Convert the Buffer to a human-readable string
// You could also pass "utf8" to readFile directly to skip this step:
// await fs.readFile("...", "utf8")
console.log(a.toString());

// This line runs AFTER the file content is printed
// because "await" makes the code wait for the file to be read first
// Unlike Method 2 (callback), execution order is predictable here
console.log("End 1");

//One small tip — you can skip the .toString() call by passing "utf8" directly to readFile:
const b = await fs.readFile("01_NodeJS/01_Tutorial/10_FS_modules_in_nodeJS/index.html", "utf8");
console.log(b); // already a string, no .toString() needed
console.log("End 2");

