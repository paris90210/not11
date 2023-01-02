const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "filter",
  category: "Music",
  permission: "",
  description: "Applys the specified filter to the player",
  usage: "",
  cooldown: 5,
  settings: {
    inVoiceChannel: true,
    sameVoiceChannel: true,
    activePlayer: true,
    playingPlayer: true,
    DJonly: true,
    voteRequired: false,
  },
  options: [
    {
      name: "8d",
      description: "Toggles the 8d filter on/off",
      type: 1,
    },
    {
      name: "bassboost",
      description: "Changes the bass gain",
      type: 1,
      options: [
        {
          name: "level",
          description: "Choose a level",
          type: 3,
          required: true,
          choices: [
            { name: "None", value: "none" },
            { name: "Low", value: "low" },
            { name: "Medium", value: "medium" },
            { name: "High", value: "high" },
          ],
        },
      ],
    },
    {
      name: "deepbass",
      description: "Toggles the deepbass filter on/off",
      type: 1,
    },
    {
      name: "nightcore",
      description: "Toggles the nightcore filter on/off",
      type: 1,
    },
    {
      name: "pop",
      description: "Toggles the pop filter on/off",
      type: 1,
    },
    {
      name: "soft",
      description: "Toggles the soft filter on/off",
      type: 1,
    },
    {
      name: "treblebass",
      description: "Toggles the treblebass filter on/off",
      type: 1,
    },
    {
      name: "tremolo",
      description: "Toggles the tremolo filter on/off",
      type: 1,
    },
    {
      name: "vaporwave",
      description: "Toggles the vaporwave filter on/off",
      type: 1,
    },
    {
      name: "vibrato",
      description: "Toggles the vibrato filter on/off",
      type: 1,
    },
  ],
  /**
   * @param {{ client: import("../../../structures/Client"), interaction: import("discord.js").CommandInteraction, dispatcher: import("kazagumo").kazagumoPlayer }}
   */
  run: async ({ client, interaction, dispatcher, emojis }) => {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "8d") {
      if (dispatcher.data.get("filter") !== "8d") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "8d");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          rotation: {
            rotationHz: 0.2,
          },
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 8d filter is now **enabled**`),
          ],
        });
      } else {
        dispatcher.data.set("filter", "none");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 8d filter is now **disabled**`),
          ],
        });
      }
    } else if (subcommand === "bassboost") {
      let level = interaction.options.getString("level");
      if (
        dispatcher.data.get("filter").includes("bass") &&
        dispatcher.data.get("filter").split("-")[1] === level
      ) {
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.cross} Bass is already set to \`${level}\``
              ),
          ],
        });
      }
      if (level === "none") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "bass-none");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          equalizer: [
            {
              band: 0,
              gain: 0.25,
            },
            {
              band: 1,
              gain: 0.025,
            },
            {
              band: 2,
              gain: 0.0125,
            },
            {
              band: 3,
              gain: 0,
            },
            {
              band: 4,
              gain: 0,
            },
            {
              band: 5,
              gain: -0.0125,
            },
            {
              band: 6,
              gain: -0.025,
            },
            {
              band: 7,
              gain: -0.0175,
            },
            {
              band: 8,
              gain: 0,
            },
            {
              band: 9,
              gain: 0,
            },
            {
              band: 10,
              gain: 0.0125,
            },
            {
              band: 11,
              gain: 0.025,
            },
            {
              band: 12,
              gain: 0.25,
            },
            {
              band: 13,
              gain: 0.125,
            },
            {
              band: 14,
              gain: 0.125,
            },
          ],
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.check} Bassboost filter is now disabled.`
              ),
          ],
        });
      } else if (level === "low") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "bass-low");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          equalizer: [
            {
              band: 0,
              gain: 0.0625,
            },
            {
              band: 1,
              gain: 0.125,
            },
            {
              band: 2,
              gain: -0.125,
            },
            {
              band: 3,
              gain: -0.0625,
            },
            {
              band: 4,
              gain: 0,
            },
            {
              band: 5,
              gain: -0.0125,
            },
            {
              band: 6,
              gain: -0.025,
            },
            {
              band: 7,
              gain: -0.0175,
            },
            {
              band: 8,
              gain: 0,
            },
            {
              band: 9,
              gain: 0,
            },
            {
              band: 10,
              gain: 0.0125,
            },
            {
              band: 11,
              gain: 0.025,
            },
            {
              band: 12,
              gain: 0.375,
            },
            {
              band: 13,
              gain: 0.125,
            },
            {
              band: 14,
              gain: 0.125,
            },
          ],
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`${emojis.check} Bass is now set to \`low\``),
          ],
        });
      } else if (level === "medium") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "bass-medium");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          equalizer: [
            {
              band: 0,
              gain: 0.125,
            },
            {
              band: 1,
              gain: 0.25,
            },
            {
              band: 2,
              gain: -0.25,
            },
            {
              band: 3,
              gain: -0.125,
            },
            {
              band: 4,
              gain: 0,
            },
            {
              band: 5,
              gain: -0.0125,
            },
            {
              band: 6,
              gain: -0.025,
            },
            {
              band: 7,
              gain: -0.0175,
            },
            {
              band: 8,
              gain: 0,
            },
            {
              band: 9,
              gain: 0,
            },
            {
              band: 10,
              gain: 0.0125,
            },
            {
              band: 11,
              gain: 0.025,
            },
            {
              band: 12,
              gain: 0.375,
            },
            {
              band: 13,
              gain: 0.125,
            },
            {
              band: 14,
              gain: 0.125,
            },
          ],
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.check} Bass gain is now set to \`medium\``
              ),
          ],
        });
      } else if (level === "high") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "bass-high");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          equalizer: [
            {
              band: 0,
              gain: 0.1875,
            },
            {
              band: 1,
              gain: 0.375,
            },
            {
              band: 2,
              gain: -0.375,
            },
            {
              band: 3,
              gain: -0.1875,
            },
            {
              band: 4,
              gain: 0,
            },
            {
              band: 5,
              gain: -0.0125,
            },
            {
              band: 6,
              gain: -0.025,
            },
            {
              band: 7,
              gain: -0.0175,
            },
            {
              band: 8,
              gain: 0,
            },
            {
              band: 9,
              gain: 0,
            },
            {
              band: 10,
              gain: 0.0125,
            },
            {
              band: 11,
              gain: 0.025,
            },
            {
              band: 12,
              gain: 0.375,
            },
            {
              band: 13,
              gain: 0.125,
            },
            {
              band: 14,
              gain: 0.125,
            },
          ],
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(
                `${emojis.check} Bass gain is now set to \`high\``
              ),
          ],
        });
      }
    } else if (subcommand === "deepbass") {
      if (dispatcher.data.get("filter") !== "deepbass") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "deepbass");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          equalizer: [
            { band: 0, gain: 0.6 },
            { band: 1, gain: 0.67 },
            { band: 2, gain: 0.67 },
            { band: 3, gain: 0 },
            { band: 4, gain: -0.5 },
            { band: 5, gain: 0.15 },
            { band: 6, gain: -0.45 },
            { band: 7, gain: 0.23 },
            { band: 8, gain: 0.35 },
            { band: 9, gain: 0.45 },
            { band: 10, gain: 0.55 },
            { band: 11, gain: 0.6 },
            { band: 12, gain: 0.55 },
            { band: 13, gain: 0 },
          ],
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Deepbass filter is now **enabled**`),
          ],
        });
      } else {
        dispatcher.data.set("filter", "none");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Deepbass filter is now **disabled**`),
          ],
        });
      }
    } else if (subcommand === "electronic") {
      if (dispatcher.data.get("filter") !== "electronic") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "electronic");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          equalizer: [
            { band: 0, gain: 0.375 },
            { band: 1, gain: 0.35 },
            { band: 2, gain: 0.125 },
            { band: 3, gain: 0 },
            { band: 4, gain: 0 },
            { band: 5, gain: -0.125 },
            { band: 6, gain: -0.125 },
            { band: 7, gain: 0 },
            { band: 8, gain: 0.25 },
            { band: 9, gain: 0.125 },
            { band: 10, gain: 0.15 },
            { band: 11, gain: 0.2 },
            { band: 12, gain: 0.25 },
            { band: 13, gain: 0.35 },
            { band: 14, gain: 0.4 },
          ],
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Electronic filter is now **enabled**`),
          ],
        });
      } else {
        dispatcher.data.set("filter", "none");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Electronic filter is now **disabled**`),
          ],
        });
      }
    } else if (subcommand === "karaoke") {
      if (dispatcher.data.get("filter") !== "karaoke") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "karaoke");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          karaoke: {
            level: 1.0,
            monoLevel: 1.0,
            filterBand: 220.0,
            filterWidth: 100.0,
          },
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Karaoke filter is now **enabled**`),
          ],
        });
      } else {
        dispatcher.data.set("filter", "none");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Karaoke filter is now **disabled**`),
          ],
        });
      }
    } else if (subcommand === "nightcore") {
      if (dispatcher.data.get("filter") !== "nightcore") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "nightcore");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          timescale: {
            speed: 1.2999999523162842,
            pitch: 1.2999999523162842,
            rate: 1,
          },
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Nightcore filter is now **enabled**`),
          ],
        });
      } else {
        dispatcher.data.set("filter", "none");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Nightcore filter is now **disabled**`),
          ],
        });
      }
    } else if (subcommand === "party") {
      if (dispatcher.data.get("filter") !== "party") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "party");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          equalizer: [
            { band: 0, gain: -1.16 },
            { band: 1, gain: 0.28 },
            { band: 2, gain: 0.42 },
            { band: 3, gain: 0.5 },
            { band: 4, gain: 0.36 },
            { band: 5, gain: 0 },
            { band: 6, gain: -0.3 },
            { band: 7, gain: -0.21 },
            { band: 8, gain: -0.21 },
          ],
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Party filter is now **enabled**`),
          ],
        });
      } else {
        dispatcher.data.set("filter", "none");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Party filter is now **disabled**`),
          ],
        });
      }
    } else if (subcommand === "pop") {
      if (dispatcher.data.get("filter") !== "pop") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "pop");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          equalizer: [
            { band: 0, gain: 0.65 },
            { band: 1, gain: 0.45 },
            { band: 2, gain: -0.45 },
            { band: 3, gain: -0.65 },
            { band: 4, gain: -0.35 },
            { band: 5, gain: 0.45 },
            { band: 6, gain: 0.55 },
            { band: 7, gain: 0.6 },
            { band: 8, gain: 0.6 },
            { band: 9, gain: 0.6 },
            { band: 10, gain: 0 },
            { band: 11, gain: 0 },
            { band: 12, gain: 0 },
            { band: 13, gain: 0 },
          ],
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Pop filter is now **enabled**`),
          ],
        });
      } else {
        dispatcher.data.set("filter", "none");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Pop filter is now **disabled**`),
          ],
        });
      }
    } else if (subcommand === "soft") {
      if (dispatcher.data.get("filter") !== "soft") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "soft");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          lowPass: {
            smoothing: 20.0,
          },
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Soft filter is now **enabled**`),
          ],
        });
      } else {
        dispatcher.data.set("filter", "none");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Soft filter is now **disabled**`),
          ],
        });
      }
    } else if (subcommand === "radio") {
      if (dispatcher.data.get("filter") !== "radio") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "radio");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          equalizer: [
            { band: 0, gain: -0.25 },
            { band: 1, gain: 0.48 },
            { band: 2, gain: 0.59 },
            { band: 3, gain: 0.72 },
            { band: 4, gain: 0.56 },
            { band: 5, gain: 0.15 },
            { band: 6, gain: -0.24 },
            { band: 7, gain: -0.24 },
            { band: 8, gain: -0.16 },
            { band: 9, gain: -0.16 },
            { band: 10, gain: 0 },
            { band: 11, gain: 0 },
            { band: 12, gain: 0 },
            { band: 13, gain: 0 },
            { band: 14, gain: 0 },
          ],
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Radio filter is now **enabled**`),
          ],
        });
      } else {
        dispatcher.data.set("filter", "none");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Radio filter is now **disabled**`),
          ],
        });
      }
    } else if (subcommand === "treblebass") {
      if (dispatcher.data.get("filter") !== "treblebass") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "treblebass");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          equalizer: [
            { band: 0, gain: 0.6 },
            { band: 1, gain: 0.67 },
            { band: 2, gain: 0.67 },
            { band: 3, gain: 0 },
            { band: 4, gain: -0.5 },
            { band: 5, gain: 0.15 },
            { band: 6, gain: -0.45 },
            { band: 7, gain: 0.23 },
            { band: 8, gain: 0.35 },
            { band: 9, gain: 0.45 },
            { band: 10, gain: 0.55 },
            { band: 11, gain: 0.6 },
            { band: 12, gain: 0.55 },
            { band: 13, gain: 0 },
          ],
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Treblebass filter is now **enabled**`),
          ],
        });
      } else {
        dispatcher.data.set("filter", "none");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Treblebass filter is now **disabled**`),
          ],
        });
      }
    } else if (subcommand === "tremolo") {
      if (dispatcher.data.get("filter") !== "tremolo") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "tremolo");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          tremolo: {
            depth: 0.5,
            frequency: 10,
          },
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Tremolo filter is now **enabled**`),
          ],
        });
      } else {
        dispatcher.data.set("filter", "none");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Tremolo filter is now **disabled**`),
          ],
        });
      }
    } else if (subcommand === "vaporwave") {
      if (dispatcher.data.get("filter") !== "vaporwave") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "vaporwave");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          equalizer: [
            { band: 1, gain: 0.3 },
            { band: 0, gain: 0.3 },
          ],
          timescale: { pitch: 0.5 },
          tremolo: { depth: 0.3, frequency: 14 },
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Vaporwave filter is now **enabled**`),
          ],
        });
      } else {
        dispatcher.data.set("filter", "none");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Vaporwave filter is now **disabled**`),
          ],
        });
      }
    } else if (subcommand === "vibrato") {
      if (dispatcher.data.get("filter") !== "vibrato") {
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        dispatcher.data.set("filter", "vibrato");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
          vibrato: {
            frequency: 10,
            depth: 0.9,
          },
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Vibrato filter is now **enabled**`),
          ],
        });
      } else {
        dispatcher.data.set("filter", "none");
        await dispatcher.player.connection.node.send({
          op: "filters",
          guildId: interaction.guild.id,
        });
        return interaction.reply({
          ephemeral: false,
          embeds: [
            new MessageEmbed()
              .setColor(client.settings.embed_color)
              .setDescription(`🎼 Vibrato filter is now **disabled**`),
          ],
        });
      }
    }
  },
};
