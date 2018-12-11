import sqlite3 from 'sqlite3';
require("babel-polyfill");

export default class Db {
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
              id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
              hash NCHAR(64) NOT NULL,
              message TEXT NOT NULL,
              username VARCHAR(64) NOT NULL,
              timestamp INT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS node_list (
              id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
              host VARCHAR(255) NOT NULL,
              user_port INT NOT NULL
          );`);
  }
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

    saveMessage(hash, msg, username, time){
      await this.run(`
        INSERT INTO messages(hash, message, username, timestamp)
        VALUES (
            `+ hash +`,
            `+ msg +`,
            `+ username +`,
            `+ time +`);`
      );
    }

    saveNode(host_ip, port) {
      await this.run(`
        INSERT INTO node_list(host, user_port)
        VALUES (
            `+ host_ip +`,
            `+ port +`);`
      );
    }
    
}
