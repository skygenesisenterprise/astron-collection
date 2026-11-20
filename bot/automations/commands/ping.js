import {
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Vérifier la latence du bot et de l'API Discord.")
  .setDMPermission(true);

export async function execute(interaction) {
  const sent = await interaction.reply({
    content: "Ping...",
    fetchReply: true,
  });

  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  const apiLatency = Math.round(interaction.client.ws.ping);

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle("🏓 Pong !")
    .setDescription(
      `Latence du bot: **${latency}ms**\n` +
      `Latence de l'API Discord: **${apiLatency}ms**`
    )
    .setTimestamp();

  await interaction.editReply({ content: " ", embeds: [embed] });
}
