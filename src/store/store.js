// @flow

export default class Store {
    #actions = {};
    #getters = {};
    #history = {};

    constructor(actions : Object, getters : Object) : void {
        this.#actions = actions;
        this.#getters = getters;
    }

    dispatch(action : string, data : Object) : void {
        this.#actions[action](this, data);
    }

    get(getter : string) : Object {
        return this.#getters[getter]();
    }

    _getHistory() : Object {
        return this.#history;
    }
}