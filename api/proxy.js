export default async function handler(req, res) {
  const { endpoint, body } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: "Missing endpoint param" });
  }

  // Parse body if sent as query string
  let parsedBody = {};
  try {
    parsedBody =
      typeof body === "string"
        ? JSON.parse(decodeURIComponent(body))
        : {};
  } catch (e) {
    console.error("Failed to parse body:", e);
  }

  const targetUrl = `http://127.0.0.1:3000/${endpoint}`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: endpoint === "data" ? JSON.stringify(parsedBody) : null
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy failed" });
  }
}
