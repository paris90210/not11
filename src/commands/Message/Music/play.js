const { MessageEmbed, Permissions } = require("discord.js");
const { Spotify } = require("spotify-info.js");
const spotify = new Spotify({
  clientID: "e49c05eb12e14f49b1d63f7be0bb4b7c", // replace with your details,
  clientSecret: "ec4be40f84914618a36906a1a4fafa48",
});

module.exports = {
  name: "play",
  aliases: ["p"],
  category: "Music",
  description: "Plays the specified track",
  permission: "",
  usage: "<track name/url>",
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
   * @param {{ client: import("../../../structures/Client"), message: import("discord.js").Message, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, message, args, dispatcher, emojis }) => {
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
    if (/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(args.join(" "))) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} As of recent events, we have removed YouTube as a supported platform, please try using a different platform or provide a search query to use our default platform.`
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
    let query;
    if (
      /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(
        args.join(" ")
      )
    ) {
      query = args.join(" ");
    } else {
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
      query = searchedtracks[0].external_urls.spotify;
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
    const { tracks, type, playlistName } = await dispatcher.search(
      query,
      message.member
    );
    if (!tracks.length) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} No songs found.`),
        ],
      });
    }
    if (type === "PLAYLIST") {
      for (let track of tracks) {
        if (/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(track.uri)) {
          return message.channel.send({
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(
                  `${emojis.cross} As of recent events, we have removed YouTube as a supported platform, please try using a different platform or provide a search query to use our default platform.`
                ),
            ],
          });
        }
        dispatcher.addSong(track);
      }
      client.util.updateRequestChannelMessage(dispatcher);
      if (!dispatcher.current) dispatcher.play();
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `Queued **${tracks.length}** tracks from [${playlistName.length > 64
                ? playlistName.substr(0, 64) + "..."
                : playlistName
              }](${query}) [${message.member}]`
            ),
        ],
      });
    } else {
      if (/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(tracks[0].uri)) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} As of recent events, we have removed YouTube as a supported platform, please try using a different platform or provide a search query to use our default platform.`
              ),
          ],
        });
      }
      dispatcher.addSong(tracks[0]);
      client.util.updateRequestChannelMessage(dispatcher);
      if (!dispatcher.current) {
        return dispatcher.play();
      } else {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `Queued [${tracks[0].title.length > 64
                  ? tracks[0].title.substr(0, 64) + "..."
                  : tracks[0].title
                }](${tracks[0].uri}) [${message.member}]`
              ),
          ],
        });
      }
    }
  },
};
