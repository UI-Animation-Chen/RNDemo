import React from 'react';
import MainContainer from './MainContainer';
import { Provider } from 'react-redux';
import store from './GlobalStore';

export default class RootPage extends React.Component {

    render() {
        return (
            <Provider store={store}>
                <MainContainer />
            </Provider>
        );
    }

}
