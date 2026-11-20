/**
 * Event delivery.
 *
 * The bus is deliberately transport-agnostic: a sink is a function or an object
 * with `deliver(envelope)`. Failures are contained per sink and reported, never
 * thrown at the business code that emitted the event. At-least-once delivery is
 * the contract; consumers deduplicate on the envelope id.
 */

import { createEvent, validateEvent } from "./events.js";

function asSink(sink, index) {
  if (typeof sink === "function") return { name: `sink-${index}`, deliver: sink };
  if (sink && typeof sink.deliver === "function") {
    return { name: sink.name ?? `sink-${index}`, deliver: sink.deliver.bind(sink) };
  }
  throw new Error(`Event sink ${index} is not deliverable.`);
}

/**
 * @param {object} options
 * @param {string} options.source Bot emitting the events.
 * @param {Array<Function|{name?: string, deliver: Function}>} [options.sinks]
 * @param {object} [options.logger]
 * @param {() => number} [options.clock]
 */
export function createEventBus({ source, sinks = [], logger, clock = () => Date.now(), metrics } = {}) {
  const normalized = sinks.map(asSink);

  async function publishEnvelope(envelope) {
    const check = validateEvent(envelope);
    if (!check.ok) {
      throw new Error(`Refusing to deliver an invalid event: ${check.errors.join("; ")}`);
    }

    const delivered = [];
    const failed = [];

    for (const sink of normalized) {
      try {
        await sink.deliver(envelope);
        delivered.push(sink.name);
      } catch (error) {
        failed.push({ sink: sink.name, error });
        logger?.warn?.("event delivery failed", {
          type: envelope.type,
          eventId: envelope.id,
          sink: sink.name,
          err: error,
        });
        metrics?.inc?.("event_delivery_failed_total", { sink: sink.name, type: envelope.type });
      }
    }

    metrics?.inc?.("event_published_total", { type: envelope.type, source });
    return { envelope, delivered, failed, ok: failed.length === 0 };
  }

  async function publish(type, options = {}) {
    const envelope = createEvent({ type, source, ...options });
    return publishEnvelope(envelope);
  }

  return {
    source,
    publish,
    publishEnvelope,
    sinks: normalized.map((sink) => sink.name),
    /** An event that is valid but has nowhere to go is not an error. */
    get configured() {
      return normalized.length > 0;
    },
  };
}

/** Collect events in memory; used by tests and by `--dry-run` diagnostics. */
export function createCollectingSink() {
  const events = [];
  return {
    name: "collecting",
    events,
    deliver: async (envelope) => {
      events.push(envelope);
    },
  };
}

/** Resolve a list of events into one guild's stream, ordered by occurrence. */
export function sortByOccurrence(events = []) {
  return [...events].sort(
    (left, right) =>
      Date.parse(left.occurredAt) - Date.parse(right.occurredAt) || left.id.localeCompare(right.id),
  );
}

