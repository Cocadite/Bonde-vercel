const { readSession } = require("../_lib/auth");

module.exports = async (req, res) => {
  const s = await readSession(req);
  if (!s) return res.status(200).json({ ok: false });
  return res.status(200).json({ ok: true, userId: s.userId, userTag: s.userTag });
};
