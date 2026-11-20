import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

import {
  createDatabase,
  runMigrations,
} from "../../../packages/discord-framework/src/index.js";
import { createBoardRepository } from "../repositories/boards.js";
import { createPollService } from "../services/polls.js";
import { createSuggestionService } from "../services/suggestions.js";

const directory = mkdtempSync(path.join(tmpdir(), "astron-guild-boards-"));
const db = createDatabase({ file: path.join(directory, "boards.sqlite3") });
const repo = createBoardRepository({ db });
const metrics = { inc() {} };
const outbox = { enqueue() {} };
const polls = createPollService({ repo, metrics });
const suggestions = createSuggestionService({ repo, outbox, metrics });

before(() => {
  runMigrations(db, path.join(path.dirname(new URL(import.meta.url).pathname), "..", "migrations"));
});

after(() => {
  db.close();
  rmSync(directory, { recursive: true, force: true });
});

describe("polls", () => {
  it("creates, votes, changes vote and closes", () => {
    const poll = polls.create({
      guildId: "1",
      channelId: "2",
      question: "Tabs or spaces?",
      options: ["Tabs", "Spaces"],
      createdBy: "3",
    });

    assert.equal(poll.options.length, 2);
    polls.vote({ guildId: "1", pollId: poll.id, userId: "10", optionIndex: 0 });
    polls.vote({ guildId: "1", pollId: poll.id, userId: "11", optionIndex: 1 });
    assert.deepEqual(polls.results(poll.id).counts, { 0: 1, 1: 1 });

    polls.vote({ guildId: "1", pollId: poll.id, userId: "10", optionIndex: 1 });
    assert.deepEqual(polls.results(poll.id).counts, { 1: 2 });

    const closed = polls.close("1", poll.id);
    assert.ok(closed.closed_at);
    assert.throws(() => polls.vote({ guildId: "1", pollId: poll.id, userId: "12", optionIndex: 0 }));
  });

  it("rejects a poll with fewer than two options", () => {
    assert.throws(() =>
      polls.create({ guildId: "1", channelId: "2", question: "?", options: ["only"], createdBy: "3" }),
    );
  });
});

describe("suggestions", () => {
  it("tracks up and down votes with one vote per member", () => {
    const suggestion = suggestions.create({
      guildId: "1",
      channelId: "2",
      authorId: "3",
      content: "Add a music bot.",
    });

    suggestions.vote({ guildId: "1", id: suggestion.id, userId: "10", direction: "up" });
    suggestions.vote({ guildId: "1", id: suggestion.id, userId: "11", direction: "up" });
    suggestions.vote({ guildId: "1", id: suggestion.id, userId: "10", direction: "down" });

    assert.deepEqual(suggestions.results(suggestion.id), { up: 1, down: 1 });
    assert.equal(suggestions.setStatus("1", suggestion.id, "accepted").status, "accepted");
  });
});
