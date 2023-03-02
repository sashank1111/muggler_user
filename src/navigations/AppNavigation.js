import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Splash from '../screens/Splash';
import Splashtest from '../screens/Splashtest'
import Home from '../screens/Home'
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import ForgotPassword from '../screens/ForgotPassword';
import Welcome from '../screens/Welcome'
import DrawerScreen from '../screens/Drawer/Drawer'
import Filter from '../screens/Filter'
import {Image,
       View,
       TouchableOpacity,
      Text} from 'react-native'
import AppStyles from '../../src/styles/AppStyles'
import Blog from '../screens/Blog'
import { navigationRef } from './RootNavigation';
import PaymentNew from '../screens/PaymentNew';
const Stack = createStackNavigator();
// const LoginStack = createStackNavigator({
//   //Splash:{screen:Splash,navigationOptions: { headerShown: false, gestureEnabled: false }},
//   Welcome:{screen:Welcome,navigationOptions: { headerShown: false, gestureEnabled: false }},
//   Login:{screen:Login,navigationOptions: { headerShown: false, gestureEnabled: false }},
//   Signup:{screen:SignUp,navigationOptions: { headerShown: false, gestureEnabled: false }},
//   ForgotPassword:{screen:ForgotPassword,navigationOptions: { headerShown: false, gestureEnabled: false }}
// })

// const DashboardStack = createStackNavigator({
//   Home:{screen:Home,navigationOptions: { headerShown: false, gestureEnabled: false }},
  
// })

// const MainNavigator = createStackNavigator({
//   LoginStack:{screen:LoginStack},
//   DashboardStack:{screen:DashboardStack, navigationOptions: { gestureEnabled: false , animationEnabled: false} },
// },
// {
//   mode:'card',
//   headerMode: "none",
//   cardStyle: { opacity: 1 } ,
//   defaultNavigationOptions: { gestureEnabled: false },
//   //initialRouteName: "LoadScreen",
//   navigationOptions: () => ({
//     gestureEnabled: false,
//     headerShown: false,
//   }),  transitionConfig: () => 
//   ({
//     transitionSpec:{
//       duration:0,
//       timing: Animated.timing,
//       easing:Easting.step0,
//     }
//   }),
  
// });

function drawerStackNavigator() {
  return (
      <Stack.Navigator>
         <Stack.Screen name="Drawer" component={DrawerScreen} options={{headerShown: false}}/>
         <Stack.Screen name="Filter" component={Filter} options={{ headerShown: false }} />
      </Stack.Navigator>
  );
}


export default function AppNavigation() {
  return (
      <NavigationContainer ref={navigationRef} theme={{ colors: { background: 'black' } }}>
          <Stack.Navigator initialRouteName="Welcome" >
              <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
              <Stack.Screen name="Blog" component={Blog} options={{ headerShown: false }} />
              <Stack.Screen name="Signup" component={SignUp} options={{ headerShown: false }} />
              <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
              <Stack.Screen name="PaymentNew" component={PaymentNew} options={{ headerShown: false }} />
              {/* <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} /> */}
              <Stack.Screen name="Drawer" component={drawerStackNavigator} options={{ headerShown: false }} />
          </Stack.Navigator>
      </NavigationContainer>
  );
}

