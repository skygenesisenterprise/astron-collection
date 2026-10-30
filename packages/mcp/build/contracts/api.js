/**
 * Minimal port implemented by the Notploy API adapter.
 *
 * Capabilities depend on this interface rather than on Axios so that they can
 * be tested without a network and so that every call goes through one place
 * that owns authentication, timeouts, retries and redaction.
 */
export {};
