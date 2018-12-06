import DHT from 'bittorrent-dht';

 export default class dht_class{
    _dht;

     constructor(listenPort) {
     this._dht = new DHT();

     //hardcoded for now
     this._dht.listen(listenPort, function(){
       console.log("DHT now listening on: "+listenPort);
     });


    this._dht.on('peer', function (peer, infoHash, from) {
      console.log('found potential peer ' + peer.host + ':' + peer.port + ' through ' + from.address + ':' + from.port);
      //Update hashtable
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
        console.log("'announce' emit received");
        this._dht.announce(infoHash);
    });

    this._dht.on('lookup', (infoHash) =>{
      console.log("'lookup' emit received");
      this._dht.lookup(infoHash);
    });
}

    infoGet(hash, callback){
      this._dht.get(hash, callback);
    }

    announce(infoHash) {
      this._dht.emit('announce', infoHash);
    }

    lookup(infoHash){
      this._dht.emit('lookup', infoHash);
    }
}

var magnet = require('magnet-uri')
var uri = 'magnet:?xt=urn:btih:e3811b9539cacff680e418124272177c47477157'
var parsed = magnet(uri)

let dht = new dht_class(1111);

dht.announce(parsed.infoHash);
