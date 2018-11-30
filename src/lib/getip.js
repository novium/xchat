import { promises as dns } from 'dns';
import URL from 'url';
import hexy from 'hexy';

import dgram from 'dgram';
require("babel-polyfill");

export default class {
    static getIP() {
        return new Promise((resolve, reject) => {

            // TODO: IPv6 Support
            const server = dgram.createSocket('udp4');
            server.bind();
            server.ref();

            const addr = encodeURI('o-o.myaddr.l.google.com').split('.');

            const buffer = Buffer.alloc(12 + 4 + addr.join('').length + addr.length * 2 - 1);

            const id        = 0b1010010100101001; // Random ID
            const QR        = 0b0               ; // Query / Response
            const Opcode    = 0b0000            ; // Operation
            const AA        = 0b0               ; // Not important
            const TC        = 0b0               ; // Truncation
            const RD        = 0b1               ; // Recursion
            const RA        = 0b0               ; // Recursion available (not important)
            const Z         = 0b000             ; // Not important
            const RCODE     = 0b0000            ; // Not important
            const QDCOUNT   = 0b0000000000000001; // # Queries
            const ANCOUNT   = 0b0000000000000000; // # Responses
            const NSCOUNT   = 0b0000000000000000; // Not important
            const ARCOUNT   = 0b0000000000000000; // Not important

            const offset16 = (QR) | (Opcode >>> 1) | (AA >>> 5) | (TC >>> 6)
                | (RD >>> 7) | (RA >>> 8) | (Z >>> 9) | (RCODE >>> 12);

            buffer.writeUInt16BE(id, 0); // ID
            buffer.writeUInt16BE(offset16, 2);
            buffer.writeUInt16BE(QDCOUNT, 4);
            buffer.writeUInt16BE(ANCOUNT, 6);
            buffer.writeUInt16BE(NSCOUNT, 8);
            buffer.writeUInt16BE(ARCOUNT, 10);

            let offset = 12;
            for(let i = 0; i < addr.length; i++) {
                buffer.writeInt8(addr[i].length, offset);
                buffer.write(addr[i], offset + 1, 'ascii');
                offset += addr[i].length + 1;
            }
            buffer.writeUInt8(0b00000000, offset);

            buffer.writeUInt16BE(16, offset + 1);
            buffer.writeUInt16BE(0b00000001, offset + 3);

            server.on('message', (msg, rinfo) => {
                const res = Buffer.slice(msg, 54).toString('utf-8');

                server.close();
                resolve(res);
            });

            server.on('error', (err) => {
                console.error(err);

                server.close();
            });

            server.send(buffer, 53, 'ns1.google.com', (err) => {
                if (err != null) {
                    console.log('send error: ' + err);
                    reject();
                }
            });
        });
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