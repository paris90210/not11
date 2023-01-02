const { MessageEmbed } = require("discord.js");
const guildSchema = require("../models/Guild");

/**
 * @param {import("../structures/Client")} client
 * @param {import("discord.js").VoiceState} newState
 */

module.exports = async (client, _, newState) => {
  if (newState.member.id === client.user.id) {
    if (
      newState.channel &&
      newState.channel.type === "GUILD_STAGE_VOICE" &&
      newState.guild.me.voice.suppress
    ) {
      return newState.setSuppressed(false).catch(() => null);
    }
    let dispatcher = client.manager.players.get(newState.guild.id);
    if (!dispatcher) return;
    if (!newState.channel) {
      return dispatcher.destroy();
    }
    dispatcher.setVoiceChannel(newState.channel.id);
    if (dispatcher.player.paused) return;
    dispatcher.setPaused(true);
    setTimeout(() => {
      dispatcher.setPaused(false);
    }, 150);
  }
  if (
    client.manager.players.get(newState.guild.id) &&
    !newState.guild.me.voice.channel.members.filter((m) => !m.user.bot).size
  ) {
    setTimeout(async () => {
      if (
        client.manager.players.get(newState.guild.id) &&
        !newState.guild.me.voice.channel.members.filter((m) => !m.user.bot).size
      ) {
        let guildData = await guildSchema.findOne({ id: newState.guild.id });
        if (guildData && !guildData.twentyFourSeven.enabled) {
          let channel = client.channels.cache.get(
            client.manager.players.get(newState.guild.id).text
          );
          if (channel) {
            channel
              .send({
                embeds: [
                  new MessageEmbed()
                    .setColor(client.settings.embed_color)
                    .setDescription(
                      `👋 Left the voice channel due to inactivity.`
                    ),
                ],
              })
              .catch(() => null);
          }
          client.manager.players.get(newState.guild.id).destroy();
        }
      }
    }, 180000);
  }
};
