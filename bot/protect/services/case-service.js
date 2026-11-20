/**
 * Moderation cases.
 *
 * A case and its `moderation.case.created` outbox row are written in the same
 * transaction: Logger can never receive a case that Protect did not commit, and
 * a delivery failure is retried from the outbox instead of losing the event.
 */

import { randomUUID } from "node:crypto";

import {
  EVENT_TYPES,
  NotFoundError,
  nowIso,
} from "../../../packages/discord-framework/src/index.js";

export function createCaseService({ db, repo, outbox, logger, clock = () => new Date() }) {
  function create({
    guildId,
    action,
    targetId,
    targetTag = null,
    moderatorId,
    moderatorTag = null,
    reason,
    durationSeconds = null,
    silent = false,
  }) {
    return db.transaction(() => {
      const caseNumber = repo.nextNumber(guildId);
      const id = randomUUID();
      const createdAt = nowIso(clock);

      const record = repo.insert({
        id,
        guildId,
        caseNumber,
        action,
        targetId,
        targetTag,
        moderatorId,
        moderatorTag,
        reason,
        durationSeconds,
        createdAt,
      });

      if (!silent) {
        outbox.enqueue(EVENT_TYPES.MODERATION_CASE_CREATED, {
          guildId,
          subject: { type: "case", id },
          data: {
            caseId: id,
            caseNumber,
            action,
            targetId,
            targetTag,
            moderatorId,
            moderatorTag,
            reason,
            durationSeconds,
            createdAt,
          },
        });
      }

      logger.info("moderation case created", {
        guildId,
        caseNumber,
        action,
        targetId,
        moderatorId,
      });

      return record;
    });
  }

  function update({ guildId, caseNumber, status = null, note = null, updatedBy }) {
    return db.transaction(() => {
      const existing = repo.findByNumber(guildId, caseNumber);
      if (!existing) {
        throw new NotFoundError(`Case #${caseNumber} does not exist.`, {
          userMessage: `Le dossier #${caseNumber} est introuvable.`,
        });
      }

      const updatedAt = nowIso(clock);
      const updated = repo.update(guildId, caseNumber, { status, note, updatedAt });

      outbox.enqueue(EVENT_TYPES.MODERATION_CASE_UPDATED, {
        guildId,
        subject: { type: "case", id: existing.id },
        data: {
          caseId: existing.id,
          caseNumber,
          status: status ?? "updated",
          note,
          updatedBy,
          updatedAt,
        },
      });

      return updated;
    });
  }

  function find(guildId, caseNumber) {
    return repo.findByNumber(guildId, caseNumber);
  }

  function list(guildId, options) {
    return repo.list(guildId, options);
  }

  function count(guildId, options) {
    return repo.count(guildId, options);
  }

  function stats(guildId, options) {
    return repo.stats(guildId, options);
  }

  function warnings(guildId, targetId) {
    return repo.activeWarnings(guildId, targetId);
  }

  return { create, update, find, list, count, stats, warnings };
}
