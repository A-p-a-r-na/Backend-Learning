# npm — Node Package Manager

npm is the **default package manager for Node.js**. It lets you install, share, and manage third-party packages (libraries and tools) in your project.

---

## What is npm?

```
npm = Node Package Manager

It does 3 things:
1. Installs packages from the npm registry (npmjs.com)
2. Manages project dependencies (package.json)
3. Runs scripts (start, test, build...)
```

npm is automatically installed when you install Node.js.

```bash
# Check versions
node -v   # v20.x.x
npm -v    # 10.x.x
```

---

## npm Registry

The **npm registry** (npmjs.com) is a giant public database of JavaScript packages — over **2 million packages** available for free.

```
Your Project
    │
    │  npm install express
    ▼
npm Registry (npmjs.com)
    │
    │  downloads package
    ▼
node_modules/
```

---

## Initializing a Project

```bash
npm init          # interactive setup (asks questions)
npm init -y       # skip questions, use defaults
```

This creates a `package.json` file:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

---

## Installing Packages

### Install a single package
```bash
npm install express
npm install lodash
npm install axios
```

### Install multiple packages at once
```bash
npm install express mongoose dotenv
```

### Install a specific version
```bash
npm install express@4.18.0
npm install lodash@4.0.0
```

### Install the latest version
```bash
npm install express@latest
```

### Shorthand
```bash
npm i express         # same as npm install express
npm i express lodash  # multiple packages
```

---

## Types of Dependencies

### Regular Dependencies (`--save` or default)
Packages your app **needs to run** in production.

```bash
npm install express        # saved to "dependencies"
npm install express --save # same thing (--save is default)
```

```json
"dependencies": {
  "express": "^4.18.2"
}
```

### Dev Dependencies (`--save-dev`)
Packages only needed **during development** — not in production.

```bash
npm install nodemon --save-dev
npm install jest --save-dev
npm install -D eslint        # shorthand
```

```json
"devDependencies": {
  "nodemon": "^3.0.1",
  "jest": "^29.0.0"
}
```

### Global Install (`-g`)
Installs a package **system-wide**, available as a CLI command anywhere.

```bash
npm install -g nodemon
npm install -g typescript
npm install -g create-react-app
```

---

## Uninstalling Packages

```bash
npm uninstall express          # remove from dependencies
npm uninstall nodemon --save-dev # remove from devDependencies
npm uninstall -g nodemon       # remove global package
```

Shorthand:
```bash
npm un express   # same as uninstall
npm r express    # also works
```

---

## Updating Packages

```bash
npm update express          # update one package
npm update                  # update all packages
npm update --save-dev       # update dev dependencies
npm outdated                # check which packages are outdated
```

---

## Listing Packages

```bash
npm list              # all installed packages (deep tree)
npm list --depth=0    # only top-level packages
npm list -g --depth=0 # globally installed packages
```

---

## npm Scripts

Define custom commands in `package.json`:

```json
{
  "scripts": {
    "start":   "node index.js",
    "dev":     "nodemon index.js",
    "test":    "jest",
    "build":   "tsc",
    "lint":    "eslint ."
  }
}
```

Run them with:
```bash
npm start        # special — no "run" needed
npm test         # special — no "run" needed
npm run dev      # custom scripts need "run"
npm run build
npm run lint
```

---

## `node_modules` Folder

When you install packages, they go into `node_modules/`:

```
project/
├── node_modules/
│   ├── express/
│   ├── lodash/
│   └── ...
├── package.json
└── index.js
```

> **Never commit `node_modules` to git!**
> Add it to `.gitignore`:

```
# .gitignore
node_modules/
```

Anyone can recreate it with:
```bash
npm install   # reads package.json and installs everything
```

---

## `package-lock.json`

Auto-generated file that **locks exact versions** of every installed package.

```json
{
  "name": "my-app",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/express": {
      "version": "4.18.2",
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz"
    }
  }
}
```

- **Commit this file to git** ✅
- Ensures everyone on the team gets the exact same versions
- `npm ci` uses this file for clean installs in CI/CD

---

## Common npm Commands — Cheat Sheet

```bash
# Project setup
npm init -y                    # create package.json

# Installing
npm install                    # install all from package.json
npm install express            # install a package
npm install -D nodemon         # install dev dependency
npm install -g typescript      # install globally
npm install express@4.18.0     # specific version

# Removing
npm uninstall express          # remove package

# Updating
npm update                     # update all
npm outdated                   # check outdated

# Info
npm list --depth=0             # list installed packages
npm info express               # info about a package
npm search express             # search the registry

# Scripts
npm start                      # run start script
npm test                       # run test script
npm run dev                    # run custom script

# Cache
npm cache clean --force        # clear npm cache

# Help
npm help                       # general help
npm help install               # help for a command
```

---

## npm vs npx

| | npm | npx |
|---|---|---|
| Purpose | Install & manage packages | Run packages without installing |
| Use case | `npm install express` | `npx create-react-app myapp` |
| Installs permanently | ✅ Yes | ❌ No (runs once) |

---

## Summary

```
npm = Node Package Manager

Key commands:
npm init -y          → create package.json
npm install pkg      → install a package
npm install -D pkg   → install dev dependency
npm install -g pkg   → install globally
npm uninstall pkg    → remove a package
npm update           → update packages
npm run scriptName   → run a script

Key files:
package.json      → project info + dependencies list
package-lock.json → exact locked versions
node_modules/     → installed packages (don't commit!)
```