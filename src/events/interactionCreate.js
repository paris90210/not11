const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  Permissions,
} = require("discord.js");
const guildSchema = require("../models/Guild");

/**
 * @param {import("../structures/Client")} client
 * @param {import("discord.js").CommandInteraction} interaction
 */

module.exports = async (client, interaction) => {
  if (!interaction.inGuild()) return;
  let guildData = async () => {
    if (await guildSchema.findOne({ id: interaction.guild.id })) {
      return await guildSchema.findOne({ id: interaction.guild.id });
    } else {
      return new guildSchema({ id: interaction.guild.id }).save();
    }
  };
  guildData = await guildData();
  let emojis;
  if (
    interaction.guild.me.permissions.has(
      Permissions.FLAGS.USE_EXTERNAL_EMOJIS
    ) &&
    interaction.channel
      .permissionsFor(interaction.guild.me)
      .has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS) &&
    interaction.guild.roles.everyone.permissions.has(
      Permissions.FLAGS.USE_EXTERNAL_EMOJIS
    ) &&
    interaction.channel
      .permissionsFor(interaction.guild.roles.everyone)
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
  interaction.member = await interaction.guild.members.fetch(
    interaction.user.id
  );
  if (interaction.isCommand()) {
    const command = client.slashCommands.get(interaction.commandName);
    if (command) {
      if (guildData.botChannel) {
        if (
          ![guildData.botChannel, guildData.reqSystem.channelId].includes(
            interaction.channel.id
          ) &&
          !interaction.member.permissions.has(
            Permissions.FLAGS.ADMINISTRATOR
          ) &&
          !client.owners.includes(interaction.member.id)
        ) {
          return interaction.reply({
            ephemeral: true,
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(
                  `${emojis.cross} You are allowed to use my commands in <#${
                    guildData.botChannel
                  }>${
                    interaction.guild.channels.cache.has(
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
        command.permission !== "" &&
        !interaction.member.permissions.has(
          Permissions.FLAGS[command.permission]
        ) &&
        !client.owners.includes(interaction.member.id)
      ) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} You must have the \`${command.permission}\` permission.`
              ),
          ],
        });
      }
      if (
        command.settings.inVoiceChannel &&
        !interaction.member.voice.channel
      ) {
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
        command.settings.sameVoiceChannel &&
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
      let dispatcher = client.manager.players.get(interaction.guild.id);
      if (command.settings.activePlayer && !dispatcher) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} There is nothing playing.`),
          ],
        });
      }
      if (command.settings.playingPlayer && !dispatcher.current) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} There is nothing playing.`),
          ],
        });
      }
      if (command.settings.DJonly && guildData.djRole) {
        let role = interaction.guild.roles.cache.get(guildData.djRole);
        if (role) {
          if (
            !interaction.member.roles.cache.has(guildData.djRole) &&
            !interaction.member.permissions.has(
              Permissions.FLAGS.ADMINISTRATOR
            ) &&
            interaction.member.voice.channel.members.filter((m) => !m.user.bot)
              .size !== 1 &&
            !client.owners.includes(interaction.member.id)
          ) {
            return interaction.reply({
              ephemeral: true,
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
      // if (command.settings.voteRequired) {
      //   let voted = await client.topggapi.hasVoted(interaction.member.id);
      //   if (!voted && !client.owners.includes(interaction.member.id)) {
      //     return interaction.reply({
      //       ephemeral: true,
      //       embeds: [
      //         new MessageEmbed()
      //           .setColor(client.settings.embed_color)
      //           .setDescription(`${emojis.cross} You must vote me first.`),
      //       ],
      //       components: [
      //         new MessageActionRow().addComponents(
      //           new MessageButton()
      //             .setStyle("LINK")
      //             .setLabel("Vote")
      //             .setURL(client.settings.links.vote)
      //         ),
      //       ],
      //     });
      //   }
      // }
      if (
        client.util.cooldown(interaction.member.id, command) &&
        !client.owners.includes(interaction.member.id)
      ) {
        let timeLeft = client.util.cooldown(interaction.member.id, command);
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} Please wait for ${timeLeft} before reusing the \`${command.name}\` command.`
              ),
          ],
        });
      }
      command.run({ client, interaction, dispatcher, emojis, guildData });
    }
  }
  if (interaction.isButton()) {
    if (interaction.channel.id === guildData.reqSystem.channelId) {
      let dispatcher = client.manager.players.get(interaction.guild.id);
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
      if (guildData.djRole) {
        let role = interaction.guild.roles.cache.get(guildData.djRole);
        if (role) {
          if (
            !interaction.member.roles.cache.has(guildData.djRole) &&
            !interaction.member.permissions.has(
              Permissions.FLAGS.ADMINISTRATOR
            ) &&
            interaction.member.voice.channel.members.filter((m) => !m.user.bot)
              .size !== 1 &&
            !client.owners.includes(interaction.member.id)
          ) {
            return interaction.reply({
              ephemeral: true,
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
      switch (interaction.customId) {
        case "voldown": {
          let volume = dispatcher.player.filters.volume * 100 - 10;
          if (volume < 1) {
            return interaction.reply({
              ephemeral: true,
              embeds: [
                new MessageEmbed()
                  .setColor(client.settings.embed_color)
                  .setDescription(
                    `${emojis.cross} The volume can't be lower than **1%**`
                  ),
              ],
            });
          }
          dispatcher.setVolume(volume);
          client.util.updateRequestChannelMessage(dispatcher);
          return interaction.reply({
            ephemeral: false,
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(
                  `🔉 ${interaction.member} has set the volume to **${volume}%**.`
                ),
            ],
          });
        }
        case "previous": {
          if (!dispatcher.previous) {
            return interaction.reply({
              ephemeral: true,
              embeds: [
                new MessageEmbed()
                  .setColor(client.settings.embed_color)
                  .setDescription(
                    `${emojis.cross} There is no previous track.`
                  ),
              ],
            });
          }
          dispatcher.queue.unshift(dispatcher.previous);
          dispatcher.player.stopTrack();
          return interaction.reply({
            ephemeral: false,
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(
                  `⏮️ ${interaction.member} has skipped to the previous track.`
                ),
            ],
          });
        }
        case "pauseandresume": {
          dispatcher.setPaused(!dispatcher.player.paused);
          client.util.updateRequestChannelMessage(dispatcher);
          return interaction.reply({
            ephemeral: false,
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(
                  `${dispatcher.player.paused ? "⏸️" : "▶️"} ${
                    interaction.member
                  } has ${
                    dispatcher.player.paused ? "paused" : "resumed"
                  } the player.`
                ),
            ],
          });
        }
        case "skip": {
          dispatcher.player.stopTrack();
          return interaction.reply({
            ephemeral: false,
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(
                  `⏭️ ${interaction.member} has skipped the current track.`
                ),
            ],
          });
        }
        case "volup": {
          let volume = dispatcher.player.filters.volume * 100 + 10;
          if (volume > 100) {
            return interaction.reply({
              ephemeral: true,
              embeds: [
                new MessageEmbed()
                  .setColor(client.settings.embed_color)
                  .setDescription(
                    `${emojis.cross} The volume can't be higher than **100%**.`
                  ),
              ],
            });
          }
          dispatcher.setVolume(volume);
          client.util.updateRequestChannelMessage(dispatcher);
          return interaction.reply({
            ephemeral: false,
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(
                  `🔊 ${interaction.member} has set the volume to **${volume}%**.`
                ),
            ],
          });
        }
        case "rewind": {
          let seektime = dispatcher.player.position - 10 * 1000;
          if (
            seektime >=
              dispatcher.current.length - dispatcher.player.position ||
            seektime < 0
          ) {
            seektime = 0;
          }
          dispatcher.player.seekTo(seektime);
          return interaction.reply({
            ephemeral: false,
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(
                  `⏪ ${interaction.member} rewinded the current track by \`10 seconds\`.`
                ),
            ],
          });
        }
        case "autoplay": {
          dispatcher.data.set("autoplay", !dispatcher.data.get("autoplay"));
          client.util.updateRequestChannelMessage(dispatcher);
          return interaction.reply({
            ephemeral: false,
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(
                  `♾️ ${interaction.member} has ${
                    dispatcher.data.get("autoplay")
                      ? "**enabled**"
                      : "**disabled**"
                  } autoplay.`
                ),
            ],
          });
        }
        case "stop": {
          dispatcher.destroy();
          return interaction.reply({
            ephemeral: false,
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(
                  `⏹️ ${interaction.member} has destroyed the player.`
                ),
            ],
          });
        }
        case "loop": {
          if (dispatcher.loop === "off") {
            dispatcher.setLoop("track");
            return interaction.reply({
              ephemeral: false,
              embeds: [
                new MessageEmbed()
                  .setColor(client.settings.embed_color)
                  .setDescription(
                    `🔁 ${interaction.member} has set the loop mode to **track**.`
                  ),
              ],
            });
          }
          if (dispatcher.loop === "track") {
            dispatcher.setLoop("queue");
            return interaction.reply({
              ephemeral: false,
              embeds: [
                new MessageEmbed()
                  .setColor(client.settings.embed_color)
                  .setDescription(
                    `🔁 ${interaction.member} has set the loop mode to **queue**.`
                  ),
              ],
            });
          }
          if (dispatcher.loop === "queue") {
            dispatcher.setLoop("off");
            return interaction.reply({
              ephemeral: false,
              embeds: [
                new MessageEmbed()
                  .setColor(client.settings.embed_color)
                  .setDescription(
                    `🔁 ${interaction.member} has **disabled** loop.`
                  ),
              ],
            });
          }
          return client.util.updateRequestChannelMessage(dispatcher);
        }
        case "forward": {
          let seektime = dispatcher.player.position + 10 * 1000;
          if (seektime >= dispatcher.current.length) {
            seektime = dispatcher.current.length - 1000;
          }
          dispatcher.player.seekTo(seektime);
          return interaction.reply({
            ephemeral: false,
            embeds: [
              new MessageEmbed()
                .setColor(client.settings.embed_color)
                .setDescription(
                  `⏩ ${interaction.member} has forwarded the current track by \`10 seconds\`.`
                ),
            ],
          });
        }
      }
    }
    if (
      interaction.customId === "delete" &&
      client.owners.includes(interaction.member.id)
    ) {
      interaction.message.delete();
    }
  }
};
