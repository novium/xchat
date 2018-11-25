import Logger from "./lib/logger";
import terminalKit from 'terminal-kit';
import Net from "./net/net";

require("babel-polyfill");

class Main {
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

      term.windowTitle('xChat - Chatting in: ' + roomName);
      term.grey(userName + ' is joining the room ' + roomName + '...\n');
      // Vi använder DHT för att utifrån roomName få port och IP
      term.bar(0.1);

      let net = new Net();

      // port number is gained from UPnP
      let port;
      switch(userName) {
        case "david":
            port = 111;
            break;
        case "isak":
            port = 222;
            break;
        default:
            port = 8080;
      }

      net.server.listen(port, () => {
        term.grey('Listening to port: ' + port);
        term('\n\n');
      });
      console.log(4);
      term('\n\n');
      term.grey('Previous log: ' + net.msgLog[0]);
      term('\n\n');

      let userActive = true;
      while(userActive) {
        let choice2 = await term.singleColumnMenu(['Write', 'Leave']).promise;
        switch(choice2.selectedText) {
          case 'Write':
          term('\n Write your message: ');
          const newMessage = await term.inputField({ minLength: 1 }).promise;
          term('\n\n');

          var timestamp = new Date();
          net.msgLog.push([newMessage, timestamp]);

          term.clear();
          term.inverse.grey('Chatting in room: ', roomName);
          term('\n');

          var logLength = net.msgLog.length;
          var counter = 0;
          while (counter < logLength) {
            var logItem = net.msgLog[counter];
            term.red(logItem[1].toUTCString() + ' ');
            term.green(userName + ' ');
            term.grey(logItem[0]);
            term('\n')
            counter = counter + 1;
          }

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


}


process.on('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})

Main.main();
