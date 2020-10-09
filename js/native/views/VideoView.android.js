/**
 * 封装原生android的VideoView
 **/

import React from 'react';
import {requireNativeComponent} from 'react-native';

const VideoView = requireNativeComponent("VideoView", VideoViewCompnt);

export default class VideoViewCompnt extends React.Component {
  render() {
    return (
      <VideoView {...this.props}/>
    );
  }
}
