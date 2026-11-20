/** Suggestions: submission, voting and moderator status. */

import { randomUUID } from "node:crypto";

import {
  EVENT_TYPES,
  NotFoundError,
  UserInputError,
} from "../../../packages/discord-framework/src/index.js";

export function createSuggestionService({ repo, outbox, metrics }) {
  function create({ guildId, channelId, authorId, content }) {
    const text = String(content ?? "").trim();
    if (text.length < 3) {
      throw new UserInputError("Suggestion is too short.", {
        userMessage: "Votre suggestion est trop courte.",
      });
    }

    const suggestion = repo.suggestionCreate({
      id: randomUUID(),
      guildId,
      channelId,
      authorId,
      content: text.slice(0, 2000),
    });

    outbox.enqueue(EVENT_TYPES.SUGGESTION_CREATED, {
      guildId,
      subject: { type: "suggestion", id: suggestion.id },
      data: { suggestionId: suggestion.id, authorId, content: suggestion.content },
    });

    metrics.inc("suggestions_created_total");
    return suggestion;
  }

  function get(guildId, id) {
    return repo.suggestionGet(guildId, id);
  }

  function requireSuggestion(guildId, id) {
    const suggestion = repo.suggestionGet(guildId, id);
    if (!suggestion) throw new NotFoundError("Suggestion not found.", {
      userMessage: "Suggestion introuvable.",
    });
    return suggestion;
  }

  function vote({ guildId, id, userId, direction }) {
    requireSuggestion(guildId, id);
    const result = repo.suggestionVote({ suggestionId: id, userId, direction });
    metrics.inc("suggestion_votes_total");
    return result;
  }

  function results(id) {
    return repo.suggestionResults(id);
  }

  function setStatus(guildId, id, status) {
    if (!["open", "accepted", "rejected", "implemented"].includes(status)) {
      throw new UserInputError("Invalid suggestion status.", { userMessage: "Statut de suggestion invalide." });
    }
    const updated = repo.suggestionSetStatus(guildId, id, status);
    if (!updated) throw new NotFoundError("Suggestion not found.", {
      userMessage: "Suggestion introuvable.",
    });
    return updated;
  }

  function list(guildId, status = null, limit = 10) {
    return repo.suggestionList(guildId, status, limit);
  }

  function setMessage(id, messageId) {
    repo.suggestionSetMessage(id, messageId);
  }

  return { create, get, requireSuggestion, vote, results, setStatus, list, setMessage };
}
