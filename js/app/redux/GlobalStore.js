import { createStore, applyMiddleware } from 'redux';
import reducers from './CommonReducer';
import createSagaMiddleware from 'redux-saga';
import sagas from './Sagas';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(reducers, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(sagas);

export default store;
