import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildYtdlpArgs,
  createSourceResolver,
  detectSource,
  isUrl,
  normalizeTrack,
} from "../services/sources.js";

describe("sources", () => {
  it("detects URLs and providers", () => {
    assert.equal(isUrl("https://youtu.be/abc"), true);
    assert.equal(isUrl("never gonna give you up"), false);
    assert.equal(detectSource("https://www.youtube.com/watch?v=abc"), "youtube");
    assert.equal(detectSource("https://soundcloud.com/artist/track"), "soundcloud");
    assert.equal(detectSource("https://cdn.example.test/a.mp3"), "direct");
    assert.equal(detectSource("some search"), "search");
  });

  it("builds yt-dlp arguments for URLs and searches", () => {
    assert.deepEqual(buildYtdlpArgs("https://youtu.be/abc"), [
      "--dump-single-json",
      "--no-playlist",
      "--no-warnings",
      "https://youtu.be/abc",
    ]);
    assert.equal(buildYtdlpArgs("daft punk").at(-1), "ytsearch1:daft punk");
    assert.throws(() => buildYtdlpArgs("  "));
  });

  it("normalizes entries and rejects empty results", () => {
    const track = normalizeTrack({
      title: "One More Time",
      webpage_url: "https://youtu.be/abc",
      duration: 320.4,
      thumbnail: "https://img.test/a.jpg",
      extractor_key: "Youtube",
    });
    assert.equal(track.title, "One More Time");
    assert.equal(track.durationSeconds, 320);
    assert.equal(track.source, "youtube");
    assert.throws(() => normalizeTrack({}));
  });

  it("resolves through an injected runner", async () => {
    const resolver = createSourceResolver({
      run: async () => ({
        stdout: JSON.stringify({
          title: "Test",
          webpage_url: "https://youtu.be/abc",
          duration: 30,
        }),
      }),
    });
    const track = await resolver.resolve("test", { requestedBy: "1" });
    assert.equal(track.title, "Test");
    assert.equal(track.requestedBy, "1");
  });

  it("maps a resolver failure to a user error", async () => {
    const resolver = createSourceResolver({
      run: async () => {
        throw Object.assign(new Error("boom"), { stderr: "not found" });
      },
    });
    await assert.rejects(() => resolver.resolve("missing"), /resolution failed/i);
  });
});
