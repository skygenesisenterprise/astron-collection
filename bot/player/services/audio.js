/**
 * Discord voice adapter.
 *
 * `@discordjs/voice` is loaded lazily so commands, tests and the health server
 * start even on a machine without voice dependencies. Audio is produced by
 * yt-dlp and decoded by ffmpeg (installed in the image).
 */

import { spawn } from "node:child_process";

import { UserInputError } from "@astron-collection/discord-framework";

export function createAudioAdapter({ logger, ytdlpPath = "yt-dlp" }) {
  let voicePromise = null;
  const sessions = new Map();

  function loadVoice() {
    if (!voicePromise) {
      voicePromise = import("@discordjs/voice").catch((error) => {
        voicePromise = null;
        throw new UserInputError("Voice support is unavailable.", {
          userMessage: "La lecture vocale n'est pas disponible sur cette instance.",
          meta: { reason: error.message },
        });
      });
    }
    return voicePromise;
  }

  async function join(guild, voiceChannel, { onIdle } = {}) {
    const voice = await loadVoice();
    let session = sessions.get(guild.id);

    if (session) {
      if (session.channelId !== voiceChannel.id) {
        session.connection.rejoin({ channelId: voiceChannel.id, selfDeaf: true });
        session.channelId = voiceChannel.id;
      }
      if (onIdle) session.onIdle = onIdle;
      return session;
    }

    const connection = voice.joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
    });

    const player = voice.createAudioPlayer();
    const sessionState = {
      connection,
      player,
      channelId: voiceChannel.id,
      onIdle,
      resource: null,
      process: null,
      destroyed: false,
    };

    player.on(voice.AudioPlayerStatus.Idle, () => {
      if (sessionState.destroyed || sessionState.playing === false) return;
      sessionState.playing = false;
      sessionState.onIdle?.().catch((error) => logger.warn("idle handler failed", { err: error }));
    });

    player.on("error", (error) => {
      sessionState.playing = false;
      logger.warn("audio player error", { guildId: guild.id, err: error });
      sessionState.onIdle?.().catch(() => {});
    });

    connection.on("error", (error) => logger.warn("voice connection error", { guildId: guild.id, err: error }));
    connection.subscribe(player);
    sessions.set(guild.id, sessionState);
    return sessionState;
  }

  async function play(guildId, track, { volume = 80, seekSeconds = 0 } = {}) {
    const voice = await loadVoice();
    const session = sessions.get(guildId);
    if (!session) throw new Error("Not connected to a voice channel.");

    stopProcess(session);

    const args = ["-f", "bestaudio", "-o", "-", "--no-playlist", "--no-warnings"];
    if (seekSeconds > 0) args.push("--download-sections", `*${Math.floor(seekSeconds)}-`);
    args.push(track.url);

    const child = spawn(ytdlpPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    child.stderr.on("data", (chunk) => logger.debug("yt-dlp", { guildId, line: String(chunk).slice(0, 200) }));
    child.on("error", (error) => logger.warn("yt-dlp failed to start", { guildId, err: error }));

    const resource = voice.createAudioResource(child.stdout, {
      inputType: voice.StreamType.Arbitrary,
      inlineVolume: true,
    });
    resource.volume?.setVolume(Math.max(0, Math.min(volume, 150)) / 100);

    session.process = child;
    session.resource = resource;
    session.playing = true;
    session.player.play(resource);
    return { seekSeconds };
  }

  function stopProcess(session) {
    if (!session?.process) return;
    try {
      session.process.kill("SIGKILL");
    } catch {
      // already gone
    }
    session.process = null;
  }

  function pause(guildId) {
    sessions.get(guildId)?.player.pause();
  }

  function resume(guildId) {
    sessions.get(guildId)?.player.unpause();
  }

  function setVolume(guildId, volume) {
    sessions.get(guildId)?.resource?.volume?.setVolume(Math.max(0, Math.min(volume, 150)) / 100);
  }

  function stop(guildId) {
    const session = sessions.get(guildId);
    if (!session) return;
    session.playing = false;
    session.player.stop(true);
    stopProcess(session);
    session.resource = null;
  }

  function leave(guildId) {
    const session = sessions.get(guildId);
    if (!session) return;
    stop(guildId);
    session.destroyed = true;
    session.connection.destroy();
    sessions.delete(guildId);
  }

  function destroyAll() {
    for (const guildId of [...sessions.keys()]) leave(guildId);
  }

  function isConnected(guildId) {
    return sessions.has(guildId);
  }

  return { join, play, pause, resume, setVolume, stop, leave, destroyAll, isConnected };
}
