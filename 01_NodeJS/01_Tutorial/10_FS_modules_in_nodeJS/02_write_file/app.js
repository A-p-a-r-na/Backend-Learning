// ============================================================
// FS MODULE — WRITING & COPYING FILES IN NODE.JS
// ============================================================

// ── METHOD 1: writeFile (Create or Overwrite a file) ─────────

// import fs from "fs/promises";

// fs.writeFile() creates a new file if it doesn't exist
// If the file ALREADY EXISTS — it completely OVERWRITES it
// Arguments: (filePath, content)
// fs.writeFile(
//   "01_NodeJS/01_Tutorial/10_FS_modules_in_nodeJS/02_write_file/new_file.txt",
//   "This is a new file created using fs.writeFile() in Node.js!",
// );

// ── METHOD 2: appendFile (Add to existing file) ───────────────

// fs.appendFile() adds content to the END of an existing file
// If the file does NOT exist — it creates a new file automatically
// Unlike writeFile, it does NOT overwrite — it only adds to the end
// fs.appendFile(
//   "01_NodeJS/01_Tutorial/10_FS_modules_in_nodeJS/02_write_file/new_file.txt",
//   " #### Appending this text to the existing file content.",
// );

// Result after both methods run on the same file:
// "This is a new file created using fs.writeFile() in Node.js!
//  #### Appending this text to the existing file content."

// ── METHOD 3: Read then Write (Copy a file) ───────────────────

// Named imports — destructuring only what we need from "fs/promises"
// Instead of importing the whole fs object, we pull out just readFile & writeFile
import { readFile, writeFile } from "fs/promises";

// Step 1: Read the PNG image file
// No encoding specified (no "utf8") — because this is a BINARY file (image)
// For binary files (images, videos, PDFs), always read without encoding
// Returns raw binary data as a Buffer object
const content = await readFile(
  "01_NodeJS/01_Tutorial/10_FS_modules_in_nodeJS/02_write_file/project.png",
  // ⚠️ Do NOT pass "utf8" here — it would corrupt the binary image data
);

// Step 2: Write the Buffer content to a new location
// This effectively COPIES the image file to the Desktop
// writeFile(destination, content)
// Since content is a Buffer (binary), writeFile writes it as-is — no corruption
// This is a simple manual file copy using read + write
await writeFile("C:/Users/ACER/OneDrive/Desktop/test.png", content);
console.log("File copied successfully!");