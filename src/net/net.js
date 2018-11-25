import net from 'net';

export default class Net {
  server = {};
  msgLog = [];
  constructor(){
    this.server = net.createServer((socket) => {
      //'connection' listener
      console.log('client connected');

      socket.on('end', () => {
        console.log('client disconnected');
      });
      socket.write('hello\r\n');
      socket.pipe(socket);
    });



    //server.on('error', (err) => {
    //  throw err; });

  }

}
