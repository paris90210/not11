const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["h", "cmds", "commands", "cmd"],
  category: "Misc",
  permission: "",
  description: "Shows all the bot's commands",
  usage: "[command]",
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
  run: async ({ client, message, args, emojis, guildData }) => {
    if (!args[0]) {
      let commands = null;
      return message.channel
        .send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setAuthor({
                name: "Apera Help",
                url: client.settings.links.support,
              })
              .setFooter({
                text: `Requested by ${message.member.user.tag}`,
                iconURL: message.member.displayAvatarURL(),
              })
              .setTimestamp()
              .setDescription(`Hello ${message.member}, I am ${client.user}

A feature rich and easy-to-use music bot with YouTube, Spotify and SoundCloud support. Find out what I can do using the buttons below.

Music \`:\` List of music related commands
Misc \`:\` List of bot's miscellaneous commands
Config \`:\` List of commands to configure Apera

Select a category from the buttons below.

[Invite](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=2205281600&scope=bot%20applications.commands) • [Support Server](${client.settings.links.support}) • [Vote](https://discordbotlist.com/bots/apera/upvote)`),
          ],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setStyle("SUCCESS")
                .setLabel("Home")
                .setCustomId("home")
                .setDisabled(true),
              new MessageButton()
                .setStyle("PRIMARY")
                .setLabel("Music")
                .setCustomId("music"),
              new MessageButton()
                .setStyle("PRIMARY")
                .setLabel("Misc")
                .setCustomId("misc"),
              new MessageButton()
                .setStyle("PRIMARY")
                .setLabel("Config")
                .setCustomId("config")
            ),
          ],
        })
        .then((msg) => {
          const collector = msg.createMessageComponentCollector({
            time: 60000,
          });
          collector.on("collect", (b) => {
            if (b.customId === "home") {
              b.deferUpdate();
              commands = null;
              return msg.edit({
                embeds: [
                  new MessageEmbed()
                    .setColor(client.settings.embed_color)
                    .setAuthor({
                      name: "Apera Help",
                      url: client.settings.links.support,
                    })
                    .setFooter({
                      text: `Requested by ${message.member.user.tag}`,
                      iconURL: message.member.displayAvatarURL(),
                    })
                    .setTimestamp()
                    .setDescription(`Hello ${message.member}, I am ${client.user}

A feature rich and easy-to-use music bot with YouTube, Spotify and SoundCloud support. Find out what I can do using the buttons below.

Music \`:\` List of music related commands
Misc \`:\` List of bot's miscellaneous commands
Config \`:\` List of commands to configure Apera

Select a category from the buttons below.

[Invite](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=2205281600&scope=bot%20applications.commands) • [Support Server](client.settings.links.support) • [Vote](https://discordbotlist.com/bots/apera/upvote)`),
                ],
                components: [
                  new MessageActionRow().addComponents(
                    msg.components[0].components[0].setDisabled(true),
                    msg.components[0].components[1].setDisabled(false),
                    msg.components[0].components[2].setDisabled(false),
                    msg.components[0].components[3].setDisabled(false)
                  ),
                ],
              });
            } else if (b.customId === "music") {
              b.deferUpdate();
              commands = client.messageCommands
                .filter((c) => c.category === "Music")
                .map((c) => `\`${c.name}\``);
              return msg.edit({
                embeds: [
                  new MessageEmbed()
                    .setColor(client.settings.embed_color)
                    .setAuthor({
                      name: "Music Commands",
                      url: client.settings.links.support,
                    })
                    .setFooter({
                      text: `Total ${commands.length} music commands.`,
                    })
                    .setDescription(commands.join(", ")),
                ],
                components: [
                  new MessageActionRow().addComponents(
                    msg.components[0].components[0].setDisabled(false),
                    msg.components[0].components[1].setDisabled(true),
                    msg.components[0].components[2].setDisabled(false),
                    msg.components[0].components[3].setDisabled(false)
                  ),
                ],
              });
            } else if (b.customId === "misc") {
              b.deferUpdate();
              commands = client.messageCommands
                .filter((c) => c.category === "Misc")
                .map((c) => `\`${c.name}\``);
              return msg.edit({
                embeds: [
                  new MessageEmbed()
                    .setColor(client.settings.embed_color)
                    .setAuthor({
                      name: "Misc Commands",
                      url: client.settings.links.support,
                    })
                    .setFooter({
                      text: `Total ${commands.length} misc commands.`,
                    })
                    .setDescription(commands.join(", ")),
                ],
                components: [
                  new MessageActionRow().addComponents(
                    msg.components[0].components[0].setDisabled(false),
                    msg.components[0].components[1].setDisabled(false),
                    msg.components[0].components[2].setDisabled(true),
                    msg.components[0].components[3].setDisabled(false)
                  ),
                ],
              });
            } else if (b.customId === "config") {
              b.deferUpdate();
              commands = client.messageCommands
                .filter((c) => c.category === "Config")
                .map((c) => `\`${c.name}\``);
              return msg.edit({
                embeds: [
                  new MessageEmbed()
                    .setColor(client.settings.embed_color)
                    .setAuthor({
                      name: "Config Commands",
                      url: client.settings.links.support,
                    })
                    .setFooter({
                      text: `Total ${commands.length} config commands.`,
                    })
                    .setDescription(commands.join(", ")),
                ],
                components: [
                  new MessageActionRow().addComponents(
                    msg.components[0].components[0].setDisabled(false),
                    msg.components[0].components[1].setDisabled(false),
                    msg.components[0].components[2].setDisabled(false),
                    msg.components[0].components[3].setDisabled(true)
                  ),
                ],
              });
            }
          });
          collector.on("end", () => {
            return msg?.edit({
              components: [
                new MessageActionRow().addComponents(
                  ...msg?.components[0].components.map((c) =>
                    c.setDisabled(true)
                  )
                ),
              ],
            });
          });
        });
    }
    let command =
      client.messageCommands.get(args[0].toLowerCase()) ||
      client.messageCommands.find(
        (c) => c.aliases[0] && c.aliases.includes(args[0].toLowerCase())
      );
    if (
      !command ||
      (command.settings.ownerOnly && !client.owners.includes(message.member.id))
    ) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} Unable to find that command.`),
        ],
      });
    }
    let usage = `${guildData.prefix}${command.name} ${
      command.usage ? command.usage : ""
    }`;
    if (args[0].toLowerCase() === "playlist") {
      usage = `${guildData.prefix}playlist addcurrent <playlist-name>,
${guildData.prefix}playlist addqueue <playlist-name>,
${guildData.prefix}playlist create <playlist-name>,
${guildData.prefix}playlist delete <playlist-name>,
${guildData.prefix}playlist view <playlist-name>,
${guildData.prefix}playlist list,
${guildData.prefix}playlist load <playlist-name>,
${guildData.prefix}playlist remove <playlist-name> <track-number>,
${guildData.prefix}playlist shuffle <playlist-name>`;
    }
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setFooter({ text: `Join our support server for more help` })
          .setDescription(
            `\`\`\`fix
- [] = Optional
- <> = Required
- Do not type these when using commands.
\`\`\``
          )
          .addFields(
            {
              name: "Name",
              value: `\`\`\`${command.name}\`\`\``,
              inline: true,
            },
            {
              name: "Description",
              value: `\`\`\`${command.description}\`\`\``,
              inline: true,
            },
            {
              name: "Aliases",
              value: `\`\`\`${
                command.aliases[0]
                  ? `${command.aliases.join(", ")}`
                  : `No aliases`
              }\`\`\``,
              inline: true,
            },
            {
              name: "Category",
              value: `\`\`\`${command.category}\`\`\``,
              inline: true,
            },
            {
              name: "Usage",
              value: `\`\`\`${usage}\`\`\``,
              inline: true,
            },
            {
              name: "Cooldown",
              value: `\`\`\`${command.cooldown} seconds\`\`\``,
              inline: true,
            },
            {
              name: "Permission",
              value: `\`\`\`${
                command.permission
                  ? command.permission
                  : "No specific permission is needed"
              }\`\`\``,
              inline: true,
            }
          ),
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setStyle("LINK")
            .setLabel("Support Server")
            .setURL(client.settings.links.support)
        ),
      ],
    });
  },
};
