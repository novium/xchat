import chalk from 'chalk';

export default class Logger {
    static info(message) {
        console.log(chalk.blueBright('[I] ' + message));
    }

    static error(message) {
        console.log(chalk.redBright('[E] ' + message));
    }
}