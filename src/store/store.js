// @flow

export default class Store {
    /**
     * State
     * @type {{}}
     */
    #state     = {};

    /**
     * Actions
     * @type {{}}
     */
    #actions   = {};

    /**
     * Mutations
     * @type {{}}
     */
    #mutations = {};

    /**
     * Getters
     * @type {{}}
     */
    #getters   = {};

    /**
     * History
     * @type {{}}
     */
    #history = {};

    /**
     * Creates a new Store
     *
     * @param state initial state
     * @param actions actions on the state
     * @param mutations mutations of the state
     * @param getters getters for the state
     */
    constructor(state : Object, actions : Object, mutations : Object, getters : Object) : void {
        this.#state     = new Proxy(state, this.#handlers);
        this.#actions   = actions;
        this.#mutations = mutations;
        this.#getters   = getters;
    }

    #handlers = {
        get(target, property, receiver) {
            return target[property];
        }
    };

    /**
     * Dispatches a new action
     *
     * @param action name of the action
     * @param data optional data for the action
     */
    dispatch(action : string, data : Object) : void {
        this.#actions[action](this, data);
    }

    /**
     * Commits a new mutation
     *
     * @param mutation name of the mutation
     * @param payload optional payload for the mutation
     */
    commit(mutation : string, payload : Object) : void {
        this.#mutations[mutation](this.#state, payload)
    }

    /**
     * Gets vaules from state
     *
     * @param getter name of getter
     * @param args optional arguments
     * @returns {*}
     */
    get(getter : string, ...args) : Object {
        return this.#getters[getter](this.#state, args);
    }

    _getHistory() : Object {
        return this.#history;
    }

    _setState(field, value) {
        this.#state[field] = value;
    }
}