import net from 'net';
import terminalKit from 'terminal-kit';

export default class Net {
  static term = terminalKit.terminal;
  server = {};
  // msgLog = [timesamp,username, message]
  msgLog = [];
  constructor(){
    this.msgLog = [];
    this.server = net.createServer((socket) => {
      //'connection' listener
      console.log('client connected');

      socket.on('end', () => {
      console.log('client disconnected');
      });

      socket.on('data', function(data) {
        //msgLog.push(JSON.parse(data));
        console.log(JSON.parse(data));

      });
      //socket.write([timestamp, "server", "Welcome to server"]);
      socket.pipe(socket);
    });

    //server.on('error', (err) => {
    //  throw err; });

  }

}
