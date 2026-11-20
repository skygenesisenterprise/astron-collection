import { addAudit } from "../utils/store.js";
import { closeSupportTicketIfExists } from "../utils/support-tickets.js";

export const name = "channelDelete";

export async function execute(channel) {
  if (!closeSupportTicketIfExists(channel.id)) {
    return;
  }

  addAudit({
    guildId: channel.guild?.id,
    action: "ticket_cleanup",
    target: channel.name,
    reason: "channel_deleted",
  });
}
