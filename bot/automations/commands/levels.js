import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

import {
  getGuildXPSettings,
  updateGuildXPSettings,
  addAudit,
} from "../utils/store.js";

export const data = new SlashCommandBuilder()
  .setName("levels")
  .setDescription("Configurer le système de niveaux.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("enable")
      .setDescription("Activer le système de niveaux")
      .addIntegerOption((option) =>
        option
          .setName("xp-per-message")
          .setDescription("XP gagné par message (1-10)")
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(10)
      )
      .addIntegerOption((option) =>
        option
          .setName("cooldown")
          .setDescription("Cooldown en secondes entre les messages (30-300)")
          .setRequired(false)
          .setMinValue(30)
          .setMaxValue(300)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("disable")
      .setDescription("Désactiver le système de niveaux")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add-reward")
      .setDescription("Ajouter une récompense de niveau")
      .addIntegerOption((option) =>
        option
          .setName("niveau")
          .setDescription("Le niveau pour la récompense")
          .setRequired(true)
          .setMinValue(1)
      )
      .addRoleOption((option) =>
        option
          .setName("rôle")
          .setDescription("Le rôle à attribuer")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove-reward")
      .setDescription("Retirer une récompense de niveau")
      .addIntegerOption((option) =>
        option
          .setName("niveau")
          .setDescription("Le niveau de la récompense à retirer")
          .setRequired(true)
          .setMinValue(1)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("list-rewards")
      .setDescription("Lister les récompenses de niveau")
  );

export async function execute(interaction) {
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Cette commande doit être utilisée dans un serveur.",
      ephemeral: true,
    });
    return;
  }

  const subcommand = interaction.options.getSubcommand();
  const settings = getGuildXPSettings(interaction.guildId) || {
    enabled: false,
    xpPerMessage: 5,
    cooldown: 60,
    rewards: [],
  };

  if (subcommand === "enable") {
    const xpPerMessage = interaction.options.getInteger("xp-per-message") || 5;
    const cooldown = interaction.options.getInteger("cooldown") || 60;

    updateGuildXPSettings(interaction.guildId, {
      enabled: true,
      xpPerMessage: xpPerMessage,
      cooldown: cooldown,
      rewards: settings.rewards || [],
    });

    addAudit({
      guildId: interaction.guildId,
      action: "levels_enable",
      actor: interaction.user.tag,
      reason: `XP/message: ${xpPerMessage}, Cooldown: ${cooldown}s`,
    });

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("✅ Système de niveaux activé")
      .setDescription(
        `Les membres gagneront **${xpPerMessage} XP** par message.\n` +
        `Cooldown entre les messages: **${cooldown} secondes**.`
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (subcommand === "disable") {
    updateGuildXPSettings(interaction.guildId, {
      enabled: false,
      xpPerMessage: 5,
      cooldown: 60,
      rewards: [],
    });

    addAudit({
      guildId: interaction.guildId,
      action: "levels_disable",
      actor: interaction.user.tag,
    });

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("❌ Système de niveaux désactivé")
      .setDescription("Les membres ne gagneront plus d'XP.")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (subcommand === "add-reward") {
    const level = interaction.options.getInteger("niveau", true);
    const role = interaction.options.getRole("rôle", true);

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({
        content: "Je n'ai pas la permission de gérer les rôles.",
        ephemeral: true,
      });
      return;
    }

    const existingRewardIndex = settings.rewards.findIndex((r) => r.level === level);
    if (existingRewardIndex !== -1) {
      await interaction.reply({
        content: `Une récompense existe déjà pour le niveau **${level}**. Utilisez "/levels remove-reward" pour la supprimer d'abord.`,
        ephemeral: true,
      });
      return;
    }

    settings.rewards.push({ level: level, roleId: role.id });
    updateGuildXPSettings(interaction.guildId, settings);

    addAudit({
      guildId: interaction.guildId,
      action: "levels_add_reward",
      actor: interaction.user.tag,
      target: role.name,
      reason: `Niveau: ${level}`,
    });

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("✅ Récompense ajoutée")
      .setDescription(`Le rôle **${role.name}** sera attribué aux membres atteignant le **niveau ${level}**.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (subcommand === "remove-reward") {
    const level = interaction.options.getInteger("niveau", true);

    const rewardIndex = settings.rewards.findIndex((r) => r.level === level);
    if (rewardIndex === -1) {
      await interaction.reply({
        content: `Aucune récompense trouvée pour le niveau **${level}**.`,
        ephemeral: true,
      });
      return;
    }

    const removedReward = settings.rewards[rewardIndex];
    settings.rewards.splice(rewardIndex, 1);
    updateGuildXPSettings(interaction.guildId, settings);

    const role = interaction.guild.roles.cache.get(removedReward.roleId);
    addAudit({
      guildId: interaction.guildId,
      action: "levels_remove_reward",
      actor: interaction.user.tag,
      target: role ? role.name : "Rôle introuvable",
      reason: `Niveau: ${level}`,
    });

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("❌ Récompense retirée")
      .setDescription(`La récompense pour le **niveau ${level}** a été supprimée.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (subcommand === "list-rewards") {
    if (settings.rewards.length === 0) {
      await interaction.reply({
        content: "Aucune récompense de niveau configurée.",
        ephemeral: true,
      });
      return;
    }

    const rewardList = settings.rewards
      .sort((a, b) => a.level - b.level)
      .map((reward) => {
        const role = interaction.guild.roles.cache.get(reward.roleId);
        return `**Niveau ${reward.level}** → ${role || "Rôle introuvable"}`;
      })
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🏆 Récompenses de niveau")
      .setDescription(rewardList)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
