import DHT from 'bittorrent-dht';

export default class {
    _dht;

    constructor() {
        this._dht = new DHT();

        this._dht.on('peer', this.onPeer);
    }

    onPeer(peer, infoHash, from) {

    }

    announce(room) {

    }
}