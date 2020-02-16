import { createReducer } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import { Types } from './CommonActions';

const initialState = Immutable({
    count: 7,
    str: 'hello czf.'
});

const HANDLES = {
    [Types.FETCH_DATA]: fetchData,
    [Types.FETCH_SUCCEEDED]: fetchSucceeded,
    [Types.FETCH_FAILED]: fetchFailed
};

function fetchData(state, action) {
    return state;
}

function fetchSucceeded(state, action) {
    return state.set('str', action.result);
}

function fetchFailed(state, action) {
    return state.set('str', action.err);
}

export default createReducer(initialState, HANDLES);
