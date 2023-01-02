const fs = require("fs");

/**
 * @param {import("../structures/Client")} client
 */

module.exports = (client) => {
  let messageCommandsCount = 0;
  let slashCommands = [];
  fs.readdirSync("./src/commands/Message").forEach((dir) => {
    const commands = fs
      .readdirSync(`./src/commands/Message/${dir}`)
      .filter((file) => file.endsWith(".js"));
    for (let file of commands) {
      let pull = require(`../commands/Message/${dir}/${file}`);
      if (pull.name) {
        client.messageCommands.set(pull.name, pull);
        messageCommandsCount++;
      }
    }
  });
  if (client.cluster.id === 0) {
    client.logger.info(`loaded ${messageCommandsCount} message commands.`);
  }
  fs.readdirSync("./src/commands/Slash").forEach((dir) => {
    const commands = fs
      .readdirSync(`./src/commands/Slash/${dir}`)
      .filter((file) => file.endsWith(".js"));
    for (let file of commands) {
      let pull = require(`../commands/Slash/${dir}/${file}`);
      if (pull.name) {
        client.slashCommands.set(pull.name, pull);
        slashCommands.push(pull);
      }
    }
  });
  client.once("ready", async () => {
    await client.application.commands.set(slashCommands);
  });
  if (client.cluster.id === 0) {
    client.logger.info(`loaded ${slashCommands.length} slash commands.`);
  }
};
