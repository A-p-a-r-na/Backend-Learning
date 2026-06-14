# `os` Module in Node.js

The `os` module provides **operating system-related utility methods and properties**. It lets you get information about the system your Node.js app is running on.

---

## Importing

```js
const os = require('os');
```

---

## 1. Platform & Architecture

### `os.platform()` — Operating System

```js
console.log(os.platform());
// 'linux'   → Linux
// 'darwin'  → macOS
// 'win32'   → Windows (even 64-bit)
// 'freebsd' → FreeBSD
```

### `os.arch()` — CPU Architecture

```js
console.log(os.arch());
// 'x64'   → 64-bit
// 'arm64' → Apple Silicon / ARM
// 'ia32'  → 32-bit
```

### `os.type()` — OS Type

```js
console.log(os.type());
// 'Linux'   → Linux
// 'Darwin'  → macOS
// 'Windows_NT' → Windows
```

### `os.release()` — OS Version

```js
console.log(os.release());
// '5.15.0-88-generic'  (Linux kernel version)
// '10.0.19045'         (Windows version)
// '23.1.0'             (macOS version)
```

### `os.version()` — OS Build Version

```js
console.log(os.version());
// '#98-Ubuntu SMP Mon Oct 2 15:18:56 UTC 2023'
```

---

## 2. Memory

### `os.totalmem()` — Total RAM

```js
const totalBytes = os.totalmem();
const totalGB    = (totalBytes / 1024 ** 3).toFixed(2);

console.log(totalBytes); // 8589934592  (bytes)
console.log(totalGB);    // 8.00        (GB)
```

### `os.freemem()` — Available RAM

```js
const freeBytes = os.freemem();
const freeGB    = (freeBytes / 1024 ** 3).toFixed(2);

console.log(freeBytes); // 2147483648
console.log(freeGB);    // 2.00

// Memory usage percentage
const usedPercent = (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(1);
console.log(`Memory used: ${usedPercent}%`); // Memory used: 75.0%
```

---

## 3. CPU Information

### `os.cpus()` — CPU Details

```js
const cpus = os.cpus();

console.log(cpus.length); // Number of CPU cores (e.g., 8)

console.log(cpus[0]);
// {
//   model: 'Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz',
//   speed: 2600,  (MHz)
//   times: {
//     user: 252020,   (ms in user mode)
//     nice: 0,
//     sys:  30340,    (ms in kernel mode)
//     idle: 1070356,  (ms idle)
//     irq:  0
//   }
// }

// Get just the model and core count
console.log(`CPU: ${cpus[0].model}`);
console.log(`Cores: ${cpus.length}`);
```

---

## 4. Network Interfaces

### `os.networkInterfaces()` — Network Info

```js
const nets = os.networkInterfaces();
console.log(nets);
// {
//   lo: [ { address: '127.0.0.1', family: 'IPv4', internal: true } ],
//   eth0: [
//     { address: '192.168.1.5', family: 'IPv4', internal: false },
//     { address: 'fe80::...', family: 'IPv6', internal: false }
//   ]
// }

// Get local IP address
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

console.log('Local IP:', getLocalIP()); // 192.168.1.5
```

---

## 5. System Paths

### `os.homedir()` — Home Directory

```js
console.log(os.homedir());
// Linux/Mac: /home/arjun
// Windows:   C:\Users\Arjun
```

### `os.tmpdir()` — Temp Directory

```js
console.log(os.tmpdir());
// Linux/Mac: /tmp
// Windows:   C:\Users\Arjun\AppData\Local\Temp
```

---

## 6. Hostname & User Info

### `os.hostname()` — Machine Name

```js
console.log(os.hostname());
// 'arjun-laptop'
// 'my-server-01'
```

### `os.userInfo()` — Current User

```js
const user = os.userInfo();
console.log(user);
// {
//   uid:      1000,
//   gid:      1000,
//   username: 'arjun',
//   homedir:  '/home/arjun',
//   shell:    '/bin/bash'
// }

console.log(`Logged in as: ${user.username}`);
```

---

## 7. Uptime

### `os.uptime()` — System Uptime

```js
const uptimeSeconds = os.uptime();
const uptimeHours   = (uptimeSeconds / 3600).toFixed(2);

console.log(`Uptime: ${uptimeSeconds} seconds`);
console.log(`Uptime: ${uptimeHours} hours`);
```

---

## 8. End-of-Line & Constants

### `os.EOL` — End of Line Character

```js
console.log(os.EOL === '\n');   // true on Linux/Mac
console.log(os.EOL === '\r\n'); // true on Windows

// Writing cross-platform files
const lines = ['Line 1', 'Line 2', 'Line 3'];
const content = lines.join(os.EOL);
```

### `os.constants` — System Constants

```js
console.log(os.constants.signals.SIGTERM); // 15
console.log(os.constants.signals.SIGKILL); // 9
console.log(os.constants.errno.ENOENT);    // 2  (no such file)
console.log(os.constants.errno.EACCES);    // 13 (permission denied)
```

---

## Real World Example — System Info Dashboard

```js
const os = require('os');

function getSystemInfo() {
  const totalMem  = os.totalmem();
  const freeMem   = os.freemem();
  const usedMem   = totalMem - freeMem;
  const memUsage  = ((usedMem / totalMem) * 100).toFixed(1);

  return {
    platform:  os.platform(),
    arch:      os.arch(),
    hostname:  os.hostname(),
    username:  os.userInfo().username,
    cpu: {
      model: os.cpus()[0].model,
      cores: os.cpus().length,
    },
    memory: {
      total:   `${(totalMem / 1024 ** 3).toFixed(2)} GB`,
      free:    `${(freeMem  / 1024 ** 3).toFixed(2)} GB`,
      used:    `${(usedMem  / 1024 ** 3).toFixed(2)} GB`,
      percent: `${memUsage}%`
    },
    uptime:    `${(os.uptime() / 3600).toFixed(2)} hours`,
    homedir:   os.homedir(),
    tmpdir:    os.tmpdir(),
  };
}

console.log(getSystemInfo());
```

**Output:**
```json
{
  "platform":  "linux",
  "arch":      "x64",
  "hostname":  "arjun-laptop",
  "username":  "arjun",
  "cpu": {
    "model": "Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz",
    "cores": 8
  },
  "memory": {
    "total":   "16.00 GB",
    "free":    "4.00 GB",
    "used":    "12.00 GB",
    "percent": "75.0%"
  },
  "uptime":  "5.23 hours",
  "homedir": "/home/arjun",
  "tmpdir":  "/tmp"
}
```

---

## Quick Reference

| Method/Property | What it returns |
|---|---|
| `os.platform()` | OS name (`linux`, `darwin`, `win32`) |
| `os.arch()` | CPU architecture (`x64`, `arm64`) |
| `os.type()` | OS type (`Linux`, `Darwin`, `Windows_NT`) |
| `os.release()` | OS version string |
| `os.totalmem()` | Total RAM in bytes |
| `os.freemem()` | Free RAM in bytes |
| `os.cpus()` | Array of CPU core info |
| `os.networkInterfaces()` | Network interface details |
| `os.homedir()` | Home directory path |
| `os.tmpdir()` | Temp directory path |
| `os.hostname()` | Machine hostname |
| `os.userInfo()` | Current user info object |
| `os.uptime()` | System uptime in seconds |
| `os.EOL` | Line ending (`\n` or `\r\n`) |
| `os.constants` | Signal and error constants |

---

## Summary

```
os = built-in module for operating system information

Most used:
  os.platform()    → which OS (linux / darwin / win32)
  os.arch()        → CPU type (x64 / arm64)
  os.totalmem()    → total RAM in bytes
  os.freemem()     → free RAM in bytes
  os.cpus()        → CPU model + core count
  os.homedir()     → home directory
  os.hostname()    → machine name
  os.uptime()      → how long system has been running
  os.EOL           → correct line ending for current OS
```