import Logger from "./lib/logger";
import terminalKit from 'terminal-kit';
import Net from "./net/net";
import User from './user';
import Room from './room';
import net from 'net';
import DHT from './dht/dht';

require("babel-polyfill");

class Main {
  static term = terminalKit.terminal;
  static msgLog = [];

  static async main() {
    try {
      let term = this.term;
      term.windowTitle('xChat - not connected');
      term('Welcome to ');
      term.red('xChat \n');

      while(true) {
        term.clear();
        await Main.menu(term);
      }

      process.exit(0);
    } catch(err) {}
  }

  static async menu(term) {
    /*let choice = await term.singleColumnMenu(['Connect', 'Quit']).promise;

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

      let net = new Net(this.msgLog.push);

      // port number is gained from UPnP
      term('\n\n Write your listening port: ');
      const listenPort = await term.inputField({ minLength: 3 }).promise;
      term('\n\n');

      await net.server.listen(listenPort, () => {
        term.grey('opened server on ' + listenPort);
        term('\n\n');
      });

      if (listenPort != 1111) {
        const connectPort = await term.inputField({ minLength: 3 }).promise;
        net.addPort(1111);
      };
      net.startConnections();

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
          user.addMsg(data);
          net.sendData(data);

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
    }*/

    let choice = await term.singleColumnMenu(['Connect', 'Quit']).promise;

    switch(choice.selectedText) {
      case 'Connect':
        await Main.connect(term);
        return;
        break;

      case 'Quit':
      default:
        process.exit(0);
    }

  }

  static async connect(term) {
    term.clear();
    term.green('Room (min. 5): ');
    let roomName = await term.inputField({ minLength: 5 }).promise; term('\n');

    term.green('\nEnter user name (min. 3): ');
    const userName = await term.inputField({ minLength: 3 }).promise; term('\n\n');
    let user = new User(userName, roomName);

    //term.grey('Finding peers...\n');

    //term.grey('Found %d peers...\n', dht.peerList.length);
    //term.grey('Initializing network...\n');

    const room = new Room(term, roomName);
    await room.enter();

    return;
  }
}



process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1)
});



Main.main();
