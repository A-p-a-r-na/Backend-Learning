import express from "express";
import cookieParser from "cookie-parser";

// Initialize the Express application
const app = express();
const PORT = 3000;

// Register cookie-parser middleware so req.cookies is populated on every request
app.use(cookieParser());

// GET / — Sets a cookie named "name" with value "express-app"
// maxAge is in milliseconds: 360000ms = 6 minutes
app.get("/", (req, res) => {
  res.cookie("name", "express-app", { maxAge: 360000 });
  res.send("Hello Express app");
});

// GET /fetch — Reads and logs all cookies sent by the client
// req.cookies is an object like: { name: 'express-app' }
app.get("/fetch", (req, res) => {
  console.log(req.cookies);
  res.send("API called");
});

// GET /remove — Clears the "name" cookie from the client's browser
// clearCookie() tells the browser to delete the cookie by setting its maxAge to 0
app.get("/remove", (req, res) => {
  res.clearCookie("name");
  res.send("Cookie cleared");
});

// Start the server and listen on the specified PORT
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
