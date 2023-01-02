const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "replay",
  aliases: [],
  category: "Music",
  permission: "",
  description: "Replays the current track",
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
  run: async ({ client, message, dispatcher }) => {
    dispatcher.setPaused(true);
    dispatcher.player.seekTo(0);
    setTimeout(() => dispatcher.setPaused(false), 150);
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(`🔃 Replaying the current track.`),
      ],
    });
  },
};
