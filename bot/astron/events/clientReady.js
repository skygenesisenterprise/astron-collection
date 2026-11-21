export const name = "clientReady";
export const once = true;

export async function execute(client, { services, logger }) {
  services.metrics.gauge("guilds", client.guilds.cache.size);
  services.metrics.inc("ready_total");

  logger.info("astron ready", {
    user: client.user?.tag,
    guilds: client.guilds.cache.size,
  });
}
