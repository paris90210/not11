const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  Permissions,
} = require("discord.js");

module.exports = {
  name: "volume",
  aliases: ["vol"],
  category: "Music",
  permission: "",
  description: "To check or change the player's volume",
  usage: "[volume]",
  cooldown: 5,
  settings: {
    ownerOnly: false,
    inVoiceChannel: false,
    sameVoiceChannel: false,
    activePlayer: true,
    playingPlayer: true,
    DJonly: false,
    voteRequired: false,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), message: import("discord.js").Message, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, message, args, dispatcher, emojis, guildData }) => {
    if (!args[0]) {
      return message.channel.send({
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
    if (!message.member.voice.channel) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} You must be in a voice channel.`),
        ],
      });
    }
    if (
      message.guild.me.voice.channel &&
      !message.guild.me.voice.channel.equals(message.member.voice.channel)
    ) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} You must be in the same voice channel as ${client.user}.`
            ),
        ],
      });
    }
    if (guildData.djRole) {
      if (
        !message.member.roles.cache.has(guildData.djRole) &&
        !message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
        message.member.voice.channel.members.filter((m) => !m.user.bot).size !==
          1 &&
        !client.owners.includes(message.member.id)
      ) {
        return message.channel.send({
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
  
    if (args[0] < 1 || args[0] > 100) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Use the command again, and this time enter a volume amount between \`1 - 100\``
            ),
        ],
      });
    }
    if (dispatcher.player.filters.volume * 100 === args[0]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Volume is already **${args[0]}%**`
            ),
        ],
      });
    }
    dispatcher.setVolume(args[0]);
    client.util.updateRequestChannelMessage(dispatcher);
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(
            `${emojis.check} Volume has been set to **${args[0]}%**`
          ),
      ],
    });
  },
};
