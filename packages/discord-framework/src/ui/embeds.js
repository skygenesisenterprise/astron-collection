/**
 * Discord message building blocks.
 *
 * These helpers only shape payloads; they hold no business logic. Importing this
 * module requires `discord.js`, which is why it is exposed as its own subpath and
 * not re-exported from the framework entry point.
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from "discord.js";

import { encodeCustomId } from "../interactions/custom-id.js";
import { COLORS, progressBar, truncate } from "./format.js";

const MAX_FIELDS = 25;

export function embed({
  title,
  description,
  color = COLORS.brand,
  fields = [],
  footer,
  thumbnail,
  image,
  author,
  timestamp = true,
} = {}) {
  const builder = new EmbedBuilder().setColor(color);
  if (title) builder.setTitle(truncate(title, 256));
  if (description) builder.setDescription(truncate(description, 4096));
  if (fields.length) {
    builder.addFields(
      fields.slice(0, MAX_FIELDS).map((field) => ({
        name: truncate(field.name, 256),
        value: truncate(field.value || "—", 1024),
        inline: Boolean(field.inline),
      })),
    );
  }
  if (footer) builder.setFooter({ text: truncate(footer, 2048) });
  if (thumbnail) builder.setThumbnail(thumbnail);
  if (image) builder.setImage(image);
  if (author) builder.setAuthor({ name: truncate(author.name ?? author, 256), iconURL: author.iconURL });
  if (timestamp) builder.setTimestamp(new Date());
  return builder;
}

export const successEmbed = (title, description, extra = {}) =>
  embed({ title: `✅ ${title}`, description, color: COLORS.success, ...extra });

export const errorEmbed = (description, extra = {}) =>
  embed({ title: "❌ Error", description, color: COLORS.danger, ...extra });

export const warningEmbed = (title, description, extra = {}) =>
  embed({ title: `⚠️ ${title}`, description, color: COLORS.warning, ...extra });

export const infoEmbed = (title, description, extra = {}) =>
  embed({ title, description, color: COLORS.info, ...extra });

export function progressField(label, value, max, extra = {}) {
  return { name: label, value: `${progressBar(value, max)} ${value}/${max}`, inline: true, ...extra };
}

/**
 * Previous / next pagination. The page is part of the versioned custom id, so a
 * button from an older render is recognised and refused by the router.
 */
export function paginationRow({ namespace, action = "page", page = 1, pages = 1, extraValue } = {}) {
  const base = extraValue ? `${extraValue}` : undefined;
  const valueFor = (target) => (base ? `${base}-${target}` : String(target));
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(encodeCustomId({ namespace, action, value: valueFor(Math.max(1, page - 1)) }))
      .setLabel("Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId(encodeCustomId({ namespace, action, value: valueFor(Math.min(pages, page + 1)) }))
      .setLabel(`Page ${page}/${pages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(encodeCustomId({ namespace, action, value: valueFor(Math.min(pages, page + 1)) }))
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page >= pages),
  );
}

/** Confirm / cancel buttons. `value` scopes the action to one record. */
export function confirmRow({
  namespace,
  value,
  confirmAction = "confirm",
  cancelAction = "cancel",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  dangerous = false,
} = {}) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(encodeCustomId({ namespace, action: confirmAction, value }))
      .setLabel(confirmLabel)
      .setStyle(dangerous ? ButtonStyle.Danger : ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(encodeCustomId({ namespace, action: cancelAction, value }))
      .setLabel(cancelLabel)
      .setStyle(ButtonStyle.Secondary),
  );
}

/** A single-select menu; options are `{label, value, description?}`. */
export function selectRow({ namespace, action, placeholder, options, value, maxValues = 1 } = {}) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(encodeCustomId({ namespace, action, value }))
    .setPlaceholder(truncate(placeholder ?? "Choose…", 150))
    .setMinValues(1)
    .setMaxValues(Math.min(maxValues, options.length))
    .addOptions(
      options.slice(0, 25).map((option) => ({
        label: truncate(option.label, 100),
        value: String(option.value),
        description: option.description ? truncate(option.description, 100) : undefined,
      })),
    );

  return new ActionRowBuilder().addComponents(menu);
}

export function fieldsFromRecord(record, { inline = true } = {}) {
  return Object.entries(record ?? {}).map(([name, value]) => ({ name, value: String(value), inline }));
}
