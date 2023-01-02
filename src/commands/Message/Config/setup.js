const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  Permissions,
} = require("discord.js");

module.exports = {
  name: "setup",
  aliases: [],
  category: "Config",
  permission: "MANAGE_GUILD",
  cooldown: 5,
  description: "Setups a request channel",
  usage: "",
  settings: {
    ownerOnly: false,
    inVoiceChannel: false,
    sameVoiceChannel: false,
    activePlayer: false,
    playingPlayer: false,
    DJonly: false,
    voteRequired: true,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), message: import("discord.js").Message, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, message, dispatcher, emojis, guildData }) => {
    if (!message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} I don't have the \`MANAGE_CHANNELS\` permission which is required to execute this command.`
            ),
        ],
      });
    }
    if (guildData.reqSystem.channelId) {
      let channel = message.guild.channels.cache.get(
        guildData.reqSystem.channelId
      );
      if (channel) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} There is already a request channel setuped. (${channel})`
              ),
          ],
        });
      } else {
        guildData.reqSystem.channelId = null;
        guildData.reqSystem.messageId = null;
        guildData.reqSystem.imageId = null;
        guildData.save();
      }
    }
    message.guild.channels
      .create("apera-song-requests", {
        type: "GUILD_TEXT",
        topic: `🔉 Decreases the player's volume by 10%.
⏮️ Plays the previous track.
⏯️ Pauses/resumes the player.
⏭️ Skips the current track.
🔊 Increases the player's volume by 10%.
⏪ Rewinds the current track by 10 seconds.
♾️ Toggles autoplay on/off.
⏹️ Stops/destroys the player.
🔁 Switches between the loop modes.
⏩ Forwards the current track by 10 seconds.`,
        permissionOverwrites: [
          {
            id: message.guild.id,
            deny: [Permissions.FLAGS.ADD_REACTIONS],
          },
          {
            id: client.user.id,
            allow: [
              Permissions.FLAGS.EMBED_LINKS,
              Permissions.FLAGS.MANAGE_MESSAGES,
              Permissions.FLAGS.READ_MESSAGE_HISTORY,
              Permissions.FLAGS.SEND_MESSAGES,
              Permissions.FLAGS.VIEW_CHANNEL,
            ],
          },
        ],
      })
      .then((channel) => {
        message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.check} Successfully setuped in ${channel}`
              ),
          ],
        });
        channel
          .send({
            content: dispatcher?.queue.length
              ? `**Queue List:**\n\n${client.util.trimArray(
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
              dispatcher?.current
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
                        dispatcher.data.get("autoplay") ? "Enabled" : "Disabled"
                      }  •  Loop: ${
                        dispatcher.loop !== "off"
                          ? dispatcher.loop === "track"
                            ? "Track"
                            : "Queue"
                          : "Disabled"
                      }${dispatcher.player.paused ? "  •  Song Paused" : ""}`,
                    })
                : new MessageEmbed()
                    .setColor(client.settings.embed_color)
                    .setTitle("No song playing currently")
                    .setDescription(
                      `[Invite](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=37088600&scope=bot%20applications.commands) • [Support Server](${client.settings.links.support}) • [Vote](https://discordbotlist.com/bots/apera/upvote)`
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
                  .setDisabled(!dispatcher?.current),
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setCustomId("previous")
                  .setEmoji("⏮️")
                  .setDisabled(!dispatcher?.current),
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setCustomId("pauseandresume")
                  .setEmoji("⏯️")
                  .setDisabled(!dispatcher?.current),
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setCustomId("skip")
                  .setEmoji("⏭️")
                  .setDisabled(!dispatcher?.current),
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setCustomId("volup")
                  .setEmoji("🔊")
                  .setDisabled(!dispatcher?.current)
              ),
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setCustomId("rewind")
                  .setEmoji("⏪")
                  .setDisabled(!dispatcher?.current),
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setCustomId("autoplay")
                  .setEmoji("♾️")
                  .setDisabled(!dispatcher?.current),
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setCustomId("stop")
                  .setEmoji("⏹️")
                  .setDisabled(!dispatcher?.current),
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setCustomId("loop")
                  .setEmoji("🔁")
                  .setDisabled(!dispatcher?.current),
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setCustomId("forward")
                  .setEmoji("⏩")
                  .setDisabled(!dispatcher?.current)
              ),
            ],
          })
          .then(({ id }) => {
            guildData.reqSystem.setuped = true;
            guildData.reqSystem.channelId = channel.id;
            guildData.reqSystem.messageId = id;
            guildData.save();
          });
      });
  },
};
