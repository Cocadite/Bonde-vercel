const { supa } = require("./_lib/supabase");

async function count(db, status) {
  const { count, error } = await db.from("submissions").select("id", { count: "exact", head: true }).eq("status", status);
  if (error) throw error;
  return count || 0;
}

module.exports = async (_req, res) => {
  try {
    const db = supa();
    const pending = await count(db, "PENDING");
    const approved = await count(db, "APPROVED");
    const rejected = await count(db, "REJECTED");
    const { count: q } = await db.from("dashboard_actions").select("id", { count: "exact", head: true }).eq("done", false);
    return res.status(200).json({ ok: true, pending, approved, rejected, actionQueue: q || 0 });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
