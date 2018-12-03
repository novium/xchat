import net from 'net';
import terminalKit from 'terminal-kit';

export default class Net {

  constructor(onPacket){
    this.connectedClients = [];
    this.portList = [];
    this.term = terminalKit.terminal;
    this.onPacket = onPacket;
    this.server = net.createServer((socket) => {
      //'connection' listener
      this.term('client connected');

      socket.on('end', () => {
      console.log('client disconnected');
      });

      socket.on('data', (data) => {
        //console.log('Server data: ', JSON.parse(data));
        this.onPacket(JSON.parse(data));

      });
      socket.pipe(socket);
      this.connectedClients.push(socket);
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

      client.on('data', (data) => {
        //console.log('Client data: ', JSON.parse(data));
        this.onPacket(JSON.parse(data));
      });


      client.on('close', () => {
        this.term.grey('Connection closed');
      });
      this.connectedClients.push(client);
    };
  };

  sendData(data) {
    let arrayLength = this.connectedClients.length;
    for (let i = 0; i< arrayLength; i++) {
      var client = this.connectedClients[i];
      client.write(JSON.stringify(data));
    }
  }

}
