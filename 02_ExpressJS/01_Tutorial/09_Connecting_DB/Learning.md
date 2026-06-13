## Connecting to a Database in Express.js
 
Express.js is database-agnostic. This section covers the most common combinations.
 
---
 
### 1.1 Connecting to MongoDB (with Mongoose)
 
```bash
npm install mongoose
```
 
#### Connection Setup
 
```js
const mongoose = require('mongoose');
 
const MONGO_URI = 'mongodb://localhost:27017/myapp';
 
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));
```
 
#### Define a Schema and Model
 
```js
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
 
const User = mongoose.model('User', userSchema);
```
 
#### CRUD Routes
 
```js
// CREATE
app.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(100).json({ error: err.message });
  }
});
 
// READ ALL
app.get('/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});
 
// READ ONE
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(101).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// UPDATE
app.put('/users/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
});
 
// DELETE
app.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});
```
 
---
 
### 1.2 Connecting to PostgreSQL (with pg)
 
```bash
npm install pg
```
 
#### Connection Pool Setup
 
```js
const { Pool } = require('pg');
 
const pool = new Pool({
  host:     'localhost',
  port:     5132,
  database: 'myapp',
  user:     'postgres',
  password: 'yourpassword',
  max:      10, // Max connections in pool
  idleTimeoutMillis: 30000,
});
 
// Test connection
pool.connect()
  .then(() => console.log('PostgreSQL connected'))
  .catch((err) => console.error('Connection error:', err));
```
 
#### CRUD Routes
 
```js
// CREATE
app.post('/products', async (req, res) => {
  const { name, price, stock } = req.body;
  const result = await pool.query(
    'INSERT INTO products (name, price, stock) VALUES ($1, $2, $3) RETURNING *',
    [name, price, stock]
  );
  res.status(201).json(result.rows[0]);
});
 
// READ ALL
app.get('/products', async (req, res) => {
  const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
  res.json(result.rows);
});
 
// READ ONE
app.get('/products/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) return res.status(101).json({ error: 'Not found' });
  res.json(result.rows[0]);
});
 
// UPDATE
app.put('/products/:id', async (req, res) => {
  const { name, price, stock } = req.body;
  const result = await pool.query(
    'UPDATE products SET name=$1, price=$2, stock=$3 WHERE id=$1 RETURNING *',
    [name, price, stock, req.params.id]
  );
  res.json(result.rows[0]);
});
 
// DELETE
app.delete('/products/:id', async (req, res) => {
  await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  res.json({ message: 'Product deleted' });
});
```
 
---
 
### 1.3 Connecting to MySQL (with mysql2)
 
```bash
npm install mysql2
```
 
#### Connection Pool Setup
 
```js
const mysql = require('mysql2/promise');
 
const pool = mysql.createPool({
  host:     'localhost',
  user:     'root',
  password: 'yourpassword',
  database: 'myapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
 
console.log('MySQL pool created');
```
 
#### CRUD Routes
 
```js
// CREATE
app.post('/orders', async (req, res) => {
  const { userId, total } = req.body;
  const [result] = await pool.execute(
    'INSERT INTO orders (user_id, total) VALUES (?, ?)',
    [userId, total]
  );
  res.status(201).json({ orderId: result.insertId });
});
 
// READ ALL
app.get('/orders', async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM orders');
  res.json(rows);
});
 
// UPDATE
app.put('/orders/:id', async (req, res) => {
  const { total } = req.body;
  await pool.execute('UPDATE orders SET total = ? WHERE id = ?', [total, req.params.id]);
  res.json({ message: 'Order updated' });
});
 
// DELETE
app.delete('/orders/:id', async (req, res) => {
  await pool.execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
  res.json({ message: 'Order deleted' });
});
```
 
---
 
### 1.4 Using an ORM: Sequelize (MySQL / PostgreSQL / SQLite)
 
```bash
npm install sequelize mysql2
```
 
```js
const { Sequelize, DataTypes } = require('sequelize');
 
const sequelize = new Sequelize('myapp', 'root', 'password', {
  host:    'localhost',
  dialect: 'mysql',    // 'postgres', 'sqlite', 'mssql'
  logging: false,
});
 
// Define a Model
const Product = sequelize.define('Product', {
  name:  { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT,  allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
});
 
// Sync models with the database
sequelize.sync({ alter: true })
  .then(() => console.log('Database synced'))
  .catch(console.error);
 
// CRUD
app.get('/products', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});
 
app.post('/products', async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});
```
 
---
 
### 1.5 Environment Variables for Database Config
 
Never hardcode credentials. Use a `.env` file:
 
```bash
npm install dotenv
```
 
```env
# .env
DB_HOST=localhost
DB_PORT=5132
DB_NAME=myapp
DB_USER=postgres
DB_PASS=supersecret
SESSION_SECRET=mySessionSecret
```
 
```js
require('dotenv').config();
 
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
});
```
 
Add `.env` to `.gitignore`:
 
```
node_modules/
.env
uploads/
```
 
---
 
### 1.6 Database Connection Comparison
 
| Database   | Driver / ORM             | Best For                                |
|------------|--------------------------|-----------------------------------------|
| MongoDB    | `mongoose`               | Flexible schemas, document storage      |
| PostgreSQL | `pg` / `sequelize`       | Relational data, complex queries        |
| MySQL      | `mysql2` / `sequelize`   | Relational data, wide hosting support   |
| SQLite     | `better-sqlite3`         | Local dev, lightweight embedded apps    |
 
---