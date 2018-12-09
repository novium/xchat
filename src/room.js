import DHT from './dht/dht';

export default class {
  _term;

  constructor(term, roomName) {
    this._term = term;
    let dht = new DHT();
    dht.findPeers(roomName);
  }

  async enter() {
    const term = this._term;

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

    term.moveTo(1, term.height - 1);
    term.scrollUp(1);
    term.eraseLine();
    term.grey(user + ': ').defaultColor(msg);
  }
}
