import { ACTION_ADD, ACTION_DELETE } from "./ActionTypes";

export function reducers(state = 7, action) {
    switch (action.type) {
        case ACTION_ADD:
            return (state + 1);
        case ACTION_DELETE: 
            return (state - 1);
        default:
            return state;
    }
}
