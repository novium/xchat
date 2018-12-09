import natpmp from 'nat-pmp';
import network from 'network';
import getip from './getip';
require("babel-polyfill");

// Perform rudimentary NAT traversal?
export default class {
    static map(port) {
        return new Promise(async (resolve, reject) => {
            let router;
            port = port || 1111;

            try {
                router = await this._findGateway();
            } catch(e) {
                reject(e);
            }

            const client = natpmp.connect(router);

            client.portMapping({ private: port, public: port, ttl: 3600 }, function (err, info) {
                if (err === null) {
                  client.close();
                  resolve({
                    external: info.external,
                    internal: info.internal
                  });
                } else {
                    reject(err);
                }
            });
        });
    }

    static _findGateway() {
        return new Promise((resolve, reject) => {
            network.get_gateway_ip((err, ip) => {
                if (err == null) {
                    resolve(ip);
                } else {
                    reject(err);
                }
            });
        });
    }
}