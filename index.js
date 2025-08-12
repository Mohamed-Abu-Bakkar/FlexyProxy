import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({ message: "FlexyProxy is running on Render" });
});

// Proxy endpoint
app.post("/proxy", async (req, res) => {
  const { url, options } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Missing 'url' in request body" });
  }

  try {
    const response = await fetch(url, options || {});
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
