import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

import { createDatabase, runMigrations } from "@astron-collection/discord-framework";
import { createMusicRepository } from "../repositories/music.js";

const directory = mkdtempSync(path.join(tmpdir(), "astron-player-"));
const db = createDatabase({ file: path.join(directory, "player.sqlite3") });
const music = createMusicRepository({ db });

before(() => {
  runMigrations(db, path.join(path.dirname(new URL(import.meta.url).pathname), "..", "migrations"));
});

after(() => {
  db.close();
  rmSync(directory, { recursive: true, force: true });
});

describe("music repository", () => {
  it("stores history per guild", () => {
    music.historyAdd({
      id: "h1",
      guildId: "1",
      url: "https://example.test/a",
      title: "A",
      durationSeconds: 120,
      requestedBy: "9",
    });
    assert.equal(music.historyList("1").length, 1);
    assert.equal(music.historyList("2").length, 0);
  });

  it("creates playlists and orders tracks", () => {
    const playlist = music.playlistCreate({ id: "p1", guildId: "1", name: "Favorites", createdBy: "9" });
    music.trackAdd({
      id: "t1",
      playlistId: playlist.id,
      guildId: "1",
      url: "https://example.test/a",
      title: "A",
      durationSeconds: 60,
      addedBy: "9",
    });
    music.trackAdd({
      id: "t2",
      playlistId: playlist.id,
      guildId: "1",
      url: "https://example.test/b",
      title: "B",
      durationSeconds: 90,
      addedBy: "9",
    });

    assert.deepEqual(music.tracks("p1", "1").map((track) => track.position), [1, 2]);
    assert.equal(music.trackRemove("1", "p1", 1), true);
    assert.deepEqual(music.tracks("p1", "1").map((track) => track.title), ["B"]);

    assert.equal(music.playlistDelete("1", "p1"), true);
    assert.equal(music.playlistGet("1", "p1"), null);
  });
});
