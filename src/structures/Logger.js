const chalk = require("chalk");

class Logger {
  success(message) {
    return console.log(`${chalk.green(`✔ success:`)} ${chalk.italic(message)}`);
  }
  error(message) {
    return console.log(`${chalk.red(`✖ error:`)} ${chalk.italic(message)}`);
  }
  info(message) {
    return console.log(`${chalk.cyan(`ℹ info:`)} ${chalk.italic(message)}`);
  }
}

module.exports = Logger;
