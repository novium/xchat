// @flow

import chalk from 'chalk';

export default class Logger {
    static info(message: string) : void {
        console.log(chalk.blueBright('[I] ' + message));
    }

    static error(message: string) : void {
        console.log(chalk.redBright('[E] ' + message));
    }
}