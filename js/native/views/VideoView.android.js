/**
 * 封装原生ios的VideoView
 **/

import React from 'react';
import {requireNativeComponent} from 'react-native';

let VideoView = requireNativeComponent("VideoView", VideoViewCompnt);

export default class VideoViewCompnt extends React.Component {
  render() {
    return (
      <VideoView {...this.props}/>
    );
  }
}
