const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "replay",
  category: "Music",
  permission: "",
  description: "Replays the current track",
  usage: "",
  cooldown: 5,
  settings: {
    inVoiceChannel: true,
    sameVoiceChannel: true,
    activePlayer: true,
    playingPlayer: true,
    DJonly: true,
    voteRequired: false,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, interaction, dispatcher }) => {
    dispatcher.setPaused(true);
    dispatcher.player.seekTo(0);
    setTimeout(() => dispatcher.setPaused(false), 150);
    return interaction.reply({
      ephemeral: false,
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(`🔃 Replaying the current track.`),
      ],
    });
  },
};
