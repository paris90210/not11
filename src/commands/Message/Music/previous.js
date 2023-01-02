const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "previous",
  aliases: ["playprevious", "back"],
  category: "Music",
  permission: "",
  description: "Plays the previous track",
  usage: "",
  cooldown: 5,
  settings: {
    ownerOnly: false,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    activePlayer: true,
    playingPlayer: true,
    DJonly: true,
    voteRequired: false,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), message: import("discord.js").Message, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, message, dispatcher, emojis }) => {
    if (!dispatcher.previous) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} There is no previous track.`),
        ],
      });
    }
    dispatcher.queue.unshift(dispatcher.previous);
    dispatcher.player.stopTrack();
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(`⏮️ Skipped to the previous track.`),
      ],
    });
  },
};
