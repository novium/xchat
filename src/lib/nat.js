import natpmp from 'nat-pmp';
import getip from './getip';
require("babel-polyfill");

// Perform rudimentary NAT traversal?
export default class {
    static map() {
        return new Promise((resolve, reject) => {
            // TODO: Discover NAT router.
            const client = natpmp.connect('192.168.1.1');

            client.portMapping({ private: 2231, public: 2222, ttl: 10 }, function (err, info) {
                if (err) throw err;
                console.log(info);
                if(info.resultCode === 0 && err === null) {
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
}