import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

import {
  getAutoModSettings,
  updateAutoModSettings,
  addAudit,
} from "../utils/store.js";

export const data = new SlashCommandBuilder()
  .setName("automod")
  .setDescription("Configurer l'auto-modération du bot.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("enable")
      .setDescription("Activer une règle d'auto-modération")
      .addStringOption((option) =>
        option
          .setName("règle")
          .setDescription("La règle à activer")
          .setRequired(true)
          .addChoices(
            { name: "Liens", value: "links" },
            { name: "Insultes", value: "swear" },
            { name: "Spam", value: "spam" },
            { name: "Mentions excessives", value: "mentions" },
            { name: "Majuscules", value: "caps" }
          )
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("disable")
      .setDescription("Désactiver une règle d'auto-modération")
      .addStringOption((option) =>
        option
          .setName("règle")
          .setDescription("La règle à désactiver")
          .setRequired(true)
          .addChoices(
            { name: "Liens", value: "links" },
            { name: "Insultes", value: "swear" },
            { name: "Spam", value: "spam" },
            { name: "Mentions excessives", value: "mentions" },
            { name: "Majuscules", value: "caps" }
          )
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("list")
      .setDescription("Lister les règles d'auto-modération activées")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("settings")
      .setDescription("Configurer les paramètres de l'auto-modération")
      .addBooleanOption((option) =>
        option
          .setName("supprimer-message")
          .setDescription("Supprimer les messages violant les règles")
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("avertir-utilisateur")
          .setDescription("Avertir l'utilisateur en DM")
          .setRequired(false)
      )
      .addIntegerOption((option) =>
        option
          .setName("seuil-mentions")
          .setDescription("Nombre maximal de mentions par message (0 pour désactiver)")
          .setRequired(false)
          .setMinValue(0)
          .setMaxValue(20)
      )
      .addIntegerOption((option) =>
        option
          .setName("seuil-majuscules")
          .setDescription("Pourcentage maximal de majuscules (0-100)")
          .setRequired(false)
          .setMinValue(0)
          .setMaxValue(100)
      )
  );

export async function execute(interaction) {
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Cette commande doit être utilisée dans un serveur.",
      ephemeral: true,
    });
    return;
  }

  const subcommand = interaction.options.getSubcommand();
  const settings = getAutoModSettings(interaction.guildId) || {
    enabledRules: [],
    deleteMessage: true,
    warnUser: true,
    maxMentions: 5,
    maxCapsPercentage: 80,
  };

  if (subcommand === "enable") {
    const rule = interaction.options.getString("règle", true);

    if (settings.enabledRules.includes(rule)) {
      await interaction.reply({
        content: `La règle **${rule}** est déjà activée.`,
        ephemeral: true,
      });
      return;
    }

    settings.enabledRules.push(rule);
    updateAutoModSettings(interaction.guildId, settings);

    addAudit({
      guildId: interaction.guildId,
      action: "automod_enable",
      actor: interaction.user.tag,
      reason: `Règle: ${rule}`,
    });

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("✅ Règle activée")
      .setDescription(`La règle d'auto-modération **${rule}** a été activée.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (subcommand === "disable") {
    const rule = interaction.options.getString("règle", true);

    const ruleIndex = settings.enabledRules.indexOf(rule);
    if (ruleIndex === -1) {
      await interaction.reply({
        content: `La règle **${rule}** n'est pas activée.`,
        ephemeral: true,
      });
      return;
    }

    settings.enabledRules.splice(ruleIndex, 1);
    updateAutoModSettings(interaction.guildId, settings);

    addAudit({
      guildId: interaction.guildId,
      action: "automod_disable",
      actor: interaction.user.tag,
      reason: `Règle: ${rule}`,
    });

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("❌ Règle désactivée")
      .setDescription(`La règle d'auto-modération **${rule}** a été désactivée.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (subcommand === "list") {
    if (settings.enabledRules.length === 0) {
      await interaction.reply({
        content: "Aucune règle d'auto-modération activée.",
        ephemeral: true,
      });
      return;
    }

    const ruleNames = {
      links: "Liens",
      swear: "Insultes",
      spam: "Spam",
      mentions: "Mentions excessives",
      caps: "Majuscules",
    };

    const ruleList = settings.enabledRules
      .map((rule) => `• ${ruleNames[rule] || rule}`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🛡️ Règles d'auto-modération activées")
      .setDescription(ruleList)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (subcommand === "settings") {
    const deleteMessage = interaction.options.getBoolean("supprimer-message");
    const warnUser = interaction.options.getBoolean("avertir-utilisateur");
    const maxMentions = interaction.options.getInteger("seuil-mentions");
    const maxCapsPercentage = interaction.options.getInteger("seuil-majuscules");

    if (deleteMessage !== null) settings.deleteMessage = deleteMessage;
    if (warnUser !== null) settings.warnUser = warnUser;
    if (maxMentions !== null) settings.maxMentions = maxMentions;
    if (maxCapsPercentage !== null) settings.maxCapsPercentage = maxCapsPercentage;

    updateAutoModSettings(interaction.guildId, settings);

    addAudit({
      guildId: interaction.guildId,
      action: "automod_settings",
      actor: interaction.user.tag,
      reason: `Supprimer message: ${settings.deleteMessage}, Avertir: ${settings.warnUser}, Mentions: ${settings.maxMentions}, Majuscules: ${settings.maxCapsPercentage}%`,
    });

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("⚙️ Paramètres de l'auto-modération mis à jour")
      .setDescription(
        `**Supprimer les messages:** ${settings.deleteMessage ? "Oui" : "Non"}\n` +
        `**Avertir l'utilisateur:** ${settings.warnUser ? "Oui" : "Non"}\n` +
        `**Seuil de mentions:** ${settings.maxMentions}\n` +
        `**Seuil de majuscules:** ${settings.maxCapsPercentage}%`
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
