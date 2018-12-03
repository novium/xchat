// @flow
import chalk from 'chalk';
import fs from 'fs';

export default class Logger {
    #fs;

    constructor(filename : string) : void {
        filename = filename || 'log.txt';
        this.#fs = fs.openSync('./' + filename, 'w+');
    }

    _write(text : string) : void {
        fs.appendFileSync(this.#fs, text + '\n');
    }

    close() {
        fs.closeSync(this.#fs);
    }

    info(message: string) : void {
        this._write('[I] ' + message)
    }

    error(message: string) : void {
        this._write('[E] ' + message)
    }
}