/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {TouchableOpacity, Text, View} from 'react-native';
import VideoViewCompnt from '../native/views/VideoView';
import {createStackNavigator, createAppContainer} from 'react-navigation';

class Player extends React.Component {

  constructor(props) {
    super(props);
    console.log('--==--js Player constructor');
  }

  componentWillMount() {
    console.log('--==--js Player will mount');
  }

  componentWillUnmount() {
    console.log('--==--js Player will unmount');
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'}}>
        <VideoViewCompnt style={{width: 320, height: 180, backgroundColor: '#ddd'}}/>
      </View>
    );
  }
}

class Inner extends React.Component {

  constructor(props) {
    super(props);
    this.txt = this.props.txt;
    this.state = {inner: 7};
  }

  componentWillReceiveProps(nextProps) {
    console.log('---receive :', nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('---update :', nextProps, nextState);
    return true;
  }

  pressed = () => {
    this.setState({inner: -this.state.inner});
  };

  render() {
    console.log('--==--inner render');
    return (
      <TouchableOpacity onPress={this.pressed}>
          <Text style={{marginTop: 10}}>{this.props.txt} + {this.state.inner}</Text>
      </TouchableOpacity>
    );
  }
}

class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {txt: 7};
  }

  play = ()=> {
    this.setState({txt: -this.state.txt});
    // this.props.navigation.push('player');
  };

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'}}>
        <TouchableOpacity onPress={this.play}>
          <Text style={{fontSize: 18}}>play video</Text>
        </TouchableOpacity>
        <Inner txt={this.state.txt}/>
      </View>
    );
  }
}

const navi = createStackNavigator({
  home: {screen: Home},
  player: {screen: Player}
});

export default createAppContainer(navi);