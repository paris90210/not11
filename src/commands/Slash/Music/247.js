const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
  name: "247",
  category: "Music",
  permission: "MANAGE_GUILD",
  description: "Toggles the 24/7 mode on/off",
  usage: "",
  cooldown: 5,
  settings: {
    inVoiceChannel: false,
    sameVoiceChannel: false,
    activePlayer: false,
    playingPlayer: false,
    DJonly: false,
    voteRequired: false,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, interaction, dispatcher, emojis, guildData }) => {
    if (!guildData.twentyFourSeven.enabled) {
      if (!interaction.member.voice.channel) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You must be in a voice channel.`
              ),
          ],
        });
      }
      const permissions = interaction.member.voice.channel.permissionsFor(
        interaction.guild.me
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
      guildData.twentyFourSeven.enabled = true;
      guildData.twentyFourSeven.textChannel = interaction.channel.id;
      guildData.twentyFourSeven.voiceChannel = interaction.member.voice.channel.id;
      guildData.save();
      if (!dispatcher) {
        dispatcher = await client.manager.createPlayer({
          guildId: message.guild.id,
          voiceId: message.member.voice.channel.id,
          textId: message.channel.id,
          deaf: true,
        });
        dispatcher.data.set("filter", "none");
      }
    } else {
      guildData.twentyFourSeven.enabled = false;
      guildData.twentyFourSeven.textChannel = null;
      guildData.twentyFourSeven.voiceChannel = null;
      guildData.save();
      if (dispatcher && !dispatcher.current) {
        setTimeout(() => dispatcher.destroy(), 150);
      }
    }
    return interaction.reply({
      ephemeral: false,
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(
            `${emojis.check} 24/7 mode is now ${
              guildData.twentyFourSeven.enabled ? "**enabled**" : "**disabled**"
            }`
          ),
      ],
    });
  },
};
