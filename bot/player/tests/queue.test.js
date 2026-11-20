import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createQueueManager } from "../services/queue.js";

const track = (title) => ({ title, url: `https://example.test/${title}`, durationSeconds: 60 });

describe("queue", () => {
  it("adds, advances and keeps loop semantics", () => {
    const queue = createQueueManager({ defaultVolume: 60, maxQueue: 3 });
    queue.add("g", track("a"));
    queue.add("g", track("b"));

    assert.equal(queue.advance("g").title, "a");
    assert.equal(queue.advance("g").title, "b");
    assert.equal(queue.advance("g"), null);
  });

  it("loops the current track or the queue", () => {
    const queue = createQueueManager();
    queue.add("g", track("a"));
    queue.add("g", track("b"));
    queue.advance("g");
    queue.setLoop("g", "track");
    assert.equal(queue.advance("g").title, "a");
    assert.equal(queue.advance("g").title, "a");

    queue.setLoop("g", "queue");
    assert.equal(queue.advance("g").title, "b");
    assert.equal(queue.advance("g").title, "a");
  });

  it("removes by 1-based position, shuffles deterministically and clamps volume", () => {
    const queue = createQueueManager({ maxQueue: 10 });
    for (const title of ["a", "b", "c"]) queue.add("g", track(title));

    assert.equal(queue.remove("g", 2).title, "b");
    assert.equal(queue.remove("g", 9), null);

    const shuffled = queue.shuffle("g", () => 0);
    assert.equal(shuffled.length, 2);

    assert.equal(queue.setVolume("g", 999), 150);
    assert.equal(queue.setVolume("g", -5), 0);
  });

  it("rejects a full queue", () => {
    const queue = createQueueManager({ maxQueue: 1 });
    queue.add("g", track("a"));
    assert.throws(() => queue.add("g", track("b")));
  });
});
