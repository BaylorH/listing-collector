import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // allow big JSON payloads

let listings = [];

// ---- SESSION HANDLERS ----

// Start new session
app.post("/start", (req, res) => {
  listings = [];
  console.log("Session started");
  res.json({ status: "ok", message: "Session started" });
});

// Receive JSON chunk
app.post("/data", (req, res) => {
  const incoming = req.body.listings;
  if (Array.isArray(incoming)) {
    listings.push(...incoming);
    console.log(`Received ${incoming.length} listings, total: ${listings.length}`);
    res.json({ status: "ok", total: listings.length });
  } else {
    res.status(400).json({ status: "error", message: "Expected listings array" });
  }
});

// End session
app.post("/end", (req, res) => {
  console.log(`Finalizing ${listings.length} listings`);
  res.json({
    status: "ok",
    total: listings.length,
    sample: listings.slice(0, 3)
  });
  listings = [];
});

// ---- OPTIONAL PROXY ENDPOINT ----
// lets you GET or POST from the Agent Builder via a single /api route
app.all("/api", async (req, res) => {
  const { endpoint, body } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: "Missing endpoint param" });
  }

  // allow body to be passed as query string or POST body
  let parsedBody = {};
  try {
    parsedBody =
      typeof body === "string"
        ? JSON.parse(decodeURIComponent(body))
        : req.body || {};
  } catch (e) {
    console.error("Body parse failed:", e.message);
  }

  const targetUrl = `https://listing-collector.vercel.app/${endpoint}`;
  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: endpoint === "data" ? JSON.stringify(parsedBody) : null
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed" });
  }
});

// ---- HEALTH CHECK ----
app.get("/", (req, res) => {
  res.send("Listing collector + proxy is live!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

export default app;
