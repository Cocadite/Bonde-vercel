export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Método inválido");

  const { token, nick, idade, motivo, linkBonde } = req.body || {};

  if (!token || !nick || !idade || !motivo || !linkBonde) {
    return res.status(400).send("❌ Preencha tudo.");
  }

  return res.status(200).send("✅ Formulário enviado! Aguarde aprovação no Discord.");
}
