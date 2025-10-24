import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let listings = [];

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
    sample: listings.slice(0, 3),
  });
  listings = [];
});

// Health check
app.get("/", (req, res) => {
  res.send("Listing collector API is live!");
});

export default app;
