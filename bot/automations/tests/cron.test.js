import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cronMatches, parseCron, validateCron } from "../services/cron.js";

describe("cron", () => {
  it("parses every supported field form", () => {
    const [minutes, hours] = parseCron("*/15 9-17 * * 1-5");
    assert.deepEqual([...minutes].sort((a, b) => a - b), [0, 15, 30, 45]);
    assert.deepEqual([...hours].sort((a, b) => a - b), [9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });

  it("matches in UTC", () => {
    assert.equal(cronMatches("0 9 * * 1", new Date("2026-11-23T09:00:00Z")), true);
    assert.equal(cronMatches("0 9 * * 1", new Date("2026-11-23T09:01:00Z")), false);
    assert.equal(cronMatches("* * * * *", new Date("2026-11-23T09:01:00Z")), true);
  });

  it("maps Sunday 7 to 0", () => {
    assert.equal(cronMatches("0 0 * * 7", new Date("2026-11-22T00:00:00Z")), true);
  });

  it("rejects malformed expressions", () => {
    assert.throws(() => validateCron("* * * *"));
    assert.throws(() => validateCron("60 * * * *"));
    assert.throws(() => validateCron("*/0 * * * *"));
    assert.throws(() => validateCron("5-1 * * * *"));
  });
});
