import React from 'react';
import { View } from 'react-native';
import VideoViewCompnt from '../../native/views/VideoView';

export default class PlayerPage extends React.Component {

    constructor(props) {
      super(props);
    }
  
    render() {
      return (
        <View style={{flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'}}>
          <VideoViewCompnt style={{width: 320, height: 180, backgroundColor: '#ddd'}}/>
        </View>
      );
    }
}