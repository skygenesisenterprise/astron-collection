import { SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "@astron-collection/discord-framework";
import { successEmbed } from "@astron-collection/discord-framework/ui";
import { suggestionComponents, suggestionEmbed } from "../lib/board-views.js";
import { requireGuild } from "../lib/guards.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Submit a suggestion to the server.")
    .setDescriptionLocalizations({ fr: "Soumettre une suggestion au serveur." })
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("content")
        .setDescription("Your suggestion")
        .setDescriptionLocalizations({ fr: "Votre suggestion" })
        .setRequired(true)
        .setMinLength(3)
        .setMaxLength(2000),
    ),
  category: "community",
  availability: { guildOnly: true },
  cooldown: { seconds: 60, scope: "user" },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const config = services.settings.get(interaction.guildId, "suggestions");
    if (!config.enabled || !config.channelId) {
      await interaction.reply({
        content: "Les suggestions ne sont pas activées sur ce serveur.",
        flags: EPHEMERAL,
      });
      return;
    }

    const channel = interaction.guild.channels.cache.get(config.channelId);
    if (!channel?.send) {
      await interaction.reply({ content: "Le salon des suggestions est introuvable.", flags: EPHEMERAL });
      return;
    }

    const suggestion = services.suggestions.create({
      guildId: interaction.guildId,
      channelId: config.channelId,
      authorId: interaction.user.id,
      content: interaction.options.getString("content", true),
    });

    const results = services.suggestions.results(suggestion.id);
    const message = await channel.send({
      embeds: [suggestionEmbed(suggestion, results)],
      components: suggestionComponents(suggestion),
    });
    services.suggestions.setMessage(suggestion.id, message.id);

    await interaction.reply({
      embeds: [
        successEmbed("Suggestion submitted", `[View it in ${channel}](${message.url ?? `https://discord.com/channels/${interaction.guildId}/${config.channelId}/${message.id}`})`),
      ],
      flags: EPHEMERAL,
    });
  },
});
