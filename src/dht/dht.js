import DHT from 'bittorrent-dht';
 export default class {
    _dht;

     constructor() { //Easier to just use let ourDHT = new DHT() but oh well.
        this._dht = new DHT();
        this._dht.listen();
    }

    this._dht.on('peer', function (peer, infoHash, from) {
      console.log('found potential peer ' + peer.host + ':' + peer.port + ' through ' + from.address + ':' + from.port)
    });

    this._dht.on('listening', function{
      console.log("DHT is now listening");
    });

    this._dht.on('error', function(err){
      console.log("Error experienced");
      throw(err);
    });

    this._dht.on('node', function(newNode){
        this._dht.addNode(newNode);
    });

    this._dht.on('announce', function(peer, infoHash){

    });

    infoGet(hash, callback){
      this._dht.get(hash, NULL, callback);
    }

    endDHT() {
      this._dht.destroy();
    }

    announce(room) {
    }
}
