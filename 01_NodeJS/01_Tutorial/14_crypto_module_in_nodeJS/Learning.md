# `crypto` Module in Node.js

The `crypto` module provides **cryptographic functionality** — hashing, encryption, decryption, digital signatures, random bytes, and more. It is built on top of OpenSSL.

---

## Importing

```js
const crypto = require('crypto');
```

---

## 1. Hashing

A hash is a **one-way transformation** of data — you cannot reverse it. Used for passwords, checksums, and data integrity.

### `crypto.createHash()` — Hash a string

```js
const crypto = require('crypto');

// SHA-256 hash
const hash = crypto
  .createHash('sha256')
  .update('hello world')
  .digest('hex');

console.log(hash);
// b94d27b9934d3e08a52e52d7da7dabfac484efe04294e576fca35d3b8f7d4a3e

// MD5 hash (not for passwords — use for checksums)
const md5 = crypto.createHash('md5').update('hello').digest('hex');
console.log(md5); // 5d41402abc4b2a76b9719d911017c592

// SHA-512
const sha512 = crypto.createHash('sha512').update('hello').digest('hex');
```

### Digest formats

```js
const data = 'Node.js';

// hex — most common
crypto.createHash('sha256').update(data).digest('hex');
// '...'  long hex string

// base64
crypto.createHash('sha256').update(data).digest('base64');
// '...'  shorter base64 string

// buffer
crypto.createHash('sha256').update(data).digest();
// <Buffer ...>
```

### Hash a file

```js
const crypto = require('crypto');
const fs     = require('fs');

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash   = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', chunk => hash.update(chunk));
    stream.on('end',  ()    => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

hashFile('package.json').then(h => console.log('File hash:', h));
```

---

## 2. HMAC — Keyed Hashing

HMAC (Hash-based Message Authentication Code) adds a **secret key** to the hash — used to verify data integrity and authenticity.

```js
const hmac = crypto
  .createHmac('sha256', 'my-secret-key')
  .update('important data')
  .digest('hex');

console.log(hmac); // unique hash based on data + key

// Verify HMAC
function verifyHMAC(data, key, receivedHmac) {
  const expectedHmac = crypto
    .createHmac('sha256', key)
    .update(data)
    .digest('hex');

  // Safe comparison (prevents timing attacks)
  return crypto.timingSafeEqual(
    Buffer.from(expectedHmac),
    Buffer.from(receivedHmac)
  );
}
```

---

## 3. Password Hashing with `pbkdf2`

**Never store plain passwords!** Use `pbkdf2` or `scrypt` for password hashing.

### `crypto.pbkdf2()` — Password-Based Key Derivation

```js
const crypto = require('crypto');

// Hash a password
function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt       = crypto.randomBytes(16).toString('hex'); // random salt
    const iterations = 100000;
    const keylen     = 64;
    const digest     = 'sha512';

    crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, key) => {
      if (err) return reject(err);
      resolve(`${salt}:${key.toString('hex')}`); // store salt + hash
    });
  });
}

// Verify a password
function verifyPassword(password, storedHash) {
  return new Promise((resolve, reject) => {
    const [salt, hash] = storedHash.split(':');

    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, key) => {
      if (err) return reject(err);
      resolve(crypto.timingSafeEqual(
        Buffer.from(hash, 'hex'),
        key
      ));
    });
  });
}

// Usage
async function main() {
  const password = 'mySecretPassword123';
  const stored   = await hashPassword(password);
  console.log('Stored:', stored);

  const isValid = await verifyPassword(password, stored);
  console.log('Valid:', isValid); // true

  const isWrong = await verifyPassword('wrongPassword', stored);
  console.log('Wrong:', isWrong); // false
}

main();
```

### `crypto.scrypt()` — Modern Password Hashing (Recommended)

```js
const crypto = require('crypto');

function hashPasswordScrypt(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) return reject(err);
      resolve(salt.toString('hex') + ':' + key.toString('hex'));
    });
  });
}
```

---

## 4. Random Bytes & Values

### `crypto.randomBytes()` — Random Buffer

```js
// Generate random bytes
const randomBuffer = crypto.randomBytes(16);
console.log(randomBuffer.toString('hex')); // a1b2c3d4e5...  (32 hex chars)
console.log(randomBuffer.toString('base64')); // base64 string

// Generate random token (e.g., for API keys, session tokens)
function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

console.log(generateToken());
// 'a3f8b2c1d4e5...' (64 hex chars)
```

### `crypto.randomUUID()` — Generate UUID v4

```js
const uuid = crypto.randomUUID();
console.log(uuid); // '110e8400-e29b-41d4-a716-446655440000'
```

### `crypto.randomInt()` — Random Integer

```js
// Random integer between min and max (exclusive)
const num = crypto.randomInt(1, 100);
console.log(num); // e.g., 42

// Random integer from 0 to max
const roll = crypto.randomInt(6) + 1; // dice roll 1–6
```

---

## 5. Symmetric Encryption (AES)

Encrypt and decrypt data using the **same secret key**.

```js
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const SECRET    = crypto.randomBytes(32); // 32 bytes for aes-256
const IV        = crypto.randomBytes(16); // initialization vector

// Encrypt
function encrypt(text) {
  const cipher     = crypto.createCipheriv(ALGORITHM, SECRET, IV);
  let encrypted    = cipher.update(text, 'utf8', 'hex');
  encrypted       += cipher.final('hex');
  return encrypted;
}

// Decrypt
function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET, IV);
  let decrypted  = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted     += decipher.final('utf8');
  return decrypted;
}

const original  = 'Hello, Secret World!';
const encrypted = encrypt(original);
const decrypted = decrypt(encrypted);

console.log('Original: ', original);   // Hello, Secret World!
console.log('Encrypted:', encrypted);  // a1b2c3...  (hex)
console.log('Decrypted:', decrypted);  // Hello, Secret World!
```

---

## 6. Diffie-Hellman & Key Pairs

### Generate RSA Key Pair

```js
const { generateKeyPairSync } = require('crypto');

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

console.log(publicKey);
// -----BEGIN PUBLIC KEY-----
// MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
// -----END PUBLIC KEY-----
```

---

## 7. Digital Signatures

Sign data with a private key, verify with the public key.

```js
const crypto = require('crypto');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048
});

// Sign
const sign      = crypto.createSign('SHA256');
sign.update('important message');
const signature = sign.sign(privateKey, 'hex');

// Verify
const verify = crypto.createVerify('SHA256');
verify.update('important message');
const isValid = verify.verify(publicKey, signature, 'hex');

console.log('Valid signature:', isValid); // true
```

---

## 8. Timing-Safe Comparison

Always use this when comparing secrets to prevent **timing attacks**:

```js
const a = Buffer.from('secret-token-abc');
const b = Buffer.from('secret-token-abc');

// ✅ Safe — constant time comparison
const isEqual = crypto.timingSafeEqual(a, b);
console.log(isEqual); // true

// ❌ Unsafe — leaks timing information
const isEqualUnsafe = a.toString() === b.toString();
```

---

## Real World — Token Generation & Verification

```js
const crypto = require('crypto');

// Generate a secure reset token
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Hash the token for storage (don't store raw token)
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Usage
const rawToken    = generateResetToken();
const storedToken = hashToken(rawToken);

console.log('Send to user:', rawToken);     // raw token in email link
console.log('Store in DB:', storedToken);   // hashed token in database

// When user submits token, hash it and compare
function verifyToken(submittedToken, storedHashedToken) {
  const hashedSubmitted = hashToken(submittedToken);
  return crypto.timingSafeEqual(
    Buffer.from(hashedSubmitted),
    Buffer.from(storedHashedToken)
  );
}

console.log(verifyToken(rawToken, storedToken)); // true
```

---

## Quick Reference

| Method | What it does |
|---|---|
| `crypto.createHash(algo)` | Create hash (sha256, md5...) |
| `crypto.createHmac(algo, key)` | Keyed hash |
| `crypto.pbkdf2(pass, salt, ...)` | Password hash (async) |
| `crypto.scrypt(pass, salt, len)` | Modern password hash |
| `crypto.randomBytes(n)` | Secure random bytes |
| `crypto.randomUUID()` | Generate UUID v4 |
| `crypto.randomInt(min, max)` | Secure random integer |
| `crypto.createCipheriv(...)` | Encrypt data |
| `crypto.createDecipheriv(...)` | Decrypt data |
| `crypto.createSign(algo)` | Create digital signature |
| `crypto.createVerify(algo)` | Verify digital signature |
| `crypto.timingSafeEqual(a, b)` | Safe secret comparison |

---

## Summary

```
crypto = built-in module for cryptographic operations

Hashing (one-way):
  crypto.createHash('sha256').update(data).digest('hex')

HMAC (keyed hashing):
  crypto.createHmac('sha256', key).update(data).digest('hex')

Password hashing:
  crypto.pbkdf2()  → solid choice
  crypto.scrypt()  → recommended (more secure)

Random values:
  crypto.randomBytes(32)   → random buffer
  crypto.randomUUID()      → UUID v4
  crypto.randomInt(1, 100) → random integer

Encryption:
  crypto.createCipheriv()   → encrypt
  crypto.createDecipheriv() → decrypt

Always use:
  crypto.timingSafeEqual() → when comparing secrets
```