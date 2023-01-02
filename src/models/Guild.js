const { Schema, model } = require("mongoose");
const settings = require("../../settings");

const guildSchema = new Schema({
  id: { type: String },
  botChannel: { type: String, default: null },
  djRole: { type: String, default: null },
  prefix: { type: String, default: settings.prefix },
  reqSystem: {
    setuped: { type: Boolean, default: false },
    channelId: { type: String, default: null },
    messageId: { type: String, default: null },
  },
  twentyFourSeven: {
    enabled: { type: Boolean, default: false },
    textChannel: { type: String, default: null },
    voiceChannel: { type: String, default: null },
  },
});

module.exports = model("Guild", guildSchema);
