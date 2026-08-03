import {
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("userinfo")
  .setDescription("Afficher les informations d'un utilisateur.")
  .setDMPermission(false)
  .addUserOption((option) =>
    option
      .setName("utilisateur")
      .setDescription("L'utilisateur à analyser (par défaut: vous)")
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

  const user = interaction.options.getUser("utilisateur") || interaction.user;
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member) {
    await interaction.reply({
      content: "Ce membre n'est pas dans le serveur.",
      ephemeral: true,
    });
    return;
  }

  const joinedAt = member.joinedAt ? member.joinedAt.toLocaleDateString("fr-FR") : "Inconnu";
  const createdAt = user.createdAt.toLocaleDateString("fr-FR");
  const roles = member.roles.cache
    .sort((a, b) => b.position - a.position)
    .filter((role) => role.id !== interaction.guild.id)
    .map((role) => role.toString())
    .join(", ") || "Aucun rôle";

  const permissions = member.permissions.toArray()
    .map((perm) => {
      const permMap = {
        Administrator: "Administrateur",
        BanMembers: "Bannir des membres",
        KickMembers: "Expulser des membres",
        ManageChannels: "Gérer les salons",
        ManageGuild: "Gérer le serveur",
        ManageMessages: "Gérer les messages",
        ManageRoles: "Gérer les rôles",
        ModerateMembers: "Modérer les membres",
        MuteMembers: "Muter des membres",
        DeafenMembers: "Rendre sourd des membres",
      };
      return permMap[perm] || perm;
    })
    .join(", ");

  const embed = new EmbedBuilder()
    .setColor(member.displayColor || 0x5865f2)
    .setTitle("👤 Informations utilisateur")
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 128 }))
    .addFields(
      { name: "Nom", value: user.tag, inline: true },
      { name: "ID", value: user.id, inline: true },
      { name: "Surnom", value: member.nickname || "Aucun", inline: true },
      { name: "Bot", value: user.bot ? "Oui" : "Non", inline: true },
      { name: "Rejoint le", value: joinedAt, inline: true },
      { name: "Compte créé le", value: createdAt, inline: true },
      { name: "Rôles", value: roles.length > 50 ? roles.substring(0, 50) + "..." : roles, inline: false },
      { name: "Permissions", value: permissions.length > 50 ? permissions.substring(0, 50) + "..." : permissions, inline: false }
    )
    .setFooter({ text: `Demandé par ${interaction.user.tag}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
