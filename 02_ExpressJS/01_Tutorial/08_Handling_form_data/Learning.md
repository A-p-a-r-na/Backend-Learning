## Handling Form Data
 
Express.js can handle both URL-encoded form submissions and `multipart/form-data` (for file uploads).
 
### 1.1 Parsing URL-Encoded Form Data
 
URL-encoded is the default encoding for HTML `<form>` elements.
 
```js
const express = require('express');
const app = express();
 
// Built-in middleware for URL-encoded body
app.use(express.urlencoded({ extended: true }));
 
app.post('/submit', (req, res) => {
  const { name, email, message } = req.body;
 
  console.log({ name, email, message });
  res.send(`Received: Hello ${name}, we'll contact you at ${email}`);
});
```
 
`extended: true` uses the `qs` library (supports nested objects); `extended: false` uses the built-in `querystring` module.
 
### 1.2 Parsing JSON Body
 
For AJAX/API form submissions that send JSON:
 
```js
app.use(express.json());
 
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  res.json({ message: `User ${username} registered!` });
});
```
 
### 1.3 HTML Form Example
 
```html
<!-- URL-encoded form -->
<form action="/submit" method="POST">
  <input type="text"  name="name"    placeholder="Your Name" />
  <input type="email" name="email"   placeholder="Email" />
  <textarea           name="message" placeholder="Message"></textarea>
  <button type="submit">Send</button>
</form>
```
 
### 1.4 Input Validation
 
Always validate and sanitize form input before processing.
 
```bash
npm install express-validator
```
 
```js
const { body, validationResult } = require('express-validator');
 
app.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('username').notEmpty().trim().isLength({ min: 1 }),
    body('password').isLength({ min: 8 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
 
    const { username, email, password } = req.body;
    res.json({ message: `Registered: ${username}` });
  }
);
```
 
### 1.5 Handling File Uploads with Multer
 
`express.urlencoded` cannot handle file uploads — use `multer` instead.
 
```bash
npm install multer
```
 
```js
const multer = require('multer');
 
// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');          // Directory to save files
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
 
// File filter (images only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};
 
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});
 
// Single file upload
app.post('/upload', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    size: req.file.size,
  });
});
 
// Multiple file uploads
app.post('/upload-multiple', upload.array('photos', 5), (req, res) => {
  res.json({ files: req.files.map(f => f.filename) });
});
```
 
### 1.6 Handling Errors from Multer
 
```js
app.post('/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ file: req.file });
  });
});
```
 
### 1.7 Handling Form Data: Summary
 
| Data Type            | Middleware / Package         | Content-Type Header                   |
|----------------------|------------------------------|---------------------------------------|
| HTML form (text)     | `express.urlencoded()`       | `application/x-www-form-urlencoded`   |
| JSON payload         | `express.json()`             | `application/json`                    |
| File upload          | `multer`                     | `multipart/form-data`                 |
 
---