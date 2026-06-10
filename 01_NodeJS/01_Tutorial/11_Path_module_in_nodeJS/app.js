// Import the built-in 'path' module from Node.js
// It provides utilities for working with file and directory paths
// Automatically handles differences between OS path styles:
//   Windows  → uses backslashes  : C:\Users\file.txt
//   Mac/Linux → uses forward slashes : /home/user/file.txt
import path from "path";

// ─────────────────────────────────────────────
// Sample path used throughout the examples
// ─────────────────────────────────────────────
const filePath = "C:/Users/ACER/OneDrive/Desktop/test.png";

// ─────────────────────────────────────────────
// path.basename() — Get the file name from a path
// ─────────────────────────────────────────────
// Returns the last portion of a path (the filename with extension)
console.log(path.basename(filePath)); // → test.png

// Pass a second argument to strip the extension too
console.log(path.basename(filePath, ".png")); // → test

// ─────────────────────────────────────────────
// path.extname() — Get the file extension
// ─────────────────────────────────────────────
// Returns the extension of the file including the dot
// Useful for checking file types (e.g. only allow .png, .jpg uploads)
console.log(path.extname(filePath)); // → .png

// ─────────────────────────────────────────────
// path.dirname() — Get the folder/directory path
// ─────────────────────────────────────────────
// Returns everything EXCEPT the last segment (the filename)
// Useful when you need to know which folder a file lives in
console.log(path.dirname(filePath)); // → C:/Users/ACER/OneDrive/Desktop

// ─────────────────────────────────────────────
// path.parse() — Break a path into all its parts at once
// ─────────────────────────────────────────────
// Returns an object with: root, dir, base, ext, name
// Handy when you need multiple pieces of info about a path
const parsed = path.parse(filePath);
console.log(parsed);
// → {
//     root: 'C:/',
//     dir:  'C:/Users/ACER/OneDrive/Desktop',
//     base: 'test.png',
//     ext:  '.png',
//     name: 'test'
//   }

// ─────────────────────────────────────────────
// path.join() — Build a path by joining segments
// ─────────────────────────────────────────────
// Joins multiple path segments with the correct OS separator
// Also cleans up extra/double slashes automatically
// Best practice: always use path.join() instead of manually writing "folder/" + "file"
const joined = path.join("users", "john", "documents", "file.txt");
console.log(joined); // → users/john/documents/file.txt  (Mac/Linux)
// → users\john\documents\file.txt  (Windows)

// ─────────────────────────────────────────────
// path.resolve() — Build an ABSOLUTE path
// ─────────────────────────────────────────────
// Similar to path.join() but always returns a full absolute path
// Starts from the current working directory if no absolute segment is provided
// Commonly used to locate files relative to your project root
const resolved = path.resolve("users", "john", "file.txt");
console.log(resolved);
// → /home/yourname/projects/users/john/file.txt  (Mac/Linux — prepends cwd)
// → C:\projects\users\john\file.txt              (Windows)

// ─────────────────────────────────────────────
// path.normalize() — Clean up messy paths
// ─────────────────────────────────────────────
// Resolves extra slashes, dots (.) and double-dots (..) in a path
const messy = "users//john/../john/./documents//file.txt";
console.log(path.normalize(messy)); // → users/john/documents/file.txt

// ─────────────────────────────────────────────
// path.isAbsolute() — Check if a path is absolute
// ─────────────────────────────────────────────
// Returns true if the path starts from the root of the filesystem
// Useful for validating user-provided paths
console.log(path.isAbsolute("/users/john/file.txt")); // → true
console.log(path.isAbsolute("documents/file.txt")); // → false

// ─────────────────────────────────────────────
// path.sep — The OS path separator character
// ─────────────────────────────────────────────
// '/' on Mac/Linux, '\' on Windows
// Useful when you need to manually split a path into segments
console.log(path.sep); // → /  (Mac/Linux) or \  (Windows)
console.log(filePath.split(path.sep)); // → splits path into an array of parts

// ─────────────────────────────────────────────
// __dirname equivalent in ES Modules
// ─────────────────────────────────────────────
// In CommonJS, __dirname gives the current file's directory automatically
// In ES Modules (import/export), __dirname is NOT available
// This is the standard workaround to get the same behavior:
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // full path to current file
const __dirname = path.dirname(__filename); // directory of current file
console.log(__dirname); // → path to the folder where this script lives
