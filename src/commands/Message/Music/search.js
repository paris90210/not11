const {
  MessageEmbed,
  MessageSelectMenu,
  MessageActionRow,
  Permissions,
} = require("discord.js");
const { Spotify } = require("spotify-info.js");
const spotify = new Spotify({
  clientID: "e49c05eb12e14f49b1d63f7be0bb4b7c", // replace with your details,
  clientSecret: "ec4be40f84914618a36906a1a4fafa48",
});

module.exports = {
  name: "search",
  aliases: ["se"],
  category: "Music",
  permission: "",
  description: "Searches a song",
  usage: "<track name>",
  cooldown: 5,
  settings: {
    ownerOnly: false,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    activePlayer: false,
    playingPlayer: false,
    DJonly: false,
    voteRequired: false,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), message: import("discord.js").Message, player: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, message, args, dispatcher, emojis, guildData }) => {
    if (!args[0]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Use the command again, and this time provide a search query.`
            ),
        ],
      });
    }
    const permissions = message.member.voice.channel.permissionsFor(
      message.guild.me
    );
    if (!permissions.has(Permissions.FLAGS.VIEW_CHANNEL)) {
      return message.channel.send({
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
      return message.channel.send({
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
      return message.channel.send({
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
      !message.guild.me.voice.channel &&
      !message.member.voice.channel.joinable
    ) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} I can't join your voice channel because it's full.`
            ),
        ],
      });
    }
    if (
      /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(
        args.join(" ")
      )
    ) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Please use the \`${guildData.prefix}play\` command to use a url as the search query.`
            ),
        ],
      });
    }
    const searchedtracks = await spotify.searchTrack(args.join(" "), {
      limit: 10,
    });
    if (!searchedtracks[0]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} No songs found.`),
        ],
      });
    }
    let emojiarray = [
      "1️⃣",
      "2️⃣",
      "3️⃣",
      "4️⃣",
      "5️⃣",
      "6️⃣",
      "7️⃣",
      "8️⃣",
      "9️⃣",
      "🔟",
    ];
    let songoptions = [
      emojiarray.map((emoji, index) => {
        return {
          value: `${index}`,
          label: searchedtracks[index].name,
          description: searchedtracks[index].artists[0].name,
          emoji,
        };
      }),
    ];
    let selection = new MessageSelectMenu()
      .setCustomId("search")
      .setPlaceholder("Nothing selected")
      .setMaxValues(10)
      .addOptions(songoptions);
    message.channel
      .send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              "Select the tracks you want to add to the queue by the menu below."
            ),
        ],
        components: [new MessageActionRow().addComponents(selection)],
      })
      .then((msg) => {
        const collector = msg.createMessageComponentCollector({ time: 90000 });
        collector.on("collect", async (menu) => {
          if (menu.user.id !== message.member.id) {
            return menu.reply({
              ephemeral: true,
              content: "This menu is not for you.",
            });
          }
          if (!message.member.voice.channel) {
            return menu.reply({
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
          if (
            message.guild.me.voice.channel &&
            !message.guild.me.voice.channel.equals(message.member.voice.channel)
          ) {
            return menu.reply({
              ephemeral: true,
              embeds: [
                new MessageEmbed()
                  .setColor(client.settings.embed_color)
                  .setDescription(
                    `${emojis.cross} You must be in the same voice channel as ${client.user}.`
                  ),
              ],
            });
          }
          menu.deferUpdate();
          if (!dispatcher) {
            dispatcher = await client.manager.createPlayer({
              guildId: message.guild.id,
              voiceId: message.member.voice.channel.id,
              textId: message.channel.id,
              deaf: true,
            });
            dispatcher.data.set("filter", "none");
          }
          let trackstoadd = [];
          if (!dispatcher.text) dispatcher.setTextChannel(message.channel.id);
          for (const value of menu.values) {
            const { tracks } = await dispatcher.search(
              searchedtracks[value].external_urls.spotify,
              message.member
            );
            trackstoadd.push(tracks[0]);
          }
          for (const track of trackstoadd) {
            dispatcher.addSong(track);
          }
          client.util.updateRequestChannelMessage(dispatcher);
          if (!dispatcher.current) dispatcher.play();
          msg.edit({
            components: [],
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(
                  `Queued ${
                    menu.values.length === 1
                      ? `[${
                          trackstoadd[menu.values[0]].title.length > 64
                            ? trackstoadd[menu.values[0]].title.substr(0, 64) +
                              "..."
                            : trackstoadd[menu.values[0]].title
                        }](${trackstoadd[menu.values[0]].uri}) [${
                          message.member
                        }]`
                      : `**${menu.values.length}** tracks`
                  }`
                ),
            ],
          });
        });
        collector.on("end", (collected) => {
          if (!collected.size) {
            return msg?.edit({
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
  },
};
