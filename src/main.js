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

      term.red(`
                                                    s    
                         .uef^"                      :8    
   uL   ..             :d88E                      .88    
 .@88b  @88R       .   \`888E             u       :888ooo 
'"Y888k/"*P   .udR88N   888E .z8k     us888u.  -*8888888 
   Y888L     <888'888k  888E~?888L .@88 "8888"   8888    
    8888     9888 'Y"   888E  888E 9888  9888    8888    
    \`888N    9888       888E  888E 9888  9888    8888    
 .u./"888&   9888       888E  888E 9888  9888   .8888Lu= 
d888" Y888*" ?8888u../  888E  888E 9888  9888   ^%888*   
\` "Y   Y"     "8888P'  m888N= 888> "888*""888"    'Y"    
                "P'     \`Y"   888   *Y"   *Y'            
                             J88"                        
                             @%                          
                           :"                            

      `);

      while(true) {
        await Main.menu(term);
        term.clear();
      }

      process.exit(0);
    } catch(err) {}
  }

  static async menu(term) {
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
