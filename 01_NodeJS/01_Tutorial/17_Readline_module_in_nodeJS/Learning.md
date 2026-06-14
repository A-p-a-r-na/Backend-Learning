# `readline` Module in Node.js

The `readline` module provides an interface for **reading input line by line** from a readable stream (like `stdin`). It is used to build interactive CLI tools and process files line by line.

---

## Importing

```js
const readline = require('readline');
```

---

## 1. Basic — Read User Input from Terminal

```js
const readline = require('readline');

const rl = readline.createInterface({
  input:  process.stdin,   // read from terminal
  output: process.stdout   // write to terminal
});

rl.question('What is your name? ', (name) => {
  console.log(`Hello, ${name}!`);
  rl.close(); // always close when done
});
```

**Output:**
```
What is your name? Arjun
Hello, Arjun!
```

---

## 2. `readline.createInterface()` — Options

```js
const rl = readline.createInterface({
  input:       process.stdin,
  output:      process.stdout,
  terminal:    true,          // true for interactive, false for file/pipe
  prompt:      '> ',          // custom prompt symbol
  crlfDelay:   Infinity,      // handle \r\n line endings
});
```

---

## 3. `rl.question()` — Ask a Question

Ask a question and get the answer in a callback:

```js
const readline = require('readline');

const rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout
});

rl.question('Enter your age: ', (age) => {
  console.log(`You are ${age} years old`);
  rl.close();
});
```

---

## 4. Multiple Questions — Chaining

```js
const readline = require('readline');

const rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function collectInfo() {
  const name = await ask('Name:  ');
  const age  = await ask('Age:   ');
  const city = await ask('City:  ');

  console.log('\n--- Profile ---');
  console.log(`Name: ${name}`);
  console.log(`Age:  ${age}`);
  console.log(`City: ${city}`);

  rl.close();
}

collectInfo();
```

**Output:**
```
Name:  Arjun
Age:   25
City:  Kerala

--- Profile ---
Name: Arjun
Age:  25
City: Kerala
```

---

## 5. `rl.prompt()` — Interactive Prompt (REPL-like)

```js
const readline = require('readline');

const rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout,
  prompt: 'app> '
});

rl.prompt(); // show the prompt

rl.on('line', (line) => {
  const input = line.trim();

  switch (input) {
    case 'hello':
      console.log('Hey there!');
      break;
    case 'time':
      console.log(new Date().toLocaleTimeString());
      break;
    case 'exit':
      console.log('Goodbye!');
      rl.close();
      return;
    default:
      console.log(`Unknown command: "${input}"`);
  }

  rl.prompt(); // show prompt again
});

rl.on('close', () => {
  process.exit(0);
});
```

**Output:**
```
app> hello
Hey there!
app> time
10:30:45 AM
app> exit
Goodbye!
```

---

## 6. Reading a File Line by Line

```js
const readline = require('readline');
const fs       = require('fs');

const rl = readline.createInterface({
  input:    fs.createReadStream('data.txt'),
  terminal: false  // not an interactive terminal
});

let lineNumber = 0;

rl.on('line', (line) => {
  lineNumber++;
  console.log(`Line ${lineNumber}: ${line}`);
});

rl.on('close', () => {
  console.log(`\nTotal lines: ${lineNumber}`);
});
```

### Count words in a file

```js
const readline = require('readline');
const fs       = require('fs');

const rl = readline.createInterface({
  input:    fs.createReadStream('text.txt'),
  terminal: false
});

let wordCount = 0;
let lineCount = 0;

rl.on('line', (line) => {
  lineCount++;
  wordCount += line.split(/\s+/).filter(Boolean).length;
});

rl.on('close', () => {
  console.log(`Lines: ${lineCount}`);
  console.log(`Words: ${wordCount}`);
});
```

---

## 7. `rl.on()` — Events

### `line` event — fired for each line

```js
rl.on('line', (line) => {
  console.log('Got line:', line);
});
```

### `close` event — fired when interface is closed

```js
rl.on('close', () => {
  console.log('Interface closed');
  process.exit(0);
});
```

### `pause` and `resume`

```js
rl.on('pause', ()  => console.log('Input paused'));
rl.on('resume', () => console.log('Input resumed'));

rl.pause();
setTimeout(() => rl.resume(), 2000);
```

---

## 8. `readline.promises` — Async/Await API (Node 17+)

```js
const readline = require('readline/promises');

const rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout
});

async function main() {
  const name = await rl.question('Enter your name: ');
  const city = await rl.question('Enter your city: ');

  console.log(`Hello ${name} from ${city}!`);
  rl.close();
}

main();
```

---

## 9. `readline.clearLine()` and `readline.moveCursor()`

Useful for building terminal UIs:

```js
// Clear current line
readline.clearLine(process.stdout, 0);  // 0 = entire line, -1 = left, 1 = right

// Move cursor
readline.moveCursor(process.stdout, -10, 0); // move left 10 chars

// Clear screen from cursor down
readline.clearScreenDown(process.stdout);

// Move cursor to specific position
readline.cursorTo(process.stdout, 0, 0); // top-left
```

### Progress bar example

```js
const readline = require('readline');

async function progress() {
  for (let i = 0; i <= 100; i += 5) {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    const bar = '█'.repeat(i / 5) + '░'.repeat(20 - i / 5);
    process.stdout.write(`Progress: [${bar}] ${i}%`);
    await new Promise(r => setTimeout(r, 100));
  }
  console.log('\nDone!');
}

progress();
```

---

## Real World — Simple CLI App

```js
const readline = require('readline');

const rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout
});

const todos = [];

function showMenu() {
  console.log('\n=== Todo App ===');
  console.log('1. Add todo');
  console.log('2. List todos');
  console.log('3. Exit');
  rl.question('Choose: ', handleMenu);
}

function handleMenu(choice) {
  switch (choice.trim()) {
    case '1':
      rl.question('Enter todo: ', (todo) => {
        todos.push(todo);
        console.log('Added!');
        showMenu();
      });
      break;
    case '2':
      if (todos.length === 0) {
        console.log('No todos yet!');
      } else {
        todos.forEach((t, i) => console.log(`${i + 1}. ${t}`));
      }
      showMenu();
      break;
    case '3':
      console.log('Goodbye!');
      rl.close();
      break;
    default:
      console.log('Invalid choice');
      showMenu();
  }
}

showMenu();
```

---

## Quick Reference

| Method / Event | What it does |
|---|---|
| `readline.createInterface({input, output})` | Create interface |
| `rl.question(prompt, callback)` | Ask a question |
| `rl.prompt()` | Show the prompt |
| `rl.close()` | Close the interface |
| `rl.on('line', fn)` | Handle each line of input |
| `rl.on('close', fn)` | Handle interface close |
| `readline.clearLine(stream, dir)` | Clear current line |
| `readline.cursorTo(stream, x, y)` | Move cursor |
| `readline.moveCursor(stream, dx, dy)` | Move cursor relatively |

---

## Summary

```
readline = built-in module for reading line-by-line input

Common uses:
  Interactive CLI tools     → rl.question(), rl.prompt()
  Read files line by line   → createInterface with fs.createReadStream
  Build terminal UIs        → clearLine(), cursorTo()

Pattern:
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Prompt: ', (answer) => { ...; rl.close(); });

Modern async/await (Node 17+):
  const rl = require('readline/promises').createInterface(...)
  const answer = await rl.question('Prompt: ');

Always call rl.close() when done!
```