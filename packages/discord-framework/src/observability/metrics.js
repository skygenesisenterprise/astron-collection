/**
 * Minimal Prometheus registry.
 *
 * Bots are long-lived processes whose failure modes are mostly counts (events
 * handled, workflow failures, reconnects) and latencies. A counter/gauge/histogram
 * registry is enough; there is no agent, exporter sidecar or vendor SDK.
 */

const DEFAULT_BUCKETS = [5, 10, 25, 50, 100, 250, 500, 1_000, 2_500, 5_000];

function sanitizeName(name) {
  const normalized = String(name).replace(/[^a-zA-Z0-9_:]/g, "_");
  if (!/^[a-zA-Z_:]/.test(normalized)) return `_${normalized}`;
  return normalized;
}

function labelKey(labels = {}) {
  return Object.keys(labels)
    .sort()
    .map((key) => `${key}="${String(labels[key]).replace(/["\\\n]/g, "")}"`)
    .join(",");
}

function formatLine(name, labels, value) {
  const suffix = labels ? `{${labels}}` : "";
  return `${name}${suffix} ${Number(value)}`;
}

export function createMetrics({ prefix = "astron", now = () => Date.now() } = {}) {
  /** @type {Map<string, {help: string, type: string, values: Map<string, any>, labels: string[]}>} */
  const families = new Map();

  function family(name, type, help, labelNames) {
    const key = sanitizeName(name);
    let entry = families.get(key);
    if (!entry) {
      entry = { help: help ?? key, type, values: new Map(), labels: labelNames ?? [] };
      families.set(key, entry);
    }
    return { key, entry };
  }

  function inc(name, labels, value = 1, { help } = {}) {
    const { entry } = family(name, "counter", help, Object.keys(labels ?? {}));
    const key = labelKey(labels);
    const current = entry.values.get(key) ?? 0;
    entry.values.set(key, current + Number(value));
    return this;
  }

  function gauge(name, value, labels = {}, { help } = {}) {
    const { entry } = family(name, "gauge", help, Object.keys(labels));
    entry.values.set(labelKey(labels), Number(value));
    return this;
  }

  function observe(name, value, labels = {}, { help, buckets = DEFAULT_BUCKETS } = {}) {
    const { entry } = family(name, "histogram", help, Object.keys(labels));
    const key = labelKey(labels);
    const state = entry.values.get(key) ?? {
      buckets: buckets.map((bound) => ({ bound, count: 0 })),
      sum: 0,
      count: 0,
    };
    state.sum += Number(value);
    state.count += 1;
    for (const bucket of state.buckets) {
      if (Number(value) <= bucket.bound) bucket.count += 1;
    }
    entry.values.set(key, state);
    return this;
  }

  function snapshot() {
    const output = {};
    for (const [name, entry] of families) {
      output[name] = {
        type: entry.type,
        help: entry.help,
        values: [...entry.values.entries()].map(([labels, value]) => ({ labels, value })),
      };
    }
    return output;
  }

  function prometheus() {
    const lines = [];
    for (const [name, entry] of families) {
      lines.push(`# HELP ${prefix}_${name} ${entry.help}`);
      lines.push(`# TYPE ${prefix}_${name} ${entry.type}`);

      if (entry.type === "histogram") {
        for (const [labels, state] of entry.values) {
          const withLe = (bound) => [labels, `le="${bound}"`].filter(Boolean).join(",");
          for (const bucket of state.buckets) {
            lines.push(
              formatLine(`${prefix}_${name}_bucket`, withLe(bucket.bound), bucket.count),
            );
          }
          lines.push(formatLine(`${prefix}_${name}_bucket`, withLe("+Inf"), state.count));
          lines.push(formatLine(`${prefix}_${name}_sum`, labels, state.sum));
          lines.push(formatLine(`${prefix}_${name}_count`, labels, state.count));
        }
        continue;
      }

      for (const [labels, value] of entry.values) {
        lines.push(formatLine(`${prefix}_${name}`, labels, value));
      }
    }
    return `${lines.join("\n")}\n`;
  }

  /** Time an async operation and record its duration in milliseconds. */
  async function time(name, labels, fn) {
    const started = now();
    try {
      return await fn();
    } finally {
      observe(name, now() - started, labels);
    }
  }

  return { inc, gauge, observe, time, snapshot, prometheus, now };
}
