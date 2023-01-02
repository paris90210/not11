const { MessageButton, MessageActionRow, Permissions } = require("discord.js");
const guildSchema = require("../models/Guild");

/**
 * @param {import("../structures/Client")} client
 */

module.exports = async (client) => {
  client.logger.success(`launched cluster #${client.cluster.id}.`);
  await client.guilds.fetch({ cache: true });
  guildSchema.find({ "reqSystem.setuped": true }, async (_, guilds) => {
    for (let data of guilds) {
      let guild = client.guilds.cache.get(data.id);
      if (guild) {
        let channel = guild.channels.cache.get(data.reqSystem.channelId);
        if (channel) {
          let message = await channel.messages.fetch(data.reqSystem.messageId);
          if (message) {
            if (message.embeds[0].title !== "No song playing currently") {
              message.edit({
                content:
                  "**Join a voice channel and queue songs by name or url in here**",
                embeds: [
                  new (require("discord.js").MessageEmbed)()
                    .setColor(client.settings.embed_color)
                    .setTitle("No song playing currently")
                    .setDescription(
                      `[Invite Me](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=37088600&scope=bot%20applications.commands) • [Support Server](https://discord.gg/TY55HZezsC) • [Vote Me](https://top.gg/bot/802812378558889994/vote)`
                    )
                    .setImage(client.settings.icon)
                    .setFooter({
                      text: `${message.guild.name}`,
                      iconURL: message.guild.iconURL({
                        dynamic: true,
                        format: "png",
                      }),
                    }),
                ],
                components: [
                  new MessageActionRow().addComponents(
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("voldown")
                      .setEmoji("🔉")
                      .setDisabled(true),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("previous")
                      .setEmoji("⏮️")
                      .setDisabled(true),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("pauseandresume")
                      .setEmoji("⏯️")
                      .setDisabled(true),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("skip")
                      .setEmoji("⏭️")
                      .setDisabled(true),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("volup")
                      .setEmoji("🔊")
                      .setDisabled(true)
                  ),
                  new MessageActionRow().addComponents(
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("rewind")
                      .setEmoji("⏪")
                      .setDisabled(true),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("autoplay")
                      .setEmoji("♾️")
                      .setDisabled(true),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("stop")
                      .setEmoji("⏹️")
                      .setDisabled(true),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("loop")
                      .setEmoji("🔁")
                      .setDisabled(true),
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setCustomId("forward")
                      .setEmoji("⏩")
                      .setDisabled(true)
                  ),
                ],
              });
            }
          } else {
            data.reqSystem.messageId = null;
            data.save();
          }
        } else {
          data.reqSystem.channelId = null;
          data.reqSystem.messageId = null;
          data.save();
        }
      } else {
        await guildSchema.deleteOne({
          id: data.id,
        });
      }
    }
  });
  setInterval(() => {
    guildSchema.find({ "reqSystem.setuped": true }, async (_, guilds) => {
      for (let data of guilds) {
        let guild = client.guilds.cache.get(data.id);
        if (guild) {
          let channel = guild.channels.cache.get(data.reqSystem.channelId);
          if (channel) {
            if (
              channel
                .permissionsFor(channel.guild.me)
                .has(Permissions.FLAGS.MANAGE_MESSAGES)
            ) {
              let messages = await channel.messages.fetch();
              if (
                messages.filter((m) => m.id !== data.reqSystem.messageId).size
              ) {
                channel.bulkDelete(
                  messages.filter((m) => m.id !== data.reqSystem.messageId)
                );
              }
            }
          } else {
            data.reqSystem.channelId = null;
            data.reqSystem.messageId = null;
            data.save();
          }
        } else {
          await guildSchema.deleteOne({
            id: data.id,
          });
        }
      }
    });
  }, 5000);
};
