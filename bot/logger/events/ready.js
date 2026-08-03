import { ActivityType } from "discord.js";
import { env } from "../config/env.js";
import { announceDeployment } from "../services/deployment-service.js";

export const name = "clientReady";
export const once = true;

export async function execute(client) {
  const memberCount = client.guilds.cache.reduce((total, guild) => total + (guild.memberCount ?? 0), 0);
  const guildCount = client.guilds.cache.size;

  client.user.setPresence({
    activities: [
      {
        name: `${guildCount} guild - ${memberCount} users`,
        type: ActivityType.Watching,
      },
    ],
    status: "online",
  });

  console.log(`Bot connecté en tant que ${client.user.tag}`);

  await announceDeployment(client).catch((error) => console.error(error));
}
