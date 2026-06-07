# Understanding NPX

`npx` is a **package runner** that comes with npm. It lets you run CLI tools and packages **without installing them permanently** on your system.

---

## What is npx?

```
npm  = installs packages
npx  = runs packages (without installing)

npm install -g create-react-app  → installs permanently
npx create-react-app my-app      → runs once, no install needed
```

npx was introduced in **npm v5.2.0** and comes bundled with Node.js automatically.

```bash
# Check if npx is available
npx --version   # 10.x.x
```

---

## The Problem npx Solves

### Before npx — the old way
```bash
# 1. Install globally
npm install -g create-react-app

# 2. Now it's available
create-react-app my-app

# Problems:
# ❌ Pollutes your system with global packages
# ❌ Version gets stale — you use old versions
# ❌ Must manually update: npm update -g create-react-app
# ❌ Every developer must install it themselves
```

### After npx — the new way
```bash
# Just run it directly — always latest version!
npx create-react-app my-app

# ✅ No global install needed
# ✅ Always uses the latest version
# ✅ No leftover packages on your system
# ✅ Works the same for every developer
```

---

## How npx Works

```
npx create-react-app my-app

Step 1: Check if create-react-app exists locally
        (in node_modules/.bin/)

Step 2: Check if it exists globally

Step 3: If not found anywhere →
        Download it temporarily from npm registry

Step 4: Run the command

Step 5: Remove the temporary download (if not cached)
```

---

## Common Use Cases

### 1. Scaffolding Tools (Most Common)
Run project generators without global install:

```bash
# React
npx create-react-app my-app
npx create-react-app my-app --template typescript

# Next.js
npx create-next-app@latest my-app

# Express generator
npx express-generator my-app

# Vue
npx @vue/cli create my-app

# Angular
npx @angular/cli new my-app

# Vite
npx create-vite my-app

# NestJS
npx @nestjs/cli new my-app
```

---

### 2. Running Local Packages
Run locally installed tools without npm scripts:

```bash
# Without npx (fails if not global)
nodemon index.js     # ❌ command not found

# With npx (finds local version)
npx nodemon index.js # ✅ uses node_modules/.bin/nodemon
npx jest             # ✅ runs local jest
npx eslint .         # ✅ runs local eslint
npx tsc              # ✅ runs local typescript compiler
```

---

### 3. Running a Specific Version
```bash
# Run a specific version without installing
npx node@18 index.js          # run with Node 18
npx npm@8 install              # use npm version 8
npx create-react-app@4 my-app  # use CRA version 4

# Run latest version explicitly
npx create-next-app@latest my-app
```

---

### 4. One-off Commands
Run tools you only need once:

```bash
# Serve static files quickly
npx http-server .               # serve current folder
npx serve .                     # another static server

# Check for outdated packages
npx npm-check-updates           # list outdated packages
npx npm-check-updates -u        # update package.json versions

# Code formatters
npx prettier --write .          # format all files

# Security audit fix
npx npm-audit-resolver

# Kill process on a port
npx kill-port 3000
```

---

### 5. GitHub Packages
Run packages directly from GitHub:

```bash
# Run directly from a GitHub repo
npx github:username/repo

# Example
npx github:nicolo-ribaudo/tc39-proposal-async-do-expressions
```

---

## npx vs npm — Full Comparison

| | `npm install` | `npx` |
|---|---|---|
| Purpose | Install packages | Run packages |
| Installs permanently | ✅ Yes | ❌ No (temporary) |
| Needs prior install | N/A | ❌ No |
| Always latest version | ❌ No | ✅ Yes (if not cached) |
| Global pollution | ✅ With `-g` | ❌ No |
| Best for | Libraries you use in code | CLI tools you run once |

---

## npx vs Global Install — When to Use Which

```
Use npx when:
✅ Scaffolding a new project (create-react-app, create-next-app)
✅ Running a tool only once or occasionally
✅ You always want the latest version
✅ You don't want to clutter your global packages
✅ Running different versions for different projects

Use global install when:
✅ You use the tool daily across all projects
✅ You need it always available (pm2, nodemon)
✅ The tool is slow to download (large packages)
✅ You work offline often
```

---

## The `-y` and `--no-install` Flags

```bash
# -y flag: auto-confirm any prompts
npx -y create-react-app my-app

# --no-install: only run if already installed, don't download
npx --no-install create-react-app my-app
# Error if not found — won't download

# --ignore-existing: always download fresh copy
npx --ignore-existing create-react-app my-app
```

---

## How npx Finds Packages

```
When you run: npx some-package

1. Look in ./node_modules/.bin/     ← local project
2. Look in global node_modules      ← global install
3. Download from npm registry       ← temporary run
   (cached in ~/.npm/_npx/)
4. Run it
5. Clean up (if not cached)
```

---

## Real World Examples

### Starting a new React project
```bash
# Old way (before npx)
npm install -g create-react-app
create-react-app my-app

# New way (with npx) — always latest!
npx create-react-app my-app
cd my-app
npm start
```

### Quick static file server
```bash
# Serve any folder instantly
cd my-html-project
npx http-server .
# Serving on http://localhost:8080
```

### Check and update outdated packages
```bash
cd my-project
npx npm-check-updates        # see what's outdated
npx npm-check-updates -u     # update package.json
npm install                  # install updated versions
```

### Format code with Prettier
```bash
npx prettier --write "src/**/*.js"   # format all JS files
npx prettier --check "src/**/*.js"   # check without writing
```

---

## Summary

```
npx = Node Package eXecute

What it does:
  Runs npm packages without permanently installing them

How it works:
  1. Check local node_modules/.bin/
  2. Check global packages
  3. Download temporarily from registry
  4. Run the command
  5. Clean up

Best use cases:
  npx create-react-app my-app   → scaffold new project
  npx create-next-app@latest    → always get latest
  npx nodemon index.js          → run local CLI tool
  npx http-server .             → one-off tools
  npx node@18 script.js         → specific version

npx vs npm install -g:
  npx              → temporary, no pollution, always latest
  npm install -g   → permanent, always available, may go stale
```