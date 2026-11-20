/** Guild interactive components: poll buttons, suggestion votes, role menus. */

import { EPHEMERAL } from "../../packages/discord-framework/src/index.js";
import { pollComponents, pollEmbed, suggestionComponents, suggestionEmbed, splitBoardValue } from "./lib/board-views.js";

export function registerComponents({ components, services }) {
  components.registerButton("poll", async (interaction, context) => {
    if (context.id.action !== "vote") return;
    const parsed = splitBoardValue(context.id.value);
    const optionIndex = Number(parsed?.suffix);
    if (!parsed || !Number.isInteger(optionIndex)) return;

    const { poll } = services.polls.vote({
      guildId: interaction.guildId,
      pollId: parsed.id,
      userId: interaction.user.id,
      optionIndex,
    });

    await interaction.update({
      embeds: [pollEmbed(poll, services.polls.results(poll.id))],
      components: pollComponents(poll),
    });
  });

  components.registerButton("suggestion", async (interaction, context) => {
    if (context.id.action !== "vote") return;
    const parsed = splitBoardValue(context.id.value);
    if (!parsed || !["up", "down"].includes(parsed.suffix)) return;

    services.suggestions.vote({
      guildId: interaction.guildId,
      id: parsed.id,
      userId: interaction.user.id,
      direction: parsed.suffix,
    });

    const suggestion = services.suggestions.get(interaction.guildId, parsed.id);
    if (!suggestion) return;
    await interaction.update({
      embeds: [suggestionEmbed(suggestion, services.suggestions.results(suggestion.id))],
      components: suggestionComponents(suggestion),
    });
  });

  components.registerSelect("reactionrole", async (interaction, context) => {
    if (context.id.action !== "toggle") return;

    const roleId = interaction.values[0];
    const result = await services.community.togglePanelRole({
      guildId: interaction.guildId,
      member: interaction.member,
      panelId: context.id.value,
      roleId,
    });

    await interaction.reply({
      content: result.added
        ? `Rôle **${result.label}** ajouté.`
        : `Rôle **${result.label}** retiré.`,
      flags: EPHEMERAL,
    });
  });
}
