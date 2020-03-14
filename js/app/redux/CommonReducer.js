import { createReducer } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import { Types } from './CommonActions';

const initialState = Immutable({
    count: 7,
    str: 'hello czf.'
});

const HANDLES = {
    [Types.FETCH_SUCCEEDED]: fetchSucceeded,
    [Types.FETCH_FAILED]: fetchFailed
};

function fetchSucceeded(state, { result }) {
    return state.set('str', result);
}

function fetchFailed(state, { err }) {
    return state.set('str', err);
}

// 将type和方法关联，再与初始的state关联。
export default createReducer(initialState, HANDLES);
