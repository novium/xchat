import 'net';
import Net from "./net/net";
import DHT from "./dht/dht.js";
import GetIP from './lib/getip';
import Db from "./store/db";

export default class {
  _term;
  _net;
  _username;
  _dht;
  _port = 5555;
  _ip;
  _db;
  _roomName;

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
  }

  async enter() {
    const term = this._term;
    currentTime();
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

    await saveNL(); //----------------------------------------------- Insert more text here! ---------------------------------------------


    /*setTimeout(async () => {
      for(let i = 0; i < this._dht.peerList.length; i++){
        // TODO: Do we have the same IP if on a wifi-point? If so, make it possible to still connect.
        //if (this._dht.peerList[0]["host"])
        console.log(this._dht.peerList[i]);
        term.gray("Trying to connect...\n>>");
        this._net.connect(this._dht.peerList[i]["host"], this._dht.peerList[i]["port"]);
      }
    }, 2100); */


    setInterval(async () => {
      await this._net.sync();
    }, 3000);

    term.grey("Starting connection...\n");
    this._port = await this._net.createServer(this._port);

    this._dht = new DHT(this._port);
    this._dht.findPeers(this._roomName);

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


    /*setTimeout(async () => {
      for(let i = 0; i < this._dht.peerList.length; i++){
        // TODO: Do we have the same IP if on a wifi-point? If so, make it possible to still connect.
        //if (this._dht.peerList[0]["host"])
        console.log(this._dht.peerList[i]);
        term.gray("Trying to connect...\n>>");
        this._net.connect(this._dht.peerList[i]["host"], this._dht.peerList[i]["port"]);
      }
    }, 2100); */


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
          process.exit(0);
          return;
          break;

        case '!help':
          await this._writeHelp();
          break;

        default:
          // TODO: Send message
          this._net.sendMessage(this._username, message, getTimestamp());
          this._writeMessage('you', message);
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
  }

  saveNL(nodeList) {
    for (let node in nodeList) {
      this._db.saveNode(node.host, node.port);
    }
  }

  getTimestamp(){
    return  Math.round(new Date().getTime()/1000);
  }

  currentTime(){
      let t = getTimestamp();
      let dt = new Date(t*1000);
      let month = dt.getMonth();
      let day = dt.getDate();
      let hr = dt.getHours();
      let m = '0'+dt.getMinutes();
      let s = '0' +dt.getSeconds();
      term.green(day+'/'+(month+1)+'-'+hr+':'+m.substr(-2)+':'+s.substr(-2)+'\n');
    }
}
