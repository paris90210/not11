const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "disconnect",
  aliases: ["dc", "stop", "leave", "destroy"],
  category: "Music",
  permission: "",
  description: "Disconnects me from the voice channel",
  usage: "",
  cooldown: 5,
  settings: {
    ownerOnly: false,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    activePlayer: true,
    playingPlayer: false,
    DJonly: true,
    voteRequired: false,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), message: import("discord.js").Message, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, message, dispatcher }) => {
    dispatcher.destroy();
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription("⏹️ Destroyed the player."),
      ],
    });
  },
};
