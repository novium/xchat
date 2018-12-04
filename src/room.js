export default class {
  _term;

  constructor(term) {
    this._term = term;
  }

  async enter() {
    const term = this._term;

    term.windowTitle('xChat - in room');
    term.clear();
  }
}