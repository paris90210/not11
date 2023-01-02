const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "remove",
  aliases: ["rm"],
  category: "Music",
  permission: "",
  description: "Removes a song from the queue",
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
  run: async ({ client, message, args, dispatcher, emojis }) => {
    if (!args[0]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Use the command again, and this time provide the position of the track you want to remove.`
            ),
        ],
      });
    }
    if (isNaN(args[0]) || args[0] > dispatcher.queue.length) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} Invalid track.`),
        ],
      });
    }
    dispatcher.queue.splice(args[0] - 1);
    client.util.updateRequestChannelMessage(dispatcher);
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(
            `${emojis.check} Removed track **${args[0]}** from the queue.`
          ),
      ],
    });
  },
};
