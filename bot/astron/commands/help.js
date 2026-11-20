import { SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { infoEmbed } from "../../../packages/discord-framework/src/ui/index.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("List Astron commands or explain one of them.")
    .setDescriptionLocalizations({ fr: "Lister les commandes d'Astron ou en expliquer une." })
    .setDMPermission(true)
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("Command to explain")
        .setDescriptionLocalizations({ fr: "Commande à expliquer" })
        .setAutocomplete(true)
        .setRequired(false),
    ),
  category: "support",
  autocomplete: async (interaction, { services }) => {
    const query = interaction.options.getFocused().toLowerCase();
    const choices = services.help
      .categories()
      .flatMap((group) => group.commands)
      .filter((command) => command.name.startsWith(query))
      .slice(0, 25)
      .map((command) => ({ name: `/${command.name}`, value: command.name }));

    await interaction.respond(choices);
  },
  execute: async (interaction, { services }) => {
    const name = interaction.options.getString("command");

    if (name) {
      const command = services.help.find(name);
      if (!command) {
        await interaction.reply({
          content: `Commande inconnue : /${name}.`,
          flags: EPHEMERAL,
        });
        return;
      }

      const permissions = [
        ...(command.permissions.user ?? []).map(String),
        ...(command.permissions.bot ?? []).map(String),
      ];

      await interaction.reply({
        embeds: [
          infoEmbed(`/${command.name}`, command.description, {
            fields: [
              { name: "Category", value: command.category, inline: true },
              {
                name: "Cooldown",
                value: command.cooldown.seconds ? `${command.cooldown.seconds}s` : "None",
                inline: true,
              },
              { name: "Permissions", value: permissions.join(", ") || "None", inline: false },
            ],
          }),
        ],
      });
      return;
    }

    const categories = services.help.categories();
    const fields = categories.map((group) => ({
      name: group.label,
      value: group.commands.map((command) => `\`/${command.name}\` — ${command.description}`).join("\n"),
      inline: false,
    }));

    fields.push({
      name: "Other bots",
      value: services.help
        .ecosystem()
        .map((bot) => `**${bot.name}** — ${bot.domain}`)
        .join("\n"),
      inline: false,
    });

    await interaction.reply({
      embeds: [
        infoEmbed("Astron help", "Use `/help command:<name>` for details on one command.", {
          fields,
        }),
      ],
    });
  },
});
