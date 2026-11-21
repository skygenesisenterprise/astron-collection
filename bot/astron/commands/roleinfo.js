import { SlashCommandBuilder } from "discord.js";

import { defineCommand, timestamp } from "@astron-collection/discord-framework";
import { infoEmbed } from "@astron-collection/discord-framework/ui";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Show information about a role.")
    .setDescriptionLocalizations({ fr: "Afficher les informations d'un rôle." })
    .setDMPermission(false)
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Role to inspect")
        .setDescriptionLocalizations({ fr: "Rôle à inspecter" })
        .setRequired(true),
    ),
  category: "information",
  availability: { guildOnly: true },
  execute: async (interaction) => {
    const role = interaction.options.getRole("role", true);
    const info = {
      name: role.name,
      id: role.id,
      color: role.hexColor,
      position: role.position,
      members: role.members?.size ?? 0,
      mentionable: role.mentionable,
      managed: role.managed,
      createdAt: role.createdAt,
      permissions: role.permissions?.toArray?.() ?? [],
    };

    await interaction.reply({
      embeds: [
        infoEmbed(info.name, null, {
          fields: [
            { name: "ID", value: info.id, inline: true },
            { name: "Color", value: info.color, inline: true },
            { name: "Position", value: String(info.position), inline: true },
            { name: "Members", value: String(info.members), inline: true },
            { name: "Mentionable", value: info.mentionable ? "Yes" : "No", inline: true },
            { name: "Managed", value: info.managed ? "Yes" : "No", inline: true },
            { name: "Created", value: timestamp(info.createdAt, "D"), inline: true },
            {
              name: "Permissions",
              value: info.permissions.length
                ? info.permissions.slice(0, 30).join(", ")
                : "None",
              inline: false,
            },
          ],
        }),
      ],
    });
  },
});
