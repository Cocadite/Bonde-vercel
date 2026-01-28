import crypto from "crypto";

export default function handler(req, res) {
  const secret = req.headers["x-bonde-secret"];

  if (!process.env.BONDE_SECRET || secret !== process.env.BONDE_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const token = crypto.randomBytes(16).toString("hex");
  return res.status(200).json({ token });
}
