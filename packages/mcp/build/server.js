/**
 * Backwards-compatible module path.
 *
 * The server implementation now lives in `protocol/server.ts`; existing
 * imports of `./server.js` (tests, embedders) keep working.
 */
export { buildMcpServer, closeRuntime, closeServerParts, createRuntime, createServer, createServerParts, } from "./protocol/server.js";
