export default class Action {
    actions;

    constructor(actions) {
        this.actions = actions;
    }

    //
    call(action, context, object) {
        this.actions.action(context, object);
    }
}