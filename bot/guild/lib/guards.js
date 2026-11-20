import { UserInputError } from "../../../packages/discord-framework/src/index.js";

export function requireGuild(interaction) {
  if (!interaction.inCachedGuild()) {
    throw new UserInputError("Guild only command.", {
      userMessage: "Cette commande doit être utilisée dans un serveur.",
    });
  }
  return interaction;
}

export function requireConfig(config, message) {
  if (!config) {
    throw new UserInputError(message, { userMessage: message });
  }
  return config;
}
