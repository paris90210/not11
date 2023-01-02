const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "skip",
  category: "Music",
  permission: "",
  description: "Skips the current track or the provided number of tracks",
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
  options: [
    {
      name: "position",
      description: "Enter the position you would like to skip to",
      type: 4,
      required: false,
    },
  ],
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, interaction, dispatcher, emojis }) => {
    const skipTo = interaction.options.getInteger("position");
    if (!skipTo) {
      dispatcher.player.stopTrack();
      return interaction.reply({
        ephemeral: false,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription("⏭️ Skipped."),
        ],
      });
    }
    if (skipTo <= 1 || skipTo > dispatcher.queue.length) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} Invalid track.`),
        ],
      });
    }
    dispatcher.queue.splice(0, skipTo - 1);
    dispatcher.player.stopTrack();
    return interaction.reply({
      ephemeral: false,
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(`⏭️ Skipped to track **${skipTo}**.`),
      ],
    });
  },
};
