import {
  buildMemberMessagePayload,
  renderMemberMessage,
  resolveWelcomeSettings,
} from "../utils/member-messages.js";
import { env } from "../config/env.js";

async function assignMemberRoles(member, roleIds) {
  if (!roleIds.length) {
    return;
  }

  const botMember = member.guild.members.me;

  if (!botMember) {
    console.warn("[WELCOME] Impossible de verifier la hierarchie des roles du bot.");
    return;
  }

  for (const roleId of roleIds) {
    const role =
      member.guild.roles.cache.get(roleId) ??
      (await member.guild.roles.fetch(roleId).catch(() => null));

    if (!role) {
      console.warn(`[WELCOME] Le role automatique ${roleId} est introuvable.`);
      continue;
    }

    if (role.managed || role.id === member.guild.id) {
      console.warn(`[WELCOME] Le role ${role.id} ne peut pas etre attribue automatiquement.`);
      continue;
    }

    if (role.position >= botMember.roles.highest.position) {
      console.warn(
        `[WELCOME] Le bot ne peut pas attribuer le role ${role.id}. Placez son role au-dessus.`
      );
      continue;
    }

    if (!member.roles.cache.has(role.id)) {
      await member.roles.add(role, "Attribution automatique lors de l'arrivee");
    }
  }
}

async function sendWelcomeDm(member, settings, content) {
  if (!settings.dmEnabled) {
    return;
  }

  try {
    await member.send(
      buildMemberMessagePayload(content, settings, `Bienvenue sur ${member.guild.name}`)
    );
  } catch (error) {
    console.warn(`[WELCOME] DM impossible pour ${member.user.tag}:`, error.message);
  }
}

async function sendWelcomeChannelMessage(member, settings, content) {
  if (!settings.channelId) {
    console.warn("[WELCOME] Aucun salon de bienvenue n'est configure.");
    return;
  }

  const channel =
    member.guild.channels.cache.get(settings.channelId) ??
    (await member.guild.channels.fetch(settings.channelId).catch(() => null));

  if (!channel || !channel.isTextBased() || channel.isDMBased()) {
    console.warn(
      `[WELCOME] Le salon de bienvenue ${settings.channelId} n'est pas un salon textuel accessible.`
    );
    return;
  }

  await channel.send(
    buildMemberMessagePayload(content, settings, `Bienvenue sur ${member.guild.name}`)
  );
}

export const name = "guildMemberAdd";

export async function execute(member) {
  const settings = resolveWelcomeSettings(member.guild.id);

  if (!settings.enabled) {
    return;
  }

  const roleIds = member.user.bot ? (env.agentsRoleId ? [env.agentsRoleId] : []) : settings.roleIds;

  if (member.user.bot && !env.agentsRoleId) {
    console.warn(
      `[WELCOME] Aucun role agent attribue a ${member.user.tag}: DISCORD_ROLE_AGENTS_ID n'est pas configure.`
    );
  }

  const content = renderMemberMessage(settings.message, member);
  const operations = [
    [
      member.user.bot ? "attribution du role agent" : "attribution du role membre",
      assignMemberRoles(member, roleIds),
    ],
    ["envoi du message prive", sendWelcomeDm(member, settings, content)],
    ["envoi du message d'accueil", sendWelcomeChannelMessage(member, settings, content)],
  ];

  const results = await Promise.allSettled(operations.map(([, operation]) => operation));

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `[WELCOME] Echec de ${operations[index][0]} pour ${member.user.tag}:`,
        result.reason
      );
    }
  });
}
