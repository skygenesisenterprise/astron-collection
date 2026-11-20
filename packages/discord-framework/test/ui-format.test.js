import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  chunk,
  formatDuration,
  formatNumber,
  formatList,
  percent,
  progressBar,
  timestamp,
  truncate,
} from "../src/ui/format.js";

describe("ui formatting", () => {
  it("draws a bounded progress bar", () => {
    assert.equal(progressBar(5, 10, { size: 10 }), "█████░░░░░");
    assert.equal(progressBar(50, 10, { size: 4 }), "████");
    assert.equal(progressBar(-5, 10, { size: 4 }), "░░░░");
    assert.equal(progressBar(5, 0, { size: 2 }), "██");
  });

  it("formats durations with the largest useful units", () => {
    assert.equal(formatDuration(0), "0s");
    assert.equal(formatDuration(65_000), "1m 5s");
    assert.equal(formatDuration(3_725_000), "1h 2m 5s");
    assert.equal(formatDuration(90_061_000), "1d 1h 1m 1s");
  });

  it("truncates, chunks and reports oversized lists", () => {
    assert.equal(truncate("abcdef", 4), "abc…");
    assert.equal(truncate("abc", 10), "abc");
    assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
    assert.match(formatList(["a", "b", "c"], { limit: 2 }), /1 more/);
    assert.equal(formatList([], { empty: "nothing" }), "nothing");
  });

  it("formats numbers, percentages and Discord timestamps", () => {
    assert.equal(formatNumber(1234567), "1,234,567");
    assert.equal(percent(1, 4), "25%");
    assert.equal(percent(1, 0), "0%");
    assert.equal(timestamp("2026-01-01T00:00:00.000Z"), "<t:1767225600:R>");
  });
});
