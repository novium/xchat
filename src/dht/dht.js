import DHT from 'bittorrent-dht';
import sha1 from 'sha1';

export default class dht_class {
  _dht;
  _port;
  peerList;

  constructor(port) {
    console.log("AHSIFDHAEIOFHIOUASHFGHASOIGFHIOAHSGIH");
    this._dht = new DHT();
    this.peerList = [];
    this._port = port;

    this._dht.listen();

    this._dht.on('peer',(peer, infoHash, from) => {
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
        //console.log(this.peerList);
      }
    });
  }

  announce(infoHash) {
    this._dht.announce(infoHash, this._port);
  }

  lookup(infoHash){
    this._dht.lookup(infoHash);
  }

  findPeers(roomName) {
    let infoHash = sha1(roomName+roomName+roomName);
    this.announce(infoHash, this._port);
    this.lookup(infoHash);
  }

  removePeer(peer){
    for (let i = 0; i < this._dht.peerList.length; i++) {
      if (this.peerList[i] = peer){
        this.peerList.splice(i, 1);
      }
    }
  }

}
