const { supa } = require("../_lib/supabase");
const { assertBotApiKey } = require("../_lib/apiKey");

module.exports = async (req, res) => {
  try {
    assertBotApiKey(req);
    const db = supa();
    const { data, error } = await db
      .from("dashboard_actions")
      .select("id,type,user_id,submission_id,created_at")
      .eq("done", false)
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) return res.status(500).json({ error: error.message });
    const actions = (data || []).map((a) => ({
      id: a.id, type: a.type, userId: a.user_id, submissionId: a.submission_id
    }));
    return res.status(200).json({ ok: true, actions });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
};
