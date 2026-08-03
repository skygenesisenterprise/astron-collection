import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EmbedBuilder } from "discord.js";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const stateDirectory = path.resolve(__dirname, "../data");
const stateFile = path.join(stateDirectory, "deployment-state.json");

export function getReleaseInfo() {
  return {
    version: env.version,
    commitSha: env.commitSha,
    shortCommit: env.commitSha === "unknown" ? "unknown" : env.commitSha.slice(0, 7),
    buildDate: env.buildDate,
    environment: env.environment,
  };
}

async function readState() {
  try {
    return JSON.parse(await fs.readFile(stateFile, "utf8"));
  } catch {
    return {};
  }
}

async function writeState(state) {
  await fs.mkdir(stateDirectory, { recursive: true });
  await fs.writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export async function announceDeployment(client) {
  if (!env.announceDeployments) return false;

  const release = getReleaseInfo();
  const deploymentKey = `${release.environment}:${release.version}:${release.commitSha}`;
  const state = await readState();

  if (state.lastAnnouncedDeployment === deploymentKey) return false;

  // Annonce dans tous les serveurs où un salon d-updates est configuré
  for (const guild of client.guilds.cache.values()) {
    const settings = getGuildSettings(guild.id);
    const updatesChannelId = settings.updatesChannelId;
    
    if (!updatesChannelId) continue;

    const channel = await guild.channels.fetch(updatesChannelId).catch(() => null);
    if (!channel?.isTextBased()) {
      console.warn(`[DEPLOYMENT] Le salon d-updates pour ${guild.name} (${guild.id}) n'est pas accessible.`);
      continue;
    }

    const embed = new EmbedBuilder()
      .setTitle("🚀 Bot mis à jour")
      .setDescription("Une nouvelle version du bot vient d’être déployée et ses commandes slash ont été synchronisées.")
      .addFields(
        { name: "Version", value: release.version, inline: true },
        { name: "Commit", value: release.shortCommit, inline: true },
        { name: "Environnement", value: release.environment, inline: true },
        { name: "Build", value: release.buildDate },
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] }).catch(() => {});
  }

  await writeState({
    lastAnnouncedDeployment: deploymentKey,
    announcedAt: new Date().toISOString(),
  });

  return true;
}

function getGuildSettings(guildId) {
  // Placeholder pour la récupération des paramètres par serveur
  // À implémenter dans store.js ou un fichier dédié
  return {};
}
