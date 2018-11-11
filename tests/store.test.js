import test from 'ava';

import Store from '../src/store/store';

test('constructor', t => {
    const store = new Store();

    t.not(store, undefined);
});