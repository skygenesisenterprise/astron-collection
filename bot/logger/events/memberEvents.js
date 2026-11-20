export const events = [
  {
    name: "guildMemberAdd",
    async execute(member, { services }) {
      services.logging.recordDiscord("guildMemberAdd", [member]);
    },
  },
  {
    name: "guildMemberRemove",
    async execute(member, { services }) {
      services.logging.recordDiscord("guildMemberRemove", [member]);
    },
  },
  {
    name: "guildMemberUpdate",
    async execute(oldMember, newMember, { services }) {
      services.logging.recordDiscord("guildMemberUpdate", [oldMember, newMember]);
    },
  },
  {
    name: "guildBanAdd",
    async execute(ban, { services }) {
      services.logging.recordDiscord("guildBanAdd", [ban]);
    },
  },
  {
    name: "guildBanRemove",
    async execute(ban, { services }) {
      services.logging.recordDiscord("guildBanRemove", [ban]);
    },
  },
];
