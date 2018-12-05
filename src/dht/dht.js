import DHT from 'bittorrent-dht';

 export default class dht_class{
    _dht;

     constructor() {
     this._dht = new DHT();

     //hardcoded for now
     this._dht.listen(1111, function(){
       console.log("DHT now listening on 1111");
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

    this._dht.on('announce', (infoHash) =>{
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

    //Does not seem to be working correctly....
    createHashCode(s) {
    for(var i = 0, h = 0; i < s.length; i++)
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return h;
    }

    lookup(infoHash){
      this._dht.emit('lookup', infoHash);
    }
}


let dht = new dht_class();

var tmp = "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh";
//complaind that it needed a string (was sending it the infoHash)...
dht.announce(tmp);

dht.lookup(tmp);
