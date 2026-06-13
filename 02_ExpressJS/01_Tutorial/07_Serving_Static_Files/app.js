import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// __dirname is not available in ES Modules — this is the workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve all files inside the "public" folder as static assets
// path.join() builds the correct absolute path regardless of OS
// __dirname + "public" = /absolute/path/to/your/project/public
app.use(express.static(path.join(__dirname, "public")));

// Other middleware and routes go here
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
