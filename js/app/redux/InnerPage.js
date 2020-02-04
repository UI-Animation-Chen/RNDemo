import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import { connect } from 'react-redux';

class InnerPage extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={{margin: 20}}>
                <Text>{this.props.str}</Text>
            </View>
        );
    } 

}

const mapStateToProps = (state) => ({
    str: state.str
});

export default connect(mapStateToProps)(InnerPage);
