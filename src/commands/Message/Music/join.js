const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
  name: "join",
  aliases: ["j"],
  category: "Music",
  permission: "",
  description: "Makes the bot join your voice channel",
  usage: "",
  cooldown: 5,
  settings: {
    ownerOnly: false,
    inVoiceChannel: true,
    sameVoiceChannel: false,
    activePlayer: false,
    playingPlayer: false,
    DJonly: false,
    voteRequired: false,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), message: import("discord.js").Message, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, message, dispatcher, emojis }) => {
    if (dispatcher && message.guild.me.voice.channel) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} I'm already connected in ${
                message.guild.channels.cache.has(dispatcher.voice)
                  ? `<@${dispatcher.voice}>`
                  : `\`Unknown Channel\``
              }`
            ),
        ],
      });
    }
    const permissions = message.member.voice.channel.permissionsFor(
      message.guild.me
    );
    if (!permissions.has(Permissions.FLAGS.VIEW_CHANNEL)) {
      return message.channel.send({
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
      return message.channel.send({
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
      return message.channel.send({
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
      !message.guild.me.voice.channel &&
      !message.member.voice.channel.joinable
    ) {
      return message.channel.send({
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
        guildId: message.guild.id,
        voiceId: message.member.voice.channel.id,
        textId: message.channel.id,
        deaf: true,
      });
      dispatcher.data.set("filter", "none");
    }
    if (!dispatcher.text) dispatcher.setTextChannel(message.channel.id);
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(
            `${emojis.check} Joined ${message.member.voice.channel}`
          ),
      ],
    });
  },
};
