const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  Permissions,
} = require("discord.js");
const guildSchema = require("../models/Guild");
const { Spotify } = require("spotify-info.js");
const spotify = new Spotify({
  clientID: "e49c05eb12e14f49b1d63f7be0bb4b7c", // replace with your details,
  clientSecret: "ec4be40f84914618a36906a1a4fafa48",
});

/**
 * @param {import("../structures/Client")} client
 * @param {import("discord.js").Message} message
 */

module.exports = async (client, message) => {
  if (
    !message.inGuild() ||
    !message.channel
      .permissionsFor(message.guild.me)
      .has(Permissions.FLAGS.VIEW_CHANNEL)
  )
    return;
  if (
    !message.guild.me.permissions.has(Permissions.FLAGS.SEND_MESSAGES) ||
    !message.channel
      .permissionsFor(message.guild.me)
      .has(Permissions.FLAGS.SEND_MESSAGES)
  ) {
    try {
      return message.member.send({
        content: `I don't have the \`SEND_MESSAGES\` permission in \`${message.guild.name}\`.`,
      });
    } catch { }
  }
  if (
    !message.guild.me.permissions.has(Permissions.FLAGS.EMBED_LINKS) ||
    !message.channel
      .permissionsFor(message.guild.me)
      .has(Permissions.FLAGS.EMBED_LINKS)
  ) {
    return message.channel.send({
      content: `I don't have the \`EMBED_LINKS\` permission.`,
    });
  }
  let guildData = async () => {
    if (await guildSchema.findOne({ id: message.guild.id })) {
      return await guildSchema.findOne({ id: message.guild.id });
    } else {
      return new guildSchema({ id: message.guild.id }).save();
    }
  };
  guildData = await guildData();
  let { prefix } = guildData;
  let emojis;
  if (
    message.guild.me.permissions.has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS) &&
    message.channel
      .permissionsFor(message.guild.me)
      .has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS) &&
    message.guild.roles.everyone.permissions.has(
      Permissions.FLAGS.USE_EXTERNAL_EMOJIS
    ) &&
    message.channel
      .permissionsFor(message.guild.roles.everyone)
      .has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS)
  ) {
    emojis = {
      check: "✅",
      cross: "❌",
    };
  } else {
    emojis = {
      check: "✅",
      cross: "❌",
    };
  }
  if (message.channel.id === guildData.reqSystem.channelId) {
    if (message.member.id !== client.user.id) message.delete();
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) prefix = "";
    const escapeRegex = (newprefix) => {
      return newprefix.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
    };
    const mentionprefix = new RegExp(
      `^(<@!?${client.user.id}>|${escapeRegex(prefix)})`
    );
    if (!mentionprefix.test(message.content)) return;
    const [, content] = message.content.match(mentionprefix);
    const args = message.content.slice(content.length).trim().split(/ +/);
    const cmd = args.length > 0 ? args.shift().toLowerCase() : null;
    const command =
      client.messageCommands.get(cmd) ||
      client.messageCommands.find(
        (cmds) => cmds.aliases && cmds.aliases.includes(cmd)
      );
    if (!command) {
      if (
        /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(
          message.content
        )
      ) {
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
      let query;
      if (
        /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(
          message.content
        )
      ) {
        query = message.content;
      } else {
        const searchedtracks = await spotify.searchTrack(message.content, {
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
      let dispatcher = client.manager.players.get(message.guild.id);
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
      const { tracks, type } = await dispatcher.search(query, message.member);
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
          dispatcher.addSong(track);
        }
        return client.util.updateRequestChannelMessage(dispatcher);
      } else {
        dispatcher.addSong(tracks[0]);
        client.util.updateRequestChannelMessage(dispatcher);
        if (!dispatcher.current) {
          return dispatcher.play();
        } else return;
      }
    } else {
      if (
        command.settings.ownerOnly &&
        !client.owners.includes(message.member.id)
      )
        return;
      if (
        command.permission &&
        !message.member.permissions.has(
          Permissions.FLAGS[command.permission]
        ) &&
        !client.owners.includes(message.member.id)
      ) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You must have the \`${command.permission}\` permission.`
              ),
          ],
        });
      }
      if (command.settings.inVoiceChannel && !message.member.voice.channel) {
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
        command.settings.sameVoiceChannel &&
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
      let dispatcher = client.manager.players.get(message.guild.id);
      if (command.settings.activePlayer && !dispatcher) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} There is nothing playing.`),
          ],
        });
      }
      if (command.settings.playingPlayer && !dispatcher.current) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} There is nothing playing.`),
          ],
        });
      }
      if (command.settings.DJonly && guildData.djRole) {
        let role = message.guild.roles.cache.get(guildData.djRole);
        if (role) {
          if (
            !message.member.roles.cache.has(guildData.djRole) &&
            !message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
            message.member.voice.channel.members.filter((m) => !m.user.bot)
              .size !== 1 &&
            !client.owners.includes(message.member.id)
          ) {
            return message.channel.send({
              embeds: [
                new MessageEmbed()
                  .setColor(client.settings.embed_color)
                  .setDescription(
                    `${emojis.cross} You must have the <@&${guildData.djRole}> role.`
                  ),
              ],
            });
          }
        } else {
          guildData.djRole = null;
          guildData.save();
        }
      }
      if (command.settings.voteRequired) {
        let voted = await client.topggapi.hasVoted(message.member.id);
        if (!voted && !client.owners.includes(message.member.id)) {
          return message.channel.send({
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(`${emojis.cross} You must vote me first.`),
            ],
            components: [
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setStyle("LINK")
                  .setLabel("Vote")
                  .setURL(client.settings.links.vote)
              ),
            ],
          });
        }
      }
      if (
        client.util.cooldown(client, message.member.id, command) &&
        !client.owners.includes(message.member.id)
      ) {
        let timeLeft = client.util.cooldown(client, message.member.id, command);
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} Please wait for ${timeLeft} before reusing the \`${command.name}\` command.`
              ),
          ],
        });
      }
      return command.run({
        client,
        message,
        args,
        dispatcher,
        emojis,
        guildData,
      });
    }
  }
  if (message.author.bot) return;
  if (
    message.content === `<@!${client.user.id}>` ||
    message.content === `<@${client.user.id}>`
  ) {
    return message.channel.send({
      content: `My prefix here is \`${prefix}\`
Type \`${prefix}help\` for a list of my commands.
For any help, join our support server. client.settings.links.support`,
    });
  }
  if (
    client.owners.includes(message.member.id) &&
    !message.content.startsWith(prefix) &&
    !["972899259852664842", "973102754270699520"].includes(client.user.id)
  )
    prefix = "";
  const escapeRegex = (newprefix) => {
    return newprefix.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  };
  const mentionprefix = new RegExp(
    `^(<@!?${client.user.id}>|${escapeRegex(prefix)})`
  );
  if (!mentionprefix.test(message.content)) return;
  const [, content] = message.content.match(mentionprefix);
  const args = message.content.slice(content.length).trim().split(/ +/);
  const cmd = args.length > 0 ? args.shift().toLowerCase() : null;
  const command =
    client.messageCommands.get(cmd) ||
    client.messageCommands.find(
      (cmds) => cmds.aliases && cmds.aliases.includes(cmd)
    );
  if (command) {
    if (
      command.settings.ownerOnly &&
      !client.owners.includes(message.member.id)
    )
      return;
    if (guildData.botChannel) {
      if (
        ![guildData.botChannel, guildData.reqSystem.channelId].includes(
          message.channel.id
        ) &&
        !message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
        !client.owners.includes(message.member.id)
      ) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You are allowed to use my commands in <#${guildData.botChannel
                }>${message.guild.channels.cache.has(
                  guildData.reqSystem.channelId
                )
                  ? ` and <#${guildData.reqSystem.channelId}>`
                  : ""
                } only.`
              ),
          ],
        });
      }
    }
    if (
      command.permission &&
      !message.member.permissions.has(Permissions.FLAGS[command.permission]) &&
      !client.owners.includes(message.member.id)
    ) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} You must have the \`${command.permission}\` permission.`
            ),
        ],
      });
    }
    if (command.settings.inVoiceChannel && !message.member.voice.channel) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} You must be in a voice channel.`),
        ],
      });
    }
    if (
      command.settings.sameVoiceChannel &&
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
    let dispatcher = client.manager.players.get(message.guild.id);
    if (command.settings.activePlayer && !dispatcher) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} There is nothing playing.`),
        ],
      });
    }
    if (command.settings.playingPlayer && !dispatcher.current) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(`${emojis.cross} There is nothing playing.`),
        ],
      });
    }
    if (command.settings.DJonly && guildData.djRole) {
      let role = message.guild.roles.cache.get(guildData.djRole);
      if (role) {
        if (
          !message.member.roles.cache.has(guildData.djRole) &&
          !message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
          message.member.voice.channel.members.filter((m) => !m.user.bot)
            .size !== 1 &&
          !client.owners.includes(message.member.id)
        ) {
          return message.channel.send({
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(
                  `${emojis.cross} You must have the <@&${guildData.djRole}> role.`
                ),
            ],
          });
        }
      } else {
        guildData.djRole = null;
        guildData.save();
      }
    }
   /* if (command.settings.voteRequired) {
      let voted = await client.topggapi.hasVoted(message.member.id);
      if (!voted && !client.owners.includes(message.member.id)) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} You must vote me first.`),
          ],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setStyle("LINK")
                .setLabel("Vote")
                .setURL(client.settings.links.vote)
            ),
          ],
        });
      }
    }*/
    if (
      client.util.cooldown(message.member.id, command) &&
      !client.owners.includes(message.member.id)
    ) {
      let timeLeft = client.util.cooldown(message.member.id, command);
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.settings.embed_color)
            .setDescription(
              `${emojis.cross} Please wait for ${timeLeft} before reusing the \`${command.name}\` command.`
            ),
        ],
      });
    }
    command.run({ client, message, args, dispatcher, emojis, guildData });
  }
};
