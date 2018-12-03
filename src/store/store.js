// @flow

import _ from 'lodash';

export default class Store {
    /**
     * State
     * @type {{}}
     * @private
     */
    _state     = {};
    _orig = {};

    /**
     * Actions
     * @type {{}}
     * @private
     */
    _actions   = {};

    /**
     * Mutations
     * @type {{}}
     * @private
     */
    _mutations = {};

    /**
     * Getters
     * @type {{}}
     * @private
     */
    _getters   = {};

    /**
     * History
     * @type {{}}
     * @private
     */
    _history = {};

    /**
     * Creates a new Store
     *
     * @param state initial state, only JSON allowed
     * @param actions actions on the state
     * @param mutations mutations of the state
     * @param getters getters for the state
     */
    constructor(state : Object, actions : Object, mutations : Object, getters : Object) : void {
        let copy = _.cloneDeep(state);

        this._orig = copy;
        this._state     = Object.assign(
            this._state,
            new Proxy(copy, Store._general_handlers)
        );

        this._actions   = actions;
        this._mutations = mutations;
        this._getters   = getters;
    }

    static _general_handlers = {
        get(target, property, receiver) {
            if(target[property] === undefined) {
                return undefined;
            }

            // TODO: Remove array check!
            if(Array.isArray(target[property])) {
                return new Proxy(target[property], Store._general_handlers);
            } else {
                if(target[property] instanceof Object) {
                    return new Proxy(target[property], Store._general_handlers);
                } else {
                    return target[property];
                }
            }
        },

        set(target, property, value, receiver) {
            target[property] = value;

            // Array observers need special treatment since they need to be prototypes
            if(receiver.hasOwnProperty('_observers')) {
                for(let observer of target._observers) {
                    observer(_.cloneDeep(target));
                    break;
                }
            }

            return true;
        }
    };

    /**
     * Dispatches a new action
     *
     * @param action name of the action
     * @param data optional data for the action
     */
    dispatch(action : string, data : Object) : void {
        this._actions[action](this, data);
    }

    /**
     * Commits a new mutation
     *
     * @param mutation name of the mutation
     * @param payload optional payload for the mutation
     */
    commit(mutation : string, payload : Object) : void {
        // TODO: Catch errors
//      try {
            this._mutations[mutation](this._state, payload)
//      } catch(e) {
//          console.log("Caught: " + e);
//      }
    }

    /**
     * Gets values from state
     *
     * @param getter name of getter
     * @param args optional arguments
     * @returns {*}
     */
    get(getter : string, ...args) : Object {

        let state = _.cloneDeep(this._orig);
        for(let v in state) {
            if(v instanceof Object) {
                for(let vp in v) {
                    if(Array.isArray(vp)) delete vp._observers;
                }
            }
        }

        return this._getters[getter](state, args);
    }

    observe(key, callback) {
        if(Array.isArray(this._state[key])) {
            if(this._orig[key]._observers === undefined) {
                this._orig[key]._observers = [callback];
            } else {
                this._orig[key]._observers.push(callback)
            }

            return;
        }

        if(this._orig[key].hasOwnProperty(key)) {
            this._orig[key].push(callback);
        } else {
            Object.assign(this._orig, { [key]: callback});
        }
    }

    _getHistory() : Object {
        return this._history;
    }

    _setState(field : String, value : Object) {
        this._state[field] = value;
    }
}