import crypto from "crypto";

// ─────────────────────────────────────────────
// 1. HASHING — Converting data into a fixed-length fingerprint
// ─────────────────────────────────────────────
// A hash is a one-way transformation — you CANNOT reverse it back to the original
// Common use cases: storing passwords, verifying file integrity, checksums

// sha256 is the most widely used secure hashing algorithm
const hash = crypto.createHash("sha256");
hash.update("Hello, World!"); // feed data into the hash
const result = hash.digest("hex"); // "hex" = human-readable hexadecimal string
console.log("SHA256 Hash:", result);
// → SHA256 Hash: dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986d

// Shorter version using method chaining
const quickHash = crypto
  .createHash("sha256")
  .update("Hello, World!")
  .digest("hex");
console.log("Quick Hash:", quickHash); // same result as above

// Other available algorithms: md5, sha1, sha512
// Note: md5 and sha1 are INSECURE for passwords — use only for checksums
const md5Hash = crypto.createHash("md5").update("test").digest("hex");
console.log("MD5 Hash:", md5Hash); // → 098f6bcd4621d373cade4e832627b4f6

// ─────────────────────────────────────────────
// 2. HMAC — Hash with a secret key
// ─────────────────────────────────────────────
// HMAC = Hash-based Message Authentication Code
// Like a regular hash, but requires a secret key to verify
// Use case: verifying API requests, webhook signatures (e.g. GitHub webhooks)

const secretKey = "my-secret-key";
const message = "important data";

const hmac = crypto
  .createHmac("sha256", secretKey)
  .update(message)
  .digest("hex");

console.log("HMAC:", hmac);
// → HMAC: 2c1fad9e5fb6a...

// Verifying a webhook — compare the sender's HMAC with yours
function verifyWebhook(payload, receivedSignature, secret) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Use timingSafeEqual to prevent timing attacks
  // (never use === for comparing secrets/signatures!)
  const a = Buffer.from(expectedSignature, "hex");
  const b = Buffer.from(receivedSignature, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

console.log("Webhook valid:", verifyWebhook(message, hmac, secretKey)); // → true
console.log(
  "Webhook valid:",
  verifyWebhook(
    message,
    "fakesig00000000000000000000000000000000000000000000000000000000000",
    secretKey,
  ),
); // → false

// ─────────────────────────────────────────────
// 3. RANDOM BYTES — Cryptographically secure random data
// ─────────────────────────────────────────────
// DO NOT use Math.random() for security purposes — it's not cryptographically secure
// Use crypto.randomBytes() instead for tokens, IDs, salts, etc.

// Synchronous version
const randomBytesSync = crypto.randomBytes(16); // 16 bytes = 128 bits
console.log("Random (hex):", randomBytesSync.toString("hex")); // 32 hex chars
console.log("Random (base64):", randomBytesSync.toString("base64")); // URL-safe token

// Asynchronous version — preferred for large amounts
crypto.randomBytes(32, (err, buffer) => {
  if (err) throw err;
  console.log("Async random token:", buffer.toString("hex"));
});

// Generate a random integer between 0 and max (exclusive)
const randomInt = crypto.randomInt(1, 101); // random number 1–100
console.log("Random int:", randomInt);

// Generate a secure random token (great for password reset links, API keys)
function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}
console.log("Secure token:", generateSecureToken()); // 64-char hex string

// ─────────────────────────────────────────────
// 4. PASSWORD HASHING with pbkdf2
// ─────────────────────────────────────────────
// NEVER store plain passwords — always hash them with a SLOW algorithm
// pbkdf2 = Password-Based Key Derivation Function 2
// Deliberately slow to make brute-force attacks expensive

// Step 1: Generate a unique random salt for each user
const salt = crypto.randomBytes(16).toString("hex"); // unique per password

// Step 2: Hash the password with the salt (async — uses thread pool)
crypto.pbkdf2(
  "userPassword123", // password to hash
  salt, // unique salt (store this alongside the hash)
  100000, // iterations — higher = slower = more secure (min: 100,000)
  64, // output key length in bytes
  "sha512", // digest algorithm
  (err, derivedKey) => {
    if (err) throw err;
    const hashedPassword = derivedKey.toString("hex");
    console.log("Salt:", salt);
    console.log("Hashed password:", hashedPassword);

    // Step 3: To verify — re-hash with the same salt and compare
    crypto.pbkdf2("userPassword123", salt, 100000, 64, "sha512", (err, key) => {
      const isMatch = crypto.timingSafeEqual(derivedKey, key);
      console.log("Password matches:", isMatch); // → true
    });
  },
);

// ─────────────────────────────────────────────
// 5. SYMMETRIC ENCRYPTION — AES-256-GCM
// ─────────────────────────────────────────────
// Symmetric = same key for encrypting AND decrypting
// AES-256-GCM is the gold standard: fast, secure, and includes authentication
// Use case: encrypting data at rest (config files, database fields)

function encryptAES(plaintext, key) {
  const iv = crypto.randomBytes(12); // 12-byte IV — unique per encryption, not secret
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag(); // GCM auth tag — detects tampering

  // Store iv + authTag + encrypted together (all needed for decryption)
  return {
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    encrypted: encrypted,
  };
}

function decryptAES(encryptedData, key) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(encryptedData.iv, "hex"),
  );

  decipher.setAuthTag(Buffer.from(encryptedData.authTag, "hex"));

  let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Key must be exactly 32 bytes for AES-256
const aesKey = crypto.randomBytes(32);

const encrypted = encryptAES("Secret message!", aesKey);
console.log("Encrypted:", encrypted);

const decrypted = decryptAES(encrypted, aesKey);
console.log("Decrypted:", decrypted); // → Secret message!

// ─────────────────────────────────────────────
// 6. ASYMMETRIC ENCRYPTION — RSA Key Pair
// ─────────────────────────────────────────────
// Asymmetric = two keys: PUBLIC key (encrypt) + PRIVATE key (decrypt)
// Public key can be shared freely — only the private key can decrypt
// Use case: secure key exchange, digital signatures, SSL/TLS

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048, // key size in bits — 2048 is the minimum recommended
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

// Encrypt with the PUBLIC key
const encryptedRSA = crypto.publicEncrypt(
  publicKey,
  Buffer.from("Top secret!"),
);
console.log(
  "RSA Encrypted (base64):",
  encryptedRSA.toString("base64").slice(0, 40) + "...",
);

// Decrypt with the PRIVATE key
const decryptedRSA = crypto.privateDecrypt(privateKey, encryptedRSA);
console.log("RSA Decrypted:", decryptedRSA.toString()); // → Top secret!

// ─────────────────────────────────────────────
// 7. DIGITAL SIGNATURES — Sign and Verify
// ─────────────────────────────────────────────
// A signature proves: (1) who created the data, (2) it hasn't been tampered with
// Sign with PRIVATE key → verify with PUBLIC key
// Use case: JWT tokens, document signing, software releases

const dataToSign = "This contract is binding.";

// Sign — only the private key holder can create this
const signature = crypto.sign("sha256", Buffer.from(dataToSign), privateKey);
console.log("Signature (hex):", signature.toString("hex").slice(0, 40) + "...");

// Verify — anyone with the public key can verify it
const isValid = crypto.verify(
  "sha256",
  Buffer.from(dataToSign),
  publicKey,
  signature,
);
console.log("Signature valid:", isValid); // → true

// Tampered data fails verification
const isValidTampered = crypto.verify(
  "sha256",
  Buffer.from("This contract is NOT binding."), // changed!
  publicKey,
  signature,
);
console.log("Tampered signature valid:", isValidTampered); // → false

// ─────────────────────────────────────────────
// 8. UUID / UNIQUE ID GENERATION
// ─────────────────────────────────────────────
// crypto.randomUUID() generates a standards-compliant UUID v4
// Great for database primary keys, session IDs, correlation IDs

const uuid = crypto.randomUUID();
console.log("UUID:", uuid); // → e.g. 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d

// ─────────────────────────────────────────────
// 9. CREATING A CHECKSUM (file integrity check)
// ─────────────────────────────────────────────
// A checksum lets you verify a file hasn't been corrupted or tampered with
// Common use case: verifying downloaded files match the original

import fs from "fs";

function getFileChecksum(filePath, algorithm = "sha256") {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk)); // process file in chunks
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

// Usage: getFileChecksum("./myfile.zip").then(console.log);
// Compare this value with the checksum published by the file's author

// ─────────────────────────────────────────────
// QUICK REFERENCE
// ─────────────────────────────────────────────
// createHash()       → one-way fingerprint (sha256, md5, sha512)
// createHmac()       → hash with a secret key (webhook verification)
// randomBytes()      → secure random data (tokens, salts, IDs)
// randomUUID()       → UUID v4 (primary keys, session IDs)
// randomInt()        → secure random integer
// pbkdf2()           → slow password hashing (store user passwords)
// createCipheriv()   → symmetric encryption (AES-256-GCM)
// createDecipheriv() → symmetric decryption
// generateKeyPairSync() → RSA public/private key pair
// publicEncrypt()    → encrypt with public key (RSA)
// privateDecrypt()   → decrypt with private key (RSA)
// sign()             → create a digital signature
// verify()           → verify a digital signature
// timingSafeEqual()  → constant-time comparison (prevents timing attacks)
