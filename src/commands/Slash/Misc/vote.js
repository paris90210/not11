const { MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  name: "vote",
  category: "Misc",
  permission: "",
  description: "Gives you the link to vote the bot",
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
   * @param {{ interaction: import("discord.js").CommandInteraction }}
   */
  run: async ({ interaction }) => {
    return interaction.reply({
      ephemeral: true,
      content: "\u200b",
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setStyle("LINK")
            .setLabel("Vote")
            .setURL("https://discordbotlist.com/bots/apera/upvote")
        ),
      ],
    });
  },
};
