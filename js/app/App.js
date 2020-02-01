/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import {createStackNavigator, createAppContainer} from 'react-navigation';
import BatchedBridge from 'react-native/Libraries/BatchedBridge/BatchedBridge';
import AppsEditPage from './pages/AppsEditPage';
import ReduxMainPage from './redux/ReduxMainPage';
import PlayerPage from './pages/PlayerPage';
import HomePage from './pages/HomePage';

BatchedBridge.registerCallableModule('MyJsModule', {
  myJsMethod: () => {
    console.log('--==-- jsFunc executed.');
  }
});

const navi = createStackNavigator({
  home: {screen: HomePage},
  player: {screen: PlayerPage},
  apps_edit_page: {screen: AppsEditPage},
  redux_page: {screen: ReduxMainPage}
});

export default createAppContainer(navi);
