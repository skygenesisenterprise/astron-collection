/** Astron interactive components (buttons only). */

import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { encodeCustomId } from "../../packages/discord-framework/src/index.js";

export const STATUS_REFRESH_ID = encodeCustomId({ namespace: "status", action: "refresh" });

export function statusRefreshRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(STATUS_REFRESH_ID)
      .setLabel("Refresh")
      .setStyle(ButtonStyle.Secondary),
  );
}

export function registerComponents({ components, services }) {
  components.registerButton("status", async (interaction, context) => {
    if (context.id.action !== "refresh") return;

    const started = Date.now();
    await interaction.update({
      embeds: [services.status.render(interaction.client)],
      components: [statusRefreshRow()],
    });
    services.metrics.observe("status_refresh_ms", Date.now() - started);
  });
}
