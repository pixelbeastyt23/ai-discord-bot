export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt required" });
  }

  try {
    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are an expert Discord.js developer.

Return ONLY valid JSON:
{
  "files": {
    "index.js": "...",
    "package.json": "...",
    "config.json": "..."
  }
}

Rules:
- No explanation
- No markdown
- Proper JSON
- Full working bot

User request:
${prompt}
`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiRes.json();

    let output = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 🔥 Clean response
    output = output.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch {
      return res.status(500).json({ error: "Invalid JSON from AI" });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}