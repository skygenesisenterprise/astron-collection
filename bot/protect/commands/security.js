import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import {
  auditBotPermissions,
  defineCommand,
  EPHEMERAL,
  securityFindings,
} from "../../../packages/discord-framework/src/index.js";
import { infoEmbed, successEmbed, warningEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { requireGuild } from "../lib/responses.js";

function enabledLabel(value) {
  return value ? "Enabled" : "Disabled";
}

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("security")
    .setDescription("Inspect and configure server protection.")
    .setDescriptionLocalizations({ fr: "Inspecter et configurer la protection du serveur." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("status")
        .setDescription("Show protection settings and recent detections")
        .setDescriptionLocalizations({ fr: "Afficher les réglages et les détections récentes" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("audit")
        .setDescription("Audit the bot's permissions and server security posture")
        .setDescriptionLocalizations({ fr: "Auditer les permissions du bot et la sécurité du serveur" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("configure")
        .setDescription("Change protection settings")
        .setDescriptionLocalizations({ fr: "Modifier les réglages de protection" })
        .addRoleOption((option) =>
          option.setName("quarantine-role").setDescription("Role applied by quarantine"),
        )
        .addChannelOption((option) =>
          option
            .setName("log-channel")
            .setDescription("Channel for automatic moderation notices")
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
        )
        .addBooleanOption((option) =>
          option.setName("dm-on-punishment").setDescription("Send a DM when a member is punished"),
        )
        .addBooleanOption((option) => option.setName("antispam").setDescription("Enable anti-spam"))
        .addIntegerOption((option) =>
          option
            .setName("antispam-max")
            .setDescription("Messages allowed per window (2-20)")
            .setMinValue(2)
            .setMaxValue(20),
        )
        .addBooleanOption((option) => option.setName("antiraid").setDescription("Enable anti-raid"))
        .addIntegerOption((option) =>
          option
            .setName("antiraid-joins")
            .setDescription("Joins per minute before a raid (2-50)")
            .setMinValue(2)
            .setMaxValue(50),
        )
        .addStringOption((option) =>
          option
            .setName("antiraid-action")
            .setDescription("Action on a raid")
            .addChoices(
              { name: "Quarantine", value: "quarantine" },
              { name: "Kick", value: "kick" },
              { name: "Alert only", value: "notify" },
            ),
        )
        .addBooleanOption((option) => option.setName("antiphish").setDescription("Enable phishing detection")),
    ),
  category: "security",
  permissions: {
    user: [PermissionFlagsBits.ManageGuild],
    bot: [],
  },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "status") {
      const status = await services.security.status(interaction.guildId);
      const recent = status.recent.length
        ? status.recent
            .map((entry) => `**${entry.kind}** (${entry.severity}) — ${entry.detail.slice(0, 100)}`)
            .join("\n")
        : "No detection recorded.";

      await interaction.reply({
        embeds: [
          infoEmbed("Protection status", null, {
            fields: [
              { name: "Anti-spam", value: enabledLabel(status.settings.antispam.enabled), inline: true },
              { name: "Anti-raid", value: enabledLabel(status.settings.antiraid.enabled), inline: true },
              { name: "Anti-phishing", value: enabledLabel(status.settings.antiphish.enabled), inline: true },
              { name: "Quarantine role", value: status.settings.quarantineRoleId ? `<@&${status.settings.quarantineRoleId}>` : "Not configured", inline: true },
              { name: "Detections (24h)", value: String(status.detections24h), inline: true },
              { name: "Recent detections", value: recent, inline: false },
            ],
          }),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "audit") {
      const audit = auditBotPermissions({ me: interaction.guild.members.me, features: ["moderation", "logging"] });
      const findings = securityFindings({ guild: interaction.guild, me: interaction.guild.members.me });
      const missing = Object.entries(audit.missing)
        .map(([feature, permissions]) => `**${feature}** — ${permissions.join(", ")}`)
        .join("\n");
      const issues = findings.length
        ? findings.map((finding) => `**${finding.severity}** — ${finding.detail}`).join("\n")
        : "No finding.";

      await interaction.reply({
        embeds: [
          (findings.length ? warningEmbed("Security audit", null, { fields: [
            { name: "Missing permissions", value: missing || "None", inline: false },
            { name: "Findings", value: issues, inline: false },
            { name: "Quarantine role", value: services.settings.get(interaction.guildId, "quarantineRoleId") ? "Configured" : "Missing", inline: true },
          ] }) : infoEmbed("Security audit", "No finding.", {
            fields: [{ name: "Missing permissions", value: missing || "None", inline: false }],
          })),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    const current = services.settings.getAll(interaction.guildId);
    const patch = {};
    const role = interaction.options.getRole("quarantine-role");
    const logChannel = interaction.options.getChannel("log-channel");
    const dm = interaction.options.getBoolean("dm-on-punishment");
    const antispam = interaction.options.getBoolean("antispam");
    const antispamMax = interaction.options.getInteger("antispam-max");
    const antiraid = interaction.options.getBoolean("antiraid");
    const antiraidJoins = interaction.options.getInteger("antiraid-joins");
    const antiraidAction = interaction.options.getString("antiraid-action");
    const antiphish = interaction.options.getBoolean("antiphish");

    if (role) patch.quarantineRoleId = role.id;
    if (logChannel) patch.logChannelId = logChannel.id;
    if (dm !== null) patch.dmOnPunishment = dm;
    if (antispam !== null) patch.antispam = { ...current.antispam, enabled: antispam };
    if (antispamMax !== null) patch.antispam = { ...(patch.antispam ?? current.antispam), maxMessages: antispamMax };
    if (antiraid !== null) patch.antiraid = { ...current.antiraid, enabled: antiraid };
    if (antiraidJoins !== null) patch.antiraid = { ...(patch.antiraid ?? current.antiraid), joinsPerMinute: antiraidJoins };
    if (antiraidAction) patch.antiraid = { ...(patch.antiraid ?? current.antiraid), action: antiraidAction };
    if (antiphish !== null) patch.antiphish = { ...current.antiphish, enabled: antiphish };

    if (Object.keys(patch).length === 0) {
      await interaction.reply({ content: "Aucun réglage fourni.", flags: EPHEMERAL });
      return;
    }

    const updated = services.settings.update(interaction.guildId, patch, { actorId: interaction.user.id });

    await interaction.reply({
      embeds: [
        successEmbed("Protection updated", null, {
          fields: [
            { name: "Anti-spam", value: `${enabledLabel(updated.antispam.enabled)} (${updated.antispam.maxMessages}/${updated.antispam.windowSeconds}s)`, inline: false },
            { name: "Anti-raid", value: `${enabledLabel(updated.antiraid.enabled)} (${updated.antiraid.joinsPerMinute}/min → ${updated.antiraid.action})`, inline: false },
            { name: "Anti-phishing", value: enabledLabel(updated.antiphish.enabled), inline: true },
            { name: "Quarantine role", value: updated.quarantineRoleId ? `<@&${updated.quarantineRoleId}>` : "Not configured", inline: true },
          ],
        }),
      ],
      flags: EPHEMERAL,
    });
  },
});
