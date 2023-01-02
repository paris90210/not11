const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "loop",
  aliases: ["l", "repeat"],
  category: "Music",
  permission: "",
  description: "Loops the current track or queue",
  usage: "",
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
              `${emojis.cross} Invalid loop method.\nValid methods: \`track\`, \`queue\``
            ),
        ],
      });
    }
    if (
      args[0].toLowerCase() === "song" ||
      args[0].toLowerCase() === "s" ||
      args[0].toLowerCase() === "track" ||
      args[0].toLowerCase() === "t"
    ) {
      if (dispatcher.loop !== "track") {
        dispatcher.setLoop("track");
        client.util.updateRequestChannelMessage(dispatcher);
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription("🔁 Track loop is now **enabled**."),
          ],
        });
      } else {
        dispatcher.setLoop("off");
        client.util.updateRequestChannelMessage(dispatcher);
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription("🔁 Track loop is now **disabled**."),
          ],
        });
      }
    } else if (
      args[0].toLowerCase() === "queue" ||
      args[0].toLowerCase() === "q"
    ) {
      if (dispatcher.loop !== "queue") {
        dispatcher.setLoop("queue");
        client.util.updateRequestChannelMessage(dispatcher);
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription("🔁 Queue loop is now **enabled**."),
          ],
        });
      } else {
        dispatcher.setLoop("off");
        client.util.updateRequestChannelMessage(dispatcher);
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription("🔁 Queue loop is now **disabled**."),
          ],
        });
      }
    } else {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Invalid loop method.\nValid methods: \`track\`, \`queue\``
            ),
        ],
      });
    }
  },
};
