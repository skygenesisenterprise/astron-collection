import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { formatList, successEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { requireGuild } from "../lib/guards.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("levels")
    .setDescription("Configure XP, levels and level rewards.")
    .setDescriptionLocalizations({ fr: "Configurer l'XP, les niveaux et les récompenses." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("enable")
        .setDescription("Enable XP gain")
        .setDescriptionLocalizations({ fr: "Activer le gain d'XP" })
        .addIntegerOption((option) =>
          option.setName("xp-per-message").setDescription("XP per message (1-50)").setMinValue(1).setMaxValue(50),
        )
        .addIntegerOption((option) =>
          option.setName("cooldown").setDescription("Seconds between XP gains (0-3600)").setMinValue(0).setMaxValue(3600),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("disable")
        .setDescription("Disable XP gain")
        .setDescriptionLocalizations({ fr: "Désactiver le gain d'XP" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("config")
        .setDescription("Change XP settings")
        .setDescriptionLocalizations({ fr: "Modifier les réglages d'XP" })
        .addIntegerOption((option) =>
          option.setName("xp-per-message").setDescription("XP per message (1-50)").setMinValue(1).setMaxValue(50),
        )
        .addIntegerOption((option) =>
          option.setName("cooldown").setDescription("Seconds between XP gains (0-3600)").setMinValue(0).setMaxValue(3600),
        )
        .addChannelOption((option) =>
          option
            .setName("announce-channel")
            .setDescription("Channel for level-up announcements")
            .addChannelTypes(ChannelType.GuildText),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reward-add")
        .setDescription("Grant a role at a level")
        .setDescriptionLocalizations({ fr: "Attribuer un rôle à un niveau" })
        .addIntegerOption((option) =>
          option.setName("level").setDescription("Level").setRequired(true).setMinValue(1).setMaxValue(1000),
        )
        .addRoleOption((option) =>
          option.setName("role").setDescription("Role to grant").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reward-remove")
        .setDescription("Remove a level reward")
        .setDescriptionLocalizations({ fr: "Retirer une récompense de niveau" })
        .addIntegerOption((option) =>
          option.setName("level").setDescription("Level").setRequired(true).setMinValue(1),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reward-list")
        .setDescription("List level rewards")
        .setDescriptionLocalizations({ fr: "Lister les récompenses de niveau" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reset")
        .setDescription("Reset a member's XP")
        .setDescriptionLocalizations({ fr: "Réinitialiser l'XP d'un membre" })
        .addUserOption((option) =>
          option.setName("member").setDescription("Member to reset").setRequired(true),
        ),
    ),
  category: "community",
  permissions: { user: [PermissionFlagsBits.ManageGuild], bot: [] },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const guildId = interaction.guildId;
    const subcommand = interaction.options.getSubcommand();
    const config = services.leveling.configFor(guildId);

    if (subcommand === "enable" || subcommand === "config") {
      const patch = { enabled: true };
      const xp = interaction.options.getInteger("xp-per-message");
      const cooldown = interaction.options.getInteger("cooldown");
      const channel = interaction.options.getChannel("announce-channel");
      if (xp !== null) patch.xpPerMessage = xp;
      if (cooldown !== null) patch.cooldownSeconds = cooldown;
      if (channel) patch.announceChannelId = channel.id;

      const updated = services.leveling.setConfig(guildId, patch, interaction.user.id);
      await interaction.reply({
        embeds: [
          successEmbed("Levels updated", null, {
            fields: [
              { name: "State", value: updated.enabled ? "Enabled" : "Disabled", inline: true },
              { name: "XP per message", value: String(updated.xpPerMessage), inline: true },
              { name: "Cooldown", value: `${updated.cooldownSeconds}s`, inline: true },
              { name: "Announcements", value: updated.announceChannelId ? `<#${updated.announceChannelId}>` : "Current channel", inline: true },
            ],
          }),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "disable") {
      services.leveling.setConfig(guildId, { enabled: false }, interaction.user.id);
      await interaction.reply({ embeds: [successEmbed("Levels disabled", "XP is kept and will resume when re-enabled.")], flags: EPHEMERAL });
      return;
    }

    if (subcommand === "reward-add") {
      const level = interaction.options.getInteger("level", true);
      const role = interaction.options.getRole("role", true);
      const rewards = config.rewards.filter((reward) => reward.level !== level);
      rewards.push({ level, roleId: role.id });
      rewards.sort((left, right) => left.level - right.level);
      services.leveling.setConfig(guildId, { rewards }, interaction.user.id);
      await interaction.reply({ embeds: [successEmbed("Reward added", `${role} at level ${level}.`)], flags: EPHEMERAL });
      return;
    }

    if (subcommand === "reward-remove") {
      const level = interaction.options.getInteger("level", true);
      const rewards = config.rewards.filter((reward) => reward.level !== level);
      services.leveling.setConfig(guildId, { rewards }, interaction.user.id);
      await interaction.reply({ embeds: [successEmbed("Reward removed", `Level ${level} has no reward.`)], flags: EPHEMERAL });
      return;
    }

    if (subcommand === "reset") {
      const member = interaction.options.getUser("member", true);
      services.leveling.resetMember(guildId, member.id);
      await interaction.reply({ embeds: [successEmbed("XP reset", `${member.tag} starts again from 0 XP.`)], flags: EPHEMERAL });
      return;
    }

    await interaction.reply({
      embeds: [
        successEmbed(
          "Level rewards",
          formatList(config.rewards.map((reward) => `Level ${reward.level} → <@&${reward.roleId}>`), {
            empty: "No reward configured.",
          }),
        ),
      ],
      flags: EPHEMERAL,
    });
  },
});
