/**
 * Source resolution through yt-dlp.
 *
 * Only the URL, title and duration leave the resolver; the audio stream is
 * produced by yt-dlp when playback starts. No provider credential is needed and
 * an unsupported link fails with a user-facing message instead of a stack trace.
 */

import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

import { UserInputError } from "@astron-collection/discord-framework";

const execFile = promisify(execFileCallback);
const URL_PATTERN = /^https?:\/\//i;

export function isUrl(value) {
  return URL_PATTERN.test(String(value ?? "").trim());
}

export function detectSource(url) {
  if (!isUrl(url)) return "search";
  const hostname = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  if (hostname === "youtu.be" || hostname.endsWith("youtube.com")) return "youtube";
  if (hostname === "soundcloud.com" || hostname.endsWith("soundcloud.com")) return "soundcloud";
  if (/\.(mp3|m4a|ogg|opus|wav|flac|webm)$/i.test(new URL(url).pathname)) return "direct";
  return "other";
}

export function buildYtdlpArgs(query) {
  const cleaned = String(query ?? "").trim();
  if (!cleaned) {
    throw new UserInputError("Search query is empty.", { userMessage: "La recherche est vide." });
  }

  const target = isUrl(cleaned) ? cleaned : `ytsearch1:${cleaned}`;
  return ["--dump-single-json", "--no-playlist", "--no-warnings", target];
}

export function normalizeTrack(info, { requestedBy = null } = {}) {
  const entry = Array.isArray(info?.entries) ? info.entries[0] : info;
  if (!entry?.webpage_url && !entry?.url) {
    throw new UserInputError("No playable result.", { userMessage: "Aucun résultat lisible." });
  }

  return {
    title: String(entry.title ?? "Unknown title").slice(0, 200),
    url: entry.webpage_url ?? entry.url,
    durationSeconds: Number.isFinite(entry.duration) ? Math.round(entry.duration) : null,
    thumbnail: entry.thumbnail ?? null,
    source: entry.extractor_key?.toLowerCase() ?? detectSource(entry.webpage_url ?? entry.url),
    requestedBy,
  };
}

export function createSourceResolver({
  ytdlpPath = "yt-dlp",
  run = execFile,
  timeoutMs = 30_000,
  maxDurationSeconds = 3 * 60 * 60,
} = {}) {
  async function resolve(query, { requestedBy = null } = {}) {
    let stdout;
    try {
      const result = await run(ytdlpPath, buildYtdlpArgs(query), {
        timeout: timeoutMs,
        maxBuffer: 10 * 1024 * 1024,
      });
      stdout = result.stdout;
    } catch (error) {
      throw new UserInputError("Source resolution failed.", {
        userMessage: "Impossible de résoudre ce lien. Vérifiez qu'il est public et lisible.",
        meta: { reason: error?.stderr?.slice?.(0, 500) ?? error.message },
      });
    }

    let info;
    try {
      info = JSON.parse(stdout);
    } catch {
      throw new UserInputError("Invalid yt-dlp output.", {
        userMessage: "La source a renvoyé une réponse illisible.",
      });
    }

    const track = normalizeTrack(info, { requestedBy });
    if (track.durationSeconds && track.durationSeconds > maxDurationSeconds) {
      throw new UserInputError("Track is too long.", {
        userMessage: "Ce morceau dépasse la durée maximale autorisée.",
      });
    }
    return track;
  }

  return { resolve, ytdlpPath };
}
