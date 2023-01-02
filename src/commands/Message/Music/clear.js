const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "clear",
  aliases: ["clq", "cl"],
  category: "Music",
  permission: "",
  description: "Clears the queue",
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
    if (!dispatcher.queue.length) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} Queue is empty.`),
        ],
      });
    }
    dispatcher.queue.splice(0);
    client.util.updateRequestChannelMessage(dispatcher);
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(`${emojis.check} Cleared the queue.`),
      ],
    });
  },
};
