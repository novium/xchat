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

    // port number is gained from UPnP
    const port = 8080;

    this.server.listen(port, () => {
      console.log('Listening to port: ' + port);
    })

    //server.on('error', (err) => {
    //  throw err; });

  }

}
