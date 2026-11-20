/**
 * Quarantine: isolate a member without banning, and restore their roles later.
 *
 * The quarantine role is configured per guild. If it is missing, quarantine is
 * refused instead of silently applying an incomplete action.
 */

import { AstronError, PermissionError } from "../../../packages/discord-framework/src/index.js";

export function createQuarantineService({ repo, settings, logger }) {
  async function apply({ guild, member, reason, actorId }) {
    const roleId = settings.get(guild.id, "quarantineRoleId");
    if (!roleId) {
      throw new AstronError("Quarantine role is not configured.", {
        expected: true,
        userMessage: "Aucun rôle de quarantaine n'est configuré. Utilisez `/security configure`.",
      });
    }
    if (!guild.members.me?.permissions.has("ManageRoles")) {
      throw new PermissionError("Missing ManageRoles", {
        userMessage: "Je n'ai pas la permission de gérer les rôles.",
      });
    }

    const previous = member.roles.cache
      .filter((role) => role.id !== guild.id && !role.managed)
      .map((role) => role.id);

    repo.record({ guildId: guild.id, userId: member.id, roleIds: previous });
    await member.roles.set([roleId], reason);
    logger.info("member quarantined", { guildId: guild.id, userId: member.id, actorId });
    return previous.length;
  }

  async function release({ guild, member, reason, actorId }) {
    const record = repo.find(guild.id, member.id);
    if (!record) {
      throw new AstronError("Member is not quarantined.", {
        expected: true,
        userMessage: "Ce membre n'est pas en quarantaine.",
      });
    }

    const roleId = settings.get(guild.id, "quarantineRoleId");
    const restored = record.roleIds.filter((id) => id !== roleId && guild.roles.cache.has(id));

    await member.roles.set(restored, reason);
    repo.release(guild.id, member.id);
    logger.info("member released from quarantine", { guildId: guild.id, userId: member.id, actorId });
    return restored.length;
  }

  function isQuarantined(guildId, userId) {
    return Boolean(repo.find(guildId, userId));
  }

  return { apply, release, isQuarantined, list: repo.listActive };
}
