const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "pause",
  category: "Music",
  permission: "",
  description: "Pauses the player",
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
    if (dispatcher.player.paused) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} The player is already paused.`),
        ],
      });
    }
    dispatcher.setPaused(true);
    client.util.updateRequestChannelMessage(dispatcher);
    return interaction.reply({
      ephemeral: false,
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(`⏸️ Paused. Type \`/resume\` to continue playing.`),
      ],
    });
  },
};
