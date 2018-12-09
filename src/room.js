import 'net';
import Net from "./net/net";
import DHT from "./dht/dht.js";
import GetIP from './lib/getip';

export default class {
  _term;
  _net;
  _username;
  _dht;
  _port = 6666;
  _ip;
  _roomName;

  constructor(term, username, roomName) {
    this._term = term;
    this._net = new Net(this.messageCallback.bind(this));
    this._username = username;
    this._roomName = roomName;
  }

  async enter() {
    const term = this._term;

    term.grey("Starting connection...\n");
    this._port = await this._net.createServer(this._port);

    this._dht = new DHT(this._port);
    this._dht.findPeers(this._roomName);

    setInterval(() => {
      for(let node of this._dht.peerList) {
        console.log("Connecting to " + node.host + ':' + node.port);

        if(!this._net.isConnected(node.host, node.port) && !(this._ip === node.host && this._port === node.port) ) {
          this._net.connect(node.host, node.port);
          console.log(node.host + ':' + node.port);
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
          return;
          break;

        case '!help':
          await this._writeHelp();
          break;

        default:
          // TODO: Send message
          this._net.sendMessage(this._username, message);
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

  messageCallback(message, username) {
    this._writeMessage(username, message);
  }
}
