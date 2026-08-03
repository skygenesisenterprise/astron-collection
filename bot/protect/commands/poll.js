import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("poll")
  .setDescription("Créer un sondage avec des boutons.")
  .setDMPermission(false)
  .addStringOption((option) =>
    option
      .setName("question")
      .setDescription("La question du sondage")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("option1")
      .setDescription("Première option")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("option2")
      .setDescription("Deuxième option")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("option3")
      .setDescription("Troisième option (optionnel)")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("option4")
      .setDescription("Quatrième option (optionnel)")
      .setRequired(false)
  );

export async function execute(interaction) {
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Cette commande doit être utilisée dans un serveur.",
      ephemeral: true,
    });
    return;
  }

  const question = interaction.options.getString("question", true);
  const option1 = interaction.options.getString("option1", true);
  const option2 = interaction.options.getString("option2", true);
  const option3 = interaction.options.getString("option3");
  const option4 = interaction.options.getString("option4");

  const options = [option1, option2];
  if (option3) options.push(option3);
  if (option4) options.push(option4);

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("📊 Sondage")
    .setDescription(question)
    .setFooter({ text: `Créé par ${interaction.user.tag}` })
    .setTimestamp();

  const buttons = options.map((option, index) =>
    new ButtonBuilder()
      .setCustomId(`poll:${interaction.id}:${index}`)
      .setLabel(option)
      .setStyle(ButtonStyle.Primary)
  );

  const row = new ActionRowBuilder().addComponents(buttons);

  await interaction.reply({
    embeds: [embed],
    components: [row],
  });
}
