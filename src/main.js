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
      term.grey(userName + ' is joining the room ' + roomName + '...\n\n');
      // Vi använder DHT för att utifrån roomName få port och IP
      term.bar(0.1);

      let myNet = new Net();

      // port number is gained from UPnP
      term('\n\n Write your listening port: ');
      const listenPort = await term.inputField({ minLength: 3 }).promise;
      term('\n\n');

      await myNet.server.listen(listenPort, () => {
        term.grey('opened server on ' + listenPort);
        term('\n\n');
      });

      let clientConnected = false;
      if (listenPort != 111) {
        term('\n Write your connect port: ');
        const connectPort = await term.inputField({ minLength: 3 }).promise;

        var client = new net.Socket();
        clientConnected = true;
        client.connect(connectPort, () => {
          term.grey('Connected');
        });

        client.on('data', function(data) {
          myNet.msgLog.push(JSON.parse(data));
          printLog(myNet, term);

        });

        client.on('close', function() {
          term.grey('Connection closed');
        });
      }

      let userActive = true;
      while(userActive) {
        let choice2 = await term.singleColumnMenu(['Write', 'Leave']).promise;
        switch(choice2.selectedText) {
          case 'Write':
          term('\n Write your message: ');
          const newMessage = await term.inputField({ minLength: 1 }).promise;
          term('\n\n');
          var timestamp = new Date();
          let data = [timestamp, userName, newMessage];

          if (clientConnected) {
            data = JSON.stringify(data);
            client.write(data);
          } else {
            myNet.msgLog.push(data);
          };


          printLog(myNet, term);

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

function printLog(net, term) {

  term.clear();
  //term.inverse.grey('Chatting in room: ', roomName);
  term('\n');

  var logLength = net.msgLog.length;
  var counter = 0;
  while (counter < logLength) {
    var logItem = net.msgLog[counter];
    term.red(logItem[0] + ' ');
    term.green(logItem[1] + ' ');
    term.grey(logItem[2]);
    term('\n')
    counter = counter + 1;
  }

}

Main.main();
