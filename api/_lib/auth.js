const { SignJWT, jwtVerify } = require("jose");

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("Missing SESSION_SECRET");
  return new TextEncoder().encode(s);
}

function cookieName(){ return "pnp_session"; }

async function createSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

async function readSession(req) {
  const cookie = req.headers.cookie || "";
  const m = cookie.match(new RegExp(`${cookieName()}=([^;]+)`));
  if (!m) return null;
  try {
    const token = decodeURIComponent(m[1]);
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

function setCookie(res, token) {
  res.setHeader("Set-Cookie", `${cookieName()}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Secure`);
}

function clearCookie(res) {
  res.setHeader("Set-Cookie", `${cookieName()}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`);
}

module.exports = { createSession, readSession, setCookie, clearCookie };
