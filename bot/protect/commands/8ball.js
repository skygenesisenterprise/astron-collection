import {
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

const RESPONSES = [
  "C'est certain",
  "C'est décidé ainsi",
  "Sans aucun doute",
  "Oui, définitivement",
  "Tu peux te fier à cela",
  "Comme je le vois, oui",
  "Très probablement",
  "Perspectives bonnes",
  "Oui",
  "Les signes indiquent que oui",
  "Réponse floue, réessayez",
  "Demandez à nouveau plus tard",
  "Mieux vaut ne pas vous le dire maintenant",
  "Impossible de prédire maintenant",
  "Concentrez-vous et demandez à nouveau",
  "Ne comptez pas là-dessus",
  "Ma réponse est non",
  "Mes sources indiquent que non",
  "Perspectives peu probables",
  "Très douteux",
];

export const data = new SlashCommandBuilder()
  .setName("8ball")
  .setDescription("Poser une question à la boule magique.")
  .setDMPermission(true)
  .addStringOption((option) =>
    option
      .setName("question")
      .setDescription("Votre question")
      .setRequired(true)
  );

export async function execute(interaction) {
  const question = interaction.options.getString("question", true);

  const randomIndex = Math.floor(Math.random() * RESPONSES.length);
  const answer = RESPONSES[randomIndex];

  const embed = new EmbedBuilder()
    .setColor(0x000000)
    .setTitle("🔮 8 Ball")
    .addFields(
      { name: "Question", value: question, inline: false },
      { name: "Réponse", value: answer, inline: false }
    )
    .setFooter({ text: `Demandé par ${interaction.user.tag}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
