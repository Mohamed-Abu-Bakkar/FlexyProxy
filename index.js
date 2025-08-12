import { app } from "./api/proxy.js";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Local Flexible Proxy running at http://localhost:${PORT}`);
});
