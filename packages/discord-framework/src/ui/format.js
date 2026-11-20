/** Pure formatting helpers used by embeds and tests; no Discord import. */

export const COLORS = Object.freeze({
  brand: 0x5865f2,
  success: 0x2ecc71,
  warning: 0xf1c40f,
  danger: 0xe74c3c,
  neutral: 0x95a5a6,
  info: 0x3498db,
});

export function truncate(value, max = 1024) {
  const text = String(value ?? "");
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
}

export function chunk(value, size = 10) {
  const list = Array.isArray(value) ? value : [...value];
  const output = [];
  for (let index = 0; index < list.length; index += size) output.push(list.slice(index, index + size));
  return output;
}

export function progressBar(value, max, { size = 12, filled = "█", empty = "░" } = {}) {
  const total = Number(max) > 0 ? Number(max) : 1;
  const ratio = Math.min(Math.max(Number(value) / total, 0), 1);
  const count = Math.round(ratio * size);
  return `${filled.repeat(count)}${empty.repeat(size - count)}`;
}

export function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.round(Number(milliseconds) / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

export function formatList(items, { empty = "—", limit = 20, separator = "\n" } = {}) {
  if (!items || items.length === 0) return empty;
  const shown = items.slice(0, limit).map((item) => `• ${item}`);
  if (items.length > limit) shown.push(`… ${items.length - limit} more`);
  return shown.join(separator);
}

export function percent(value, total) {
  if (!total) return "0%";
  return `${Math.round((Number(value) / Number(total)) * 100)}%`;
}

/** Discord timestamps, without importing discord.js. */
export function timestamp(date, style = "R") {
  const seconds = Math.floor(new Date(date).getTime() / 1000);
  return Number.isFinite(seconds) ? `<t:${seconds}:${style}>` : "—";
}
