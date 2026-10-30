import { getRegisteredSecrets } from "../observability/secrets.js";
import { DEFAULT_REDACTED_FIELDS, redactKnownSecrets, redactSensitive } from "./redactSensitive.js";
export var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (LogLevel = {}));
const LEVEL_PRIORITY = {
    [LogLevel.ERROR]: 0,
    [LogLevel.WARN]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.DEBUG]: 3,
};
let minimumLevel = LogLevel.INFO;
export function setLogLevel(level) {
    minimumLevel = level;
}
export function getLogLevel() {
    return minimumLevel;
}
function shouldLog(level) {
    return LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[minimumLevel];
}
class Logger {
    context;
    constructor(context = "MCP-Server") {
        this.context = context;
    }
    log(level, message, meta) {
        if (!shouldLog(level))
            return;
        // Field-based redaction catches known secret-bearing keys; the literal pass
        // catches credentials embedded in free-form error text.
        const safeMeta = meta
            ? redactKnownSecrets(redactSensitive(meta, DEFAULT_REDACTED_FIELDS), getRegisteredSecrets())
            : undefined;
        const entry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context: { service: this.context, ...safeMeta },
        };
        // MCP stdio reserves stdout for the protocol; all diagnostics go to stderr.
        console.error(JSON.stringify(entry));
    }
    error(message, meta) {
        this.log(LogLevel.ERROR, message, meta);
    }
    warn(message, meta) {
        this.log(LogLevel.WARN, message, meta);
    }
    info(message, meta) {
        this.log(LogLevel.INFO, message, meta);
    }
    debug(message, meta) {
        this.log(LogLevel.DEBUG, message, meta);
    }
}
export function createLogger(context) {
    return new Logger(context);
}
