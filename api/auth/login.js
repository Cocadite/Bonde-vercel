module.exports = async (_req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirect = process.env.DISCORD_REDIRECT_URI;
  if (!clientId || !redirect) return res.status(500).send("Missing oauth envs");

  const params = new URLSearchParams();
  params.set("client_id", clientId);
  params.set("redirect_uri", redirect);
  params.set("response_type", "code");
  params.set("scope", "identify");

  res.writeHead(302, { Location: `https://discord.com/api/oauth2/authorize?${params}` });
  res.end();
};
