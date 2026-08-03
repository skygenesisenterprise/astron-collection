import { MessageFlags } from "discord.js";

export const name = "interactionCreate";

export async function execute(interaction) {
  try {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      await interaction.reply({
        content: "Commande inconnue.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await command.execute(interaction);
  } catch (error) {
    const interactionLabel = interaction.isChatInputCommand()
      ? `/${interaction.commandName}`
      : (interaction.customId ?? interaction.type);

    console.error(`Erreur sur l'interaction ${interactionLabel}:`, error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "Une erreur est survenue pendant l'exécution de la commande.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply({
      content: "Une erreur est survenue pendant l'exécution de la commande.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
