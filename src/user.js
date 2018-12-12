import Logger from "./lib/logger";
import terminalKit from 'terminal-kit';
import Net from "./net/net";
import net from 'net';

require("babel-polyfill");

export default class User {
  name = {};
  roomName = {};
  //msgLog = {};
  term = {};

  constructor(userName, roomName) {
    this.name = userName;
    this.roomName = roomName;
    //this.msgLog = [];
    this.term  = terminalKit.terminal;
  }

  changeRoom(newRoomName) {
    this.roomName = newRoomName;
  }

  addMsg(msg) {
    this.msgLog.push(msg);
    this.printLog();
  }

  printLog(msgLog) {
    this.term.clear();
    this.term.inverse.grey('Chatting in room: ', this.roomName);
    this.term('\n');

    let arrayLength = msgLog.length; //should be thos.msgLog if using msgLog in user
    for (let i = 0; i < arrayLength; i++) {
      let logItem = msgLog[i];  //should be thos.msgLog if using msgLog in user
      this.term.red(logItem[0] + ' ');
      this.term.green(logItem[1] + ' ');
      this.term.grey(logItem[2]);
      this.term('\n')
    };
  };

}
