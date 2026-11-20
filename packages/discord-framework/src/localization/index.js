import { createTranslator } from "./catalog.js";
import en from "./locales/en.js";
import fr from "./locales/fr.js";

export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  createTranslator,
  interpolate,
  mergeCatalogs,
  normalizeLocale,
  resolveLocale,
} from "./catalog.js";

/** Built-in catalogs. A bot merges its own catalog over these. */
export const BUILTIN_CATALOGS = Object.freeze({ fr, en });

/**
 * Translator with the built-in catalogs plus optional bot-specific ones.
 * @param {{locale?: string, catalogs?: object[]}} [options]
 */
export function createBotTranslator({ locale, catalogs = [] } = {}) {
  return createTranslator({ locale, catalogs, builtin: BUILTIN_CATALOGS });
}

/** Localized description object for a Discord builder. */
export function descriptionLocalizations(frText, enText) {
  return { fr: frText, en: enText };
}
