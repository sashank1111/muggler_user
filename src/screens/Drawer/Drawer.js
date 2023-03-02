import React,{Component} from 'react'
import { createDrawerNavigator,DrawerItem } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { StackActions } from '@react-navigation/native'
import Home from '../Home';
import Sidebar from './Sidebar';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Keyboard
} from 'react-native'

import AppStyles from '../../styles/AppStyles'
import Profile from '../Profile/Profile';
import ProfileEdit from '../Profile/ProfileEdit';
import SavedAddress from '../Profile/SavedAddress';
import Notifications from '../Notifications';
import ProductCategory from '../ProductCategory';
import ProductDetails from '../ProductDetails';
import Cart from '../Cart';
import Contact from '../Contact';
import Checkout from '../Checkout'
import AddAddress from '../AddAddress';
import Payment from '../Payment';
import MyOrder from '../MyOrders/MyOrder'
import OrderDetails from '../MyOrders/OrderDetails'
import Login from '../Login';
import ChangePassword from '../Profile/ChangePassword';
import { connect } from 'react-redux';
import OrderTracking from '../MyOrders/OrderTracking';
import { useDispatch } from 'react-redux'
import {changeDeliveryAddress, showProductSearchView} from '../../redux/actions'


const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();


function HomeTabStack(props) {
    let address = props.address
    let count = props.count
    let isLoggedIn = props.isLoggedIn
    return (
            <Stack.Navigator initialRouteName="Home" 
                screenOptions={({ navigation, route }) => ({ headerShown: true, headerLeft:null,
                    headerTitleContainerStyle:{ flex:1, paddingHorizontal:5}, 
                    headerStyle:{backgroundColor:'black', height:65,},  headerTitle: props => 
                    <Header {...props}  navigation={navigation} route={route} 
                    address={address} count={count} isLoggedIn={isLoggedIn}
                    />})}
                >
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Cart" component={Cart}/>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Contact" component={Contact} />
                <Stack.Screen name="Notifications" component={Notifications}/>
                <Stack.Screen name="ProductDetails" component={ProductDetails}  />
                <Stack.Screen name="ProductCategory" component={ProductCategory} />
                <Stack.Screen name="Profile" component={Profile}  />
                <Stack.Screen name="ProfileEdit" component={ProfileEdit}  />
                <Stack.Screen name="SavedAddress" component={SavedAddress}  />
                <Stack.Screen name="AddAddress" component={AddAddress}  />
                <Stack.Screen name="Payment" component={Payment} />
                <Stack.Screen name="MyOrder" component={MyOrder} />
                <Stack.Screen name="OrderTracking" component={OrderTracking}/>
                <Stack.Screen name="OrderDetails" component={OrderDetails}/>
                <Stack.Screen name="Checkout" component={Checkout} />
            </Stack.Navigator>
    );
}
function ProfileTabStack(props) {
    let address = props.address
    let count = props.count
    let isLoggedIn = props.isLoggedIn
    return (
            <Stack.Navigator initialRouteName="Profile" 
                screenOptions={({ navigation, route }) => ({ headerShown: true, headerLeft:null,
                    headerTitleContainerStyle:{ flex:1, paddingHorizontal:5}, 
                    headerStyle:{backgroundColor:'black', height:60, },  headerTitle: props => 
                    <Header {...props}  navigation={navigation} route={route} 
                    address={address} count={count} isLoggedIn={isLoggedIn}
                    />})}
                >
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Cart" component={Cart}/>
                <Stack.Screen name="Contact" component={Contact} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Notifications" component={Notifications}/>
                <Stack.Screen name="ProductDetails" component={ProductDetails}  />
                <Stack.Screen name="ProductCategory" component={ProductCategory} />
                <Stack.Screen name="Profile" component={Profile}  />
                <Stack.Screen name="ProfileEdit" component={ProfileEdit}  />
                <Stack.Screen name="SavedAddress" component={SavedAddress}  />
                <Stack.Screen name="AddAddress" component={AddAddress}  />
                <Stack.Screen name="Payment" component={Payment} />
                <Stack.Screen name="MyOrder" component={MyOrder} />
                <Stack.Screen name="OrderDetails" component={OrderDetails}/>
                <Stack.Screen name="OrderTracking" component={OrderTracking}/>
                <Stack.Screen name="Checkout" component={Checkout} />
                <Stack.Screen name="ChangePassword" component={ChangePassword} />
            </Stack.Navigator>
    );
}

function MyOrders(props) {
    let address = props.address
    let count = props.count
    let isLoggedIn = props.isLoggedIn
    return (
            <Stack.Navigator initialRouteName="MyOrder" 
                screenOptions={({ navigation, route }) => ({ headerShown: true, headerLeft:null,
                    headerTitleContainerStyle:{ flex:1, paddingHorizontal:5}, 
                    headerStyle:{backgroundColor:'black', height:60, },  headerTitle: props => 
                    <Header {...props}  navigation={navigation} route={route} 
                    address={address} count={count} isLoggedIn={isLoggedIn}
                    />})}
                >
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Cart" component={Cart}/>
                <Stack.Screen name="Contact" component={Contact} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Notifications" component={Notifications}/>
                <Stack.Screen name="ProductDetails" component={ProductDetails}  />
                <Stack.Screen name="ProductCategory" component={ProductCategory} />
                <Stack.Screen name="Profile" component={Profile}  />
                <Stack.Screen name="ProfileEdit" component={ProfileEdit}  />
                <Stack.Screen name="SavedAddress" component={SavedAddress}  />
                <Stack.Screen name="AddAddress" component={AddAddress}  />
                <Stack.Screen name="Payment" component={Payment} />
                <Stack.Screen name="MyOrder" component={MyOrder} />
                <Stack.Screen name="OrderDetails" component={OrderDetails}/>
                <Stack.Screen name="OrderTracking" component={OrderTracking}/>
                <Stack.Screen name="Checkout" component={Checkout} />
                <Stack.Screen name="ChangePassword" component={ChangePassword} />
            </Stack.Navigator>
    );
}

function CartTabStack(props) {
    let address = props.address
    let count = props.count
    let isLoggedIn = props.isLoggedIn
    return (
            <Stack.Navigator initialRouteName="Cart" 
                screenOptions={({ navigation, route }) => ({ headerShown: true, headerLeft:null,
                    headerTitleContainerStyle:{ flex:1, paddingHorizontal:5}, headerStyle:{backgroundColor:'black', height:65,},  headerTitle: props => 
                    <Header {...props}  navigation={navigation} route={route} 
                    address={address} count={count} isLoggedIn={isLoggedIn}
                    />})}
                >
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Cart" component={Cart}/>
                <Stack.Screen name="Contact" component={Contact} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Notifications" component={Notifications}/>
                <Stack.Screen name="ProductDetails" component={ProductDetails}  />
                <Stack.Screen name="ProductCategory" component={ProductCategory} />
                <Stack.Screen name="Profile" component={Profile}  />
                <Stack.Screen name="ProfileEdit" component={ProfileEdit}  />
                <Stack.Screen name="SavedAddress" component={SavedAddress}  />
                <Stack.Screen name="AddAddress" component={AddAddress}  />
                <Stack.Screen name="Payment" component={Payment} />
                <Stack.Screen name="MyOrder" component={MyOrder} />
                <Stack.Screen name="OrderDetails" component={OrderDetails}/>
                <Stack.Screen name="OrderTracking" component={OrderTracking}/>
                <Stack.Screen name="Checkout" component={Checkout} />
            </Stack.Navigator>
    );
}
function LoginTabStack(props){
    let address = props.address
    let count = props.count
    let isLoggedIn = props.isLoggedIn
    let initialRouteName = props.initialRouteName
    let showBackButton = props.showBackButton
    return (
            <Stack.Navigator initialRouteName={initialRouteName} 
                screenOptions={({ navigation, route }) => ({ headerShown: true, headerLeft:null,
                    headerTitleContainerStyle:{ flex:1, paddingHorizontal:5}, headerStyle:{backgroundColor:'black', height:65,},  headerTitle: props => 
                    <Header {...props}  navigation={navigation} route={route} 
                    address={address} count={count} isLoggedIn={isLoggedIn} showBackButton={showBackButton}
                    />})}
            >
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Contact" component={Contact} />
                <Stack.Screen name="Cart" component={Cart}/>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Notifications" component={Notifications}/>
                <Stack.Screen name="ProductDetails" component={ProductDetails}  />
                <Stack.Screen name="ProductCategory" component={ProductCategory} />
                <Stack.Screen name="Profile" component={Profile}  />
                <Stack.Screen name="ProfileEdit" component={ProfileEdit}  />
                <Stack.Screen name="SavedAddress" component={SavedAddress}  />
                <Stack.Screen name="AddAddress" component={AddAddress}  />
                <Stack.Screen name="Payment" component={Payment} />
                <Stack.Screen name="MyOrder" component={MyOrder} />
                <Stack.Screen name="OrderTracking" component={OrderTracking}/>
                <Stack.Screen name="Checkout" component={Checkout} />
                <Stack.Screen name="OrderDetails" component={OrderDetails} />
                <Stack.Screen name="ChangePassword" component={ChangePassword} />
            </Stack.Navigator>
    );
}

function ContactTabStack(props){
    let address = props.address
    let count = props.count
    let isLoggedIn = props.isLoggedIn
    return (
            <Stack.Navigator initialRouteName="Contact" 
                screenOptions={({ navigation, route }) => ({ headerShown: true, headerLeft:null,
                    headerTitleContainerStyle:{ flex:1, paddingHorizontal:5}, headerStyle:{backgroundColor:'black', height:65,},  headerTitle: props => 
                    <Header {...props}  navigation={navigation} route={route} 
                    address={address} count={count} isLoggedIn={isLoggedIn}
                    />})}
            >
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Home" component={Contact} />
                <Stack.Screen name="Cart" component={Cart}/>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Notifications" component={Notifications}/>
                <Stack.Screen name="ProductDetails" component={ProductDetails}  />
                <Stack.Screen name="ProductCategory" component={ProductCategory} />
                <Stack.Screen name="Profile" component={Profile}  />
                <Stack.Screen name="ProfileEdit" component={ProfileEdit}  />
                <Stack.Screen name="SavedAddress" component={SavedAddress}  />
                <Stack.Screen name="AddAddress" component={AddAddress}  />
                <Stack.Screen name="OrderDetails" component={OrderDetails}/>
                <Stack.Screen name="Payment" component={Payment} />
                <Stack.Screen name="MyOrder" component={MyOrder} />
                <Stack.Screen name="OrderTracking" component={OrderTracking}/>
                <Stack.Screen name="Checkout" component={Checkout} options={{ headerShown: false }} />
            </Stack.Navigator>
    );
}

function Header(props, navigation, route) {
   // const dispatch = useDispatch()
    const dispatch = useDispatch()
    const setDeliveryAddress = value => dispatch(changeDeliveryAddress(value))
    const setProuctSearchValue = value => dispatch(showProductSearchView(value))

   // console.log('showBackButton', JSON.stringify(props))
    return(
      <View style={{width:'100%',
          flexDirection:'row', alignItems:'center', justifyContent:'space-between', flex:1}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', flex:1}}>
              {props.showBackButton && <TouchableOpacity onPress={()=>props.navigation.goBack()}>
                  <Image style={{width:25, marginRight:15}}resizeMode={'contain'} source={require('../../../assets/back-arrow.png')}/>
              </TouchableOpacity>}
              <TouchableOpacity onPress={()=>{
                  Keyboard.dismiss()
                  props.navigation.openDrawer()
                  }}>
                  <Image resizeMode={'contain'} source={require('../../../assets/side-menu.png')} style={{height:25, width:25, }}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setDeliveryAddress(true)} style={{marginLeft:15, justifyContent:'space-between', height:40, flex:1}}>
                  <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, fontFamily:AppStyles.fontFamily.M_BOLD}}>
                      Delivery Address
                  </Text>
                  <Text numberOfLines={2} style={{color:AppStyles.colorSet.mainTextColor, fontSize:12, fontFamily:AppStyles.fontFamily.M_SEMIBOLD, 
                      marginRight:7,}}>
                      {props.address}
                  </Text>
              </TouchableOpacity>
          </View>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
              {props.isLoggedIn && <TouchableOpacity onPress={()=>
              //this.checkCartProducts()
              props.navigation.navigate('Notifications')
                  }>
                  <Image resizeMode={'cover'} source={require('../../../assets/notification.png')} style={{height:25, width:25, marginRight:15}}/>
              </TouchableOpacity>}
              <TouchableOpacity onPress={()=>props.navigation.navigate('Cart')}>
                  <Image resizeMode={'contain'} source={require('../../../assets/cart_home.png')} style={{height:25, width:25, marginRight:15}}/>
                  {props.count>0 && <View style={{backgroundColor:'white', height:16, width:16,
                   borderRadius:8, position:'absolute', top:-5, right:5, 
                   //borderColor:AppStyles.colorSet.mainTextColor,
                    borderWidth:1, justifyContent:'center', alignItems:'center'}}>
                        <Text style={{color:AppStyles.colorSet.mainTextColor, alignSelf:'center', fontSize:9}}>
                            {props.count}
                        </Text>
                  </View>}
              </TouchableOpacity>
              { <TouchableOpacity onPress={()=>
                    setProuctSearchValue(true)
                 // this.setState({showProductSearchBar:!this.state.showProductSearchBar})
                  }>
                 <Image resizeMode={'contain'} source={require('../../../assets/search_bg.png')} style={{height:26, width:26, }}/>
              </TouchableOpacity>}
          </View>
      </View>
  )
  }
  


class DrawerScreen extends Component {
    constructor(props){
        super(props)
    }
  
    render(){
       /// console.log('DrawerScreen',this.props.route)
        let initialRouteName = 'Login'
        if(this.props.route.params!==undefined && this.props.route.params.navigateTo==='MyOrder'){
            initialRouteName = 'MyOrders'
        }else if(this.props.route.params===undefined){
            initialRouteName = 'Home'
        }
        return (
            <Drawer.Navigator 
            drawerContent={props => <Sidebar {...props} mainProps={this.props}/>} 
           // initialRouteName={initialRouteName}
            >
               
               <Drawer.Screen 
                    name="Logout" 
                    options={{
                        drawerLabel: ({focused, color, size}) => (
                            <Text style={{color:!this.props.data.isLoggedIn?'black':'black', 
                            fontFamily:AppStyles.fontFamily.M_SEMIBOLD, fontSize:2 }}>
                                Logout
                            </Text>
                        ),
                        drawerIcon: ({focused, color, size}) => (
                            <Image 
                            resizeMode={'contain'}
                            source={this.props.data.isLoggedIn?require('../../../assets/log-out.png'):
                            null}
                            //style={{height:!this.props.data.isLoggedIn?0:24, width:24}}
                            style={{height:0, width:0}}
                            />
                        ),
                    }}>
                                {props => (
                        <LoginTabStack 
                            isLoggedIn={this.props.data.isLoggedIn} 
                            {...props} 
                            count={this.props.data.totalCartCount} 
                            address={this.props.data.address}
                            initialRouteName={initialRouteName}
                            showBackButton={this.props.data.showBackButton}
                        />
                    )}
                    
                </Drawer.Screen>
                
            </Drawer.Navigator>
        );
    }
}const mapStateToProps = (state) => {
    const { data } = state
    return { data }
};

export default connect(mapStateToProps)(DrawerScreen);
