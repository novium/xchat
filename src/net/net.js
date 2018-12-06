import net from 'net';
import nat from '../lib/nat';
import graphlib from 'graphlib';
import terminalKit from 'terminal-kit';
import _ from 'lodash';

export default class Net {
  onPacket;
  term;
  server;

  _nodeGraph;
  _sockets = {};
  // _maxClients = 3;

  constructor(onPacket){
    // Create client graph for gossip
    this._nodeGraph = new graphlib.Graph({ directed: false });
    this._nodeGraph.setNode('localhost'); // TODO: Add host + port

    this.onPacket = onPacket;
  };




  /**
   * NEW
   */

  /**
   * Connect to a new node
   * @param host
   * @param port
   * @returns {Promise<void>}
   */
  async connect(host : String, port : Number) : void {
    const socket = new net.Socket();
    socket.on('data', this._socketData.bind(this, socket));
    socket.on('error', this._socketError.bind(this, socket));
    socket.on('close', this._socketClose.bind(this, host, port));

    try {
      await socket.connect(port, host);
    } catch(e) { console.log('Something went wrong connecting to ' + host + ':' + port); }

    this.connectNode(host, port, socket);
  }


  // Connects to a node
  connectNode(host : String, port : Number, socket) : void {
    this.addNode(host, port);
    this._nodeGraph.setEdge('localhost', this._createNodeKey(host, port));
    this._sockets[this._createNodeKey(host, port)] = socket;
  }

  // Adds node to graph
  addNode(host : String, port : Number) : void {
    this._nodeGraph.setNode(
      this._createNodeKey(host, port),
      this._createNodeValue(host, port)
    );
  }

  removeNode(host : String, port : Number) : void {
    this._nodeGraph.removeNode(this._createNodeKey(host, port));
  }

  // Create a key for graph nodes
  _createNodeKey(host : String, port : Number) : Object { return host + ':' + port; }
  _createNodeValue(host : String, port : Number) : Object { return { host: host, port: port }; }

  /**
   * Creates a new server and listens to port
   * @param port
   * @private
   */
  async _createServer(port : Number) {
    port = await nat.map(port);
    port = port.internal;

    this.server = net.createServer()
      .on('connection', this._serverConnection.bind(this))
      .on('error', this._serverError.bind(this));

    this.server.listen(port, '0.0.0.0');
  }

  /**
   * Handler for new server connections
   * @param socket
   * @private
   */
  _serverConnection(socket : net.Socket) : void {
    this.connectNode(socket.remoteAddress, socket.remotePort, socket);
    socket.on('data', this._socketData.bind(this, socket));
    socket.on('error', this._socketError.bind(this, socket));
    socket.on('close', this._socketClose.bind(this, socket.remoteAddress, socket.remotePort));
  }

  /**
   * Handles server errors
   * @param error
   * @private
   */
  _serverError(error : Error) : void {
    console.log('Something went wrong with the server.');
    console.log(error);
    process.exit(1);
  }

  _socketError(e) {
    console.log('Socket returned an error ' + e);
  }

  /**
   * Callback when socket is closed
   * @param host
   * @param port
   * @param error Is true if an error occurred
   * @private
   */
  _socketClose(host, port, error) {
    this.removeNode(host, port);
    delete this._sockets[this._createNodeKey(host, port)];
  }

  /**
   * Handles new data on sockets
   * @param data
   * @private
   */
  _socketData(socket, data) {
    const d = JSON.parse(data);
    console.log(d);

    if(d.version == 1) {
      switch(d.type) {
        case 'message':
          this.onPacket(d.data);
          break;

        case 'ping':
          socket.write(this._encodePacket('pong', {}));
          break;

        case 'pong':
          break;

        case 'sync':
          this._sync(socket, data);
          break;

        case 'sync_res':

          break;

        default:
          console.error('[NET] Received unknown message type ' + d.type);
      }
    }
    /*console.log('Server data: ', JSON.parse(data));
    this.onPacket(JSON.parse(data));*/
  }

  _sync(socket, data) {
    // TODO: Sync
    const graph = graphlib.json.write(this._nodeGraph);
    this._sendPacketSocket('sync', graph, socket);
  }


  /**
   * Sends a message
   * @param message Object with keys message and user
   */
  sendMessage(message : String) {
    let arrayLength = this.connectedClients.length;
    for (let i = 0; i< arrayLength; i++) {
      let client = this.connectedClients[i];
      client.write(this._encodePacket('ping', message));
    }
  }

  sendSync() {
    let arrayLength = this.connectedClients.length;
    for (let i = 0; i< arrayLength; i++) {
      let client = this.connectedClients[i];
      client.write(this._encodePacket('sync', {}));
    }
  }

  /**
   * Creates and sends a packet
   * @param type Type of packet, e.g. message, sync, ping
   * @param data Data object, see documentation
   * @param pass Nodes to pass, can be undefined
   * @private
   */
  _sendPacket(type, data, pass) {
    const packet = this._encodePacket(type, data, pass);
    let neighbors = this._nodeGraph.neighbors('localhost');
    neighbors = _.difference(neighbors, pass);

    for(let socket of Object.keys(this._sockets)) {
      if(neighbors.includes(socket)) {
        this._sockets[socket].write(packet);
      }
    }
  }

  _sendPacketSocket(type, data, socket) {
    const packet = this._encodePacket(type, data, pass);
    socket.write(packet);
  }

  /**
   * Builds a packet
   * @param type Type of packet e.g. message, sync, ping
   * @param data Data object, see documentation if applicable
   * @returns {string} JSON Encoded data
   * @private
   */
  _encodePacket(type : String, data : Object, pass : Array) : String {
    return JSON.stringify({
      version: 1,
      type: type,
      data: data,
      pass: pass
    });
  }
}
