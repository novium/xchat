import Logger from "./lib/logger";
import terminalKit from 'terminal-kit';
import Net from "./net/net";
import User from './user';
import net from 'net';

require("babel-polyfill");

class Main {
  static msgLog = []; // Denna ska inte ligga här ;U
  static term = terminalKit.terminal;

  static async main() {
    try {
      let term = this.term;

      term.windowTitle('xChat - not connected');
      term('Welcome to ');
      term.red('xChat \n');

      while(true) {
        await Main.menu(term);
      }

      process.exit(0);
    } catch(err) {}
  }

  static async menu(term) {
    let choice = await term.singleColumnMenu(['Connect', 'Quit']).promise;

    switch(choice.selectedText) {
      case 'Connect':
      term.windowTitle('xChat - enter room name');
      term('\n room name: ');
      const roomName = await term.inputField({ minLength: 3 }).promise;
      term('\n\n');

      term.windowTitle('xChat - enter user name');
      term('\n user name: ');
      const userName = await term.inputField({ minLength: 3 }).promise;
      term('\n\n');

      let user = new User(userName, roomName);

      term.windowTitle('xChat - Chatting in: ' + user.roomName);
      term.grey(user.name + ' is joining the room ' + user.roomName + '...\n\n');
      // Vi använder DHT för att utifrån roomName få port och IP
      term.bar(0.1);

      let net = new Net((msg) => {
        this.msgLog.push(msg);
        user.printLog(this.msgLog);
      });

      // port number is gained from UPnP
      term('\n\n Write your listening port: ');
      const listenPort = await term.inputField({ minLength: 3 }).promise;
      term('\n\n');

      await net.server.listen(listenPort, () => {
        term.grey('opened server on ' + listenPort);
        term('\n\n');
      });

      if (listenPort != 111) {
        term('\n\n Write your connection port: ');
        const connectPort = await term.inputField({ minLength: 3 }).promise;
        term('\n\n');
        net.addPort(111);
      }
      net.startConnections((msg) => {
        this.msgLog.push(msg);
        user.printLog(this.msgLog);
      });

      let userActive = true;
      while(userActive) {
        let choice2 = await term.singleColumnMenu(['Write', 'Leave']).promise;
        switch(choice2.selectedText) {
          case 'Write':
          term('\n Write your message: ');
          const newMessage = await term.inputField({ minLength: 1 }).promise;
          term('\n\n');
          let timestamp = new Date();
          let data = [timestamp, userName, newMessage];

          this.msgLog.push(JSON.parse(JSON.stringify(data)));
          //user.addMsg(data);
          net.sendData(data);
          user.printLog(this.msgLog);

          term('\n\n');
          break;

          case 'Leave':
          term.grey(userName + ' is leaving the room ' + roomName + '...\n');
          term.windowTitle('xChat - not connected');
          userActive = false;
          break;
        }
      }

      break;

      case 'Quit':
      process.exit(0);
      break;
    }
  }

  static addMsg(msg) {
    this.msgLog.push(msg);
    user.printLog(this.msgLog);
  }

}

process.on('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})



Main.main();
