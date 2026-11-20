import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { projectDiscordEvent, PROJECTED_EVENTS } from "../services/discord-event-projector.js";

const member = {
  id: "220000000000000000",
  user: { id: "220000000000000000", tag: "Ada#0001", createdAt: new Date("2021-01-01T00:00:00.000Z") },
  guild: { id: "110000000000000000" },
  joinedAt: new Date("2024-01-01T00:00:00.000Z"),
  nickname: null,
  roles: { cache: new Map() },
};

describe("discord event projector", () => {
  it("projects member events with guild scope", () => {
    const joined = projectDiscordEvent("guildMemberAdd", [member]);
    assert.equal(joined.guildId, "110000000000000000");
    assert.equal(joined.category, "members");
    assert.equal(joined.eventType, "member.join");
    assert.match(joined.summary, /Ada#0001/);
  });

  it("projects a deleted message without leaking beyond the payload limit", () => {
    const entry = projectDiscordEvent("messageDelete", [
      {
        id: "m1",
        guild: { id: "110000000000000000" },
        channelId: "330000000000000000",
        channel: { name: "general" },
        author: { id: "220000000000000000", tag: "Ada#0001" },
        content: "x".repeat(5000),
        attachments: { size: 0 },
      },
    ]);

    assert.equal(entry.eventType, "message.delete");
    assert.ok(entry.payload.content.length <= 1501);
  });

  it("returns null for unchanged updates and unknown events", () => {
    const text = { content: "same", author: { id: "1" }, channelId: "2", id: "3" };
    assert.equal(projectDiscordEvent("messageUpdate", [text, text]), null);
    assert.equal(projectDiscordEvent("notAnEvent", [{}]), null);
  });

  it("covers every projected event name", () => {
    assert.ok(PROJECTED_EVENTS.includes("guildBanAdd"));
    assert.ok(PROJECTED_EVENTS.includes("roleUpdate"));
  });
});
