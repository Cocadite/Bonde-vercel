const { supa } = require("./_lib/supabase");

function toInt(v, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.floor(n);
  if (i < min || i > max) return null;
  return i;
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "method" });
    const body = req.body || {};
    const token = String(body.token || "").trim();
    const nick = String(body.nick || "").trim().slice(0, 64);
    const motivo = String(body.motivo || "").trim().slice(0, 700);
    const idade = toInt(body.idade, 5, 120);
    const linkBonde = String(body.linkBonde || "").trim().slice(0, 300);

    if (!token || !nick || !motivo || idade === null) return res.status(400).json({ error: "campos_invalidos" });
    if (!/^https?:\/\//i.test(linkBonde)) return res.status(400).json({ error: "link_invalido" });

    const db = supa();

    const { data: tok, error: e1 } = await db.from("form_tokens").select("token,user_id,discord_tag,used").eq("token", token).maybeSingle();
    if (e1) return res.status(500).json({ error: e1.message });
    if (!tok) return res.status(404).json({ error: "token_invalido" });
    if (tok.used) return res.status(410).json({ error: "token_ja_usado" });

    // mark used
    await db.from("form_tokens").update({ used: true, used_at: Date.now() }).eq("token", token);

    const createdAt = Date.now();
    const { data: ins, error: e2 } = await db.from("submissions").insert({
      token,
      user_id: tok.user_id,
      discord_tag: tok.discord_tag,
      nick,
      idade,
      motivo,
      link_bonde: linkBonde,
      status: "PENDING",
      posted_to_discord: false,
      created_at: createdAt
    }).select("id,user_id,discord_tag,nick,idade,motivo,link_bonde,created_at").single();

    if (e2) return res.status(500).json({ error: e2.message });

    // audit
    await db.from("audit_log").insert({ actor: tok.user_id, action: "submit", payload: ins, created_at: Date.now() });

    return res.status(200).json({ ok: true, id: ins.id });
  } catch (e) {
    return res.status(500).json({ error: e.message || "err" });
  }
};
