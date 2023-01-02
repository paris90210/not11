const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  Permissions,
} = require("discord.js");

module.exports = {
  name: "volume",
  category: "Music",
  permission: "",
  description: "To check or change the player's volume",
  usage: "[volume]",
  cooldown: 5,
  settings: {
    inVoiceChannel: false,
    sameVoiceChannel: false,
    activePlayer: true,
    playingPlayer: true,
    DJonly: false,
    voteRequired: false,
  },
  options: [
    {
      name: "new-volume",
      description: "Enter the volume amount to set",
      type: 4,
      required: false,
    },
  ],
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, interaction, dispatcher, emojis, guildData }) => {
    const volume = interaction.options.getInteger("new-volume");
    if (!volume) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `The current volume is **${
                dispatcher.player.filters.volume * 100
              }%**`
            ),
        ],
      });
    }
    if (!interaction.member.voice.channel) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} You must be in a voice channel.`),
        ],
      });
    }
    if (
      interaction.guild.me.voice.channel &&
      !interaction.guild.me.voice.channel.equals(
        interaction.member.voice.channel
      )
    )
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} You must be in the same voice channel as ${client.user}.`
            ),
        ],
      });
    if (guildData.djRole) {
      if (
        !interaction.member.roles.cache.has(guildData.djRole) &&
        !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
        interaction.member.voice.channel.members.filter((m) => !m.user.bot)
          .size !== 1 &&
        !client.owners.includes(interaction.member.id)
      ) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You must have the <@&${guildData.djRole}> role.`
              ),
          ],
        });
      }
    }
    if (volume < 1 || volume > 100) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Use the command again, and this time enter a volume amount between \`1 - 100\``
            ),
        ],
      });
    }
    if (dispatcher.player.filters.volume * 100 === volume) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Volume is already set to **${volume}%**`
            ),
        ],
      });
    }
    dispatcher.setVolume(volume);
    client.util.updateRequestChannelMessage(dispatcher);
    return interaction.reply({
      ephemeral: false,
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(
            `${emojis.check} Volume has been set to **${volume}%**`
          ),
      ],
    });
  },
};
