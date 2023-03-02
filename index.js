/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import React from 'react';
import {name as appName} from './app.json';
import Payment from './src/screens/Payment'
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import countReducer from './src/redux/reducers'
import Contact from './src/screens/Contact'
LogBox.ignoreAllLogs(true)
const store = createStore(countReducer);

const RNRedux = () => (
    <Provider store = { store }>
      <App />
    </Provider>
  )


AppRegistry.registerComponent(appName, () => RNRedux);
