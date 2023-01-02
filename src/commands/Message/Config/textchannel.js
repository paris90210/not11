const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "textchannel",
  aliases: [],
  category: "Config",
  permission: "MANAGE_GUILD",
  cooldown: 5,
  description: "To set/reset the only channel where the bot should work",
  usage: "<set channel> or <reset>",
  settings: {
    ownerOnly: false,
    inVoiceChannel: false,
    sameVoiceChannel: false,
    activePlayer: false,
    playingPlayer: false,
    DJonly: false,
    voteRequired: false,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), message: import("discord.js").Message }}
   */
  run: async ({ client, message, args, emojis, guildData }) => {
    if (!args[0]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Invalid subcommand.\nValid subcommands: \`set\`, \`reset\``
            ),
        ],
      });
    }
    if (args[0].toLowerCase() === "set") {
      if (!args[1]) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} Use the command again, and this time mention or provide the id of a channelh.`
              ),
          ],
        });
      }
      let channel =
        message.mentions.channels.first() ||
        (await message.guild.channels.fetch(args[1]));
      if (!channel) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} Invalid channel.`),
          ],
        });
      }
      if (guildData.botChannel === channel.id) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} The text channel is already set to ${channel}`
              ),
          ],
        });
      }
      guildData.botChannel = channel.id;
      guildData.save();
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.check} Successfully set the text channel to ${channel}`
            ),
        ],
      });
    } else if (args[0].toLowerCase() === "reset") {
      if (!guildData.botChannel) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} There is no text channel set for this server.`
              ),
          ],
        });
      }
      guildData.botChannel = null;
      guildData.save();
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.check} Successfully reset the text channel.`
            ),
        ],
      });
    } else {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Invalid subcommand.\nValid subcommands: \`set\`, \`reset\``
            ),
        ],
      });
    }
  },
};
