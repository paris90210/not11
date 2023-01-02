const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "seek",
  aliases: [],
  category: "Music",
  permission: "",
  description: "Seeks to a specific time in the track playing",
  usage: "<time>",
  cooldown: 5,
  settings: {
    ownerOnly: false,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    activePlayer: true,
    playingPlayer: true,
    DJonly: true,
    voteRequired: true,
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
              `${emojis.cross} Use the command again, and this provide a duration to seek.`
            ),
        ],
      });
    }
    if (!dispatcher.current.isSeekable) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} This track isn't seekable.`),
        ],
      });
    }
    if (!/^[0-5]?[0-9](:[0-5][0-9]){1,2}$/.test(args[0])) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} You provided an invalid duration. Valid duration e.g. \`2:42\``
            ),
        ],
      });
    }
    let ms = () => {
      return (
        args[0]
          .split(":")
          .map(Number)
          .reduce((a, b) => a * 60 + b, 0) * 1000
      );
    };
    ms = ms();
    if (ms > dispatcher.current.length) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} The duration you provided exceeds the duration of the current track.`
            ),
        ],
      });
    }
    dispatcher.player.seekTo(ms);
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(
            `${emojis.check} Seeked to \`${args[0]}\``
          ),
      ],
    });
  },
};
