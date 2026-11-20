import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { nextBirthday, renderTemplate } from "../services/community.js";

describe("community helpers", () => {
  const member = {
    id: "111111111111111111",
    user: { tag: "Liam#0001", username: "Liam" },
    guild: { name: "Astron", memberCount: 42 },
  };

  it("renders every documented placeholder", () => {
    assert.equal(
      renderTemplate("Bienvenue {user} ({tag}) sur {server} — {count} membres", member),
      "Bienvenue <@111111111111111111> (Liam#0001) sur Astron — 42 membres",
    );
  });

  it("rolls an elapsed birthday to next year", () => {
    const from = new Date("2026-11-20T12:00:00.000Z");
    assert.equal(nextBirthday(11, 20, from).toISOString().slice(0, 10), "2026-11-20");
    assert.equal(nextBirthday(1, 2, from).toISOString().slice(0, 10), "2027-01-02");
  });
});
