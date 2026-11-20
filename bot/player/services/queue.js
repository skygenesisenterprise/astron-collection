/**
 * In-memory queues, one per guild. Voice state is ephemeral by nature: a queue
 * is lost on restart, while playlists and history are persisted in SQLite.
 */

import { LOOP_MODES } from "../config/bot.js";

export function createQueueManager({ defaultVolume = 80, maxQueue = 100 } = {}) {
  const queues = new Map();

  function ensure(guildId) {
    if (!queues.has(guildId)) {
      queues.set(guildId, {
        tracks: [],
        current: null,
        loop: "off",
        volume: defaultVolume,
        paused: false,
        playing: false,
        textChannelId: null,
      });
    }
    return queues.get(guildId);
  }

  function add(guildId, track, { limit = maxQueue } = {}) {
    const queue = ensure(guildId);
    if (queue.tracks.length >= limit) {
      throw new Error(`Queue is full (${limit} tracks).`);
    }
    queue.tracks.push(track);
    return queue.tracks.length;
  }

  function advance(guildId) {
    const queue = ensure(guildId);
    if (queue.loop === "track" && queue.current) return queue.current;
    if (queue.loop === "queue" && queue.current) queue.tracks.push(queue.current);

    queue.current = queue.tracks.shift() ?? null;
    queue.playing = Boolean(queue.current);
    queue.paused = false;
    return queue.current;
  }

  function remove(guildId, position) {
    const queue = ensure(guildId);
    const index = Number(position) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= queue.tracks.length) return null;
    return queue.tracks.splice(index, 1)[0];
  }

  function shuffle(guildId, random = Math.random) {
    const queue = ensure(guildId);
    for (let index = queue.tracks.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      [queue.tracks[index], queue.tracks[swap]] = [queue.tracks[swap], queue.tracks[index]];
    }
    return queue.tracks;
  }

  function setLoop(guildId, mode) {
    if (!LOOP_MODES.includes(mode)) throw new Error(`Unknown loop mode '${mode}'.`);
    ensure(guildId).loop = mode;
    return mode;
  }

  function setVolume(guildId, volume) {
    const value = Math.max(0, Math.min(Number(volume), 150));
    ensure(guildId).volume = value;
    return value;
  }

  function clear(guildId) {
    const queue = ensure(guildId);
    queue.tracks = [];
    queue.current = null;
    queue.playing = false;
    queue.paused = false;
  }

  function snapshot(guildId) {
    const queue = ensure(guildId);
    return {
      ...queue,
      tracks: [...queue.tracks],
      size: queue.tracks.length,
      totalDuration: queue.tracks.reduce((total, track) => total + (track.durationSeconds ?? 0), 0),
    };
  }

  function removeQueue(guildId) {
    queues.delete(guildId);
  }

  return {
    ensure,
    add,
    advance,
    remove,
    shuffle,
    setLoop,
    setVolume,
    clear,
    snapshot,
    removeQueue,
    get size() {
      return queues.size;
    },
  };
}
