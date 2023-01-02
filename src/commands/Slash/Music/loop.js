const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "loop",
  category: "Music",
  permission: "",
  description: "Loops the current track or queue",
  usage: "",
  cooldown: 5,
  settings: {
    inVoiceChannel: true,
    sameVoiceChannel: true,
    activePlayer: true,
    playingPlayer: true,
    DJonly: true,
    voteRequired: true,
  },
  options: [
    {
      name: "mode",
      description: "What do you want to loop?",
      type: 3,
      required: true,
      choices: [
        { name: "Track", value: "track" },
        { name: "Queue", value: "queue" },
      ],
    },
  ],
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, interaction, dispatcher }) => {
    let mode = interaction.options.getString("mode");
    if (mode === "track") {
      if (dispatcher.loop !== "track") {
        dispatcher.setLoop("track");
        client.util.updateRequestChannelMessage(dispatcher);
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription("🔁 Track loop is now **enabled**."),
          ],
        });
      } else {
        dispatcher.setLoop("off");
        client.util.updateRequestChannelMessage(dispatcher);
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription("🔁 Track loop is now **disabled**."),
          ],
        });
      }
    } else if (mode === "queue") {
      if (dispatcher.loop !== "queue") {
        dispatcher.setLoop("queue");
        client.util.updateRequestChannelMessage(dispatcher);
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription("🔁 Queue loop is now **enabled**."),
          ],
        });
      } else {
        dispatcher.setLoop("off");
        client.util.updateRequestChannelMessage(dispatcher);
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription("🔁 Queue loop is now **disabled**."),
          ],
        });
      }
    }
  },
};
