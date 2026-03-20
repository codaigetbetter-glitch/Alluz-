export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages, system } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "API key not configured in Vercel environment variables." });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: system || "",
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || "API error " + response.status });
    }

    const data = await response.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
}
