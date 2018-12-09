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
   * Connect to a new node
   * @param host
   * @param port
   * @returns {Promise<void>}
   */
  async connect(host : String, port : Number) : void {
    const socket = new net.Socket();
    socket.setNoDelay(true);
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
  _getKeyValue(key : String) {
    const index = key.lastIndexOf(':');
    const host = key.substr(0, index);
    const port = key.substr(index + 1);

    return { host: host, port: Number.parseInt(port) };
  }

  /**
   * Creates a new server and listens to port
   * @param port
   * @private
   */
  async createServer(port : Number) {
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
    socket.setNoDelay(true);

    // Find the node's server port
    this._sendPacketSocket('port', {}, socket);

    socket.on('data', this._socketData.bind(this, socket));
    socket.on('error', this._socketError.bind(this, socket));
    // socket.on('close', this._socketClose.bind(this, socket.remoteAddress));
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
    data = d.data;

    if(d.version == 1) {
      switch(d.type) {
        case 'message':
          this.onPacket(d.data.message, d.data.user);
          break;

        case 'ping':
          this._sendPacketSocket('pong', {}, socket, []);
          break;

        case 'pong':

          break;

        case 'sync':
          this._sync(socket, data);
          break;

        case 'sync_res':
          this._syncResponse(socket, data);
          break;

        case 'port':
          this._sendPacketSocket('port_res', this.server.address().port, socket, []);
          break;

        case 'port_res':
          this.connectNode(socket.remoteAddress, data, socket);
          socket.on('close', this._socketClose.bind(this, socket.remoteAddress, data))
          break;

        default:
          console.error('[NET] Received unknown message type ' + d.type);
      }
    }
  }

  sync() {
    this._sendPacket('sync', {}, []);
  }

  _sync(socket, data) {
    const res = {
      graph: graphlib.json.write(this._nodeGraph),
      address: socket.remoteAddress,
      port: socket.remotePort
    };

    this._sendPacketSocket('sync_res', res, socket, []);
  }

  /**
   * Handles new synchronization data
   * @param socket Origin socket
   * @param data Graph and our external IP + Port
   * @private
   */
  _syncResponse(socket : net.Socket, data : Object) : void {
    const res = graphlib.json.read(data.graph);
    const addr = this._createNodeKey(data.address, this.server.address().port);

    // Find new nodes
    let nodes = _.without(res.nodes(), addr, 'localhost');
    const localNodes = _.without(
      this._nodeGraph.nodes(),
      'localhost',
      this._createNodeKey(socket.remoteAddress, socket.remotePort)
    );
    nodes = _.difference(nodes, localNodes); // Potential new peers!

    // Add nodes to our graph
    for(let node of nodes) {
      if(!this._nodeGraph.hasNode(node)) {
        const index = node.lastIndexOf(':');
        const host = node.substr(0, index);
        const port = node.substr(index + 1);

        this._nodeGraph.setNode(node, this._createNodeValue(host, this.server.address().port));
      }
    }

    const sinks = _.intersection(this._nodeGraph.sources(), this._nodeGraph.sinks());

    for(let node of sinks) {
      node = this._getKeyValue(node);

      this.connect(node.host, node.port);
    }
  }


  /**
   * Sends a message
   * @param message Object with keys message and user
   */
  sendMessage(user : String, message : String) : void {
    this._sendPacket('message', {
      message: message,
      user: user
    }, []);
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
        this._writePacket(packet, this._sockets[socket]);
      }
    }
  }

  _sendPacketSocket(type, data, socket) {
    const packet = this._encodePacket(type, data, []);
    this._writePacket(packet, socket);
  }

  _writePacket(packet, socket) {
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
