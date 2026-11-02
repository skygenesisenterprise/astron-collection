/**
 * Component handler registry (buttons, select menus, modals).
 *
 * Handlers are declared *per bot*, keyed by the namespace of the custom id, and
 * are looked up only through a strictly parsed id. Nothing here holds business
 * logic: it maps an id to a function.
 */

import { ERROR_CODES, AstronError } from "../errors.js";
import { parseCustomId } from "./custom-id.js";

export const COMPONENT_KINDS = Object.freeze({
  button: "button",
  select: "select",
  modal: "modal",
});

export function createComponentRegistry({ bot } = {}) {
  if (!bot) throw new Error("createComponentRegistry requires the owning bot name.");

  /** @type {Map<string, {kind: string, namespace: string, handler: Function}>} */
  const handlers = new Map();
  const keyOf = (kind, namespace) => `${kind}:${namespace}`;

  function register(kind, namespace, handler, { allowlist = true } = {}) {
    if (!Object.values(COMPONENT_KINDS).includes(kind)) {
      throw new AstronError(`Unknown component kind '${kind}'.`, {
        code: ERROR_CODES.COMMAND_INVALID,
        expected: true,
      });
    }
    if (allowlist && (typeof namespace !== "string" || namespace === "")) {
      throw new AstronError("A component handler needs a namespace.", {
        code: ERROR_CODES.COMMAND_INVALID,
        expected: true,
      });
    }
    if (typeof handler !== "function") {
      throw new AstronError(`Handler for '${kind}:${namespace}' is not a function.`, {
        code: ERROR_CODES.COMMAND_INVALID,
        expected: true,
      });
    }

    const key = keyOf(kind, namespace);
    if (handlers.has(key)) {
      throw new AstronError(`Duplicate ${kind} handler for '${namespace}'.`, {
        code: ERROR_CODES.COMMAND_DUPLICATE,
        expected: true,
      });
    }

    handlers.set(key, { kind, namespace, handler });
    return handler;
  }

  function get(kind, namespace) {
    return handlers.get(keyOf(kind, namespace))?.handler ?? null;
  }

  /** Resolve the handler of a raw custom id, or `null` when none matches. */
  function resolve(kind, customId) {
    const parsed = parseCustomId(customId);
    if (!parsed) return null;
    const handler = get(kind, parsed.namespace);
    if (!handler) return null;
    return { handler, parsed };
  }

  return {
    bot,
    register,
    registerButton: (namespace, handler, options) =>
      register(COMPONENT_KINDS.button, namespace, handler, options),
    registerSelect: (namespace, handler, options) =>
      register(COMPONENT_KINDS.select, namespace, handler, options),
    registerModal: (namespace, handler, options) =>
      register(COMPONENT_KINDS.modal, namespace, handler, options),
    get,
    resolve,
    list: () => [...handlers.values()].map(({ kind, namespace }) => ({ kind, namespace })),
    get size() {
      return handlers.size;
    },
  };
}
