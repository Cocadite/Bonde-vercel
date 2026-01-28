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
    const motivo = String((req.body || {}).motivo || "").trim();
    if (!motivo) return res.status(400).json({ error: "motivo" });

    const db = supa();
    await db.from("dashboard_actions").update({ done: true }).eq("done", false);
    await db.from("audit_log").insert({ actor: s.userId, action: "reset_system", payload: { motivo }, created_at: Date.now() });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
