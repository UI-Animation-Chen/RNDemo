import React from 'react';
import { View } from 'react-native';
import MyViewGroupCompnt from '../../native/views/MyViewGroup';

export default class MyViewGroupPage extends React.PureComponent {
    render() {
        return (
            <MyViewGroupCompnt {...this.props}/>
        );
    }
}
