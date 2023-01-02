const fs = require("fs");

/**
 * @param {import("../structures/Client")} client
 */

module.exports = (client) => {
  let eventsCount = 0;
  const events = fs
    .readdirSync("./src/events")
    .filter((file) => file.endsWith(".js"));
  for (let file of events) {
    const event = require(`../events/${file}`);
    client.on(file.split(".")[0], event.bind(null, client));
    eventsCount++;
  }
  if (client.cluster.id === 0) {
    client.logger.info(`loaded ${eventsCount} events.`);
  }
};
