# xchat
Project for the course 1DT102 Computer Networks and Distributed Systems (10c) at Uppsala University. It implements a fully P2P chat application piggybacking on the BitTorrent DHT network for node discovery and a gossip protocol to exchange messages and peers within the system running over TCP sockets.

## How to run

1. Run `npm i`
2. Run `npm run start`

## How to test

### Typecheck
1. `npm run build`
2. `npm run flow check`

### Tests
1. `npm run test`
