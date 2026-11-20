/**
 * Readiness, liveness and metrics over HTTP.
 *
 * Containers need a probe that is independent from the Discord gateway: a bot
 * that is reconnecting is alive but not ready, and an operator must be able to
 * see the difference. The server is also the extension point for inbound
 * event-contract webhooks (Logger), which keeps one listening socket per bot.
 */

import http from "node:http";

const MAX_BODY_BYTES = 1024 * 1024;
const BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
  });
  res.end(body);
}

function readBody(req, limit = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error("Request body too large."), { code: "BODY_TOO_LARGE" }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/**
 * @param {object} options
 * @param {string} options.bot Process name.
 * @param {number} [options.port] 0 picks a free port (tests).
 * @param {string} [options.host]
 * @param {() => object} [options.health] Readiness snapshot.
 * @param {object} [options.metrics] Registry from createMetrics.
 * @param {Array<{method?: string, path: string, handler: Function}>} [options.routes]
 * @param {object} [options.logger]
 */
export function createHealthServer({
  bot,
  port = 8080,
  host = "0.0.0.0",
  health = () => ({ ready: true }),
  metrics,
  routes = [],
  logger,
} = {}) {
  const custom = new Map(routes.map((route) => [`${(route.method ?? "GET").toUpperCase()} ${route.path}`, route]));

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const method = (req.method ?? "GET").toUpperCase();
    const path = url.pathname;

    try {
      if (method === "GET" && (path === "/healthz" || path === "/readyz")) {
        const snapshot = health();
        sendJson(res, snapshot?.ready === false ? 503 : 200, { bot, ...snapshot });
        return;
      }

      if (method === "GET" && path === "/livez") {
        sendJson(res, 200, { bot, status: "alive", uptimeSeconds: Math.round(process.uptime()) });
        return;
      }

      if (method === "GET" && path === "/metrics" && metrics) {
        res.writeHead(200, { "content-type": "text/plain; version=0.0.4; charset=utf-8" });
        res.end(metrics.prometheus());
        return;
      }

      const route = custom.get(`${method} ${path}`);
      if (route) {
        const rawBody = BODY_METHODS.has(method) ? await readBody(req) : "";
        let body = null;
        if (rawBody) {
          try {
            body = JSON.parse(rawBody);
          } catch {
            sendJson(res, 400, { error: "invalid_json" });
            return;
          }
        }

        const result = await route.handler(req, {
          body,
          rawBody,
          query: Object.fromEntries(url.searchParams),
          json: (status, payload) => sendJson(res, status, payload),
          res,
        });

        if (result !== undefined) sendJson(res, result?.status ?? 200, result?.body ?? result);
        return;
      }

      sendJson(res, 404, { error: "not_found" });
    } catch (error) {
      if (error?.code === "BODY_TOO_LARGE") {
        sendJson(res, 413, { error: "payload_too_large" });
        return;
      }
      logger?.error?.("health server request failed", { method, path, err: error });
      if (!res.headersSent) sendJson(res, 500, { error: "internal_error" });
      else res.end();
    }
  });

  let listening = null;

  async function start() {
    if (listening) return listening;
    if (port === false || port === null) {
      return { port: null, url: null, close: async () => {} };
    }

    listening = await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(port, host, () => {
        server.off("error", reject);
        const address = server.address();
        const actualPort = typeof address === "object" && address ? address.port : port;
        resolve({
          port: actualPort,
          url: `http://${host === "0.0.0.0" ? "127.0.0.1" : host}:${actualPort}`,
          close: () =>
            new Promise((done) => {
              server.close(() => done());
              listening = null;
            }),
        });
      });
    });

    logger?.info?.("health server listening", { port: listening.port, host });
    return listening;
  }

  async function stop() {
    if (!listening) return;
    const current = listening;
    listening = null;
    await current.close();
    logger?.info?.("health server stopped");
  }

  return {
    server,
    start,
    stop,
    get address() {
      return listening;
    },
  };
}
