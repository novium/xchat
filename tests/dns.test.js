import test from 'ava';

import ip from '../src/lib/getip';

test('get ip', async t => {
    await ip.getIP();

    t.pass();
});