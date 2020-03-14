import React from 'react';
import MainContainer from './MainContainer';
import { Provider } from 'react-redux';
import store from './GlobalStore';

export default class RootPage extends React.Component {

    render() {
        // 将navigation传到MainContainer中，即MainComponent
        return (
            <Provider store={store}>
                <MainContainer {...this.props}/>
            </Provider>
        );
    }

}
