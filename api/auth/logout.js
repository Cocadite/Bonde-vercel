const { clearCookie } = require("../_lib/auth");

module.exports = async (_req, res) => {
  clearCookie(res);
  res.status(200).json({ ok: true });
};
