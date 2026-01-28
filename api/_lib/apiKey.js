function assertBotApiKey(req) {
  const expected = process.env.BOT_API_KEY;
  if (!expected) throw new Error("Missing BOT_API_KEY");
  const auth = req.headers.authorization || "";
  if (auth !== `Bearer ${expected}`) {
    const e = new Error("unauthorized");
    e.status = 401;
    throw e;
  }
}

module.exports = { assertBotApiKey };
