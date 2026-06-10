# `path` Module in Node.js

The `path` module provides utilities for working with **file and directory paths**. It handles differences between operating systems (Windows uses `\`, Linux/Mac uses `/`) automatically.

---

## Importing

```js
const path = require('path');
```

---

## 1. `path.join()` — Join Path Segments

Joins multiple path segments into one, using the correct separator for the OS.

```js
const path = require('path');

console.log(path.join('folder', 'subfolder', 'file.txt'));
// Linux/Mac: folder/subfolder/file.txt
// Windows:   folder\subfolder\file.txt

console.log(path.join('/home', 'user', 'project', 'index.js'));
// /home/user/project/index.js

console.log(path.join(__dirname, 'files', 'data.txt'));
// /home/user/project/files/data.txt

// Handles extra slashes
console.log(path.join('folder/', '/subfolder/', 'file.txt'));
// folder/subfolder/file.txt  (normalizes slashes)
```

---

## 2. `path.resolve()` — Resolve Absolute Path

Resolves a sequence of paths into an **absolute path**, right to left.

```js
console.log(path.resolve('folder', 'file.txt'));
// /current/working/directory/folder/file.txt

console.log(path.resolve('/home/user', 'project', 'index.js'));
// /home/user/project/index.js

console.log(path.resolve('/home/user', '/etc', 'config'));
// /etc/config  (absolute path resets from /)

// Common use — always get absolute path
console.log(path.resolve(__dirname, 'config.json'));
// /home/user/project/config.json
```

### `join` vs `resolve`

```js
// join — just combines segments
path.join('/a', 'b', 'c')      // /a/b/c

// resolve — builds absolute path from CWD
path.resolve('a', 'b', 'c')    // /current/dir/a/b/c
path.resolve('/a', 'b', 'c')   // /a/b/c
path.resolve('/a', '/b', 'c')  // /b/c  (resets at /)
```

---

## 3. `path.basename()` — Get File Name

Returns the **last part** of a path (the filename).

```js
console.log(path.basename('/home/user/project/index.js'));
// index.js

console.log(path.basename('/home/user/project/index.js', '.js'));
// index  (removes the extension)

console.log(path.basename('/home/user/project/'));
// project

console.log(path.basename('C:\\Users\\Arjun\\file.txt'));
// file.txt
```

---

## 4. `path.dirname()` — Get Directory Name

Returns the **directory** part of a path.

```js
console.log(path.dirname('/home/user/project/index.js'));
// /home/user/project

console.log(path.dirname('/home/user/project/'));
// /home/user

console.log(path.dirname('index.js'));
// .  (current directory)
```

---

## 5. `path.extname()` — Get File Extension

Returns the **extension** of a file.

```js
console.log(path.extname('index.js'));      // .js
console.log(path.extname('style.css'));     // .css
console.log(path.extname('image.png'));     // .png
console.log(path.extname('archive.tar.gz')); // .gz
console.log(path.extname('README'));        // ''  (no extension)
console.log(path.extname('.gitignore'));    // ''
```

---

## 6. `path.parse()` — Parse Path into Object

Breaks a path into its **component parts**.

```js
const result = path.parse('/home/user/project/index.js');
console.log(result);
// {
//   root: '/',
//   dir:  '/home/user/project',
//   base: 'index.js',
//   ext:  '.js',
//   name: 'index'
// }

const result2 = path.parse('C:\\Users\\Arjun\\file.txt');
// {
//   root: 'C:\\',
//   dir:  'C:\\Users\\Arjun',
//   base: 'file.txt',
//   ext:  '.txt',
//   name: 'file'
// }
```

---

## 7. `path.format()` — Build Path from Object

Opposite of `path.parse()` — builds a path from an object.

```js
const pathObj = {
  root: '/',
  dir:  '/home/user/project',
  base: 'index.js',
};

console.log(path.format(pathObj));
// /home/user/project/index.js

// From parts
console.log(path.format({
  dir:  '/home/user',
  name: 'app',
  ext:  '.js'
}));
// /home/user/app.js
```

---

## 8. `path.isAbsolute()` — Check if Absolute

Returns `true` if the path is absolute.

```js
console.log(path.isAbsolute('/home/user/file.txt'));  // true
console.log(path.isAbsolute('C:\\Users\\file.txt'));  // true
console.log(path.isAbsolute('./file.txt'));            // false
console.log(path.isAbsolute('../file.txt'));           // false
console.log(path.isAbsolute('file.txt'));              // false
```

---

## 9. `path.relative()` — Relative Path Between Two Paths

Returns the **relative path** from one location to another.

```js
console.log(path.relative('/home/user/project', '/home/user/project/src/index.js'));
// src/index.js

console.log(path.relative('/home/user/a', '/home/user/b'));
// ../b

console.log(path.relative('/home/user/a/b', '/home/user/c/d'));
// ../../c/d
```

---

## 10. `path.normalize()` — Clean Up a Path

Resolves `.` and `..` and normalizes slashes.

```js
console.log(path.normalize('/home/user/../user/./project//index.js'));
// /home/user/project/index.js

console.log(path.normalize('folder\\subfolder//file.txt'));
// folder/subfolder/file.txt

console.log(path.normalize('./a/b/../c'));
// a/c
```

---

## 11. `path.sep` and `path.delimiter`

### `path.sep` — OS Path Separator
```js
console.log(path.sep);
// Linux/Mac: /
// Windows:   \

// Split a path into parts
const parts = '/home/user/project'.split(path.sep);
console.log(parts); // ['', 'home', 'user', 'project']
```

### `path.delimiter` — PATH Environment Variable Delimiter
```js
console.log(path.delimiter);
// Linux/Mac: :
// Windows:   ;

// Parse PATH environment variable
const paths = process.env.PATH.split(path.delimiter);
console.log(paths);
// ['/usr/bin', '/usr/local/bin', '/bin', ...]
```

---

## Real World Examples

### Building safe file paths
```js
const path = require('path');
const fs   = require('fs/promises');

async function readConfig() {
  // Always use path.join with __dirname for reliable paths
  const configPath = path.join(__dirname, 'config', 'settings.json');
  const data = await fs.readFile(configPath, 'utf8');
  return JSON.parse(data);
}
```

### File type checker
```js
function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();

  const types = {
    '.js':  'JavaScript',
    '.ts':  'TypeScript',
    '.json': 'JSON',
    '.html': 'HTML',
    '.css':  'CSS',
    '.png':  'Image',
    '.jpg':  'Image',
    '.pdf':  'PDF',
  };

  return types[ext] || 'Unknown';
}

console.log(getFileType('app.js'));       // JavaScript
console.log(getFileType('style.css'));    // CSS
console.log(getFileType('photo.png'));    // Image
```

### Rename file extension
```js
function changeExtension(filePath, newExt) {
  const dir  = path.dirname(filePath);
  const name = path.basename(filePath, path.extname(filePath));
  return path.join(dir, name + newExt);
}

console.log(changeExtension('/home/user/app.js', '.ts'));
// /home/user/app.ts
```

---

## Quick Reference

| Method | What it does |
|---|---|
| `path.join(...parts)` | Join path segments (OS-safe) |
| `path.resolve(...parts)` | Build absolute path |
| `path.basename(p, ext?)` | Get filename |
| `path.dirname(p)` | Get directory |
| `path.extname(p)` | Get file extension |
| `path.parse(p)` | Break path into object |
| `path.format(obj)` | Build path from object |
| `path.isAbsolute(p)` | Check if absolute |
| `path.relative(from, to)` | Get relative path |
| `path.normalize(p)` | Clean up path |
| `path.sep` | OS path separator (`/` or `\`) |
| `path.delimiter` | PATH env delimiter (`:` or `;`) |

---

## Summary

```
path = built-in module for working with file paths

Most used methods:
  path.join()       → safely combine path segments
  path.resolve()    → get absolute path
  path.basename()   → get filename from path
  path.dirname()    → get folder from path
  path.extname()    → get file extension
  path.parse()      → split path into parts

Best practice:
  Always use path.join(__dirname, 'file') instead of
  string concatenation like __dirname + '/file'
  → Works correctly on ALL operating systems
```