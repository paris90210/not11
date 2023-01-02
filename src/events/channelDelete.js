const guildSchema = require("../models/Guild");

/**
 * @param {import("discord.js").TextChannel} channel
 */

module.exports = async (_, channel) => {
  let guildData = await guildSchema.findOne({ id: channel.guild.id });
  if (guildData) {
    if (channel.id === guildData.reqSystem.channelId) {
      guildData.reqSystem.setuped = false;
      guildData.reqSystem.channelId = null;
      guildData.reqSystem.messageId = null;
      guildData.save();
    }
    if (channel.id === guildData.botChannel) {
      guildData.botChannel = null;
      guildData.save();
    }
    if (
      guildData.twentyFourSeven &&
      (channel.id === guildData.twentyFourSeven.textChannel ||
        channel.id === guildData.twentyFourSeven.voiceChannel)
    ) {
      guildData.twentyFourSeven.enabled = false;
      guildData.twentyFourSeven.textChannel = null;
      guildData.twentyFourSeven.voiceChannel = null;
      guildData.save();
    }
  }
};
