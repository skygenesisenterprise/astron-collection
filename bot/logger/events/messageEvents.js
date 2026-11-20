export const events = [
  {
    name: "messageDelete",
    async execute(message, { services }) {
      services.logging.recordDiscord("messageDelete", [message]);
    },
  },
  {
    name: "messageDeleteBulk",
    async execute(messages, channel, { services }) {
      services.logging.recordDiscord("messageDeleteBulk", [messages, channel]);
    },
  },
  {
    name: "messageUpdate",
    async execute(oldMessage, newMessage, { services }) {
      services.logging.recordDiscord("messageUpdate", [oldMessage, newMessage]);
    },
  },
];
