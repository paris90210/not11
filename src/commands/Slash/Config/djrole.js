const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "djrole",
  category: "Config",
  permission: "MANAGE_GUILD",
  cooldown: 5,
  description: "To set/reset the dj role of your server",
  usage: "<set role> or <reset>",
  settings: {
    inVoiceChannel: false,
    sameVoiceChannel: false,
    activePlayer: false,
    playingPlayer: false,
    DJonly: false,
    voteRequired: false,
  },
  options: [
    {
      name: "set",
      description: "Let's you set or change the dj role of your server",
      type: 1,
      options: [
        {
          name: "role",
          description: "Choose the role that you want dj's to have",
          type: 8,
          required: true,
        },
      ],
    },
    {
      name: "reset",
      description: "Resets the dj role of your server",
      type: 1,
    },
  ],
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction }}
   */
  run: async ({ client, interaction, emojis, guildData }) => {
    let subcommand = interaction.options.getSubcommand();
    if (subcommand === "set") {
      let role = interaction.options.getRole("role");
      if (["@everyone", "@here"].includes(role.name)) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} Invalid role.`),
          ],
        });
      }
      if (guildData.djRole === role.id) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} The dj role is already set to <@&${role.id}>.`
              ),
          ],
        });
      }
      guildData.djRole = role.id;
      guildData.save();
      return interaction.reply({
        ephemeral: false,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.check} Successfully set the dj role to <@&${role.id}>.`
            ),
        ],
      });
    } else if (subcommand === "reset") {
      if (!guildData.djRole) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} There is no dj role set for this server.`
              ),
          ],
        });
      }
      guildData.djRole = null;
      guildData.save();
      return interaction.reply({
        ephemeral: false,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.check} Successfully reset the dj role.`),
        ],
      });
    }
  },
};
