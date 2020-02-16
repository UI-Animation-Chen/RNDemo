import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { getData } from './NetServices';
import { Creators, Types } from './CommonActions';

function* fetchData (action) {
    try {
        const result = yield call(getData, action.params);
        yield put(Creators.fetch_succeeded(result));
    } catch (err) {
        yield put(Creators.fetch_failed(err.toString()));
    }
}

export default function* sagas () {
    yield takeLatest(Types.FETCH_DATA, fetchData);
}
