import { call, put, takeLatest } from 'redux-saga/effects';
import { getData } from './NetServices';
import { Creators, Types } from './CommonActions';

function* fetchData ({ params }) {
    try {
        const result = yield call(getData, params);
        yield put(Creators.fetch_succeeded(result));
    } catch (err) {
        yield put(Creators.fetch_failed(err.toString()));
    }
}

export default function* sagas () {
    // 将action和对应的方法进行关联
    yield takeLatest(Types.FETCH_DATA, fetchData);
}
