import net from 'net';
import terminalKit from 'terminal-kit';

export default class Net {

  constructor(onPacket){
    this.connectedClients = [];
    this.portList = [];
    this.term = terminalKit.terminal;
    this.server = net.createServer((socket) => {
      //'connection' listener
      console.log('client connected');

      socket.on('end', () => {
      console.log('client disconnected');
      });

      socket.on('data', function(data) {
        console.log('Got to server.socket.on');
        console.log('Server data: ', JSON.parse(data));
        onPacket(JSON.parse(data));

      });
      socket.pipe(socket);
    });

  };

  addClient(client) {
    this.connectedClients.push(client);
  };

  addPort(port) {
    this.portList.push(port);
  };

  startConnections(onPacket) {
    let arrayLength = this.portList.length;
    for (let i = 0; i < arrayLength; i++) {
      let client = new net.Socket();
      client.connect(this.portList[i], () => {
        this.term.grey('Connected');
      });

      client.on('data', function(data) {
        console.log('Client data: ', data);
        onPacket(JSON.parse(data));
      });


      client.on('close', function() {
        this.term.grey('Connection closed');
      });
      this.connectedClients.push(client);
    };
  };

  sendData(data) {
    let arrayLength = this.connectedClients.length;
    for (let i = 0; i< arrayLength; i++) {
      console.log('before write');
      var client = this.connectedClients[i];
      client.write(JSON.stringify(data));
      console.log('After write');
    }
  }

}
