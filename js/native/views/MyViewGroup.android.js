/**
 * 封装原生ios的VideoView
 **/

import React from 'react';
import { View, Text, requireNativeComponent } from 'react-native';

let MyViewGroup = requireNativeComponent("MyViewGroup", MyViewGroupCompnt);

export default class MyViewGroupCompnt extends React.Component {
  render() {
    return (
      <MyViewGroup {...this.props}>
        <View style={{ width: 100, height: 100, backgroundColor: '#0f0', borderColor: '#00f', borderWidth: 1 }}/>
        <Text style={{ padding: 20 }}>hello world</Text>
      </MyViewGroup>
    );
  }
}
