import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createLogger, redact } from "../src/logger.js";
import { createHealthServer } from "../src/observability/health.js";
import { createMetrics } from "../src/observability/metrics.js";

describe("logger", () => {
  it("redacts secret keys and token-shaped strings", () => {
    const records = [];
    const logger = createLogger({
      bot: "protect",
      level: "debug",
      sink: (record) => records.push(record),
      clock: () => new Date("2026-01-01T00:00:00.000Z"),
    });

    logger.info("started", {
      token: "do-not-log",
      nested: { password: "hunter2" },
      detail: "used FAKE_TOKEN_abcdefghijklmnop.123456.abcdefghijklmnopqrstuvwxyz0",
    });

    assert.equal(records[0].bot, "protect");
    assert.equal(records[0].token, "[redacted]");
    assert.equal(records[0].nested.password, "[redacted]");
    assert.equal(records[0].detail.includes("FAKE_TOKEN"), false);
    assert.equal(JSON.stringify(records[0]).includes("hunter2"), false);
  });

  it("serializes errors without throwing on cycles", () => {
    const cycle = { name: "cycle" };
    cycle.self = cycle;
    assert.equal(redact(cycle).self, "[circular]");
    assert.deepEqual(redact(new Error("boom")).message, "boom");
  });
});

describe("metrics", () => {
  it("renders counters, gauges and histograms in Prometheus format", () => {
    const metrics = createMetrics({ prefix: "astron" });

    metrics.inc("events_total", { type: "member.joined" });
    metrics.inc("events_total", { type: "member.joined" }, 2);
    metrics.gauge("guilds", 4);
    metrics.observe("command_duration_ms", 12, { command: "ping" }, { buckets: [10, 50] });

    const output = metrics.prometheus();

    assert.match(output, /# TYPE astron_events_total counter/);
    assert.match(output, /astron_events_total\{type="member\.joined"\} 3/);
    assert.match(output, /astron_guilds 4/);
    assert.match(output, /astron_command_duration_ms_bucket\{command="ping",le="10"\} 0/);
    assert.match(output, /astron_command_duration_ms_bucket\{command="ping",le="50"\} 1/);
    assert.match(output, /astron_command_duration_ms_bucket\{command="ping",le="\+Inf"\} 1/);
    assert.match(output, /astron_command_duration_ms_count\{command="ping"\} 1/);
  });
});

describe("health server", () => {
  it("answers readiness, metrics and a signed ingest route", async () => {
    const metrics = createMetrics();
    metrics.inc("health_probes_total");
    const server = createHealthServer({
      bot: "logger",
      port: 0,
      health: () => ({ ready: true, guilds: 2 }),
      metrics,
      routes: [
        {
          method: "POST",
          path: "/ingest/events",
          handler: (request, context) =>
            context.json(202, {
              received: context.body?.hello === "world",
              bytes: context.rawBody.length,
            }),
        },
      ],
    });

    const address = await server.start();

    try {
      const health = await fetch(`${address.url}/healthz`);
      assert.equal(health.status, 200);
      assert.deepEqual(await health.json(), { bot: "logger", ready: true, guilds: 2 });

      const ingest = await fetch(`${address.url}/ingest/events`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hello: "world" }),
      });
      assert.equal(ingest.status, 202);
      const payload = await ingest.json();
      assert.equal(payload.received, true);
      assert.ok(payload.bytes >= 17);

      const metricsResponse = await fetch(`${address.url}/metrics`);
      assert.equal(metricsResponse.status, 200);
      assert.match(await metricsResponse.text(), /# TYPE/);

      const missing = await fetch(`${address.url}/nope`);
      assert.equal(missing.status, 404);
    } finally {
      await server.stop();
    }
  });
});
