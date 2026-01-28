const { readSession } = require("../_lib/auth");
const { fetchMemberRoles, isAdminRole } = require("../_lib/discord");
const { supa } = require("../_lib/supabase");

module.exports = async (req, res) => {
  try {
    const s = await readSession(req);
    if (!s) return res.status(401).json({ error: "login" });

    const roles = await fetchMemberRoles(s.userId);
    if (!isAdminRole(roles)) return res.status(403).json({ error: "forbidden" });

    if (req.method !== "POST") return res.status(405).json({ error: "method" });
    const id = Number((req.body || {}).id);
    if (!id) return res.status(400).json({ error: "id" });

    const db = supa();
    const now = Date.now();
    await db.from("submissions").update({ status: "REJECTED", reviewed_by: s.userId, reviewed_via: "dashboard", reviewed_at: now }).eq("id", id);
    await db.from("audit_log").insert({ actor: s.userId, action: "reject_dashboard", payload: { id }, created_at: now });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
