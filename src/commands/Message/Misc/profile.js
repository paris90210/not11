const { MessageEmbed, Permissions } = require("discord.js");

module.exports = {
  name: "profile",
  aliases: ["badges", "achievements"],
  category: "Misc",
  permission: "",
  description: "Shows your/mention member's profile in Apera",
  usage: "[member's mention or id]",
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
   * @param {{ client: import("../../../structures/Client"), message: import("discord.js").Message }}
   */
  run: async ({ client, message, args, emojis }) => {
    let user;
    if (args[0]) {
      user =
        message.mentions.users.first() || (await client.users.fetch(args[0]));
      if (!user) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} Invalid user.`),
          ],
        });
      }
      if (user.bot) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.cross} The user must not be a bot.`),
          ],
        });
      }
    } else {
      user = message.member.user;
    }
    const getUserBadges = async () => {
      const { badges } = await client.cluster.evalOnCluster(
        async (c, { customEmojiAllowed, userId }) => {
          let badges = [];
          let guild = await c.guilds.fetch("961893008893177898");
          let member = await guild.members.fetch(userId);
          if (member.roles.cache.has("961893009325195305")) {
            badges.push(
              ...[
                `${
                  customEmojiAllowed ? "<:owner:972056124243189830>" : "👑"
                } Owner`,
                `${
                  customEmojiAllowed ? "<:dev:972056124008316940>" : "⌨️"
                } Developer`,
              ]
            );
          }
          if (member.roles.cache.has("961893009295814685")) {
            badges.push(
              `${
                customEmojiAllowed ? "<:staff:972056124264157195>" : "⚒️"
              } Staff`
            );
          }
          if (member.roles.cache.has("961893009295814683")) {
            badges.push(
              `${
                customEmojiAllowed ? "<:mod:972056124398379038>" : "🛡️"
              } Moderator`
            );
          }
          if (member.roles.cache.has("961893009295814684")) {
            badges.push(
              `${
                customEmojiAllowed ? "<:bughunter:972106025685622854>" : "🪛"
              } Bug Hunter`
            );
          }
          if (member.roles.cache.has("972110893561315448")) {
            badges.push(
              `${
                customEmojiAllowed ? "<:supporter:972056123999920190>" : "🤝"
              } Supporter`
            );
          }
          if (member.roles.cache.has("961893009295814679")) {
            badges.push("🎨 GFX Artist");
          }
          if (member.roles.cache.has("970025073958338570")) {
            badges.push(
              `${customEmojiAllowed ? "<:vip:972056124188667985>" : "💎"} VIP`
            );
          }
          return {
            success: true,
            badges: badges.length
              ? `\n${badges.join("\n")}`
              : "\nNo achievements.",
          };
        },
        {
          context: {
            customEmojiAllowed: !!(
              message.guild.me.permissions.has(
                Permissions.FLAGS.USE_EXTERNAL_EMOJIS
              ) &&
              message.channel
                .permissionsFor(message.guild.me)
                .has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS) &&
              message.guild.roles.everyone.permissions.has(
                Permissions.FLAGS.USE_EXTERNAL_EMOJIS
              ) &&
              message.channel
                .permissionsFor(message.guild.roles.everyone)
                .has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS)
            ),
            userId: user.id,
          },
          guildId: "961893008893177898",
        }
      );
      return badges;
    };
    const badges = await getUserBadges();
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.settings.embed_color)
          .setAuthor({
            name: `Profile of ${user.tag}`,
            url: client.settings.links.support,
          })
          .setThumbnail(user.avatarURL({ dynamic: true }))
          .setFooter({
            text: `Requested By ${message.member.user.tag}`,
            iconURL: message.member.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp()
          .setDescription(`**__Apera Achievements__**${badges}`),
      ],
    });
  },
};
