## Routing

Routing defines how your app responds to a client request at a specific **URL** and **HTTP method**.

![alt text](image.png)

### HTTP Methods

```javascript
app.get("/users",    (req, res) => res.send("GET    — fetch users"));
app.post("/users",   (req, res) => res.send("POST   — create user"));
app.put("/users",    (req, res) => res.send("PUT    — replace user"));
app.patch("/users",  (req, res) => res.send("PATCH  — update user"));
app.delete("/users", (req, res) => res.send("DELETE — remove user"));

// app.all() matches ALL HTTP methods for a path
app.all("/secret", (req, res) => {
  res.send(`You used method: ${req.method}`);
});
```

### Route Patterns

```javascript
// Exact match
app.get("/about", (req, res) => res.send("About"));

// Named parameters (covered in next section)
app.get("/users/:id", (req, res) => res.send(req.params.id));

// Optional parameter — matches /blog and /blog/123
app.get("/blog/:id?", (req, res) => {
  res.send(req.params.id ? `Post ${req.params.id}` : "All posts");
});

// Wildcard — matches /files/anything/here
app.get("/files/*", (req, res) => {
  res.send(`File path: ${req.params[0]}`);
});

// Regex pattern — matches /aab, /aaab, /aaaab etc.
app.get(/^\/a+b$/, (req, res) => res.send("Regex matched!"));
```

### Chaining Route Handlers

```javascript
// Multiple handlers for the same route using .route()
app.route("/posts")
  .get((req, res)    => res.send("Get all posts"))
  .post((req, res)   => res.send("Create a post"))
  .delete((req, res) => res.send("Delete all posts"));
```

---

## Route Parameters, Query Strings & Request Body

### Route Parameters (`:param`)

Dynamic segments of a URL — captured as `req.params`.

```javascript
// URL: GET /users/42
app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  res.json({ userId: id }); // → { "userId": "42" }
});

// Multiple params
// URL: GET /users/5/posts/12
app.get("/users/:userId/posts/:postId", (req, res) => {
  const { userId, postId } = req.params;
  res.json({ userId, postId }); // → { "userId": "5", "postId": "12" }
});
```

### Query Strings (`?key=value`)

Key-value pairs after the `?` — captured as `req.query`.

```javascript
// URL: GET /search?q=nodejs&page=2&limit=10
app.get("/search", (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  res.json({ query: q, page, limit });
  // → { "query": "nodejs", "page": "2", "limit": "10" }
});
```

### Request Body (POST / PUT / PATCH)

Data sent in the body of a request — captured as `req.body`.  
Requires `express.json()` or `express.urlencoded()` middleware first.

```javascript
app.use(express.json()); // parse JSON bodies

// URL: POST /users
// Body: { "name": "Alice", "email": "alice@example.com" }
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({ message: "User created", name, email });
});
```

---