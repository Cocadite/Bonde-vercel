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

    const { data: sub, error: e1 } = await db.from("submissions").select("*").eq("id", id).maybeSingle();
    if (e1) return res.status(500).json({ error: e1.message });
    if (!sub) return res.status(404).json({ error: "not_found" });

    const now = Date.now();
    const { error: e2 } = await db.from("submissions").update({
      status: "APPROVED",
      reviewed_by: by,
      reviewed_via: via,
      reviewed_at: now
    }).eq("id", id);
    if (e2) return res.status(500).json({ error: e2.message });

    await db.from("audit_log").insert({ actor: by, action: "approve", payload: { id, via }, created_at: now });

    // queue action for bot (dashboard approvals also go here)
    await db.from("dashboard_actions").insert({ type: "approve", user_id: sub.user_id, submission_id: id, created_at: now, done: false });

    return res.status(200).json({ ok: true, userId: sub.user_id });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
};
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

    const { data: sub, error: e1 } = await db.from("submissions").select("*").eq("id", id).maybeSingle();
    if (e1) return res.status(500).json({ error: e1.message });
    if (!sub) return res.status(404).json({ error: "not_found" });

    const now = Date.now();
    const { error: e2 } = await db.from("submissions").update({
      status: "APPROVED",
      reviewed_by: by,
      reviewed_via: via,
      reviewed_at: now
    }).eq("id", id);
    if (e2) return res.status(500).json({ error: e2.message });

    await db.from("audit_log").insert({ actor: by, action: "approve", payload: { id, via }, created_at: now });

    // queue action for bot (dashboard approvals also go here)
    await db.from("dashboard_actions").insert({ type: "approve", user_id: sub.user_id, submission_id: id, created_at: now, done: false });

    return res.status(200).json({ ok: true, userId: sub.user_id });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
};
