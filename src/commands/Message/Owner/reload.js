const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  name: "reload",
  aliases: ["r"],
  category: "Owner",
  permission: "",
  description: "Reloads a command",
  usage: "<type> <command>",
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
  run: async ({ client, message, args, emojis }) => {
    if (!args[0]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Invalid command type.\nValid types: \`message\`, \`slash\``
            ),
        ],
      });
    }
    if (!args[1]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Use the command again, and this time provide the name of the command you want to reload.`
            ),
        ],
      });
    }
    let cmd =
      client.messageCommands.get(args[1].toLowerCase()) ||
      client.messageCommands.find(
        (c) => c.aliases[0] && c.aliases.includes(args[1].toLowerCase())
      );
    if (!cmd) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} Invalid command.`),
        ],
      });
    }
    if (args[0].toLowerCase() === "message") {
      message.channel
        .send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `Would you like to reload the \`${cmd.name}\` command on all clusters or only on cluster **${client.cluster.id}**?`
              ),
          ],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel("All")
                .setStyle("SUCCESS")
                .setCustomId("all"),
              new MessageButton()
                .setLabel(`Cluster ${client.cluster.id}`)
                .setStyle("SECONDARY")
                .setCustomId("this")
            ),
          ],
        })
        .then((msg) => {
          const collector = msg.createMessageComponentCollector({
            time: 90000,
          });
          collector.on("collect", async (b) => {
            if (b.user.id !== message.member.id) {
              return b.reply({
                ephemeral: true,
                content: "These buttons are not for you.",
              });
            }
            if (b.customId === "all") {
              try {
                await client.cluster.broadcastEval(
                  async (c, command) => {
                    delete require.cache[
                      require.resolve(
                        `${process.cwd()}/src/commands/Message/${
                          command.category
                        }/${command.name}`
                      )
                    ];
                    c.messageCommands.delete(command.name);
                    const pull = require(`${process.cwd()}/src/commands/Message/${
                      command.category
                    }/${command.name}`);
                    c.messageCommands.set(command.name, pull);
                  },
                  { context: { name: cmd.name, category: cmd.category } }
                );
                return b.message.edit({
                  content: null,
                  embeds: [
                    new MessageEmbed()
                      .setColor(client.settings.embed_color)
                      .setDescription(
                        `${emojis.check} Successfully reloaded the message commmand \`${cmd.name}\` on all clusters.`
                      ),
                  ],
                  components: [],
                });
              } catch (e) {
                return b.message.edit({
                  content: null,
                  embeds: [
                    new MessageEmbed()
                      .setColor(client.settings.embed_color)
                      .setDescription(
                        `${emojis.cross} Unable to reload the message commmand \`${cmd.name}\`\n${e}`
                      ),
                  ],
                  components: [],
                });
              }
            } else {
              try {
                delete require.cache[
                  require.resolve(
                    `${process.cwd()}/src/commands/Message/${cmd.category}/${
                      cmd.name
                    }`
                  )
                ];
                client.messageCommands.delete(cmd.name);
                const pull = require(`${process.cwd()}/src/commands/Message/${
                  cmd.category
                }/${cmd.name}`);
                client.messageCommands.set(cmd.name, pull);
                return b.message.edit({
                  content: null,
                  embeds: [
                    new MessageEmbed()
                      .setColor(client.settings.embed_color)
                      .setDescription(
                        `${emojis.check} Successfully reloaded the message commmand \`${cmd.name}\` on cluster **${client.cluster.id}**.`
                      ),
                  ],
                  components: [],
                });
              } catch (e) {
                return b.message.edit({
                  content: null,
                  embeds: [
                    new MessageEmbed()
                      .setColor(client.settings.embed_color)
                      .setDescription(
                        `${emojis.cross} Unable to reload the message commmand \`${cmd.name}\`\n${e}`
                      ),
                  ],
                  components: [],
                });
              }
            }
          });
          collector.on("end", (collected) => {
            if (!collected.size) {
              return msg?.edit({
                content: null,
                embeds: [
                  new MessageEmbed()
                    .setColor(client.settings.embed_color)
                    .setDescription(`${emojis.cross} Time's up.`),
                ],
                components: [
                  new MessageActionRow().addComponents(
                    ...msg?.components[0].components.map((c) =>
                      c.setDisabled(true)
                    )
                  ),
                ],
              });
            }
          });
        });
    } else if (args[0].toLowerCase() === "slash") {
      message.channel
        .send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `Would you like to reload the \`${cmd.name}\` command on all clusters or only on cluster **${client.cluster.id}**?`
              ),
          ],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel("All")
                .setStyle("SUCCESS")
                .setCustomId("all"),
              new MessageButton()
                .setLabel(`Cluster ${client.cluster.id}`)
                .setStyle("SECONDARY")
                .setCustomId("this")
            ),
          ],
        })
        .then((msg) => {
          const collector = msg.createMessageComponentCollector({
            time: 90000,
          });
          collector.on("collect", async (b) => {
            if (b.user.id !== message.member.id) {
              return b.reply({
                ephemeral: true,
                content: "These buttons are not for you.",
              });
            }
            if (b.customId === "all") {
              try {
                await client.cluster.broadcastEval(
                  async (c, command) => {
                    delete require.cache[
                      require.resolve(
                        `${process.cwd()}/src/commands/Slash/${
                          command.category
                        }/${command.name}`
                      )
                    ];
                    c.slashCommands.delete(command.name);
                    const pull = require(`${process.cwd()}/src/commands/Slash/${
                      command.category
                    }/${command.name}`);
                    c.slashCommands.set(command.name, pull);
                  },
                  { context: { name: cmd.name, category: cmd.category } }
                );
                return b.message.edit({
                  content: null,
                  embeds: [
                    new MessageEmbed()
                      .setColor(client.settings.embed_color)
                      .setDescription(
                        `${emojis.check} Successfully reloaded the slash commmand \`${cmd.name}\` on all clusters.`
                      ),
                  ],
                  components: [],
                });
              } catch (e) {
                return b.message.edit({
                  content: null,
                  embeds: [
                    new MessageEmbed()
                      .setColor(client.settings.embed_color)
                      .setDescription(
                        `${emojis.cross} Unable to reload the slash commmand \`${cmd.name}\`\n${e}`
                      ),
                  ],
                  components: [],
                });
              }
            } else {
              try {
                delete require.cache[
                  require.resolve(
                    `${process.cwd()}/src/commands/Slash/${cmd.category}/${
                      cmd.name
                    }`
                  )
                ];
                client.slashCommands.delete(cmd.name);
                const pull = require(`${process.cwd()}/src/commands/Slash/${
                  cmd.category
                }/${cmd.name}`);
                client.slashCommands.set(cmd.name, pull);
                return b.message.edit({
                  content: null,
                  embeds: [
                    new MessageEmbed()
                      .setColor(client.settings.embed_color)
                      .setDescription(
                        `${emojis.check} Successfully reloaded the slash commmand \`${cmd.name}\` on cluster **${client.cluster.id}**.`
                      ),
                  ],
                  components: [],
                });
              } catch (e) {
                return b.message.edit({
                  content: null,
                  embeds: [
                    new MessageEmbed()
                      .setColor(client.settings.embed_color)
                      .setDescription(
                        `${emojis.cross} Unable to reload the slash commmand \`${cmd.name}\`\n${e}`
                      ),
                  ],
                  components: [],
                });
              }
            }
          });
          collector.on("end", (collected) => {
            if (!collected.size) {
              return msg?.edit({
                content: null,
                embeds: [
                  new MessageEmbed()
                    .setColor(client.settings.embed_color)
                    .setDescription(`${emojis.cross} Time's up.`),
                ],
                components: [
                  new MessageActionRow().addComponents(
                    ...msg?.components[0].components.map((c) =>
                      c.setDisabled(true)
                    )
                  ),
                ],
              });
            }
          });
        });
    } else {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Invalid command type.\nValid types: \`message\`, \`slash\``
            ),
        ],
      });
    }
  },
};
