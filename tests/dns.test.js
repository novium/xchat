import test from 'ava';

import ip from '../src/lib/getip';

test('get ip', t => {
    ip.getIP();

    t.pass();
});