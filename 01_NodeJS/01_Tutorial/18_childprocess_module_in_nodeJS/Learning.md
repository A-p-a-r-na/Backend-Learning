# `child_process` Module in Node.js

The `child_process` module allows you to **spawn subprocesses** — run shell commands, scripts, or other programs from within your Node.js application.

---

## Importing

```js
const { exec, execFile, spawn, fork } = require('child_process');
```

---

## Four Main Methods

```
exec()      → run shell command, buffer output, callback
execFile()  → run executable file directly (no shell)
spawn()     → stream large output, more control
fork()      → spawn a new Node.js process
```

---

## 1. `exec()` — Run Shell Command

Best for **short commands** where you want buffered output.

```js
const { exec } = require('child_process');

exec('ls -la', (err, stdout, stderr) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  if (stderr) {
    console.error('Stderr:', stderr);
  }
  console.log('Output:\n', stdout);
});
```

### Common use cases

```js
// List files
exec('ls', (err, stdout) => console.log(stdout));

// Check Node version
exec('node --version', (err, stdout) => console.log(stdout.trim()));

// Run git commands
exec('git log --oneline -5', (err, stdout) => console.log(stdout));

// Run npm commands
exec('npm list --depth=0', (err, stdout) => console.log(stdout));
```

### Promisified exec

```js
const { exec }   = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function runCommand(cmd) {
  try {
    const { stdout, stderr } = await execAsync(cmd);
    return stdout.trim();
  } catch (err) {
    throw new Error(`Command failed: ${err.message}`);
  }
}

async function main() {
  const version = await runCommand('node --version');
  const files   = await runCommand('ls -la');
  console.log('Node version:', version);
  console.log('Files:\n', files);
}

main();
```

### Options

```js
exec('ls', {
  cwd:     '/home/user',    // working directory
  timeout: 5000,            // timeout in ms
  maxBuffer: 1024 * 1024,  // max output size (1MB default)
  env: { ...process.env, MY_VAR: 'hello' } // environment variables
}, (err, stdout) => {
  console.log(stdout);
});
```

---

## 2. `execFile()` — Run Executable Directly

Like `exec()` but **doesn't use a shell** — more secure, faster for executables.

```js
const { execFile } = require('child_process');

execFile('node', ['--version'], (err, stdout) => {
  console.log(stdout.trim()); // v20.x.x
});

execFile('python3', ['script.py', 'arg1'], (err, stdout, stderr) => {
  if (err) throw err;
  console.log('Python output:', stdout);
});
```

---

## 3. `spawn()` — Stream Output

Best for **long-running commands** or **large output** — data streams in real time.

```js
const { spawn } = require('child_process');

const ls = spawn('ls', ['-la', '/home']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});
```

### Running a long process

```js
const { spawn } = require('child_process');

// Run a Node.js script with streaming output
const child = spawn('node', ['long-script.js']);

child.stdout.on('data', (data) => {
  process.stdout.write(data); // stream output live
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
});

child.on('close', (code) => {
  console.log(`\nFinished with exit code: ${code}`);
});
```

### Pipe to parent's stdio

```js
const { spawn } = require('child_process');

// inherit → child uses parent's stdin/stdout/stderr directly
const child = spawn('npm', ['install'], {
  stdio: 'inherit',  // show output directly in terminal
  cwd: './my-project'
});

child.on('close', (code) => {
  if (code === 0) console.log('npm install succeeded!');
  else            console.error('npm install failed!');
});
```

---

## 4. `fork()` — Spawn Node.js Process

`fork()` is a special version of `spawn()` specifically for **Node.js processes**. It sets up an IPC (Inter-Process Communication) channel between parent and child.

```js
// parent.js
const { fork } = require('child_process');

const child = fork('./child.js');

// Send message to child
child.send({ type: 'start', data: [1, 2, 3, 4, 5] });

// Receive message from child
child.on('message', (result) => {
  console.log('Result from child:', result);
});

child.on('exit', (code) => {
  console.log('Child exited with code:', code);
});
```

```js
// child.js
process.on('message', ({ type, data }) => {
  if (type === 'start') {
    const sum = data.reduce((a, b) => a + b, 0);
    process.send({ sum, average: sum / data.length });
  }
});
```

**Output:**
```
Result from child: { sum: 15, average: 3 }
Child exited with code: 0
```

### Fork for CPU-intensive tasks

```js
// main.js — keeps event loop free
const { fork } = require('child_process');

const worker = fork('./heavy-computation.js');

worker.send({ n: 1000000 });

worker.on('message', (result) => {
  console.log('Fibonacci result:', result);
  worker.kill();
});

// main event loop stays responsive
setInterval(() => console.log('Main thread still running...'), 500);
```

```js
// heavy-computation.js
process.on('message', ({ n }) => {
  function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
  process.send(fibonacci(n));
});
```

---

## exec vs execFile vs spawn vs fork

| Method | Shell? | Output | Best for |
|---|---|---|---|
| `exec()` | ✅ Yes | Buffered | Short shell commands |
| `execFile()` | ❌ No | Buffered | Executables directly |
| `spawn()` | ❌ No | Streamed | Long-running, large output |
| `fork()` | ❌ No | Streamed + IPC | Node.js child processes |

---

## Real World — Run Shell Scripts

```js
const { exec }      = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function deployApp() {
  console.log('Starting deployment...');

  try {
    await execAsync('git pull origin main');
    console.log('✅ Code pulled');

    await execAsync('npm install');
    console.log('✅ Dependencies installed');

    await execAsync('npm run build');
    console.log('✅ Build complete');

    await execAsync('pm2 restart app');
    console.log('✅ App restarted');

    console.log('\n🚀 Deployment successful!');
  } catch (err) {
    console.error('❌ Deployment failed:', err.message);
  }
}

deployApp();
```

---

## Quick Reference

| Method | What it does |
|---|---|
| `exec(cmd, cb)` | Run shell command, buffered output |
| `execFile(file, args, cb)` | Run executable, no shell |
| `spawn(cmd, args, opts)` | Stream output, long processes |
| `fork(module, args)` | New Node.js process with IPC |
| `child.stdout.on('data', fn)` | Listen to stdout stream |
| `child.stderr.on('data', fn)` | Listen to stderr stream |
| `child.on('close', fn)` | Process exit handler |
| `child.send(msg)` | Send IPC message (fork only) |
| `child.on('message', fn)` | Receive IPC message (fork only) |
| `child.kill()` | Kill child process |

---

## Summary

```
child_process = run external commands and scripts from Node.js

Four methods:
  exec(cmd)       → shell command, small output → promisify it
  execFile(file)  → run executable, no shell, safer
  spawn(cmd)      → streaming, large output, long-running
  fork(script)    → Node.js child with IPC messaging

When to use what:
  Quick shell commands        → exec() + promisify
  Run a script or executable  → execFile()
  Long process (npm install)  → spawn() with stdio:'inherit'
  CPU-heavy task in Node.js   → fork() to keep event loop free
```