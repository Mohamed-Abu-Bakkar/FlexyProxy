// api/proxy.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import serverless from "serverless-http";

const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(express.json());

// ===== Health Check Route =====
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Flexible Proxy",
    message: "The Flexible Proxy server is up and running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// ===== Utility Functions =====
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

// ===== Core Proxy Logic =====
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
    console.log("Data sent to client:", JSON.stringify(data));
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Export for Vercel
export default serverless(app);
