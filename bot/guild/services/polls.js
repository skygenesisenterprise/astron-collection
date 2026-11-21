/** Polls: creation, voting, results and closure. */

import { randomUUID } from "node:crypto";

import { NotFoundError, UserInputError } from "@astron-collection/discord-framework";

export function createPollService({ repo, metrics, clock = () => new Date() }) {
  function create({ guildId, channelId, question, options, createdBy }) {
    const cleaned = (options ?? []).map((option) => String(option ?? "").trim()).filter(Boolean).slice(0, 5);
    if (cleaned.length < 2) {
      throw new UserInputError("A poll needs at least two options.", {
        userMessage: "Un sondage doit contenir au moins deux options.",
      });
    }

    const poll = repo.pollCreate({
      id: randomUUID(),
      guildId,
      channelId,
      question: String(question).slice(0, 250),
      options: cleaned,
      createdBy,
    });
    metrics.inc("polls_created_total");
    return poll;
  }

  function get(guildId, id) {
    return repo.pollGet(guildId, id);
  }

  function requirePoll(guildId, id) {
    const poll = repo.pollGet(guildId, id);
    if (!poll) throw new NotFoundError("Poll not found.", { userMessage: "Sondage introuvable." });
    return poll;
  }

  function vote({ guildId, pollId, userId, optionIndex }) {
    const poll = requirePoll(guildId, pollId);
    if (poll.closed_at) {
      throw new UserInputError("Poll is closed.", { userMessage: "Ce sondage est clôturé." });
    }
    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= poll.options.length) {
      throw new UserInputError("Invalid poll option.", { userMessage: "Option de sondage invalide." });
    }
    const result = repo.pollVote({ pollId, userId, optionIndex });
    metrics.inc("poll_votes_total");
    return { poll, ...result };
  }

  function results(pollId) {
    return repo.pollResults(pollId);
  }

  function close(guildId, id) {
    const poll = repo.pollClose(guildId, id);
    if (!poll) throw new NotFoundError("Poll not found.", { userMessage: "Sondage introuvable." });
    return poll;
  }

  function latestOpen(guildId, channelId = null) {
    return repo.pollLatestOpen(guildId, channelId);
  }

  function setMessage(id, messageId) {
    repo.pollSetMessage(id, messageId);
  }

  return { create, get, requirePoll, vote, results, close, latestOpen, setMessage, clock };
}
