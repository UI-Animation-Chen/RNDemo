import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import store from './GlobalStore';
import { ACTION_ADD, ACTION_DELETE } from './ActionTypes';

export default class MainComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    onPressed = () => {
        store.dispatch({ type: ACTION_ADD });
    }

    render() {
        return (
            <View style={{margin: 20}}>
                <TouchableOpacity onPress={this.onPressed}>
                    <Text>{this.props.str} + {this.props.count}</Text>
                </TouchableOpacity>
            </View>
        );
    } 

}
