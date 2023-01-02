const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "remove",
  category: "Music",
  permission: "",
  description: "Removes a song from the queue",
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
      name: "track",
      description: "Track's number which you would like to remove",
      type: 4,
      required: true,
    },
  ],
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, interaction, dispatcher, emojis }) => {
    let toremove = interaction.options.getInteger("track");
    if (toremove > dispatcher.queue.length) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} Invalid track.`),
        ],
      });
    }
    dispatcher.queue.splice(toremove - 1);
    client.util.updateRequestChannelMessage(dispatcher);
    return interaction.reply({
      ephemeral: false,
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(
            `${emojis.check} Removed track **${toremove}** from the queue.`
          ),
      ],
    });
  },
};
