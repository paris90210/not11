const { MessageEmbed, Permissions } = require("discord.js");
const { Spotify } = require("spotify-info.js");
const spotify = new Spotify({
  clientID: "e49c05eb12e14f49b1d63f7be0bb4b7c", // replace with your details,
  clientSecret: "ec4be40f84914618a36906a1a4fafa48",
});

module.exports = {
  name: "play",
  category: "Music",
  description: "Plays the specified track",
  permission: "",
  usage: "<track name/url>",
  cooldown: 5,
  settings: {
    inVoiceChannel: true,
    sameVoiceChannel: true,
    activePlayer: false,
    playingPlayer: false,
    DJonly: false,
    voteRequired: false,
  },
  options: [
    {
      name: "query",
      description: "Enter the track's name or URL you want to play",
      type: 3,
      required: true,
    },
  ],
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, interaction, dispatcher, emojis }) => {
    let query = interaction.options.getString("query");
    if (
      /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(
        query
      )
    ) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} As of recent events, we have removed YouTube as a supported platform, please try using a different platform or provide a search query to use our default platform.`
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
    await interaction.deferReply();
    if (
      !/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(
        query
      )
    ) {
      const searchedtracks = await spotify.searchTrack(query, {
        limit: 10,
      });
      if (!searchedtracks[0]) {
        return interaction.editReply({
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
        guildId: interaction.guild.id,
        voiceId: interaction.member.voice.channel.id,
        textId: interaction.channel.id,
        deaf: true,
      });
      dispatcher.data.set("filter", "none");
    }
    if (!dispatcher.text) dispatcher.setTextChannel(interaction.channel.id);
    const { tracks, type, playlistName } = await dispatcher.search(
      query,
      interaction.member
    );
    if (!tracks.length) {
      return interaction.editReply({
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
      return interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `Queued **${tracks.length}** tracks from [${playlistName.length > 64
                ? playlistName.substr(0, 64) + "..."
                : playlistName
              }](${query}) [${interaction.member}]`
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
      if (!dispatcher.current) dispatcher.play();
      return interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `Queued [${tracks[0].title.length > 64
                ? tracks[0].title.substr(0, 64) + "..."
                : tracks[0].title
              }](${tracks[0].uri}) [${interaction.member}]`
            ),
        ],
      });
    }
  },
};
