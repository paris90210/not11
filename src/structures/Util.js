const {
  Collection,
  CommandInteraction,
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  Permissions,
} = require("discord.js");
const prettyMilliseconds = require("pretty-ms");
const guildSchema = require("../models/Guild");
const { Spotify } = require("spotify-info.js");
const spotify = new Spotify({
  clientID: "e49c05eb12e14f49b1d63f7be0bb4b7c", // replace with your details,
  clientSecret: "ec4be40f84914618a36906a1a4fafa48",
});
let client;

class Util {
  constructor(c) {
    client = c;
  }
  async autoplay(dispatcher) {
    const searchedtracks = await spotify.searchTrack(
      dispatcher.data.get("trackforautoplayfunction").author,
      {
        limit: 10,
      }
    );
    if (!searchedtracks[0]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${
                client.guilds.cache
                  .get(dispatcher.guild)
                  .me.permissions.has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS) &&
                client.channels.cache
                  .get(dispatcher.textChannel)
                  .permissionsFor(message.guild.me)
                  .has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS) &&
                client.guilds.cache
                  .get(dispatcher.guild)
                  .roles.everyone.permissions.has(
                    Permissions.FLAGS.USE_EXTERNAL_EMOJIS
                  ) &&
                client.channels.cache
                  .get(dispatcher.textChannel)
                  .permissionsFor(
                    client.guilds.cache.get(dispatcher.guild).roles.everyone
                  )
                  .has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS)
                  ? "<:cross:944263125333573694>"
                  : "❌"
              } Unable to autoplay from the previous track. Destroyed the player.`
            ),
        ],
      });
    }
    const url =
      searchedtracks[
        Math.floor(Math.random() * Math.floor(searchedtracks.length))
      ].external_urls.spotify;
    const { tracks } = await dispatcher.search(
      url,
      client.guilds.cache.get(dispatcher.guild).me
    );
    dispatcher.addSong(tracks[0]);
    return dispatcher.play();
  }

  cooldown(member, command) {
    if (!client.cooldowns.has(command.name)) {
      client.cooldowns.set(command.name, new Collection());
    }
    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount = command.cooldown * 1000;
    if (timestamps.has(member)) {
      const expirationTime = timestamps.get(member) + cooldownAmount;
      if (Date.now() < expirationTime) {
        const timeLeft = (expirationTime - Date.now()) / 1000;
        return Math.round(timeLeft) + 1 === 1
          ? "a second"
          : `${Math.round(timeLeft) + 1} seconds`;
      } else {
        timestamps.set(member, Date.now());
        setTimeout(() => timestamps.delete(member), cooldownAmount);
      }
    } else {
      timestamps.set(member, Date.now());
      setTimeout(() => timestamps.delete(member), cooldownAmount);
    }
  }

  duration(ms) {
    return prettyMilliseconds(ms, {
      colonNotation: true,
      secondsDecimalDigits: 0,
    });
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    return `${(
      bytes / Math.pow(1024, Math.floor(Math.log(bytes) / Math.log(1024)))
    ).toFixed(2)} ${sizes[Math.floor(Math.log(bytes) / Math.log(1024))]}`;
  }

  async getChannel(channelId) {
    let channels = await client.cluster.broadcastEval(
      async (c, ctx) => {
        let channel = await c.channels.fetch(ctx);
        if (channel) {
          return channel;
        } else {
          return null;
        }
      },
      { context: channelId }
    );
    for (let i = 0; i < channels.length; i++) {
      if (channels[i]) return channels[i];
    }
  }

  async getGuild(guildId) {
    let guilds = await client.cluster.broadcastEval(
      async (c, ctx) => {
        let guild = await c.guilds.fetch(ctx);
        if (guild) {
          return guild;
        } else {
          return null;
        }
      },
      { context: guildId }
    );
    for (let i = 0; i < guilds.length; i++) {
      if (guilds[i]) return guilds[i];
    }
  }

  async getUser(userId) {
    let users = await client.cluster.broadcastEval(
      async (c, ctx) => {
        let user = await c.users.fetch(ctx);
        if (user) {
          return user;
        } else {
          return null;
        }
      },
      { context: userId }
    );
    for (let i = 0; i < users.length; i++) {
      if (users[i]) return users[i];
    }
  }

  async pagination(ctx, embeds) {
    let currentPage = 0;
    if (ctx instanceof CommandInteraction) {
      ctx
        .reply({
          ephemeral: true,
          fetchReply: true,
          embeds: [
            new MessageEmbed(embeds[0]).setFooter({
              text: `Page 1/${embeds.length}`,
            }),
          ],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setStyle("SECONDARY")
                .setCustomId("1")
                .setLabel("First")
                .setDisabled(true),
              new MessageButton()
                .setStyle("SECONDARY")
                .setCustomId("2")
                .setLabel("Back")
                .setDisabled(true),
              new MessageButton()
                .setStyle("SECONDARY")
                .setCustomId("3")
                .setLabel("Next"),
              new MessageButton()
                .setStyle("SECONDARY")
                .setCustomId("4")
                .setLabel("Last")
            ),
          ],
        })
        .then((message) => {
          const collector = message.createMessageComponentCollector({
            time: 300000,
          });
          collector.on("collect", (b) => {
            if (b.user.id !== ctx.member.id) {
              return b.reply({
                ephemeral: true,
                content: "These buttons are not for you.",
              });
            }
            b.deferUpdate();
            switch (b.customId) {
              case "1": {
                currentPage = 0;
                return ctx.editReply({
                  embeds: [
                    new MessageEmbed(embeds[currentPage]).setFooter({
                      text: `Page 1/${embeds.length}`,
                    }),
                  ],
                  components: [
                    new MessageActionRow().addComponents(
                      message.components[0].components[0].setDisabled(true),
                      message.components[0].components[1].setDisabled(true),
                      message.components[0].components[2].setDisabled(false),
                      message.components[0].components[3].setDisabled(false)
                    ),
                  ],
                });
              }
              case "2": {
                --currentPage;
                return ctx.editReply({
                  embeds: [
                    new MessageEmbed(embeds[currentPage]).setFooter({
                      text: `Page ${currentPage + 1}/${embeds.length}`,
                    }),
                  ],
                  components: [
                    currentPage === 0
                      ? new MessageActionRow().addComponents(
                          message.components[0].components[0].setDisabled(true),
                          message.components[0].components[1].setDisabled(true),
                          message.components[0].components[2].setDisabled(
                            false
                          ),
                          message.components[0].components[3].setDisabled(false)
                        )
                      : new MessageActionRow().addComponents(
                          ...message.components[0].components.map((c) =>
                            c.setDisabled(false)
                          )
                        ),
                  ],
                });
              }
              case "3": {
                currentPage++;
                return ctx.editReply({
                  embeds: [
                    new MessageEmbed(embeds[currentPage]).setFooter({
                      text: `Page ${currentPage + 1}/${embeds.length}`,
                    }),
                  ],
                  components: [
                    currentPage === embeds.length - 1
                      ? new MessageActionRow().addComponents(
                          message.components[0].components[0].setDisabled(
                            false
                          ),
                          message.components[0].components[1].setDisabled(
                            false
                          ),
                          message.components[0].components[2].setDisabled(true),
                          message.components[0].components[3].setDisabled(true)
                        )
                      : new MessageActionRow().addComponents(
                          ...message.components[0].components.map((c) =>
                            c.setDisabled(false)
                          )
                        ),
                  ],
                });
              }
              case "4": {
                currentPage = embeds.length - 1;
                return ctx.editReply({
                  embeds: [
                    new MessageEmbed(embeds[currentPage]).setFooter({
                      text: `Page ${currentPage + 1}/${embeds.length}`,
                    }),
                  ],
                  components: [
                    new MessageActionRow().addComponents(
                      message.components[0].components[0].setDisabled(false),
                      message.components[0].components[1].setDisabled(false),
                      message.components[0].components[2].setDisabled(true),
                      message.components[0].components[3].setDisabled(true)
                    ),
                  ],
                });
              }
            }
            collector.on("end", () => {
              return ctx?.editReply({
                components: [
                  new MessageActionRow().addComponents(
                    ...message?.components[0].components.map((c) =>
                      c.setDisabled(true)
                    )
                  ),
                ],
              });
            });
          });
        });
    } else {
      ctx.channel
        .send({
          embeds: [
            new MessageEmbed(embeds[0]).setFooter({
              text: `Page 1/${embeds.length}`,
            }),
          ],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setStyle("SECONDARY")
                .setCustomId("1")
                .setLabel("First")
                .setDisabled(true),
              new MessageButton()
                .setStyle("SECONDARY")
                .setCustomId("2")
                .setLabel("Back")
                .setDisabled(true),
              new MessageButton()
                .setStyle("SECONDARY")
                .setCustomId("3")
                .setLabel("Next"),
              new MessageButton()
                .setStyle("SECONDARY")
                .setCustomId("4")
                .setLabel("Last")
            ),
          ],
        })
        .then((message) => {
          const collector = message.createMessageComponentCollector({
            time: 300000,
          });
          collector.on("collect", (b) => {
            if (b.user.id !== ctx.member.id) {
              return b.reply({
                ephemeral: true,
                content: "These buttons are not for you.",
              });
            }
            b.deferUpdate();
            switch (b.customId) {
              case "1": {
                currentPage = 0;
                return message.edit({
                  embeds: [
                    new MessageEmbed(embeds[currentPage]).setFooter({
                      text: `Page 1/${embeds.length}`,
                    }),
                  ],
                  components: [
                    new MessageActionRow().addComponents(
                      message.components[0].components[0].setDisabled(true),
                      message.components[0].components[1].setDisabled(true),
                      message.components[0].components[2].setDisabled(false),
                      message.components[0].components[3].setDisabled(false)
                    ),
                  ],
                });
              }
              case "2": {
                --currentPage;
                return message.edit({
                  embeds: [
                    new MessageEmbed(embeds[currentPage]).setFooter({
                      text: `Page ${currentPage + 1}/${embeds.length}`,
                    }),
                  ],
                  components: [
                    currentPage === 0
                      ? new MessageActionRow().addComponents(
                          message.components[0].components[0].setDisabled(true),
                          message.components[0].components[1].setDisabled(true),
                          message.components[0].components[2].setDisabled(
                            false
                          ),
                          message.components[0].components[3].setDisabled(false)
                        )
                      : new MessageActionRow().addComponents(
                          ...message.components[0].components.map((c) =>
                            c.setDisabled(false)
                          )
                        ),
                  ],
                });
              }
              case "3": {
                currentPage++;
                return message.edit({
                  embeds: [
                    new MessageEmbed(embeds[currentPage]).setFooter({
                      text: `Page ${currentPage + 1}/${embeds.length}`,
                    }),
                  ],
                  components: [
                    currentPage === embeds.length - 1
                      ? new MessageActionRow().addComponents(
                          message.components[0].components[0].setDisabled(
                            false
                          ),
                          message.components[0].components[1].setDisabled(
                            false
                          ),
                          message.components[0].components[2].setDisabled(true),
                          message.components[0].components[3].setDisabled(true)
                        )
                      : new MessageActionRow().addComponents(
                          ...message.components[0].components.map((c) =>
                            c.setDisabled(false)
                          )
                        ),
                  ],
                });
              }
              case "4": {
                currentPage = embeds.length - 1;
                return message.edit({
                  embeds: [
                    new MessageEmbed(embeds[currentPage]).setFooter({
                      text: `Page ${currentPage + 1}/${embeds.length}`,
                    }),
                  ],
                  components: [
                    new MessageActionRow().addComponents(
                      message.components[0].components[0].setDisabled(false),
                      message.components[0].components[1].setDisabled(false),
                      message.components[0].components[2].setDisabled(true),
                      message.components[0].components[3].setDisabled(true)
                    ),
                  ],
                });
              }
            }
          });
          collector.on("end", () => {
            return message?.edit({
              components: [
                new MessageActionRow().addComponents(
                  ...message?.components[0].components.map((c) =>
                    c.setDisabled(true)
                  )
                ),
              ],
            });
          });
        });
    }
  }

  trimArray(array, maxLen = 10) {
    if (array.length > maxLen) {
      const len = array.length - maxLen;
      array = array.slice(0, maxLen);
      array.push(`\nAnd **${len}** more...`);
    }
    return array.join("\n");
  }

  async updateRequestChannelMessage(dispatcher) {
    let guildData = await guildSchema.findOne({
      id: dispatcher.guild || dispatcher,
    });
    if (guildData.reqSystem.channelId && guildData.reqSystem.messageId) {
      let guild = client.guilds.cache.get(guildData.id);
      let channel = guild.channels.cache.get(guildData.reqSystem.channelId);
      if (channel) {
        channel.messages
          .fetch(guildData.reqSystem.messageId)
          .then((message) => {
            if (message) {
              message.edit({
                content: dispatcher.queue?.length
                  ? `**__Queue List:__**\n\n${client.util.trimArray(
                      dispatcher.queue.map(
                        (track, i) =>
                          `${++i}. ${
                            track.title.length > 64
                              ? track.title.substr(0, 64) + "..."
                              : track.title
                          } [${client.util.duration(track.length)}] - ${
                            track.requester
                          }`
                      )
                    )}`
                  : "**Join a voice channel and queue songs by name or url in here.**",
                embeds: [
                  dispatcher.current
                    ? new MessageEmbed()
                        .setColor(client.settings.embed_color)
                        .setAuthor({
                          name:
                            dispatcher.current.title.length > 64
                              ? dispatcher.current.title.substr(0, 64) + "..."
                              : dispatcher.current.title,
                          url: dispatcher.current.uri,
                        })
                        .addFields(
                          {
                            name: "Duration",
                            value: dispatcher.current.isStream
                              ? `\`LIVE\``
                              : `\`${client.util.duration(
                                  dispatcher.current.length
                                )}\``,
                            inline: true,
                          },
                          {
                            name: "Author",
                            value: `\`${dispatcher.current.author}\``,
                            inline: true,
                          },
                          {
                            name: "Requested By",
                            value: `${dispatcher.current.requester}`,
                            inline: true,
                          }
                        )
                        .setImage(dispatcher.current.thumbnail)
                        .setFooter({
                          text: `Volume: ${
                            dispatcher.player.filters.volume * 100
                          }%  •  Autoplay: ${
                            dispatcher.data.get("autoplay")
                              ? "Enabled"
                              : "Disabled"
                          }  •  Loop: ${
                            dispatcher.loop !== "off"
                              ? dispatcher.loop === "track"
                                ? "Track"
                                : "Queue"
                              : "Disabled"
                          }${
                            dispatcher.player.paused ? "  •  Song Paused" : ""
                          }`,
                        })
                    : new MessageEmbed()
                        .setColor(client.settings.embed_color)
                        .setTitle("No song playing currently")
                        .setDescription(
                          `[Invite](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=37088600&scope=bot%20applications.commands) • [Support Server](https://discord.gg/QJqr6Hz2Mq) • [Vote](https://https://discordbotlist.com/bots/apera/upvote)`
                        )
                        .setImage(client.settings.icon)
                        .setFooter({
                          text: `${message.guild.name}`,
                          iconURL: message.guild.iconURL({
                            dynamic: true,
                            format: "jpg",
                          }),
                        }),
                ],
                components: [
                  new MessageActionRow().addComponents(
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("voldown")
                      .setEmoji("🔉")
                      .setDisabled(!dispatcher.current),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("previous")
                      .setEmoji("⏮️")
                      .setDisabled(!dispatcher.current),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("pauseandresume")
                      .setEmoji("⏯️")
                      .setDisabled(!dispatcher.current),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("skip")
                      .setEmoji("⏭️")
                      .setDisabled(!dispatcher.current),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("volup")
                      .setEmoji("🔊")
                      .setDisabled(!dispatcher.current)
                  ),
                  new MessageActionRow().addComponents(
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("rewind")
                      .setEmoji("⏪")
                      .setDisabled(!dispatcher.current),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("autoplay")
                      .setEmoji("♾️")
                      .setDisabled(!dispatcher.current),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("stop")
                      .setEmoji("⏹️")
                      .setDisabled(!dispatcher.current),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("loop")
                      .setEmoji("🔁")
                      .setDisabled(!dispatcher.current),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("forward")
                      .setEmoji("⏩")
                      .setDisabled(!dispatcher.current)
                  ),
                ],
              });
            } else {
              guildData.reqSystem.messageId = null;
              guildData.save();
            }
          });
      } else {
        guildData.reqSystem.setuped = false;
        guildData.reqSystem.channelId = null;
        guildData.reqSystem.messageId = null;
        guildData.save();
      }
      return true;
    } else {
      return false;
    }
  }
}

module.exports = Util;
