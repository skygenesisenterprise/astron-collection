import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { createLogger } from "../utils/logger.js";
import { redactKnownSecrets } from "../utils/redactSensitive.js";
import { getRegisteredSecrets } from "./secrets.js";
const logger = createLogger("Audit");
/**
 * Append-only audit trail for every tool call, including refusals.
 *
 * Events contain identifiers, decisions and outcome codes only — never inputs,
 * headers or credentials. The JSONL file is optional; the structured log line
 * is always emitted so an existing log pipeline can collect it.
 */
export class AuditLog {
    path;
    writeChain = Promise.resolve();
    constructor(path) {
        this.path = path;
    }
    async record(event) {
        const safeEvent = redactKnownSecrets(event, getRegisteredSecrets());
        const entry = { type: "audit", timestamp: new Date().toISOString(), ...safeEvent };
        logger.info("MCP tool call", entry);
        if (!this.path)
            return;
        this.writeChain = this.writeChain
            .catch(() => undefined)
            .then(async () => {
            try {
                await mkdir(dirname(this.path), { recursive: true });
                await appendFile(this.path, `${JSON.stringify(entry)}\n`, {
                    encoding: "utf8",
                    mode: 0o600,
                });
            }
            catch (error) {
                logger.error("Could not append to NOTPLOY_MCP_AUDIT_LOG", {
                    error: error instanceof Error ? error.message : "unknown error",
                });
            }
        });
        await this.writeChain;
    }
    async close() {
        await this.writeChain;
    }
}
