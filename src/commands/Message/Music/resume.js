const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "resume",
  aliases: ["unpause", "continue"],
  category: "Music",
  permission: "",
  description: "Resumes the player",
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
    if (!dispatcher.player.paused) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} The player isn't paused.`),
        ],
      });
    }
    dispatcher.setPaused(false);
    client.util.updateRequestChannelMessage(dispatcher);
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription("▶️ Resumed."),
      ],
    });
  },
};
