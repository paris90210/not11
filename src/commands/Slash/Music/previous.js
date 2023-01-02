const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "previous",
  category: "Music",
  permission: "",
  description: "Plays the previous track",
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
  run: async ({ client, interaction, dispatcher, emojis }) => {
    if (!dispatcher.previous) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} There is no previous track.`),
        ],
      });
    }
    dispatcher.queue.unshift(dispatcher.previous);
    dispatcher.player.stopTrack();
    return interaction.reply({
      ephemeral: false,
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(`⏮️ Skipped to the previous track.`),
      ],
    });
  },
};
