import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { infoEmbed, successEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { requireGuild } from "./guards.js";

/**
 * Welcome and farewell are the same command with a different settings key and
 * template. One factory keeps their options, permissions and feedback identical.
 */
export function createGreetingCommand({ name, key, english, french, title, sample }) {
  return defineCommand({
    data: new SlashCommandBuilder()
      .setName(name)
      .setDescription(english)
      .setDescriptionLocalizations({ fr: french })
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .setDMPermission(false)
      .addSubcommand((subcommand) =>
        subcommand
          .setName("setup")
          .setDescription("Choose the channel and the message")
          .setDescriptionLocalizations({ fr: "Choisir le salon et le message" })
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription("Destination channel")
              .setRequired(true)
              .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
          )
          .addStringOption((option) =>
            option
              .setName("message")
              .setDescription("Template: {user} {tag} {server} {count}")
              .setMaxLength(1500),
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("preview")
          .setDescription("Preview the configured message")
          .setDescriptionLocalizations({ fr: "Prévisualiser le message configuré" }),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("disable")
          .setDescription("Disable this message")
          .setDescriptionLocalizations({ fr: "Désactiver ce message" }),
      ),
    category: "community",
    permissions: { user: [PermissionFlagsBits.ManageGuild], bot: [PermissionFlagsBits.SendMessages] },
    availability: { guildOnly: true },
    execute: async (interaction, { services }) => {
      requireGuild(interaction);
      const guildId = interaction.guildId;
      const current = services.settings.get(guildId, key);
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === "setup") {
        const channel = interaction.options.getChannel("channel", true);
        const message = interaction.options.getString("message") ?? current.message;
        const next = { enabled: true, channelId: channel.id, message };

        services.settings.set(guildId, key, next, { actorId: interaction.user.id });
        await interaction.reply({
          embeds: [successEmbed(`${title} enabled`, `Messages will be sent to ${channel}.`, {
            fields: [{ name: "Template", value: message.slice(0, 1000), inline: false }],
          })],
          flags: EPHEMERAL,
        });
        return;
      }

      if (subcommand === "disable") {
        services.settings.set(guildId, key, { ...current, enabled: false }, { actorId: interaction.user.id });
        await interaction.reply({
          embeds: [successEmbed(`${title} disabled`, "The template is kept and can be re-enabled with `setup`.")],
          flags: EPHEMERAL,
        });
        return;
      }

      const rendered = services.community.renderTemplate(current.message || sample, interaction.member);
      await interaction.reply({
        embeds: [
          infoEmbed(`${title} preview`, rendered, {
            fields: [
              { name: "State", value: current.enabled ? "Enabled" : "Disabled", inline: true },
              { name: "Channel", value: current.channelId ? `<#${current.channelId}>` : "Not configured", inline: true },
            ],
            footer: "Template variables: {user} {tag} {server} {count}",
          }),
        ],
        flags: EPHEMERAL,
      });
    },
  });
}
