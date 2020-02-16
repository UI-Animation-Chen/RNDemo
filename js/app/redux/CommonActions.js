import { createActions } from 'reduxsauce';

const { Types: _Types, Creators: _Creators } = createActions({
    fetch_data: ['params'],
    fetch_succeeded: ['result'],
    fetch_failed: ['err']
});

export const Creators = _Creators;
export const Types = _Types;
