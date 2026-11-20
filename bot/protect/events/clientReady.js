export const name = "clientReady";
export const once = true;

export async function execute(client, { services, logger }) {
  services.metrics.gauge("guilds", client.guilds.cache.size);
  services.metrics.inc("ready_total");

  try {
    client.user.setPresence({
      status: "online",
      activities: [{ name: "over the server", type: 3 }],
    });
  } catch (error) {
    logger.warn("could not set presence", { err: error });
  }

  logger.info("protect ready", { user: client.user?.tag, guilds: client.guilds.cache.size });
}
