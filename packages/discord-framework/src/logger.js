/**
 * Structured JSON logging shared by every Astron bot.
 *
 * Every line carries the bot name, a severity and the log context, so a log
 * collector can filter on `bot` without parsing messages. Secrets are removed
 * before a record is written: redaction is a property of the logger, not a
 * discipline callers have to remember.
 */

const LEVELS = Object.freeze({
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
});

const DEFAULT_LEVEL = "info";
const SENSITIVE_KEY =
  /(token|secret|password|authorization|cookie|api[-_]?key|private[-_]?key|session|credential)/i;
const RESERVED_KEYS = new Set(["ts", "level", "bot", "msg"]);
const MAX_STRING_LENGTH = 512;
const MAX_DEPTH = 4;
const MAX_ARRAY_ITEMS = 25;

/** Discord bot tokens (`base64.timestamp.hmac`) and bearer values. */
const SECRET_PATTERNS = [
  /\b[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6,7}\.[A-Za-z0-9_-]{27,40}\b/g,
  /\b(?:Bearer|Bot)\s+[A-Za-z0-9._-]{10,}/gi,
];

export function isLogLevel(value) {
  return typeof value === "string" && Object.hasOwn(LEVELS, value.toLowerCase());
}

/** Mask anything that looks like a credential, including inside error messages. */
export function scrubString(value) {
  let output = String(value);
  for (const pattern of SECRET_PATTERNS) {
    output = output.replace(pattern, "[redacted]");
  }
  if (output.length > MAX_STRING_LENGTH) {
    output = `${output.slice(0, MAX_STRING_LENGTH)}…`;
  }
  return output;
}

export function serializeError(error) {
  if (!(error instanceof Error)) {
    return { name: "NonError", message: scrubString(error) };
  }

  const serialized = {
    name: error.name,
    message: scrubString(error.message),
  };

  if (error.code !== undefined) serialized.code = error.code;
  if (error.stack) serialized.stack = scrubString(error.stack);
  if (error.cause && error.cause !== error) {
    serialized.cause = error.cause instanceof Error ? serializeError(error.cause) : scrubString(error.cause);
  }

  return serialized;
}

/**
 * Recursively remove secret-looking keys and unprintable values.
 * Cyclic references are reported instead of throwing.
 */
export function redact(value, seen = new WeakSet(), depth = 0) {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return scrubString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "function") return `[function ${value.name || "anonymous"}]`;
  if (typeof value !== "object") return String(value);

  if (value instanceof Error) return serializeError(value);
  if (depth >= MAX_DEPTH) return "[truncated]";
  if (seen.has(value)) return "[circular]";
  seen.add(value);

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((item) => redact(item, seen, depth + 1));
  }

  if (value instanceof Map) {
    return Object.fromEntries(
      [...value.entries()].slice(0, MAX_ARRAY_ITEMS).map(([key, item]) => [
        String(key),
        redact(item, seen, depth + 1),
      ]),
    );
  }

  const output = {};
  for (const [key, item] of Object.entries(value)) {
    output[key] = SENSITIVE_KEY.test(key) ? "[redacted]" : redact(item, seen, depth + 1);
  }
  return output;
}

function defaultSink(record) {
  const stream = LEVELS[record.level] >= LEVELS.warn ? process.stderr : process.stdout;
  stream.write(`${JSON.stringify(record)}\n`);
}

/**
 * @param {object} [options]
 * @param {string} [options.bot] Bot name stamped on every record.
 * @param {string} [options.level] Minimum severity: debug|info|warn|error|silent.
 * @param {(record: object) => void} [options.sink] Override the output sink (tests, collectors).
 * @param {() => Date} [options.clock] Injectable clock.
 * @param {object} [options.context] Context merged into every record (e.g. service name).
 */
export function createLogger({
  bot = "unknown",
  level = DEFAULT_LEVEL,
  sink = defaultSink,
  clock = () => new Date(),
  context = {},
} = {}) {
  const threshold = LEVELS[String(level).toLowerCase()] ?? LEVELS[DEFAULT_LEVEL];

  function write(severity, message, details = {}) {
    if (LEVELS[severity] < threshold) return;

    const safeDetails = redact(details);
    const record = {
      ts: clock().toISOString(),
      level: severity,
      bot,
      msg: scrubString(message),
    };

    for (const [key, value] of Object.entries({ ...context, ...safeDetails })) {
      if (!RESERVED_KEYS.has(key)) record[key] = value;
    }

    try {
      sink(record);
    } catch {
      // A broken sink must never take the bot down.
    }
  }

  return {
    bot,
    level: String(level).toLowerCase(),
    debug: (message, details) => write("debug", message, details),
    info: (message, details) => write("info", message, details),
    warn: (message, details) => write("warn", message, details),
    error: (message, details) => write("error", message, details),
    isEnabled: (severity) => LEVELS[String(severity).toLowerCase()] >= threshold,
    child: (extra = {}) => createLogger({ bot, level, sink, clock, context: { ...context, ...extra } }),
  };
}

export const LOG_LEVELS = Object.keys(LEVELS).filter((level) => level !== "silent");
