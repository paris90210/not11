const { MessageEmbed } = require("discord.js");
const settings = require("../../../../settings");

module.exports = {
  name: "prefix",
  aliases: [],
  category: "Config",
  permission: "MANAGE_GUILD",
  cooldown: 5,
  description: "To set/reset the prefix of your server",
  usage: "<set symbol> or <reset>",
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
      let prefix = args.slice(1).join(" ");
      if (!prefix) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} Use the command again, and this time provide the prefix you want to set.`
              ),
          ],
        });
      }
      if (prefix.length > 5) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} The prefix's length shouldn't be longer than **5**.`
              ),
          ],
        });
      }
      if (guildData.prefix === prefix) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} The prefix is already set to \`${prefix}\`.`
              ),
          ],
        });
      }
      guildData.prefix = prefix;
      guildData.save();
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.check} Successfully set the new prefix to \`${prefix}\`.`
            ),
        ],
      });
    } else if (args[0].toLowerCase() === "reset") {
      if (guildData.prefix === settings.prefix) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} There is no custom prefix set for this server.`
              ),
          ],
        });
      }
      guildData.prefix = settings.prefix;
      guildData.save();
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.check} Successfully reset the prefix to \`${settings.prefix}\`.`
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
