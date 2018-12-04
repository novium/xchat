import DHT from 'bittorrent-dht';
 export default class{
    _dht;

     constructor() { //Easier to just use let ourDHT = new DHT() but oh well.
     this._dht = new DHT();

     //hardcoded for now
     this._dht.listen(1111, function(){
       console.log("DHT now listening on 1111");
     });

     //if we get a new potential peer, print this and update hash(?)
    this._dht.on('peer', function (peer, infoHash, from) {
      console.log('found potential peer ' + peer.host + ':' + peer.port + ' through ' + from.address + ':' + from.port);
    });

  /*  this._dht.on('listening', function(){
      console.log("DHT is now listening");
    });
*/
    this._dht.on('error', function(err){
      console.log("Error experienced");
      throw(err);
    });

    this._dht.on('node', function(newNode){
        this._dht.addNode(newNode);
    });

    this._dht.on('announce', function(peer, infoHash){

    });
}
    //To be used instead of the constructors listen.
    startListening(listenPort){
      this._dht.listen(listenPort, function(){
        console.log("DHT listening on: "+listenPort);
      });
    }

    infoGet(hash, callback){
      this._dht.get(hash, NULL, callback);
    }

    endDHT() {
      this._dht.destroy();
    }

    announce(room) {
    }

    //function for generating a hash from a string.
    createHashCode(s) {
    for(var i = 0, h = 0; i < s.length; i++)
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return h;
}
}
