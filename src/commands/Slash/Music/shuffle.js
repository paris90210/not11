const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "shuffle",
  category: "Music",
  permission: "",
  description: "Shuffles the queue",
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
    if (dispatcher.queue.length < 3) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Not enough songs in the queue to shuffle.`
            ),
        ],
      });
    }
    dispatcher.shuffle();
    client.util.updateRequestChannelMessage(dispatcher);
    return interaction.reply({
      ephemeral: false,
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription("🔀 Shuffled the queue."),
      ],
    });
  },
};
