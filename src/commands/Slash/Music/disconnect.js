const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "disconnect",
  category: "Music",
  permission: "",
  description: "Disconnects me from the voice channel",
  usage: "",
  cooldown: 5,
  settings: {
    inVoiceChannel: true,
    sameVoiceChannel: true,
    activePlayer: true,
    playingPlayer: false,
    DJonly: true,
    voteRequired: false,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, interaction, dispatcher }) => {
    dispatcher.destroy();
    return interaction.reply({
      ephemeral: false,
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription("⏹️ Destroyed the player."),
      ],
    });
  },
};
