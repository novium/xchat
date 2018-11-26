import sqlite3 from 'sqlite3';
require("babel-polyfill");

export default class {
    _db;

    constructor() {

    }

    async init() {
        this._db = await new sqlite3.Database('db.sqlite3');
        await this._db.on('error', (error) => {
            console.log(error);
        });

        // Create tables
        await this.run(`
            CREATE TABLE IF NOT EXISTS messages (
                hash NCHAR(64) PRIMARY KEY,
                message TEXT,
                username VARCHAR(64)
            )
        `);
    }

    async run(...params) {
        try {
            const res = await this._db.run.apply(this._db, params);
        } catch(error) {
            console.log("THREW ERROR!");
            return error;
        }
    }
}