import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";

import { defineCommand } from "@astron-collection/discord-framework";
import { executeUserInfo } from "./userinfo.js";

export default defineCommand({
  data: new ContextMenuCommandBuilder()
    .setName("User information")
    .setNameLocalizations({ fr: "Informations utilisateur" })
    .setType(ApplicationCommandType.User),
  category: "context",
  execute: executeUserInfo,
});
