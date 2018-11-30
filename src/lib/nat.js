import natpmp from 'nat-pmp';
import network from 'network';
import getip from './getip';
require("babel-polyfill");

// Perform rudimentary NAT traversal?
export default class {
    static map() {
        return new Promise(async (resolve, reject) => {
            let router;

            try {
                router = await this._findGateway();
            } catch(e) {
                reject(e);
            }

            const client = natpmp.connect(router);

            client.portMapping({private: 2231, public: 2222, ttl: 10}, function (err, info) {
                if (info.resultCode === 0 && err === null) {
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