import {
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

function rollDice(diceStr) {
  // Format: NdN (ex: 2d20, 1d6, 3d10)
  const match = diceStr.match(/^(\d+)d(\d+)$/);
  if (!match) {
    // Si ce n'est pas au format NdN, on essaie de parser un nombre simple
    const num = parseInt(diceStr);
    if (isNaN(num) || num < 1) return null;
    return { rolls: [Math.floor(Math.random() * num) + 1], total: Math.floor(Math.random() * num) + 1, sides: num };
  }

  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);

  if (count < 1 || sides < 1) return null;

  const rolls = [];
  let total = 0;

  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    total += roll;
  }

  return { rolls, total, sides, count };
}

export const data = new SlashCommandBuilder()
  .setName("dice")
  .setDescription("Lancer un ou plusieurs dés.")
  .setDMPermission(true)
  .addStringOption((option) =>
    option
      .setName("dé")
      .setDescription("Le dé à lancer (ex: 2d20, d6, 100)")
      .setRequired(true)
  );

export async function execute(interaction) {
  const diceStr = interaction.options.getString("dé", true).toLowerCase();

  // Ajouter un "1d" devant si l'utilisateur a juste écrit "d20"
  const normalizedDiceStr = diceStr.startsWith("d") ? `1${diceStr}` : diceStr;

  const result = rollDice(normalizedDiceStr);
  if (!result) {
    await interaction.reply({
      content: "Format de dé invalide. Utilisez un format comme `2d20`, `d6`, ou `100`.",
      ephemeral: true,
    });
    return;
  }

  let description = "";

  if (result.count > 1) {
    description = `Lancement de **${result.count}d${result.sides}**:\n`;
    description += `Résultats: **${result.rolls.join(", ")}**\n`;
    description += `Total: **${result.total}**`;
  } else {
    description = `Vous avez lancé un **d${result.sides}** et obtenu: **${result.total}**`;
  }

  const embed = new EmbedBuilder()
    .setColor(0x8b4513)
    .setTitle("🎲 Lancement de dé")
    .setDescription(description)
    .setFooter({ text: `Demandé par ${interaction.user.tag}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
