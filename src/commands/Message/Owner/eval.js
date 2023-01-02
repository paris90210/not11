const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  Util: { splitMessage },
} = require("discord.js");
const { inspect } = require("util");

module.exports = {
  name: "eval",
  aliases: ["ev"],
  category: "Owner",
  permission: "",
  description: "Evals the code",
  usage: "<code>",
  cooldown: 5,
  settings: {
    ownerOnly: true,
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
  run: async ({ client, message, args, dispatcher, emojis, guildData }) => {
    const code = args.join(" ");
    if (!code) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Use the command again, and this time provide the code you want to eval.`
            ),
        ],
      });
    }
    try {
      let evaled = await eval(code);
      if (typeof evaled !== "string") {
        evaled = inspect(evaled, { depth: 0 });
      }
      if (evaled.includes(client.settings.token)) {
        evaled = evaled.replace(client.settings.token, "CENSORED");
      }
      if (evaled.includes(client.settings.mongo)) {
        evaled = evaled.replace(client.settings.mongo, "CENSORED");
      }
      const splitDescription = splitMessage(evaled, {
        maxLength: 2000,
        char: `\n`,
        prepend: ``,
        append: ``,
      });
      return message.channel.send({
        content: `\`\`\`js\n${splitDescription[0]}\n\`\`\``,
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setStyle("DANGER")
              .setCustomId("delete")
              .setEmoji("943809726116937748")
          ),
        ],
      });
    } catch (e) {
      return message.channel.send({
        content: `\`\`\`js\n${e}\n\`\`\``,
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setStyle("DANGER")
              .setCustomId("delete")
              .setEmoji("943809726116937748")
          ),
        ],
      });
    }
  },
};
