const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "nowplaying",
  category: "Music",
  permission: "",
  description: "Shows what's currently playing",
  usage: "",
  cooldown: 5,
  settings: {
    inVoiceChannel: false,
    sameVoiceChannel: false,
    activePlayer: true,
    playingPlayer: true,
    DJonly: false,
    voteRequired: false,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, interaction, dispatcher }) => {
    const progressbar = () => {
      const percentage = dispatcher.player.position / dispatcher.current.length;
      const progress = Math.round(25 * percentage);
      const emptyProgress = 25 - progress;
      const progressText = "▰".repeat(progress);
      const emptyProgressText = "▱".repeat(emptyProgress);
      return progressText + emptyProgressText;
    };
    return interaction.reply({
      ephemeral: true,
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setDescription(
            `🎵 **Now Playing**\n\n[${
              dispatcher.current.title.length > 64
                ? dispatcher.current.title.substr(0, 64) + "..."
                : dispatcher.current.title
            }](${dispatcher.current.uri}) - [${
              dispatcher.current.requester
            }]\n\n${progressbar()} \`[${client.util.duration(
              dispatcher.player.position
            )}/${client.util.duration(dispatcher.current.length)}]\``
          ),
      ],
    });
  },
};
