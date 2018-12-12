import sqlite3 from 'sqlite3';
require("babel-polyfill");

export default class Db {
    _db;

    constructor() {

    }

    async init() {
        this._db = await new sqlite3.Database('db.sqlite3');

        this._db.on('error', (error) => { });

        // Create tables
        await this.run(`
          CREATE TABLE IF NOT EXISTS messages (
              id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
              hash NCHAR(64) NOT NULL,
              message TEXT NOT NULL,
              username VARCHAR(64) NOT NULL,
              timestamp INT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS node_list (
              id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
              host VARCHAR(255) NOT NULL,
              user_port INT NOT NULL,
          );
          `);
    }

    async run(...params) {
        try {
            return await this._db.run.apply(this._db, params);
        } catch(error) {
            throw error;
        }
    }

    async get(...params) {
        try {
            return await this._db.get.apply(this._db, params);
        } catch(error) {
            throw error;
        }
    }

    async all(...params) {
        try {
            return await this._db.all.apply(this._db, params);
        } catch(error) {
            throw error;
        }
    }

    async saveMessage(hash, msg, username, time) {
      try {
        this._db.run(`
          INSERT INTO messages(hash, message, username, timestamp)
          VALUES (
            ` + hash + `,
            ` + msg + `,
            ` + username + `,
            ` + time + `);`
        );
      } catch(e) { return; }
    }

    async saveNode(host_ip, port) {
      try {
        this._db.run(`
        INSERT INTO node_list(host, user_port)
        VALUES (?, ?);`, [host_ip, port], () => {});
      } catch(err) { return; }
    }
}
