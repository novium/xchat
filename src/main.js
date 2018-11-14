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
                term.grey('Joining the room ' + roomName + '...\n');
                // Vi använder DHT för att utifrån roomName få port och IP
                term.bar(0.1);

                let net = new Net();



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
