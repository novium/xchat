import DHT from 'bittorrent-dht';

export default class dht_class{
  _dht;

  constructor(listenPort) {
    this._dht = new DHT();

    //hardcoded for now
    this._dht.listen(listenPort, function(){
      console.log("DHT now listening on: "+listenPort);
    });
/*
    this._dht.on('peer', function (peer, infoHash, from) {
      //console.log('found potential peer ' + peer.host + ':' + peer.port + ' through ' + from.address + ':' + from.port);
      console.log(peer);
      //console.log(infoHash);
    });

    this._dht.on('error', function(err){
      console.log("Error experienced");
      throw(err);
    });

    this._dht.on('node', (newNode) => {
      this._dht.addNode(newNode);
      //console.log(newNode);
    });

    this._dht.on('announce', (infoHash, listenPort) =>{
      //console.log("'announce' emit received");
      //this._dht.announce(infoHash);
    });

    this._dht.on('lookup', (infoHash) =>{
      console.log("'lookup' emit received");
      //this._dht.lookup(infoHash);
    });
*/
  }

  announce(infoHash) {
    this._dht.announce(infoHash);
  }

  lookup(infoHash){
    this._dht.lookup(infoHash);
  }
}

/*
let sha1 = require('sha1');
let infoHash = sha1("roomNameTemp");
//let newBuffy = Buffer.from(infoHash);
let dht = new dht_class(1112);
dht.announce(infoHash);
dht.lookup(infoHash);
*/
