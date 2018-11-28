import Logger from "./lib/logger";
import terminalKit from 'terminal-kit';
import Net from "./net/net";
import net from 'net';

require("babel-polyfill");

export default class User {

  constructor(userName, roomName) {
    this.name = userName;
    this.roomName = roomName;
    this.msgLog = [];
    this.term  = terminalKit.terminal;
  }

  changeRoom(newRoomName) {
    this.roomName = newRoomName;
  }

  addMsg(msg) {
    this.msgLog.push(msg);
    this.printLog();
  }

  printLog() {
    //this.term.clear();
    this.term.inverse.grey('Chatting in room: ', this.roomName);
    this.term('\n');

    let arrayLength = this.msgLog.length;
    for (let i = 0; i < arrayLength; i++) {
      let logItem = this.msgLog[i];
      this.term.red(logItem[0] + ' ');
      this.term.green(logItem[1] + ' ');
      this.term.grey(logItem[2]);
      this.term('\n')
    };
  };

}
