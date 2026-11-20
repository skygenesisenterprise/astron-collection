/**
 * Astron's help catalogue, derived from its own registry.
 *
 * It never reads another bot's catalogue: the six bots are independent
 * applications, and an operator discovers them from the ecosystem section.
 */

import { CATEGORY_LABELS } from "../config/bot.js";

export const ECOSYSTEM = Object.freeze([
  { name: "Automations", domain: "Triggers, conditions, scheduled workflows and integrations." },
  { name: "Guild", domain: "Welcome, levels, roles, polls, suggestions, birthdays and reminders." },
  { name: "Logger", domain: "Audit logging, search, export and retention." },
  { name: "Player", domain: "Voice sessions, queues, playlists and playback controls." },
  { name: "Protect", domain: "Moderation, anti-spam, anti-raid, phishing protection and cases." },
]);

export function createHelpService({ registry, locale = "fr" }) {
  function describe(command) {
    const localizations = command.definition.description_localizations ?? {};
    return localizations[locale] ?? command.definition.description ?? "";
  }

  function categories() {
    const groups = new Map();

    for (const command of registry.list()) {
      const category = command.category ?? "utility";
      if (!groups.has(category)) {
        groups.set(category, {
          key: category,
          label: CATEGORY_LABELS[category] ?? category,
          commands: [],
        });
      }
      groups.get(category).commands.push({
        name: command.definition.name,
        description: describe(command),
        type: command.metadata.type,
      });
    }

    return [...groups.values()]
      .map((group) => ({
        ...group,
        commands: group.commands.sort((left, right) => left.name.localeCompare(right.name)),
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }

  function find(name) {
    const command = registry.get(name);
    if (!command) return null;
    return {
      name: command.definition.name,
      description: describe(command),
      category: command.category,
      permissions: command.permissions,
      cooldown: command.cooldown,
    };
  }

  function renderText() {
    return categories()
      .map(
        (group) =>
          `**${group.label}**\n${group.commands.map((command) => `/${command.name} — ${command.description}`).join("\n")}`,
      )
      .join("\n\n");
  }

  return { categories, find, renderText, ecosystem: () => [...ECOSYSTEM], count: () => registry.size };
}
