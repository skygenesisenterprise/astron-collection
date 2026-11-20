export const events = [
  {
    name: "roleCreate",
    async execute(role, { services }) {
      services.logging.recordDiscord("roleCreate", [role]);
    },
  },
  {
    name: "roleDelete",
    async execute(role, { services }) {
      services.logging.recordDiscord("roleDelete", [role]);
    },
  },
  {
    name: "roleUpdate",
    async execute(oldRole, newRole, { services }) {
      services.logging.recordDiscord("roleUpdate", [oldRole, newRole]);
    },
  },
];
