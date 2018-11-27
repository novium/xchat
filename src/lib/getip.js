import { promises as dns } from 'dns';
import dgram from 'dgram';
import Buffer from 'buffer';
require("babel-polyfill");

import DHT from 'bittorrent-dht';

export default class {
    static async getIP() {
        // TODO: IPv6 Support
        const server = dgram.createSocket('udp4');

        let buffer = Buffer.alloc(200);

        const id        = 0b0000000000000000;
        const QR        = 0b0;
        const Opcode    = 0b0000;
        const AA        = 0b0;
        const TC        = 0b0;
        const RD        = 0b0;
        const RA        = 0b0;
        const Z         = 0b000;
        const RCODE     = 0b0000;
        const QDCOUNT   = 0b0000000000000000;
        const ANCOUNT   = 0b0000000000000000;
        const NSCOUNT   = 0b0000000000000000;
        const ARCOUNT   = 0b0000000000000000;

        const offset16 = (QR) | (Opcode >>> 1) | (AA >>> 5) | (TC >>> 6)
            | (RD >>> 7) | (RA >>> 8) | (Z >>> 9) | (RCODE >>> 12);

        buffer.writeInt16BE(id, 0); // ID
        buffer.writeInt16BE(offset16, 16);
        buffer.writeInt16BE(QDCOUNT, 32);
        buffer.writeInt16BE(ANCOUNT, 48);
        buffer.writeInt16BE(NSCOUNT, 64);
        buffer.writeInt16BE(ARCOUNT, 96);

        server.close();
    }
}

/* Dev notes

UDP DNS Packet

0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                      ID                       |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|QR|   Opcode  |AA|TC|RD|RA|   Z    |   RCODE   |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                    QDCOUNT                    |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                    ANCOUNT                    |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                    NSCOUNT                    |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|                    ARCOUNT                    |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
 */