async function fetchDiscordToken(code) {
  const params = new URLSearchParams();
  params.set("client_id", process.env.DISCORD_CLIENT_ID);
  params.set("client_secret", process.env.DISCORD_CLIENT_SECRET);
  params.set("grant_type", "authorization_code");
  params.set("code", code);
  params.set("redirect_uri", process.env.DISCORD_REDIRECT_URI);

  const r = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
  if (!r.ok) throw new Error("oauth_token_failed");
  return r.json();
}

async function fetchDiscordUser(accessToken) {
  const r = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!r.ok) throw new Error("oauth_user_failed");
  return r.json();
}

async function fetchMemberRoles(userId) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!botToken || !guildId) throw new Error("Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID");

  const r = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
    headers: { Authorization: `Bot ${botToken}` }
  });
  if (!r.ok) throw new Error("member_fetch_failed");
  const j = await r.json();
  return j.roles || [];
}

function isAdminRole(roles) {
  const adminIds = String(process.env.ADMIN_ROLE_IDS || "").split(",").map(s=>s.trim()).filter(Boolean);
  return roles.some(r => adminIds.includes(r));
}

module.exports = { fetchDiscordToken, fetchDiscordUser, fetchMemberRoles, isAdminRole };
