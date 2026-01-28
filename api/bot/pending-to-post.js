const { supa } = require("../_lib/supabase");
const { assertBotApiKey } = require("../_lib/apiKey");

module.exports = async (req, res) => {
  try {
    assertBotApiKey(req);
    const db = supa();
    const { data, error } = await db
      .from("submissions")
      .select("id,user_id,discord_tag,nick,idade,motivo,link_bonde,created_at")
      .eq("status", "PENDING")
      .eq("posted_to_discord", false)
      .order("created_at", { ascending: true })
      .limit(25);

    if (error) return res.status(500).json({ error: error.message });
    const items = (data || []).map((it) => {
      const discordTag = it.discord_tag || `ID:${it.user_id}`;
      return {
        id: it.id,
        discordMessage: {
          embeds: [{
            title: "📋 Novo Formulário — É Os Pé Na Porta",
            color: 0xff1b1b,
            fields: [
              { name: "Discord", value: discordTag, inline: false },
              { name: "Nick", value: it.nick, inline: true },
              { name: "Idade", value: String(it.idade), inline: true },
              { name: "Motivo", value: it.motivo.slice(0, 1024), inline: false },
              { name: "Link do bonde", value: it.link_bonde, inline: false },
            ],
            footer: { text: `SubmissionID: ${it.id} | UserID: ${it.user_id}` },
            timestamp: new Date(it.created_at).toISOString()
          }],
          components: [{
            type: 1,
            components: [
              { type: 2, style: 3, label: "✅ Aprovar", custom_id: `approve:${it.id}` },
              { type: 2, style: 4, label: "❌ Recusar", custom_id: `reject:${it.id}` }
            ]
          }]
        }
      };
    });

    return res.status(200).json({ ok: true, items });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
};
