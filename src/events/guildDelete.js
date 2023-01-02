const guildSchema = require("../models/Guild");

/**
 * @param {import("discord.js").Guild} guild
 */

module.exports = async (_, guild) => {
  await guildSchema.deleteOne({ id: guild.id });
};
