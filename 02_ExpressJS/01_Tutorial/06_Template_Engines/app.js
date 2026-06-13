import express from "express";
import ejs from "ejs";

const app = express();
const PORT = 3000;

app.set("view engine", "ejs"); // set EJS as the engine
app.set("views", "./views"); // folder where templates live

app.get("/profile", (req, res) => {
  // Renders views/profile.ejs and passes data to it
  res.render("index", {
    name: "Alice",
    age: 28,
    skills: ["JavaScript", "Node.js", "Express"],
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port number ${PORT}`);
});
