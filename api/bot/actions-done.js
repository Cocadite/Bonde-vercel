const { supa } = require("../_lib/supabase");
const { assertBotApiKey } = require("../_lib/apiKey");

module.exports = async (req, res) => {
  try {
    assertBotApiKey(req);
    if (req.method !== "POST") return res.status(405).json({ error: "method" });
    const id = Number((req.body || {}).id);
    if (!id) return res.status(400).json({ error: "id" });

    const db = supa();
    const { error } = await db.from("dashboard_actions").update({ done: true }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });

    await db.from("audit_log").insert({ actor: "bot", action: "action_done", payload: { id }, created_at: Date.now() });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
};
