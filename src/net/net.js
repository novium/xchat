import net from 'net';

export default class Net {
  server = {};
  // msgLog = [timesamp,username, message]
  msgLog = [];
  constructor(){
    this.server = net.createServer((socket) => {
      //'connection' listener
      console.log('client connected');

      socket.on('end', () => {
      console.log('client disconnected');
      });
      var timestamp = new Date();
      //socket.write([timestamp, "server", "Welcome to server"]);
      socket.pipe(socket);
    });



    //server.on('error', (err) => {
    //  throw err; });

  }

}
