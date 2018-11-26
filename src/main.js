import Logger from "./lib/logger";
import terminalKit from 'terminal-kit';
import Net from "./net/net";
import net from 'net';

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

      let myNet = new Net();
      //net.connect();

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

      myNet.server.listen(port, () => {
        term.grey('opened server on ');
        console.log( myNet.server.address());
        term('\n\n');
      });

      var client = new net.Socket();
      client.connect(8080, () => {
        console.log('Connected');
        client.write('Hello world!');
        console.log('connection done');
      });
      console.log(2);

      client.on('data', function(data) {
        console.log('Recieved: ' + data);
      });
      console.log(3);

      client.on('close', function() {
        console.log('Connection closed');
      });
      console.log(4);

      term('\n\n');
      term.grey('Previous log: ' + myNet.msgLog[0]);
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
          myNet.msgLog.push([newMessage, timestamp]);

          term.clear();
          term.inverse.grey('Chatting in room: ', roomName);
          term('\n');

          var logLength = myNet.msgLog.length;
          var counter = 0;
          while (counter < logLength) {
            var logItem = myNet.msgLog[counter];
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
