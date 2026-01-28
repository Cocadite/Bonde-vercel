const { supa } = require("./_lib/supabase");
const { assertBotApiKey } = require("./_lib/apiKey");

module.exports = async (req, res) => {
  try {
    assertBotApiKey(req);
    if (req.method !== "POST") return res.status(405).json({ error: "method" });
    const id = Number((req.body || {}).id);
    const by = String((req.body || {}).by || "").trim() || null;
    const via = String((req.body || {}).via || "bot").trim();

    if (!id) return res.status(400).json({ error: "id" });
    const db = supa();

    const now = Date.now();
    const { error: e2 } = await db.from("submissions").update({
      status: "REJECTED",
      reviewed_by: by,
      reviewed_via: via,
      reviewed_at: now
    }).eq("id", id);
    if (e2) return res.status(500).json({ error: e2.message });

    await db.from("audit_log").insert({ actor: by, action: "reject", payload: { id, via }, created_at: now });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
};
