import test from 'ava';

import ip from '../src/lib/getip';

import { PerformanceObserver, performance } from 'perf_hooks';

test('get ip', async t => {
    let avg = [];
    for(let i = 0; i < 5; i++) {
        const t0 = performance.now();
        const res = await ip.getIP();
        const t1 = performance.now();
        avg[i] = (t1 - t0);
    }

    console.log("avg: " + avg.reduce((acc, b) => { return acc + b; }) / avg.length);
    t.pass();
});