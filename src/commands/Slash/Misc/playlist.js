const { MessageEmbed, Permissions } = require("discord.js");
const playlistSchema = require("../../../models/Playlist");
//const { TrackUtils } = require("erela.js");

module.exports = {
  name: "playlist",
  category: "Misc",
  permission: "",
  description: "All playlist commands",
  usage: "",
  cooldown: 5,
  settings: {
    inVoiceChannel: false,
    sameVoiceChannel: false,
    activePlayer: false,
    playingPlayer: false,
    DJonly: false,
    voteRequired: false,
  },
  options: [
    {
      name: "addcurrent",
      description: "Adds the currently playing song in your saved playlist",
      type: 1,
      options: [
        {
          name: "playlist-name",
          description: "In which playlist would you like to add the song to?",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "addqueue",
      description: "Adds the whole queue in your saved playlist",
      type: 1,
      options: [
        {
          name: "playlist-name",
          description: "In which playlist would you like to add the queue to?",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "create",
      description: "Creates a new saved playlist",
      type: 1,
      options: [
        {
          name: "playlist-name",
          description: "What should be the name of the playlist?",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "delete",
      description: "Deletes your saved playlist",
      type: 1,
      options: [
        {
          name: "playlist-name",
          description: "Which playlist you would like to delete?",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "view",
      description: "Shows all the tracks of your saved playlist",
      type: 1,
      options: [
        {
          name: "playlist-name",
          description: "Which playlist's tracks you would like to view?",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "list",
      description: "Shows a list of your saved playlists",
      type: 1,
    },
    {
      name: "play",
      description: "To play your saved playlist",
      type: 1,
      options: [
        {
          name: "playlist-name",
          description: "Which playlist you would like to play?",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Removes a track from your saved playlist",
      type: 1,
      options: [
        {
          name: "playlist-name",
          description:
            "From which playlist you would like to remove the track from?",
          type: 3,
          required: true,
        },
        {
          name: "track",
          description:
            "Position of the track which you would like to remove from your saved playlist",
          type: 4,
          required: true,
        },
      ],
    },
    {
      name: "shuffle",
      description: "Shuffles the tracks of your saved playlist",
      type: 1,
      options: [
        {
          name: "playlist-name",
          description: "Which playlist's tracks you would like to shuffle?",
          type: 3,
          required: true,
        },
      ],
    },
  ],
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction }}
   */
  run: async ({ client, interaction, dispatcher, emojis }) => {
    let subcommand = interaction.options.getSubcommand();
    if (subcommand === "addcurrent") {
      if (!dispatcher || !dispatcher.current) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.check} There is nothing playing.`),
          ],
        });
      }
      if (dispatcher.current.isStream) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} The currently playing track is live stream.`
              ),
          ],
        });
      }
      let name = interaction.options.getString("playlist-name");
      let fetchList = await playlistSchema.findOne({
        userId: interaction.member.id,
        name: name.toLowerCase(),
      });
      if (!fetchList) {
        return interaction.reply({
          ephemeral: true,
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
          userId: interaction.member.id,
          name: name.toLowerCase(),
        },
        {
          $push: {
            tracks: {
              title: player.queue.current.title,
              uri: player.queue.current.uri,
              isStream: player.queue.current.isStream,
              duration: player.queue.current.length,
            },
          },
        }
      );
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${
                emojis.check
              } Successfully added the currently playing track in \`${name.toLowerCase()}\`.`
            ),
        ],
      });
    } else if (subcommand === "addqueue") {
      if (!dispatcher || !dispatcher.current) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} There is nothing playing.`),
          ],
        });
      }
      if (!dispatcher.queue.length) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} Queue is empty.`),
          ],
        });
      }
      if (dispatcher.queue.filter((track) => !track.isStream).length === 0) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} All the tracks in the queue are live streams.`
              ),
          ],
        });
      }
      let name = interaction.options.getString("playlist-name");
      let fetchList = await playlistSchema.findOne({
        userId: interaction.member.id,
        name: name.toLowerCase(),
      });
      if (!fetchList) {
        return interaction.reply({
          ephemeral: true,
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
          userId: interaction.member.id,
          name: name.toLowerCase(),
        },
        {
          $set: {
            tracks,
          },
        }
      );
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${
                emojis.check
              } Successfully added all the tracks of the queue (excluding live streams) in \`${name.toLowerCase()}\`.`
            ),
        ],
      });
    } else if (subcommand === "create") {
      let name = interaction.options.getString("playlist-name");
      if (name.length > 10) {
        return interaction.reply({
          ephemeral: true,
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
        userId: interaction.member.id,
        name: name.toLowerCase(),
      });
      if (playlist) {
        return interaction.reply({
          ephemeral: true,
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
        userId: interaction.member.id,
      });
      if (fetchList.length >= 25) {
        return interaction.reply({
          ephemeral: true,
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
          userId: interaction.member.id,
          name: name.toLowerCase(),
          tracks,
        }).save();
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${
                  emojis.check
                } Successfully created \`${name.toLowerCase()}\` with ${
                  tracks.length === 1
                    ? "**1** track"
                    : `**${tracks.length}** tracks`
                } (live streams were excluded).`
              ),
          ],
        });
      } else {
        new playlistSchema({
          userId: interaction.member.id,
          name: name.toLowerCase(),
          tracks: [],
        }).save();
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${
                  emojis.check
                } Successfully created \`${name.toLowerCase()}\`.`
              ),
          ],
        });
      }
    } else if (subcommand === "delete") {
      let name = interaction.options.getString("playlist-name");
      let fetchList = await playlistSchema.findOne({
        userId: interaction.member.id,
        name: name.toLowerCase(),
      });
      if (!fetchList) {
        return interaction.reply({
          ephemeral: true,
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
        userId: interaction.member.id,
        name: name.toLowerCase(),
      });
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.check} Successfully deleted \`${name.toLowerCase()}\`.`
            ),
        ],
      });
    } else if (subcommand === "view") {
      let name = interaction.options.getString("playlist-name");
      let fetchList = await playlistSchema.findOne({
        userId: interaction.member.id,
        name: name.toLowerCase(),
      });
      if (!fetchList) {
        return interaction.reply({
          ephemeral: true,
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
        return interaction.reply({
          ephemeral: true,
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
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setAuthor({
                name: `${name.toLowerCase()} - (${tracks.length})`,
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
              name: `${name.toLowerCase()} - (${tracks.length})`,
              url: client.settings.links.support,
              iconURL: client.settings.icon,
            })
            .setDescription(list[i])
        );
      }
      return client.util.pagination(client, interaction, embeds);
    } else if (subcommand === "list") {
      let fetchList = await playlistSchema.find({
        userId: interaction.member.id,
      });
      if (!fetchList || !fetchList.length) {
        return interaction.reply({
          ephemeral: true,
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
          name: `${interaction.member.user.username}'s playlists`,
          url: client.settings.links.support,
          iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
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
      return interaction.reply({
        ephemeral: true,
        embeds: [embed],
      });
    } else if (subcommand === "play") {
      let name = interaction.options.getString("playlist-name");
      let fetchList = await playlistSchema.findOne({
        userId: interaction.member.id,
        name: name.toLowerCase(),
      });
      if (!fetchList) {
        return interaction.reply({
          ephemeral: true,
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
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} There are no tracks in that playlist.`
              ),
          ],
        });
      }
      if (!interaction.member.voice.channel) {
        return interaction.reply({
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
        interaction.guild.me.voice.channel &&
        !interaction.guild.me.voice.channel.equals(
          interaction.member.voice.channel
        )
      ) {
        return interaction.reply({
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
      const permissions = interaction.member.voice.channel.permissionsFor(
        interaction.guild.me
      );
      if (!permissions.has(Permissions.FLAGS.VIEW_CHANNEL)) {
        return interaction.reply({
          ephemeral: true,
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
        return interaction.reply({
          ephemeral: true,
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
        return interaction.reply({
          ephemeral: true,
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
        !interaction.guild.me.voice.channel &&
        !interaction.member.voice.channel.joinable
      ) {
        return interaction.reply({
          ephemeral: true,
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
          guildId: interaction.guild.id,
          voiceId: interaction.member.voice.channel.id,
          textId: interaction.channel.id,
          deaf: true,
        });
        dispatcher.data.set("filter", "none");
      }
      if (!dispatcher.text) dispatcher.setTextChannel(interaction.channel.id);
      for (const { uri } of fetchList.tracks) {
        const track = (await client.manager.search(uri, interaction.member))
          .tracks[0];
        dispatcher.addSong(track);
      }
      if (!dispatcher.current) {
        dispatcher.play();
      }
      return interaction.reply({
        ephemeral: false,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.check} Queued ${
                fetchList.tracks.length === 1
                  ? `**1** track`
                  : `**${fetchList.tracks.length}** tracks`
              } from \`${name.toLowerCase()}\`.`
            ),
        ],
      });
    } else if (subcommand === "remove") {
      let name = interaction.options.getString("playlist-name");
      let track = interaction.options.getInteger("track");
      let fetchList = await playlistSchema.findOne({
        userId: interaction.member.id,
        name: name.toLowerCase(),
      });
      if (!fetchList) {
        return interaction.reply({
          ephemeral: true,
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
      if ((tracks.length === 1 && track <= 1) || track > tracks.length) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} Invalid track.`),
          ],
        });
      }
      tracks.splice(track - 1, 1);
      await playlistSchema.updateOne(
        {
          userId: interaction.member.id,
          name: name.toLowerCase(),
        },
        {
          $set: {
            tracks: tracks,
          },
        }
      );
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.check} Removed track **${
                track + 1
              }** from \`${name.toLowerCase()}\`.`
            ),
        ],
      });
    } else if (subcommand === "shuffle") {
      let name = interaction.options.getString("playlist-name");
      let fetchList = await playlistSchema.findOne({
        userId: interaction.member.id,
        name: name.toLowerCase(),
      });
      if (!fetchList) {
        return interaction.reply({
          ephemeral: true,
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
        return interaction.reply({
          ephemeral: true,
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
          userId: interaction.member.id,
          name: name.toLowerCase(),
        },
        {
          $set: {
            tracks,
          },
        }
      );
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `🔀 Shuffled the tracks in \`${name.toLowerCase()}\`.`
            ),
        ],
      });
    }
  },
};
