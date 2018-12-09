import 'net';
import Net from "./net/net";

export default class {
  _term;
  _net;
  _username;

  constructor(term, username) {
    this._term = term;
    this._net = new Net(this.messageCallback.bind(this));
    this._username = username;
  }

  async enter() {
    const term = this._term;

    await this._net.createServer(process.argv[2]);

    if(process.argv[2] == 3333) {
      await this._net.connect('127.0.0.1', 1111);
    }

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