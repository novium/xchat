import test from 'ava';

import ip from '../src/lib/getip';

import { PerformanceObserver, performance } from 'perf_hooks';

test('get ip', async t => {
    const res = await ip.getIP();

    // Can't do much more than this.
    t.truthy(res.length != 0);
});