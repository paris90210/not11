const guildSchema = require("../models/Guild");

/**
 * @param {import("discord.js").Message} message
 */

module.exports = async (_, message) => {
  let guildData = await guildSchema.findOne({ id: message.guild.id });
  if (guildData) {
    if (message.id === guildData.reqSystem.messageId) {
      guildData.reqSystem.messageId = null;
      guildData.save();
    }
  }
};
