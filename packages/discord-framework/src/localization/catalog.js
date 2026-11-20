/**
 * Message catalogs.
 *
 * Catalogs are plain nested objects keyed by dotted paths, merged left to right.
 * A missing key falls back to the default locale and then to the key itself, so
 * a translation gap is visible and never crashes a command.
 */

export const SUPPORTED_LOCALES = Object.freeze(["fr", "en"]);
export const DEFAULT_LOCALE = "fr";

export function normalizeLocale(value, fallback = DEFAULT_LOCALE) {
  if (typeof value !== "string") return fallback;
  const base = value.trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LOCALES.includes(base) ? base : fallback;
}

function getPath(source, key) {
  return key.split(".").reduce((current, part) => {
    if (current && typeof current === "object" && part in current) return current[part];
    return undefined;
  }, source);
}

export function interpolate(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (match, name) =>
    Object.hasOwn(params, name) ? String(params[name]) : match,
  );
}

export function mergeCatalogs(...catalogs) {
  const output = {};
  for (const catalog of catalogs) {
    if (!catalog) continue;
    for (const [key, value] of Object.entries(catalog)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        output[key] = mergeCatalogs(output[key], value);
      } else {
        output[key] = value;
      }
    }
  }
  return output;
}

/**
 * @param {object} options
 * @param {string} [options.locale]
 * @param {object[]} [options.catalogs] Overrides merged over the built-in ones.
 * @param {object} [options.builtin] Locale map `{ fr, en }`.
 */
export function createTranslator({ locale = DEFAULT_LOCALE, catalogs = [], builtin = {} } = {}) {
  const active = normalizeLocale(locale);
  const fallback = DEFAULT_LOCALE;

  const catalogsFor = (target) => mergeCatalogs(builtin[fallback], builtin[target], ...catalogs);

  const primary = catalogsFor(active);
  const secondary = catalogsFor(fallback);

  function t(key, params = {}) {
    const value = getPath(primary, key) ?? getPath(secondary, key);
    if (typeof value !== "string") return key;
    return interpolate(value, params);
  }

  function has(key) {
    return typeof getPath(primary, key) === "string";
  }

  return {
    t,
    has,
    locale: active,
    withLocale: (next) => createTranslator({ locale: next, catalogs, builtin }),
    list: () => SUPPORTED_LOCALES.slice(),
  };
}

export function resolveLocale(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim() !== "") {
      return normalizeLocale(candidate);
    }
  }
  return DEFAULT_LOCALE;
}
