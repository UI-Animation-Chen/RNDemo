import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import { Provider } from 'react-redux';
import { ACTION_ADD, ACTION_DELETE } from './ActionTypes';
import store from './GlobalStore';
import InnerPage from './InnerPage';

export default class ReduxMainPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {count: store.getState().count};
    }

    componentDidMount() {
        store.subscribe(() => {
            this.setState({count: store.getState().count});
        });
    }

    increase = () => {
        store.dispatch({type: ACTION_ADD});
    };

    decrease = () => {
        store.dispatch({type: ACTION_DELETE});
    };

    render() {
        return (
            <Provider store={store}>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{fontSize: 20}}>{this.state.count}</Text>
                    <TouchableOpacity style={{margin: 20}} onPress={this.increase}>
                        <Text style={{fontSize: 20, color: '#0000aa'}}>increase</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.decrease}>
                        <Text style={{fontSize: 20, color: '#0000aa'}}>decrease</Text>
                    </TouchableOpacity>
                    <InnerPage/>
                </View>
            </Provider>
        );
    }

}
