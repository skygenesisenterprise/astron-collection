import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import {
  defineCommand,
  EPHEMERAL,
} from "@astron-collection/discord-framework";
import { successEmbed } from "@astron-collection/discord-framework/ui";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("language")
    .setDescription("Set the interface language for this server.")
    .setDescriptionLocalizations({ fr: "Définir la langue de l'interface pour ce serveur." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("locale")
        .setDescription("Language")
        .setDescriptionLocalizations({ fr: "Langue" })
        .setRequired(true)
        .addChoices({ name: "Français", value: "fr" }, { name: "English", value: "en" }),
    ),
  category: "configuration",
  permissions: {
    user: [PermissionFlagsBits.ManageGuild],
    bot: [],
  },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: "Commande réservée aux serveurs.", flags: EPHEMERAL });
      return;
    }

    const locale = interaction.options.getString("locale", true);
    services.settings.set(interaction.guildId, "locale", locale, { actorId: interaction.user.id });

    await interaction.reply({
      embeds: [
        successEmbed(
          locale === "fr" ? "Langue mise à jour" : "Language updated",
          locale === "fr"
            ? "Les réponses d'Astron utiliseront le français sur ce serveur."
            : "Astron will answer in English on this server.",
        ),
      ],
      flags: EPHEMERAL,
    });
  },
});
