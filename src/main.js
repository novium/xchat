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


      term.grey(userName + ' is joining the room ' + roomName + '...\n');
      // Vi använder DHT för att utifrån roomName få port och IP
      term.bar(0.1);

      let net = new Net();

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

          var timestamp = Date.now();
          net.msgLog.push([newMessage, timestamp]);
          console.log(timestamp);

          /*
          //Detta skulle vara kod för att
          datevalues = [
          timestamp.getFullYear(),
          timestamp.getMonth()+1,
          timestamp.getDate(),
          timestamp.getHours(),
          timestamp.getMinutes(),
          timestamp.getSeconds(),
          ];
          */

          /*
          //Detta skulle vara kod för att loopa igenom igenom loggen
          // och printa raderna som : year month day time usename message
          var logLength = net.msgLog.length;
          console.log(2);
          while (logLength > 0) {
            console.log(3);
            console.log(length);
            console.log('item at length: ' + net.msgLog[length-1]);

            var logItem = net.msgLog[length-1]
            term.red(logItem[1] + ' ');
            tem.green(userName + ' ');
            term.grey(logItem[0]);
            console.log(4);
          }
          */

          term('\n');
          term.grey('Log:\n' + net.msgLog[net.msgLog.length - 1]);
          term('\n\n');
          break;

          case 'Leave':
          term.grey(userName + ' is leaving the room ' + roomName + '...\n');
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
