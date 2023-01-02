const { MessageEmbed, Permissions } = require("discord.js");
const playlistSchema = require("../../../models/Playlist");

module.exports = {
  name: "playlist",
  aliases: ["pl"],
  category: "Misc",
  permission: "",
  description: "All playlist commands",
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
   * @param {{ client: import("../../../structures/Client"), message: import("discord.js").Message, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, message, args, dispatcher, emojis }) => {
    if (!args[0]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Invalid subcommand.\nValid subcommands: \`addcurrent\`, \`addqueue\`, \`create\`, \`delete\`, \`list\`, \`play\`, \`remove\`, \`shuffle\`, \`view\``
            ),
        ],
      });
    }
    if (args[0].toLowerCase() === "addcurrent") {
      if (!dispatcher || !dispatcher.current) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.check} There is nothing playing.`),
          ],
        });
      }
      if (dispatcher.current.isStream) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} The currently playing track is live stream.`
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
                `${emojis.cross} Use the command again, and this time provide the name of the playlist.`
              ),
          ],
        });
      }
      let fetchList = await playlistSchema.findOne({
        userId: message.member.id,
        name: args[1].toLowerCase(),
      });
      if (!fetchList) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You don't have any playlist with this name.`
              ),
          ],
        });
      }
      await playlistSchema.updateOne(
        {
          userId: message.member.id,
          name: args[1],
        },
        {
          $push: {
            tracks: {
              title: dispatcher.current.title,
              uri: dispatcher.current.uri,
              length: dispatcher.current.length,
            },
          },
        }
      );
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.check} Successfully added the currently playing track in \`${args[1]}\`.`
            ),
        ],
      });
    } else if (args[0] === "addqueue") {
      if (!dispatcher || !dispatcher.current) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} There is nothing playing.`),
          ],
        });
      }
      if (!dispatcher.queue.length) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} Queue is empty.`),
          ],
        });
      }
      if (dispatcher.queue.filter((track) => !track.isStream).length === 0) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} All the tracks in the queue are live streams.`
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
                `${emojis.cross} Use the command again, and this time provide the name of the playlist.`
              ),
          ],
        });
      }
      let fetchList = await playlistSchema.findOne({
        userId: message.member.id,
        name: args[1].toLowerCase(),
      });
      if (!fetchList) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You don't have any playlist with this name.`
              ),
          ],
        });
      }
      let oldtracks = fetchList.tracks;
      let newtracks = [];
      for (const { title, uri, length } of dispatcher.queue.filter(
        (track) => !track.isStream
      )) {
        newtracks.push({
          title,
          uri,
          length,
        });
      }
      let tracks = oldtracks.concat(newtracks);
      await playlistSchema.updateOne(
        {
          userId: message.member.id,
          name: args[1],
        },
        {
          $set: {
            tracks,
          },
        }
      );
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.check} Successfully added all the tracks of the queue (excluding live streams) in \`${args[1]}\`.`
            ),
        ],
      });
    } else if (args[0].toLowerCase() === "create") {
      if (!args[1]) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} Use the command again, and this time provide a name for the playlist.`
              ),
          ],
        });
      }
      if (args[1].toLowerCase().length > 10) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} The playlist name's length shouldn't be longer than **5**.`
              ),
          ],
        });
      }
      let playlist = await playlistSchema.findOne({
        userId: message.member.id,
        name: args[1].toLowerCase(),
      });
      if (playlist) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You already have a playlist with this name.`
              ),
          ],
        });
      }
      let fetchList = await playlistSchema.find({
        userId: message.member.id,
      });
      if (fetchList.length >= 25) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You can't create any more playlists.`
              ),
          ],
        });
      }
      if (dispatcher && dispatcher.current) {
        if (
          dispatcher.current.isStream &&
          dispatcher.queue.filter((track) => !track.isStream).length === 0
        ) {
          return message.channel.send({
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(
                  `${emojis.cross} All the tracks in the queue are live streams.`
                ),
            ],
          });
        }
        let tracks = [];
        if (!dispatcher.current.isStream) {
          tracks.push({
            title: dispatcher.current.title,
            uri: dispatcher.current.uri,
            length: dispatcher.current.length,
          });
        }
        for (const { title, uri, length } of dispatcher.queue.filter(
          (track) => !track.isStream
        )) {
          tracks.push({
            title,
            uri,
            length,
          });
        }
        new playlistSchema({
          userId: message.member.id,
          name: args[1].toLowerCase(),
          tracks,
        }).save();
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${
                  emojis.check
                } Successfully created \`${args[1].toLowerCase()}\` with ${
                  tracks.length === 1
                    ? "**1** track"
                    : `**${tracks.length}** tracks`
                } (live streams were excluded).`
              ),
          ],
        });
      } else {
        new playlistSchema({
          userId: message.member.id,
          name: args[1].toLowerCase(),
          tracks: [],
        }).save();
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${
                  emojis.check
                } Successfully created \`${args[1].toLowerCase()}\`.`
              ),
          ],
        });
      }
    } else if (args[0].toLowerCase() === "delete") {
      if (!args[1]) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} Use the command again, and this time provide the name of the playlist.`
              ),
          ],
        });
      }
      let fetchList = await playlistSchema.findOne({
        userId: message.member.id,
        name: args[1].toLowerCase(),
      });
      if (!fetchList) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You don't have any playlist with this name.`
              ),
          ],
        });
      }
      await playlistSchema.deleteOne({
        userId: message.member.id,
        name: args[1].toLowerCase(),
      });
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${
                emojis.check
              } Successfully deleted \`${args[1].toLowerCase()}\`.`
            ),
        ],
      });
    } else if (args[0].toLowerCase() === "view") {
      if (!args[1]) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} Use the command again, and this time provide the name of the playlist.`
              ),
          ],
        });
      }
      let fetchList = await playlistSchema.findOne({
        userId: message.member.id,
        name: args[1].toLowerCase(),
      });
      if (!fetchList) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You don't have any playlist with this name.`
              ),
          ],
        });
      }
      let tracks = fetchList.tracks;
      if (!tracks.length) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} There are no tracks in that playlist.`
              ),
          ],
        });
      }
      if (tracks.length <= 10) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setAuthor({
                name: `${args[1].toLowerCase()} - (${tracks.length})`,
                url: client.settings.links.support,
                iconURL: client.settings.icon,
              })
              .setDescription(
                tracks
                  .map(
                    (track, i) =>
                      `\`${++i}.\` [${
                        track.title.length > 64
                          ? track.title.substr(0, 64) + "..."
                          : track.title
                      }](${track.uri}) - \`${client.util.duration(
                        track.length
                      )}\`\n`
                  )
                  .join("\n")
              ),
          ],
        });
      }
      let list = [];
      for (let i = 0; i < tracks.length; i += 10) {
        let songs = tracks.slice(i, i + 10);
        list.push(
          songs
            .map(
              (track, index) =>
                `\`${i + ++index}.\` [${
                  track.title.length > 64
                    ? track.title.substr(0, 64) + "..."
                    : track.title
                }](${track.uri}) - \`${client.util.duration(track.length)}\`\n`
            )
            .join("\n")
        );
      }
      let limit = list.length;
      let embeds = [];
      for (let i = 0; i < limit; i++) {
        embeds.push(
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setAuthor({
              name: `${args[1].toLowerCase()} - (${tracks.length})`,
              url: client.settings.links.support,
              iconURL: client.settings.icon,
            })
            .setDescription(list[i])
        );
      }
      return pagination(client, message, embeds);
    } else if (args[0].toLowerCase() === "list") {
      let fetchList = await playlistSchema.find({
        userId: message.member.id,
      });
      if (!fetchList || !fetchList.length) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} You don't have any playlists.`),
          ],
        });
      }
      let embed = new MessageEmbed()
        .setColor(client.settings.embed_color)
        .setAuthor({
          name: `${message.member.user.username}'s playlists`,
          url: client.settings.links.support,
          iconURL: message.member.displayAvatarURL({ dynamic: true }),
        })
        .setFooter({
          text: `Total playlists: ${fetchList.length}`,
        });
      let i = 0;
      for (const item in fetchList) {
        embed.addField(
          `${++i}. ${fetchList[item].name}`,
          `**Songs:** \`${fetchList[item].tracks.length}\``,
          true
        );
      }
      return message.channel.send({
        embeds: [embed],
      });
    } else if (args[0].toLowerCase() === "play") {
      if (!args[1]) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} Use the command again, and this time provide the name of the playlist.`
              ),
          ],
        });
      }
      let fetchList = await playlistSchema.findOne({
        userId: message.member.id,
        name: args[1].toLowerCase(),
      });
      if (!fetchList) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You don't have any playlist with this name.`
              ),
          ],
        });
      }
      if (!fetchList.tracks.length) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} There are no tracks in that playlist.`
              ),
          ],
        });
      }
      if (!message.member.voice.channel) {
        return message.channel.send({
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
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You must be in the same voice channel as ${client.user}.`
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
      if (!dispatcher) {
        dispatcher = await client.manager.createPlayer({
          guildId: message.guild.id,
          voiceId: message.member.voice.channel.id,
          textId: message.channel.id,
          deaf: true,
        });
        dispatcher.data.set("filter", "none");
      }
      if (!dispatcher.text) dispatcher.setTextChannel(message.channel.id);
      for (const { uri } of fetchList.tracks) {
        const track = (await client.manager.search(uri, message.member))
          .tracks[0];
        dispatcher.addSong(track);
      }
      if (!dispatcher.current) {
        dispatcher.play();
      }
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.check} Queued ${
                fetchList.tracks.length === 1
                  ? `**1** track`
                  : `**${fetchList.tracks.length}** tracks`
              } from \`${args[1].toLowerCase()}\`.`
            ),
        ],
      });
    } else if (args[0].toLowerCase() === "remove") {
      if (!args[1]) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} Use the command again, and this time provide the name of the playlist.`
              ),
          ],
        });
      }
      if (!args[2]) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} Use the command again, and this time provide the position of the track which you want to remove.`
              ),
          ],
        });
      }
      let fetchList = await playlistSchema.findOne({
        userId: message.member.id,
        name: args[1].toLowerCase(),
      });
      if (!fetchList) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You don't have any playlist with this name.`
              ),
          ],
        });
      }
      let tracks = fetchList.tracks;
      let tracktoremove = parseInt(args[2]);
      if (
        isNaN(tracktoremove) ||
        (tracks.length === 1 && tracktoremove <= 1) ||
        tracktoremove > tracks.length
      ) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} Invalid track.`),
          ],
        });
      }
      tracks.splice(tracktoremove - 1, 1);
      await playlistSchema.updateOne(
        {
          userId: message.member.id,
          name: args[1].toLowerCase(),
        },
        {
          $set: {
            tracks,
          },
        }
      );
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.check} Removed track **${
                tracktoremove + 1
              }** from \`${args[1].toLowerCase()}\`.`
            ),
        ],
      });
    } else if (args[0].toLowerCase() === "shuffle") {
      if (!args[1]) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} Use the command again, and this time provide the name of the playlist.`
              ),
          ],
        });
      }
      let fetchList = await playlistSchema.findOne({
        userId: message.member.id,
        name: args[1].toLowerCase(),
      });
      if (!fetchList) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You don't have any playlist with this name.`
              ),
          ],
        });
      }
      let oldtracks = fetchList.tracks;
      if (oldtracks.length < 3) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} Not enough songs in the playlist to shuffle.`
              ),
          ],
        });
      }
      let tracks = () => {
        for (let i = oldtracks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [oldtracks[i], oldtracks[j]] = [oldtracks[j], oldtracks[i]];
        }
        return oldtracks;
      };
      tracks = tracks();
      await playlistSchema.updateOne(
        {
          userId: message.member.id,
          name: args[1].toLowerCase(),
        },
        {
          $set: {
            tracks,
          },
        }
      );
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `🔀 Shuffled the tracks in \`${args[1].toLowerCase()}\`.`
            ),
        ],
      });
    } else {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Invalid subcommand.\nValid subcommands: \`addcurrent\`, \`addqueue\`, \`create\`, \`delete\`, \`list\`, \`play\`, \`remove\`, \`shuffle\`, \`view\``
            ),
        ],
      });
    }
  },
};
