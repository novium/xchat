import 'net';
import Net from "./net/net";
import DHT from "./dht/dht.js";
import GetIP from './lib/getip';
import Db from "./store/db";
import NTP from "./lib/ntp";

import MerkleTree from 'merkletreejs';
import SHA256 from 'crypto-js/sha256';
import sorted from 'sorted-array-functions';

export default class {
  _term;
  _net;
  _username;
  _dht;
  _port = 5555;
  _ip;
  _db;
  _roomName;

  _merkle;
  _messages;

  constructor(term, username, roomName) {
    this._term = term;
    this._net = new Net(
      this.messageCallback.bind(this),
      this.nodeCallback.bind(this),
      this.messageSyncCallback.bind(this),
      this.getMessages.bind(this)
    );
    this._username = username;
    this._roomName = roomName;
    this._db = new Db();

    // Merkle tree!
    this._messages = [];
    this._merkle = new MerkleTree(this._messages.map(x => SHA256(x)), SHA256);
  }

  async enter() {
    const term = this._term;
    term.grey("Starting connection...\n");
    this._port = await this._net.createServer(this._port);
    await this._db.init();

    this._dht = new DHT(this._port);
    this._dht.findPeers(this._roomName);
    //this_db.saveNode(this._ip, this._port);
    setInterval(() => {
      for(let node of this._dht.peerList) {
        if(!this._net.isConnected(node.host, node.port) && !(this._ip === node.host && this._port === node.port) ) {
          this._net.connect(node.host, node.port);
        }
        else {
          this._dht.removePeer(node);
        }
      }
    }, 2000);

    setInterval(async () => {
      await this._net.sync();
    }, 3000);

    term.windowTitle('xChat - in room');
    term.clear();

    await this._main();
  }

  async _main() {
    const term = this._term;

    await this._writeMessage('clippy', 'I\'m here if you need me, just type !help');

    while(true) {
      term.moveTo(1, term.height).grey('>> ');
      let message = await term.inputField().promise;

      switch(message) {
        case '!exit':
        case '!quit':
          saveNL();
          process.exit(0);
          return;
          break;

        case '!help':
          await this._writeHelp();
          break;

        default:
          // TODO: Send message
          const timestamp = this.getTimestamp();
          this._net.sendMessage(this._username, message, timestamp);
          this._writeMessage('you', message);
          this._insertMessage(this._username, message, timestamp);
          break;
      }

      term.moveTo(1, term.height);
      term.eraseLine();
    }
  }

  async _writeHelp() {
    const helpText = `
    Available commands:
      !quit - quit
      !help - this text
    `;

    await this._writeMessage('clippy', helpText);
  }

  async _writeMessage(user, msg) {
    const term = this._term;

    term.moveTo(2, term.height - 1);
    term.scrollUp(1);
    term.eraseLine();
    term.grey(user + ': ').defaultColor(msg);
    term.moveTo(1, term.height).grey('>> ');
  }

  /**
   * Is called when a new node is connected
   * @param host hostname
   * @param port
   */
  nodeCallback(host, port) {
    this._db.saveNode(host, port);
  }

  /**
   * Is called when another node syncs messages
   */
  messageSyncCallback(messages) : Object {
    // TODO
  }

  getMessages(timestamp) {

  }

  messageCallback(message, username, timestamp) {
    this._writeMessage(username, message);
    this._db.saveMessage(this._dht, message, username, timestamp);
    this._insertMessage(username, message, timestamp);
  }

  saveNL() {
    for (let node of this._net.getNodes()) {
      this._db.saveNode(node.host, node.port);
    }
  }


  _compareMessage(a, b) {
    if(a.timestamp > b.timestamp) {
      return 1;
    } else if(a.timestamp < b.timestamp) {
      return -1;
    } else {
      return 0;
    }
  }

  _insertMessage(username, message, timestamp) {
    sorted.add(
      this._messages,
      { username: username, message: message, timestamp: timestamp },
      this._compareMessage
    );
  }

  getTimestamp() {
    return Math.round(((new Date().getTime()) + NTP.getTime().t)/1000);
  }

  currentTime() {
    let time = this.getTimestamp();
    let date = new Date(t*1000);
    let month = date.getMonth();
    let day = date.getDate();
    let hour = date.getHours();
    let minute = '0' + date.getMinutes();
    let second = '0' + date.getSeconds();
  }
}
