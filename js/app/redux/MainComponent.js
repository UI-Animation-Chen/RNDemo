import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

export default class MainComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    onPressed = () => {
        this.props.fetchData('cdx');
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
