/**
 * Five-field cron (`minute hour day month weekday`), evaluated in UTC.
 *
 * Supported syntax: `*`, `a`, `a-b`, `* /n` and comma-separated lists. When both
 * day-of-month and weekday are restricted they must both match, which is
 * deterministic and documented instead of the ambiguous classic OR rule.
 */

import { UserInputError } from "@astron-collection/discord-framework";

const FIELDS = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day", min: 1, max: 31 },
  { name: "month", min: 1, max: 12 },
  { name: "weekday", min: 0, max: 7 },
];

function expandField(text, { name, min, max }) {
  const values = new Set();

  for (const part of String(text).split(",")) {
    if (part === "") throw invalid(name, text);

    const [rangePart, stepPart] = part.split("/");
    const step = stepPart === undefined ? 1 : Number(stepPart);
    if (!Number.isInteger(step) || step <= 0) throw invalid(name, text);

    let start;
    let end;
    if (rangePart === "*") {
      start = min;
      end = max;
    } else if (rangePart.includes("-")) {
      const [left, right] = rangePart.split("-").map(Number);
      start = left;
      end = right;
    } else {
      const value = Number(rangePart);
      start = value;
      end = stepPart === undefined ? value : max;
    }

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < min || end > max || start > end) {
      throw invalid(name, text);
    }

    for (let value = start; value <= end; value += step) {
      values.add(name === "weekday" && value === 7 ? 0 : value);
    }
  }

  return values;
}

function invalid(field, value) {
  return new UserInputError(`Invalid cron ${field} field '${value}'.`, {
    userMessage: `Expression cron invalide (${field} : ${value}).`,
  });
}

export function parseCron(expression) {
  const parts = String(expression ?? "").trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new UserInputError("Cron expression must have five fields.", {
      userMessage: "Une expression cron doit contenir cinq champs.",
    });
  }

  return parts.map((part, index) => expandField(part, FIELDS[index]));
}

const cache = new Map();

function compiled(expression) {
  const key = String(expression);
  if (!cache.has(key)) cache.set(key, parseCron(key));
  return cache.get(key);
}

export function cronMatches(expression, date = new Date()) {
  const [minutes, hours, days, months, weekdays] = compiled(expression);
  return (
    minutes.has(date.getUTCMinutes()) &&
    hours.has(date.getUTCHours()) &&
    days.has(date.getUTCDate()) &&
    months.has(date.getUTCMonth() + 1) &&
    weekdays.has(date.getUTCDay())
  );
}

export function validateCron(expression) {
  parseCron(expression);
  return expression;
}
