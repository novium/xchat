import test from 'ava';

import Store from '../src/store/store';

test('constructor', t => {
    const store = new Store({}, actions, {}, getters);

    t.not(store, undefined);
});

const state = {
    messages: []
}

const actions = {
  'newMessage': (context, message) => {
    context.commit('addMessage', message);
  }
};

const mutations = {
  'addMessage': (state, message) => {
      state.messages.push(message);
  }
};

const getters = {
    'getMessages': (state) => {
        return state.messages;
    }
};

test('new message', t => {
    const store = new Store(state, actions, mutations, getters);

    store.dispatch('newMessage', 'Hello world!');
    t.deepEqual(store.get('getMessages'), ['Hello world!']);

    store.dispatch('newMessage', 'Hello world again!!!');
    t.deepEqual(store.get('getMessages'), ['Hello world!', 'Hello world again!!!']);
});