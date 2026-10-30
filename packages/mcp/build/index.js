#!/usr/bin/env node
import { createLogger } from "./utils/logger.js";
const logger = createLogger("MCP-Entry");
function useHttpTransport() {
    const args = process.argv.slice(2);
    return (args.includes("--http") ||
        args.includes("--sse") ||
        process.env.MCP_TRANSPORT === "http" ||
        process.env.MCP_TRANSPORT === "sse");
}
async function main() {
    if (useHttpTransport()) {
        const { main: runHttp } = await import("./entrypoints/http.js");
        await runHttp();
        return;
    }
    const { main: runStdio } = await import("./entrypoints/stdio.js");
    await runStdio();
}
main().catch((error) => {
    logger.error("Fatal error", {
        error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
});
