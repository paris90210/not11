const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  Permissions,
} = require("discord.js");
const guildSchema = require("../models/Guild");

/**
 * @param {import("../structures/Client")} client
 */

module.exports = (client) => {
  client.manager
    .on("playerStart", async (dispatcher, track) => {
      client.util.updateRequestChannelMessage(dispatcher);
      dispatcher.data.set("trackforautoplayfunction", track);

      if (dispatcher.data.get("message")) {
        client.channels.cache
          .get(dispatcher.text)
          ?.messages.fetch(dispatcher.data.get("message"))
          .then((msg) => {
            if (msg) {
              msg.delete();
            }
          });
      }
      let guildData = await guildSchema.findOne({ id: dispatcher.guild });
      if (dispatcher.text !== guildData.reqSystem.channelId) {

        client.channels.cache
          .get(dispatcher.text)
          ?.send({
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setTitle("Now Playing")
                .setThumbnail(track.thumbnail)
                .setDescription(`[${track.title.length > 64 ? track.title.substr(0, 64) + "..." : track.title}](${track.uri}) - [\`${client.util.duration(track.length)}\`] - [${track.requester}]`),
            ],
            components: [
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setCustomId("previous")
                  .setLabel("Previous"),
                new MessageButton()
                  .setStyle("SUCCESS")
                  .setCustomId("pauseandresume")
                  .setLabel("Pause"),
                new MessageButton()
                  .setStyle("DANGER")
                  .setCustomId("stop")
                  .setLabel("Stop"),
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setCustomId("skip")
                  .setLabel("Skip")
              ),
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setStyle("PRIMARY")
                  .setCustomId("loop-track")
                  .setLabel("Track"),
                new MessageButton()
                  .setStyle("PRIMARY")
                  .setCustomId("loop-queue")
                  .setLabel("Queue")
              ),
            ],
          })
          .then(async (message) => {
            dispatcher.data.set("message", message.id);
            message.createMessageComponentCollector().on("collect", (b) => {
              const member = message.guild.members.cache.get(b.user.id);
              if (!member.voice.channel) {
                return b.reply({
                  ephemeral: true,
                  embeds: [
                    new MessageEmbed()
                      .setColor(client.settings.embed_color)
                      .setDescription(
                        `You must be in a voice channel.`
                      ),
                  ],
                });
              }
              if (
                message.guild.me.voice.channel &&
                !message.guild.me.voice.channel.equals(member.voice.channel)
              ) {
                return b.reply({
                  ephemeral: true,
                  embeds: [
                    new MessageEmbed()
                      .setColor(client.settings.embed_color)
                      .setDescription(
                        `You must be in the same voice channel as ${client.user}.`
                      ),
                  ],
                });
              }
              if (guildData.djRole) {
                let role = message.guild.roles.cache.get(guildData.djRole);
                if (role) {
                  if (
                    !member.roles.cache.has(guildData.djRole) &&
                    !member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
                    member.voice.channel.members.filter((m) => !m.user.bot)
                      .size !== 1 &&
                    !client.owners.includes(member.id)
                  ) {
                    return b.reply({
                      ephemeral: true,
                      embeds: [
                        new MessageEmbed()
                          .setColor(client.settings.embed_color)
                          .setDescription(
                            `You must have the <@&${guildData.djRole}>.`
                          ),
                      ],
                    });
                  }
                } else {
                  guildData.djRole = null;
                  guildData.save();
                }
              }

              switch (b.customId) {
                case "previous": {
                  if (!dispatcher.previous) {
                    return b.reply({
                      ephemeral: true,
                      embeds: [
                        new MessageEmbed()
                          .setColor(client.settings.embed_color)
                          .setDescription(
                            `There is no previous track.`
                          ),
                      ],
                    });
                  }
                  dispatcher.queue.unshift(dispatcher.previous);
                  dispatcher.player.stopTrack();
                  return b
                    .reply({
                      ephemeral: false,
                      embeds: [
                        new MessageEmbed()
                          .setColor(client.settings.embed_color)
                          .setDescription(
                            `⏮️ ${member} has skipped to the previous track.`
                          ),
                      ],
                    })
                    .then(() => {
                      setTimeout(() => {
                        b.deleteReply();
                      }, 5000);
                    });
                }
                case "pauseandresume": {
                  dispatcher.setPaused(!dispatcher.player.paused);
                  client.util.updateRequestChannelMessage(dispatcher);
                  return b
                    .reply({
                      ephemeral: false,
                      embeds: [
                        new MessageEmbed()
                          .setColor(client.settings.embed_color)
                          .setDescription(
                            `${dispatcher.player.paused ? "⏸️" : "▶️"
                            } ${member} has ${dispatcher.player.paused ? "paused" : "resumed"
                            } the player.`
                          ),
                      ],
                    })
                    .then(() => {
                      setTimeout(() => {
                        b.deleteReply();
                      }, 5000);
                    });
                }
                case "stop": {
                  dispatcher.destroy();
                  return b
                    .reply({
                      ephemeral: false,
                      embeds: [
                        new MessageEmbed()
                          .setColor(client.settings.embed_color)
                          .setDescription(
                            `⏹️ ${member} has destroyed the player.`
                          ),
                      ],
                    })
                    .then(() => {
                      setTimeout(() => {
                        b.deleteReply();
                      }, 5000);
                    });
                }
                case "skip": {
                  dispatcher.player.stopTrack();
                  return b
                    .reply({
                      ephemeral: false,
                      embeds: [
                        new MessageEmbed()
                          .setColor(client.settings.embed_color)
                          .setDescription(
                            `⏭️ ${member} has skipped the current track.`
                          ),
                      ],
                    })
                    .then(() => {
                      setTimeout(() => {
                        b.deleteReply();
                      }, 5000);
                    });
                }
                case "loop-track":
                case "loop-queue": {
                  const mode = b.customId.split("-")[1];
                  if (mode === "track") {
                    if (dispatcher.loop !== "track") {
                      dispatcher.setLoop("track");
                      client.util.updateRequestChannelMessage(dispatcher);
                      return b
                        .reply({
                          embeds: [
                            new MessageEmbed()
                              .setColor(client.settings.embed_color)
                              .setDescription(
                                `🔁 ${member} has **enabled** track loop.`
                              ),
                          ],
                        })
                        .then(() => {
                          setTimeout(() => {
                            b.deleteReply();
                          }, 5000);
                        });
                    } else {
                      dispatcher.setLoop("off");
                      client.util.updateRequestChannelMessage(dispatcher);
                      return b
                        .reply({
                          embeds: [
                            new MessageEmbed()
                              .setColor(client.settings.embed_color)
                              .setDescription(
                                `🔁 ${member} has **disabled** track loop.`
                              ),
                          ],
                        })
                        .then(() => {
                          setTimeout(() => {
                            b.deleteReply();
                          }, 5000);
                        });
                    }
                  } else {
                    if (dispatcher.loop !== "queue") {
                      dispatcher.setLoop("queue");
                      client.util.updateRequestChannelMessage(dispatcher);
                      return b
                        .reply({
                          embeds: [
                            new MessageEmbed()
                              .setColor(client.settings.embed_color)
                              .setDescription(
                                `🔁 ${member} has **enabled** queue loop.`
                              ),
                          ],
                        })
                        .then(() => {
                          setTimeout(() => {
                            b.deleteReply();
                          }, 5000);
                        });
                    } else {
                      dispatcher.setLoop("off");
                      client.util.updateRequestChannelMessage(dispatcher);
                      return b
                        .reply({
                          embeds: [
                            new MessageEmbed()
                              .setColor(client.settings.embed_color)
                              .setDescription(
                                `🔁 ${member} has **disabled** queue loop.`
                              ),
                          ],
                        })
                        .then(() => {
                          setTimeout(() => {
                            b.deleteReply();
                          }, 5000);
                        });
                    }
                  }
                }
              }
            });
          })
          .catch(() => null);
      }
    })
    .on("playerEmpty", async (dispatcher) => {
      if (dispatcher.data.get("autoplay")) {
        dispatcher.previous = dispatcher.data.get("trackforautoplayfunction");
        return client.util.autoplay(dispatcher);
      }
      client.util.updateRequestChannelMessage(dispatcher.guild);
      let channel = client.channels.cache.get(dispatcher.text);
      if (channel) {
        channel.messages
          .fetch(dispatcher.data.get("message"))
          .then((message) => {
            if (message) {
              message.delete();
            }
          });
      }
      dispatcher.data.set("bass", "none");
      dispatcher.data.set("loop", "off");
      let guildData = await guildSchema.findOne({ id: dispatcher.guild });
      if (!dispatcher.current && !guildData.twentyFourSeven.enabled) {
        setTimeout(() => {
          if (
            dispatcher &&
            !dispatcher.current &&
            !guildData.twentyFourSeven.enabled
          ) {
            dispatcher.destroy();
          }
        }, 180000);
      }
    })
    .on("playerDestroy", async (dispatcher) => {
      client.util.updateRequestChannelMessage(dispatcher.guild);
      let channel = client.channels.cache.get(dispatcher.text);
      if (channel) {
        channel.messages
          .fetch(dispatcher.data.get("message"))
          .then((message) => {
            if (message) {
              message.delete();
            }
          });
      }
      let guildData = await guildSchema.findOne({ id: dispatcher.guild });
      if (guildData.twentyFourSeven.enabled) {
        setTimeout(async () => {
          dispatcher = await client.manager.createPlayer({
            guildId: dispatcher.guild,
            voiceId: guildData.twentyFourSeven.voiceChannel,
            textId: guildData.twentyFourSeven.textChannel,
            deaf: true,
          });
          dispatcher.data.set("filter", "none");
        }, 500);
      }
    });
  client.manager.shoukaku.on("ready", () => {
    guildSchema.find({ "twentyFourSeven.enabled": true }, async (_, guilds) => {
      for (let data of guilds) {
        let guild = client.guilds.cache.get(data.id);
        if (guild) {
          if (client.manager.players.has(guild.id)) return;
          let vc = guild.channels.cache.get(data.twentyFourSeven.voiceChannel);
          if (vc) {
            const permissions = vc.permissionsFor(guild.me);
            if (
              !permissions.has(
                require("discord.js").Permissions.FLAGS.VIEW_CHANNEL
              ) ||
              !permissions.has(
                require("discord.js").Permissions.FLAGS.CONNECT
              ) ||
              !permissions.has(require("discord.js").Permissions.FLAGS.SPEAK) ||
              !vc.joinable
            )
              return;
            let tc = guild.channels.cache.get(data.twentyFourSeven.textChannel);
            if (tc) {
              const dispatcher = await client.manager.createPlayer({
                guildId: guild.id,
                voiceId: vc.id,
                textId: tc.id,
                deaf: true,
              });
              dispatcher.data.set("filter", "none");
            } else {
              const dispatcher = await client.manager.createPlayer({
                guildId: guild.id,
                voiceId: vc.id,
                textId: null,
                deaf: true,
              });
              dispatcher.data.set("filter", "none");
              data.twentyFourSeven.textChannel = null;
              data.save();
            }
          } else {
            data.twentyFourSeven.enabled = false;
            data.twentyFourSeven.textChannel = null;
            data.twentyFourSeven.voiceChannel = null;
            data.save();
          }
        } else {
          await guildSchema.deleteOne({
            id: data.id,
          });
        }
      }
    });
  });
};
