import { ACTION_ADD, ACTION_DELETE } from "./ActionTypes";

const initialState = {
    count: 7,
    str: 'hello, czf.'
};

export function reducers(state = initialState, action) {
    switch (action.type) {
        case ACTION_ADD:
            return {...state, count: state.count+1};
        case ACTION_DELETE:
            return {...state, count: state.count-1};
        default:
            return state;
    }
}
