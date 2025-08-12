import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import serverless from "serverless-http";

const app = express();
app.use(cors());
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Flexible Proxy",
    message: "The Flexible Proxy server is up and running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// Utility Functions
function buildFetchOptions({ method = "GET", headers = {}, body = {} }) {
  const options = {
    method: method.toUpperCase(),
    headers: headers || {},
  };
  if (["POST", "PUT", "PATCH", "DELETE"].includes(options.method)) {
    options.body = JSON.stringify(body || {});
    if (!options.headers["Content-Type"]) {
      options.headers["Content-Type"] = "application/json";
    }
  }
  return options;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
}

// Proxy route
app.all("/proxy", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Missing 'url' in request body" });
  }
  try {
    const options = buildFetchOptions(req.body);
    const response = await fetch(url, options);
    const data = await parseResponse(response);
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export the app for local development and serverless deployment
export { app };


export default serverless(app);
