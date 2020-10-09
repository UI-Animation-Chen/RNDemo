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
import ReduxMainPage from './redux/RootPage';
import PlayerPage from './pages/PlayerPage';
import HomePage from './pages/HomePage';
import DraggablePage from './pages/DraggablePage';
import ExcelPage from './pages/ExcelPage';
import RecycleScrollviewPage from './pages/RecycleScrollviewPage';
import MyViewGroupPage from './pages/MyViewGroupPage';

BatchedBridge.registerCallableModule('MyJsModule', {
  myJsMethod: () => {
    console.log('--==-- jsFunc executed.');
  }
});

const navi = createStackNavigator({
  home: {
    screen: HomePage,
    navigationOptions: {
      title: 'home'
    }
  },
  player: {
    screen: PlayerPage,
    navigationOptions: {
      title: 'player'
    }
  },
  apps_edit_page: {
    screen: AppsEditPage,
    navigationOptions: {
       title: 'apps setting'
    }
  },
  redux_page: {
    screen: ReduxMainPage,
    navigationOptions: {
      title: 'redux page'
    }
  },
  draggable_page: {
    screen: DraggablePage,
    navigationOptions: {
      title: 'draggable page'
    }
  },
  excel_page: {
    screen: ExcelPage,
    navigationOptions: {
      title: 'excel page'
    }
  },
  recycle_scrollview_page: {
    screen: RecycleScrollviewPage,
    navigationOptions: {
      title: 'recycle scrollview page'
    }
  },
  my_viewgroup_page: {
    screen: MyViewGroupPage,
    navigationOptions: {
      title: 'my viewgroup page'
    }
  }
});

export default createAppContainer(navi);
