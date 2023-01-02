const { MessageEmbed } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");

module.exports = {
  name: "node",
  aliases: [],
  category: "Misc",
  permission: "",
  description: "Shows the audio node's statistics",
  usage: "",
  cooldown: 5,
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
  run: async ({ client, message }) => {
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setAuthor({
            name: "Node Statistics",
            url: client.settings.links.support,
          })
          .setDescription(
            `\`\`\`nim\n${[...client.manager.shoukaku.nodes.values()]
              .map(
                (node) =>
                  `Node         :: ${node.state === 1 ? "🟢" : "🔴"} ${
                    node.name
                  }
Memory Usage :: ${client.util.formatBytes(
                    node.stats.memory.allocated
                  )} - ${node.stats.cpu.lavalinkLoad.toFixed(2)}%
Connections  :: ${client.manager.players.size}
Uptime       :: ${
                    node.state === 1
                      ? moment(node.stats.uptime).format(
                          "D[ days], H[ hours], M[ minutes], S[ seconds]"
                        )
                      : "0 days, 0 hours, 0 minutes, 0 seconds"
                  }
`
              )
              .join(
                "\n\n------------------------------------------------------------\n\n"
              )}\`\`\``
          ),
      ],
    });
  },
};
