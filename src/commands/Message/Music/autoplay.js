const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "autoplay",
  aliases: ["ap"],
  category: "Music",
  permission: "",
  description: "Toggles autoplay on/off",
  usage: "",
  cooldown: 5,
  settings: {
    ownerOnly: false,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    activePlayer: true,
    playingPlayer: true,
    DJonly: false,
    voteRequired: false,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), message: import("discord.js").Message, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, message, dispatcher }) => {
    dispatcher.data.set("autoplay", !dispatcher.data.get("autoplay"));
    client.util.updateRequestChannelMessage(dispatcher);
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(
            `♾️ Autoplay is now ${
              dispatcher.data.get("autoplay") ? "**enabled**" : "**disabled**"
            }.`
          ),
      ],
    });
  },
};
