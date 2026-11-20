/** Value helpers shared by the repositories of every bot. */

export function nowIso(clock = () => new Date()) {
  return clock().toISOString();
}

export function toJson(value) {
  return JSON.stringify(value ?? null);
}

export function fromJson(value, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function boolToInt(value) {
  return value ? 1 : 0;
}

export function intToBool(value) {
  return value === 1 || value === true;
}

/** Clamp a requested page size and offset to something a Discord message can show. */
export function paginate({ page = 1, pageSize = 10, maxPageSize = 50 } = {}) {
  const size = Math.min(Math.max(Number(pageSize) || 10, 1), maxPageSize);
  const index = Math.max(Number(page) || 1, 1);
  return { page: index, pageSize: size, offset: (index - 1) * size, limit: size };
}

export const DAY_MS = 24 * 60 * 60 * 1000;
export const HOUR_MS = 60 * 60 * 1000;
export const MINUTE_MS = 60 * 1000;

export function daysFromNow(days, clock = () => Date.now()) {
  return new Date(clock() + Number(days) * DAY_MS);
}
