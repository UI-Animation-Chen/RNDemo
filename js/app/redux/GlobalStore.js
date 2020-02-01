import { createStore } from 'redux';
import { reducers } from './CommonReducer';

const store = createStore(reducers);
export default store;
