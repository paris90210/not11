const { Client, Collection, Intents } = require("discord.js");
const Cluster = require("discord-hybrid-sharding");
const Manager = require("kazagumo");
const mongoose = require("mongoose");
const Topgg = require("@top-gg/sdk");
const settings = require("../../settings");
const Util = require("./Util");
const Logger = require("./Logger");

class Apera extends Client {
  constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.DIRECT_MESSAGES,
      ],
      presence: {
        activities: [
          {
            name: `${settings.prefix}help`,
            type: "LISTENING",
          },
        ],
      },
      shardCount: Cluster.data.TOTAL_SHARDS,
      shards: Cluster.data.SHARD_LIST,
    });

    this.cluster = new Cluster.Client(this);
    this.cooldowns = new Collection();
    this.messageCommands = new Collection();
    this.slashCommands = new Collection();
    this.settings = settings;
    this.util = new Util(this);
    this.logger = new Logger();
    this.owners = ["588659781930188811"];
    this.topggapi = null;
    this.manager = new Manager(
      this,
      this.settings.audionodes,
      {
        moveOnDisconnect: false,
        resumable: false,
        resumableTimeout: 30,
        reconnectTries: 2,
        restTimeout: 10000,
      },
      {
        spotify: {
          clientId: "e49c05eb12e14f49b1d63f7be0bb4b7c", // replace with your details,
          clientSecret: "ec4be40f84914618a36906a1a4fafa48",
        },
        defaultSearchEngine: "youtube_music",
      }
    );
  }
  build() {
    this.login(this.settings.token);
    mongoose.connect(this.settings.mongo, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    ["command", "event", "playerEvents"].forEach((handler) => {
      require(`../handlers/${handler}`)(this);
    });
    return this;
  }
}

module.exports = Apera;
