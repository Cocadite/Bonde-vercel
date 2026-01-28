const crypto = require("crypto");
const { supa } = require("./_lib/supabase");
const { assertBotApiKey } = require("./_lib/apiKey");

module.exports = async (req, res) => {
  try {
    assertBotApiKey(req);
    if (req.method !== "POST") return res.status(405).json({ error: "method" });

    const body = req.body || {};
    const userId = String(body.userId || "").trim();
    const discordTag = String(body.discordTag || "").trim() || null;
    if (!userId) return res.status(400).json({ error: "userId" });

    const token = crypto.randomBytes(16).toString("hex");
    const createdAt = Date.now();

    const db = supa();
    const { error } = await db.from("form_tokens").insert({
      token, user_id: userId, discord_tag: discordTag, used: false, created_at: createdAt
    });
    if (error) return res.status(500).json({ error: error.message });

    const base = (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "").trim();
    const publicBase = base || (process.env.PUBLIC_BASE_URL || "").trim() || "";
    const origin = publicBase || "";
    const url = `${origin}/form?token=${encodeURIComponent(token)}`;

    return res.status(200).json({ ok: true, token, url });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message || "err" });
  }
};
