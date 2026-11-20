import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { successEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { pollComponents, pollEmbed } from "../lib/board-views.js";
import { requireGuild } from "../lib/guards.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a button poll or close an existing one.")
    .setDescriptionLocalizations({ fr: "Créer un sondage à boutons ou clôturer un sondage." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a poll")
        .setDescriptionLocalizations({ fr: "Créer un sondage" })
        .addStringOption((option) =>
          option.setName("question").setDescription("Question").setRequired(true).setMaxLength(250),
        )
        .addStringOption((option) =>
          option.setName("option1").setDescription("First option").setRequired(true).setMaxLength(80),
        )
        .addStringOption((option) =>
          option.setName("option2").setDescription("Second option").setRequired(true).setMaxLength(80),
        )
        .addStringOption((option) => option.setName("option3").setDescription("Third option").setMaxLength(80))
        .addStringOption((option) => option.setName("option4").setDescription("Fourth option").setMaxLength(80))
        .addStringOption((option) => option.setName("option5").setDescription("Fifth option").setMaxLength(80))
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel; defaults to the current one")
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("close")
        .setDescription("Close a poll")
        .setDescriptionLocalizations({ fr: "Clôturer un sondage" })
        .addStringOption((option) =>
          option.setName("id").setDescription("Poll id; defaults to the latest open poll"),
        ),
    ),
  category: "community",
  permissions: { user: [PermissionFlagsBits.ManageGuild], bot: [PermissionFlagsBits.SendMessages] },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);

    if (interaction.options.getSubcommand() === "create") {
      const channel = interaction.options.getChannel("channel") ?? interaction.channel;
      const options = [1, 2, 3, 4, 5]
        .map((index) => interaction.options.getString(`option${index}`))
        .filter(Boolean);

      const poll = services.polls.create({
        guildId: interaction.guildId,
        channelId: channel.id,
        question: interaction.options.getString("question", true),
        options,
        createdBy: interaction.user.id,
      });

      const results = services.polls.results(poll.id);
      const message = await channel.send({
        embeds: [pollEmbed(poll, results)],
        components: pollComponents(poll),
      });
      services.polls.setMessage(poll.id, message.id);

      await interaction.reply({
        embeds: [
          successEmbed("Poll created", `[Open the poll](https://discord.com/channels/${interaction.guildId}/${channel.id}/${message.id})`, {
            fields: [{ name: "Poll id", value: poll.id, inline: false }],
          }),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    const requested = interaction.options.getString("id");
    const poll = requested
      ? services.polls.requirePoll(interaction.guildId, requested)
      : services.polls.latestOpen(interaction.guildId, interaction.channelId);

    if (!poll) {
      await interaction.reply({ content: "Aucun sondage ouvert dans ce salon.", flags: EPHEMERAL });
      return;
    }

    const closed = services.polls.close(interaction.guildId, poll.id);
    const results = services.polls.results(poll.id);
    const winner = poll.options
      .map((label, index) => ({ label, count: results.counts[String(index)] ?? 0 }))
      .sort((left, right) => right.count - left.count)[0];

    await interaction.reply({
      embeds: [
        successEmbed("Poll closed", poll.question, {
          fields: [
            { name: "Votes", value: String(results.total), inline: true },
            { name: "Winner", value: winner && winner.count > 0 ? `${winner.label} (${winner.count})` : "No vote", inline: true },
          ],
        }),
      ],
      flags: EPHEMERAL,
    });

    void closed;
  },
});
