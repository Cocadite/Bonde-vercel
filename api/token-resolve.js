const { supa } = require("./_lib/supabase");

module.exports = async (req, res) => {
  try {
    const token = String(req.query.token || "").trim();
    if (!token) return res.status(400).json({ error: "token" });

    const db = supa();
    const { data, error } = await db.from("form_tokens").select("token,user_id,discord_tag,used").eq("token", token).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "token_invalido" });
    if (data.used) return res.status(410).json({ error: "token_ja_usado" });

    return res.status(200).json({ ok: true, userId: data.user_id, discordTag: data.discord_tag || "Usuário" });
  } catch (e) {
    return res.status(500).json({ error: e.message || "err" });
  }
};
