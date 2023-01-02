const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
  name: "join",
  category: "Music",
  permission: "",
  description: "Makes the bot join your voice channel",
  usage: "",
  cooldown: 5,
  settings: {
    inVoiceChannel: true,
    sameVoiceChannel: false,
    activePlayer: false,
    playingPlayer: false,
    DJonly: false,
    voteRequired: false,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, interaction, dispatcher, emojis }) => {
    if (dispatcher && interaction.guild.me.voice.channel) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} I'm already connected in ${
                interaction.guild.channels.cache.has(dispatcher.voice)
                  ? `<@${dispatcher.voice}>`
                  : `\`Unknown Channel\``
              }`
            ),
        ],
      });
    }
    const permissions = interaction.member.voice.channel.permissionsFor(
      message.guild.me
    );
    if (!permissions.has(Permissions.FLAGS.VIEW_CHANNEL)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} I don't have the permission to **view** your voice channel.`
            ),
        ],
      });
    }
    if (!permissions.has(Permissions.FLAGS.CONNECT)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} I don't have the permission to **connect** to your voice channel.`
            ),
        ],
      });
    }
    if (!permissions.has(Permissions.FLAGS.SPEAK)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} I don't have the permission to **speak** in your voice channel.`
            ),
        ],
      });
    }
    if (
      !interaction.guild.me.voice.channel &&
      !interaction.member.voice.channel.joinable
    ) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} I can't join your voice channel because it's full.`
            ),
        ],
      });
    }
    if (!dispatcher) {
      dispatcher = await client.manager.createPlayer({
        guildId: interaction.guild.id,
        voiceId: interaction.member.voice.channel.id,
        textId: interaction.channel.id,
        deaf: true,
      });
      dispatcher.data.set("filter", "none");
    }
    if (!dispatcher.text) dispatcher.setTextChannel(interaction.channel.id);
    return interaction.reply({
      ephemeral: false,
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(
            `${emojis.check} Joined ${interaction.member.voice.channel}`
          ),
      ],
    });
  },
};
