import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SUPPORTED_LOCALES,
  createBotTranslator,
  createTranslator,
  interpolate,
  normalizeLocale,
} from "../src/localization/index.js";

describe("localization", () => {
  it("defaults to French and supports English", () => {
    assert.match(createBotTranslator().t("errors.guildOnly"), /serveur/);
    assert.match(createBotTranslator({ locale: "en" }).t("errors.guildOnly"), /server/);
    assert.deepEqual([...SUPPORTED_LOCALES], ["fr", "en"]);
  });

  it("normalizes regional and unknown locales", () => {
    assert.equal(normalizeLocale("en-US"), "en");
    assert.equal(normalizeLocale("fr_FR"), "fr");
    assert.equal(normalizeLocale("de"), "fr");
    assert.equal(normalizeLocale(undefined), "fr");
  });

  it("merges bot catalogs over the built-in ones", () => {
    const translator = createBotTranslator({
      locale: "en",
      catalogs: [{ common: { saved: "Done!" }, guild: { welcome: "Welcome {user}" } }],
    });

    assert.equal(translator.t("common.saved"), "Done!");
    assert.equal(translator.t("guild.welcome", { user: "Ada" }), "Welcome Ada");
    assert.equal(translator.t("common.enabled"), "Enabled");
  });

  it("returns the key for a missing translation and interpolates values", () => {
    const translator = createTranslator({ locale: "en" });
    assert.equal(translator.t("does.not.exist"), "does.not.exist");
    assert.equal(translator.has("does.not.exist"), false);
    assert.equal(interpolate("Page {page}/{pages}", { page: 2, pages: 5 }), "Page 2/5");
  });

  it("switches locale without losing the bot catalog", () => {
    const translator = createBotTranslator({ catalogs: [{ custom: { value: "Valeur" } }] });
    assert.equal(translator.withLocale("en").t("custom.value"), "Valeur");
    assert.match(translator.withLocale("en").t("errors.guildOnly"), /server/);
  });
});
