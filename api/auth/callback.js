const { fetchDiscordToken, fetchDiscordUser, fetchMemberRoles, isAdminRole } = require("../_lib/discord");
const { createSession, setCookie } = require("../_lib/auth");
const { supa } = require("../_lib/supabase");

module.exports = async (req, res) => {
  try {
    const code = String(req.query.code || "").trim();
    if (!code) return res.status(400).send("missing code");

    const tok = await fetchDiscordToken(code);
    const user = await fetchDiscordUser(tok.access_token);

    const roles = await fetchMemberRoles(user.id);
    if (!isAdminRole(roles)) return res.status(403).send("Sem permissão.");

    const jwt = await createSession({ userId: user.id, userTag: `${user.username}#${user.discriminator}` });
    setCookie(res, jwt);

    const db = supa();
    await db.from("audit_log").insert({ actor: user.id, action: "dashboard_login", payload: { user: user.id }, created_at: Date.now() });

    res.writeHead(302, { Location: "/dashboard" });
    res.end();
  } catch (e) {
    res.status(500).send("auth failed: " + e.message);
  }
};
