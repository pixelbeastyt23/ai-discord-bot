export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt required" });
  }

  try {
    // 🔹 Call Qwen (replace with your API)
    const qwenRes = await fetch(process.env.QWEN_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.QWEN_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen-plus",
        input: `
Return ONLY JSON:
{
  "files": {
    "index.js": "console.log('Hello bot');",
    "package.json": "{}"
  }
}

User: ${prompt}
`
      })
    });

    const data = await qwenRes.json();

    let output = data.output || "";

    // 🔹 Clean AI response
    output = output.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch {
      return res.status(500).json({ error: "Invalid AI JSON" });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}