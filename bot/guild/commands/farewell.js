import { DEFAULT_FAREWELL } from "../config/bot.js";
import { createGreetingCommand } from "../lib/greeting-command.js";

export default createGreetingCommand({
  name: "farewell",
  key: "farewell",
  english: "Configure the message sent when a member leaves.",
  french: "Configurer le message envoyé lorsqu'un membre quitte le serveur.",
  title: "Farewell",
  sample: DEFAULT_FAREWELL,
});
