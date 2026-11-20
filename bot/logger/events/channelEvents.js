export const events = [
  {
    name: "channelCreate",
    async execute(channel, { services }) {
      services.logging.recordDiscord("channelCreate", [channel]);
    },
  },
  {
    name: "channelDelete",
    async execute(channel, { services }) {
      services.logging.recordDiscord("channelDelete", [channel]);
    },
  },
  {
    name: "channelUpdate",
    async execute(oldChannel, newChannel, { services }) {
      services.logging.recordDiscord("channelUpdate", [oldChannel, newChannel]);
    },
  },
];
