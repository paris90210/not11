const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "autoplay",
  category: "Music",
  permission: "",
  description: "Toggles autoplay on/off",
  usage: "",
  cooldown: 5,
  settings: {
    inVoiceChannel: true,
    sameVoiceChannel: true,
    activePlayer: true,
    playingPlayer: true,
    DJonly: false,
    voteRequired: false,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, interaction, dispatcher }) => {
    dispatcher.data.set("autoplay", !dispatcher.data.get("autoplay"));
    client.util.updateRequestChannelMessage(dispatcher);
    return interaction.reply({
      ephemeral: false,
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
