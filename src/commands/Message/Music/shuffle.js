const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "shuffle",
  aliases: ["mix"],
  category: "Music",
  permission: "",
  description: "Shuffles the queue",
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
    if (dispatcher.queue.length < 3) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Not enough songs in the queue to shuffle.`
            ),
        ],
      });
    }
    dispatcher.shuffle();
    client.util.updateRequestChannelMessage(dispatcher);
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription("🔀 Shuffled the queue."),
      ],
    });
  },
};
