import DHT from 'bittorrent-dht';
import sha1 from 'sha1';

export default class dht_class{
  _dht;
  peerList;

  constructor(listenPort) {
    this._dht = new DHT();
    this.peerList = [];

    this._dht.listen();

    this._dht.on('peer',(peer, infoHash, from) => {
      //console.log('found potential peer ' + peer.host + ':' + peer.port + ' through ' + from.address + ':' + from.port);
      let exists = false;
      for (let i = 0; i < this.peerList.length; i++){
        if (this.peerList[i] = peer)
          {
            exists = true;
            break;
          }
      }
      if (!exists){
        this.peerList.push(peer);
        console.log(this.peerList);
      }
    });

    /*
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

  findPeers(roomName) {
  let infoHash = sha1(roomName+roomName+roomName);
  this.announce(infoHash);
  this.lookup(infoHash);
  }

/*
  getFields(field) {
    let output = [];
    for (let i=0; i < this.peerList.length ; ++i)
        output.push(this.peerList[i][field]);
    return output;
  } */
}

/*
let infoHash = sha1("roomNameTemp");
//let newBuffy = Buffer.from(infoHash);
let dht = new dht_class(1112);
dht.announce(infoHash);
dht.lookup(infoHash);
*/
