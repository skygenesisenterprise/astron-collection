/** Playback orchestration: resolve, queue, voice, history and contracts. */

import { randomUUID } from "node:crypto";

import {
  EVENT_TYPES,
  UserInputError,
  NotFoundError,
} from "../../../packages/discord-framework/src/index.js";

export function createPlayerService({
  queue,
  sources,
  music,
  settings,
  audio,
  outbox,
  logger,
  metrics,
  clock = () => new Date(),
}) {
  const paused = new Map();

  function queueFor(guildId) {
    return queue.ensure(guildId);
  }

  async function startNext(guild) {
    const state = queueFor(guild.id);
    const track = queue.advance(guild.id);

    if (!track) {
      state.playing = false;
      audio.stop(guild.id);
      return null;
    }

    await audio.play(guild.id, track, { volume: state.volume });
    paused.set(guild.id, false);

    music.historyAdd({
      id: randomUUID(),
      guildId: guild.id,
      url: track.url,
      title: track.title,
      durationSeconds: track.durationSeconds,
      requestedBy: track.requestedBy ?? "unknown",
    });

    outbox.enqueue(EVENT_TYPES.TRACK_STARTED, {
      guildId: guild.id,
      data: {
        title: track.title,
        url: track.url,
        durationSeconds: track.durationSeconds,
        requestedBy: track.requestedBy ?? null,
      },
    });

    metrics.inc("tracks_started_total");
    return track;
  }

  async function play({ guild, member, voiceChannel, textChannel, query }) {
    const channel = voiceChannel ?? member.voice?.channel;
    if (!channel) {
      throw new UserInputError("Join a voice channel first.", {
        userMessage: "Rejoignez d'abord un salon vocal.",
      });
    }

    const track = await sources.resolve(query, { requestedBy: member.id });
    await audio.join(guild, channel, {
      onIdle: () => startNext(guild).catch((error) => logger.warn("next track failed", { err: error })),
    });

    const state = queueFor(guild.id);
    if (state.tracks.length === 0 && !state.current) {
      state.volume = settings.get(guild.id, "defaultVolume");
    }
    state.textChannelId = textChannel?.id ?? state.textChannelId;

    try {
      queue.add(guild.id, track, { limit: settings.get(guild.id, "maxQueue") });
    } catch (error) {
      throw new UserInputError("Queue is full.", {
        userMessage: "La file de lecture est pleine.",
        meta: { reason: error.message },
      });
    }

    if (!state.current) {
      state.current = queue.advance(guild.id);
      await audio.play(guild.id, state.current, { volume: state.volume });
      paused.set(guild.id, false);
      music.historyAdd({
        id: randomUUID(),
        guildId: guild.id,
        url: state.current.url,
        title: state.current.title,
        durationSeconds: state.current.durationSeconds,
        requestedBy: state.current.requestedBy,
      });
      outbox.enqueue(EVENT_TYPES.TRACK_STARTED, {
        guildId: guild.id,
        data: {
          title: state.current.title,
          url: state.current.url,
          durationSeconds: state.current.durationSeconds,
          requestedBy: state.current.requestedBy,
        },
      });
      metrics.inc("tracks_started_total");
    }

    return { track, position: state.tracks.length, current: state.current };
  }

  async function playTracks({ guild, member, voiceChannel, textChannel, tracks }) {
    const channel = voiceChannel ?? member.voice?.channel;
    if (!channel) {
      throw new UserInputError("Join a voice channel first.", {
        userMessage: "Rejoignez d'abord un salon vocal.",
      });
    }
    if (!Array.isArray(tracks) || tracks.length === 0) {
      throw new UserInputError("Playlist is empty.", { userMessage: "Cette playlist est vide." });
    }

    await audio.join(guild, channel, {
      onIdle: () => startNext(guild).catch((error) => logger.warn("next track failed", { err: error })),
    });

    const state = queueFor(guild.id);
    if (state.tracks.length === 0 && !state.current) {
      state.volume = settings.get(guild.id, "defaultVolume");
    }
    state.textChannelId = textChannel?.id ?? state.textChannelId;

    for (const track of tracks) {
      queue.add(guild.id, { ...track, requestedBy: member.id }, { limit: settings.get(guild.id, "maxQueue") });
    }

    if (!state.current) await startNext(guild);
    return { added: tracks.length, current: state.current };
  }

  async function skip(guild) {
    if (!queueFor(guild.id).current) {
      throw new UserInputError("Nothing is playing.", { userMessage: "Aucune lecture en cours." });
    }
    return startNext(guild);
  }

  function stop(guild) {
    queue.clear(guild.id);
    audio.stop(guild.id);
    paused.set(guild.id, false);
  }

  function pause(guild) {
    if (!queueFor(guild.id).current) throw new UserInputError("Nothing is playing.", {
      userMessage: "Aucune lecture en cours.",
    });
    audio.pause(guild.id);
    paused.set(guild.id, true);
  }

  function resume(guild) {
    audio.resume(guild.id);
    paused.set(guild.id, false);
  }

  function setVolume(guild, volume) {
    const value = queue.setVolume(guild.id, volume);
    audio.setVolume(guild.id, value);
    return value;
  }

  function setLoop(guild, mode) {
    return queue.setLoop(guild.id, mode);
  }

  function shuffle(guild) {
    return queue.shuffle(guild.id);
  }

  function remove(guild, position) {
    const track = queue.remove(guild.id, position);
    if (!track) throw new NotFoundError("Queue position not found.", {
      userMessage: "Position introuvable dans la file.",
    });
    return track;
  }

  async function seek(guild, seconds) {
    const state = queueFor(guild.id);
    if (!state.current) throw new UserInputError("Nothing is playing.", { userMessage: "Aucune lecture en cours." });
    const duration = state.current.durationSeconds;
    if (duration && seconds >= duration) {
      throw new UserInputError("Seek is past the end.", { userMessage: "La position dépasse la durée du morceau." });
    }
    await audio.play(guild.id, state.current, { volume: state.volume, seekSeconds: seconds });
    return seconds;
  }

  async function disconnect(guild) {
    stop(guild);
    audio.leave(guild.id);
    queue.removeQueue(guild.id);
    paused.delete(guild.id);
  }

  function nowPlaying(guildId) {
    const state = queueFor(guildId);
    return {
      current: state.current,
      paused: paused.get(guildId) ?? false,
      loop: state.loop,
      volume: state.volume,
      upcoming: state.tracks.length,
    };
  }

  function playbackQueue(guildId) {
    return queue.snapshot(guildId);
  }

  return {
    play,
    playTracks,
    skip,
    stop,
    pause,
    resume,
    setVolume,
    setLoop,
    shuffle,
    remove,
    seek,
    disconnect,
    nowPlaying,
    playbackQueue,
    startNext,
    isConnected: (guildId) => audio.isConnected(guildId),
  };
}
