import { SlashCommandBuilder } from "discord.js";

import {
  defineCommand,
  EPHEMERAL,
  timestamp,
} from "../../../packages/discord-framework/src/index.js";
import { infoEmbed } from "../../../packages/discord-framework/src/ui/index.js";

export async function executeUserInfo(interaction, { services }) {
  const user = interaction.options.getUser("user") ?? interaction.user;
  const member =
    interaction.guild && typeof interaction.guild.members?.fetch === "function"
      ? await interaction.guild.members.fetch(user.id).catch(() => null)
      : null;

  if (interaction.guild && !member) {
    await interaction.reply({ content: "Ce membre n'est pas dans le serveur.", flags: EPHEMERAL });
    return;
  }

  const info = services.info.userInfo(user, member);

  await interaction.reply({
    embeds: [
      infoEmbed(info.tag, null, {
        thumbnail: info.avatar,
        fields: [
          { name: "ID", value: info.id, inline: true },
          { name: "Account type", value: info.bot ? "Bot" : "Human", inline: true },
          { name: "Created", value: timestamp(info.createdAt, "D"), inline: true },
          ...(info.joinedAt
            ? [{ name: "Joined", value: timestamp(info.joinedAt, "D"), inline: true }]
            : []),
          ...(info.nickname ? [{ name: "Nickname", value: info.nickname, inline: true }] : []),
          ...(info.highestRole
            ? [{ name: "Highest role", value: info.highestRole, inline: true }]
            : []),
          ...(info.roles.length
            ? [{ name: `Roles (${info.roles.length})`, value: info.roles.slice(0, 25).join(", "), inline: false }]
            : []),
        ],
        footer: "Astron",
      }),
    ],
  });
}

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Show information about a user.")
    .setDescriptionLocalizations({ fr: "Afficher les informations d'un utilisateur." })
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to inspect; defaults to you")
        .setDescriptionLocalizations({ fr: "Utilisateur à inspecter ; par défaut, vous" })
        .setRequired(false),
    ),
  category: "information",
  execute: executeUserInfo,
});
