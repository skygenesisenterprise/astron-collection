import { DEFAULT_WELCOME } from "../config/bot.js";
import { createGreetingCommand } from "../lib/greeting-command.js";

export default createGreetingCommand({
  name: "welcome",
  key: "welcome",
  english: "Configure the welcome message sent when a member joins.",
  french: "Configurer le message de bienvenue envoyé à l'arrivée d'un membre.",
  title: "Welcome",
  sample: DEFAULT_WELCOME,
});
