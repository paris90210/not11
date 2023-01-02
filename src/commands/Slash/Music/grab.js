const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "grab",
  category: "Music",
  permission: "",
  description: "Saves the current track to your Direct Messages",
  usage: "",
  cooldown: 5,
  settings: {
    inVoiceChannel: false,
    sameVoiceChannel: false,
    activePlayer: true,
    playingPlayer: true,
    DJonly: false,
    voteRequired: true,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, interaction, dispatcher, emojis }) => {
    interaction.member
      .send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setAuthor({
              name: "Song Saved",
              url: client.settings.links.support,
              iconURL: client.settings.icon,
            })
            .setFooter({
              text: `Message from ${interaction.guild.name}`,
              iconURL: interaction.guild.iconURL({ dynamic: true }),
            })
            .setDescription(
              `[${
                dispatcher.current.title.length > 64
                  ? dispatcher.current.title.substr(0, 64) + "..."
                  : dispatcher.current.title
              }](${dispatcher.current.uri})`
            )
            .addFields(
              {
                name: "Author",
                value: `\`${dispatcher.current.author}\``,
              },
              {
                name: "Duration",
                value: dispatcher.current.isStream
                  ? `\`LIVE\``
                  : `\`${client.util.duration(dispatcher.current.length)}\``,
              },
              {
                name: "Play it",
                value: `\`${client.settings.prefix}play ${dispatcher.current.uri}\``,
              }
            ),
        ],
      })
      .then(() => {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription("📭 Check your DMs."),
          ],
        });
      })
      .catch(() => {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} I can't DM you.`),
          ],
        });
      });
  },
};
