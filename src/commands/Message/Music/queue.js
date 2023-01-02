const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "queue",
  aliases: ["q"],
  category: "Music",
  permission: "",
  description: "Shows the server's songs queue",
  usage: "",
  cooldown: 5,
  settings: {
    ownerOnly: false,
    inVoiceChannel: false,
    sameVoiceChannel: false,
    activePlayer: true,
    playingPlayer: true,
    DJonly: false,
    voteRequired: false,
  },
  /**
   * @param {{ client: import("../../../structures/Client"), message: import("discord.js").Message, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, message, dispatcher, emojis }) => {
    if (!dispatcher.queue.length) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} Queue is empty.`),
        ],
      });
    }
    if (dispatcher.queue.length <= 10) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setAuthor({
              name: "Queue",
              url: client.settings.links.support,
              iconURL: client.settings.icon,
            })
            .setDescription(
              dispatcher.queue
                .map(
                  (track, i) =>
                    `\`${++i}.\` [${
                      track.title.length > 64
                        ? track.title.substr(0, 64) + `...`
                        : track.title
                    }](${track.uri})\n\`${
                      track.isStream
                        ? "LIVE"
                        : client.util.duration(track.length)
                    }\` • Requested By ${track.requester}\n`
                )
                .join("\n")
            ),
        ],
      });
    }
    let list = [];
    for (let i = 0; i < dispatcher.queue.length; i += 10) {
      let songs = dispatcher.queue.slice(i, i + 10);
      list.push(
        songs
          .map(
            (track, index) =>
              `\`${i + ++index}.\` [${
                track.title.length > 64
                  ? track.title.substr(0, 64) + `...`
                  : track.title
              }](${track.uri})\n\`${
                track.isStream ? "LIVE" : client.util.duration(track.length)
              }\` • Requested By ${track.requester}\n`
          )
          .join("\n")
      );
    }
    let embeds = [];
    for (let i = 0; i < list.length; i++) {
      embeds.push(
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setAuthor({
            name: "Queue",
            url: "https://discord.gg/TY55HZezsC",
            iconURL: client.settings.icon,
          })
          .setDescription(list[i])
      );
    }
    return client.util.pagination(message, embeds);
  },
};
