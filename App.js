/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  Image,
  Animated,
  FlatList,
  TextInput,
  Keyboard,
  SafeAreaView,
  Platform,
  StatusBar
  } from 'react-native'
import AppStyles from './src/styles/AppStyles'
import { CommonActions } from '@react-navigation/native'
import { connect } from 'react-redux';
import { checkPermission, findCoordinates, getLocationPermission } from './src/Utils/Helper';
import AsyncStorage from '@react-native-community/async-storage';
import AppNavigation from './src/navigations/AppNavigation';
import { changeAlertVisibility, deleteAll, addToCart, changeDeliveryAddress, 
  setLocation, showProductSearchView, showAddAddressAlert, showLoginFirstAlert, 
  showStoreAlert, addToCartFromDetails, showChangeAddressAlert, navigateToMyOrders} from './src/redux/actions'
import { bindActionCreators } from 'redux';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import messaging from '@react-native-firebase/messaging'
import * as RootNavigation from './src/navigations/RootNavigation';
import { sendPostRequest, sendPostRequestWithAccessTokenAndBody } from './src/Utils/RestApiService';
import { ADD_DELIVERY_ADDRESS, IMAGE_BASE_URL, SEARCH_ALL, SET_DEFAULT_ADDRESS, UPDATE_DELIVERY_ADDRESS } from './src/Utils/UrlClass';
import { navigate, navigateToMyOrder } from './src/navigations/RootNavigation';
import notifee from "@notifee/react-native"
const alertText = "The product you have selected is not available at the store you are shopping from. If you want to add this product to your cart, it will change the store and clear your cart. Press 'Okay' if you want to change your store and clear your cart."
const alertText1 = "By choosing this product, you'll be limited to shopping from this store until you clear your cart. Clear your cart to see other store's products."
const alertText2 = "The store you currently have products in your cart from does not deliver to the new address you've entered. If you want to use this address, press 'Okay' and your cart will be cleared to continue shopping."

async function onMessageReceived(message) {
  console.log('OnMessageReceived', JSON.stringify(message))
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });
  await notifee.displayNotification({
    title: message.notification.title,
    body: message.notification.body,
    android: {
      channelId,
      smallIcon: 'app_icon'
    },
  });
}

class App extends Component{
  constructor(props){
    super(props)
    this.state={
     // searchAllList:'',
      searchAllList:[],
      latitude:'',
      longitude:'',
      address:'',
      searchViewList:[]
    }
    this.createNotificationListeners()

  }

  async componentDidMount(){
    var token = await checkPermission()
    //console.log('appToken', JSON.stringify(token))
    if(token !== '' && token !== undefined){
      global.fcmToken=token
      await AsyncStorage.setItem("@fcmTokem", token)
    }
    const hasLocationPermission = await getLocationPermission()
    console.log('hasLocationPermission', hasLocationPermission)
    if(hasLocationPermission){
      await findCoordinates()
    }
    
  }

  // componentWillMount () {
  //   this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
  //   this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  // }
    
  // componentWillUnmount () {
  //   this.keyboardDidShowListener.remove();
  //   this.keyboardDidHideListener.remove();
  // }
    
  // _keyboardDidShow = (e) => {
  //   console.log('show', e)
  // }
    
  // _keyboardDidHide = (e) => {
  //   console.log('hide', e)
  // }

  async createNotificationListeners(){
    messaging().getInitialNotification(async (remoteMessage) => {
      console.log('getInitialNotification', JSON.stringify(remoteMessage))
     // navigateToMyOrders()
     
   })
 
    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.log('onNotifictaionOpened', JSON.stringify(remoteMessage))
      //navigateToMyOrders()
     //onMessageReceived(remoteMessage)
     this.props.navigateToMyOrders(true)
          navigateToMyOrder()
   })
 
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('setBackgroundMessageHandler', JSON.stringify(remoteMessage))
    // onMessageReceived(remoteMessage)
   })
 
    messaging().onMessage(async (remoteMessage) => {
      onMessageReceived(remoteMessage)
    })

    messaging().getInitialNotification(async (remoteMessage) => {
      console.log('getInitialNotification1', JSON.stringify(initialMessage))
      this.props.navigateToMyOrders(true)
          navigateToMyOrder()
    })

    messaging().getInitialNotification().then(initialMessage => {
      if (initialMessage) { // <- always undefined on iOS
        console.log('getInitialNotification', JSON.stringify(initialMessage))
        this.props.navigateToMyOrders(true)
          navigateToMyOrder()
        // handle notification
      }
    });
 
    }

  async changeProductInCart(){
    await this.props.deleteAll()
    await this.props.addToCart(this.props.data.savedItem)
  }

  showDifferentStoreAlert(){
    return(
        <Modal
            animationType={'fade'}
            transparent={true}
            visible={this.props.data.showDifferentStoreAlert}
            onRequestClose={() => {
                console.log('Modal has been closed.');
            }}>
        
            <View style={{flex:1, flexDirection:"column", position:'absolute',
            height:'100%', width:'100%', alignItems:'center', justifyContent:'center',
            backgroundColor:"transparent", opacity:1.5}}>
                <View style={{flex:1,backgroundColor:'#000000',opacity:0.7,
                    height:'100%', width:'100%', justifyContent:'center',
                    position:'absolute', alignSelf:'center'}}>
                </View>
                <View style={{ width:'93%', alignSelf:'center',
                borderColor:AppStyles.colorSet.mainThemeForegroundColor, 
                borderWidth:2, borderRadius:10, zIndex:999, padding:10, 
                backgroundColor:'black', opacity:1, paddingBottom:30}}>
                    <TouchableOpacity onPress={()=>{
                      this.props.changeAlertVisibility() 
                      }}>
                        <Image source={require('./assets/close_yellow.png')} 
                        style={{height:25, width:25, alignSelf:'flex-end'}}/>
                    </TouchableOpacity>
                    <Image resizeMode={'contain'} source={require('./assets/logo_delivery.png')} 
                        style={{height:60, width:90, alignSelf:'center', marginTop:20}}/>
                    <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_SEMIBOLD,
                           fontSize:16, textAlign:'center', marginTop:15}}>
                               {alertText}
                    </Text>
                    <View style={{flexDirection:'row',marginTop:35, justifyContent:'center', width:'100%'}}>
                        <TouchableOpacity onPress={()=>this.changeProductInCart()}
                            style={{padding:7,paddingHorizontal:12, borderRadius:25, backgroundColor:AppStyles.colorSet.mainTextColor, alignItems:'center'}}>
                                <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                    Okay
                                </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.props.changeAlertVisibility()}
                            style={{padding:7,paddingHorizontal:12, borderRadius:25, backgroundColor:'black', alignItems:'center',
                                borderWidth:2, borderColor:AppStyles.colorSet.mainTextColor, marginLeft:20}}>
                                <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                    Cancel
                                </Text>
                        </TouchableOpacity>
                   </View>
                </View>
            </View>
        </Modal>
    )
}

showChangeAddressAlert(){
  return(
      <Modal
          animationType={'fade'}
          transparent={true}
          visible={this.props.data.showChangeAddressAlert}
          onRequestClose={() => {
              console.log('Modal has been closed.');
          }}>
      
          <View style={{flex:1, flexDirection:"column", position:'absolute',
          height:'100%', width:'100%', alignItems:'center', justifyContent:'center',
          backgroundColor:"transparent", opacity:1.5}}>
              <View style={{flex:1,backgroundColor:'#000000',opacity:0.7,
                  height:'100%', width:'100%', justifyContent:'center',
                  position:'absolute', alignSelf:'center'}}>
              </View>
              <View style={{ width:'93%', alignSelf:'center',
              borderColor:AppStyles.colorSet.mainThemeForegroundColor, 
              borderWidth:2, borderRadius:10, zIndex:999, padding:10, 
              backgroundColor:'black', opacity:1, paddingBottom:30}}>
                  <TouchableOpacity onPress={()=>{
                    this.props.showChangeAddressAlert(false) 
                    }}>
                      <Image source={require('./assets/close_yellow.png')} 
                      style={{height:25, width:25, alignSelf:'flex-end'}}/>
                  </TouchableOpacity>
                  <Image resizeMode={'contain'} source={require('./assets/logo_delivery.png')} 
                      style={{height:60, width:90, alignSelf:'center', marginTop:20}}/>
                  <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_SEMIBOLD,
                         fontSize:16, textAlign:'center', marginTop:15}}>
                             {alertText2}
                  </Text>
                  <View style={{flexDirection:'row',marginTop:35, justifyContent:'center', width:'100%'}}>
                      <TouchableOpacity onPress={async()=>{
                        let coord = {latitude: this.state.latitude,
                          longitude: this.state.longitude, 
                          address: this.state.address}
                        await this.props.setLocation(coord)
                        this.props.showChangeAddressAlert(false)
                      }}
                          style={{padding:7,paddingHorizontal:12, borderRadius:25, backgroundColor:AppStyles.colorSet.mainTextColor, alignItems:'center'}}>
                              <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                  Okay
                              </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>this.props.showChangeAddressAlert(false)}
                          style={{padding:7,paddingHorizontal:12, borderRadius:25, backgroundColor:'black', alignItems:'center',
                              borderWidth:2, borderColor:AppStyles.colorSet.mainTextColor, marginLeft:20}}>
                              <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                  Cancel
                              </Text>
                      </TouchableOpacity>
                 </View>
              </View>
          </View>
      </Modal>
  )
}


showEnterDeliveryAddressPopup(){
  return(
      <Modal
          animationType={'slide'}
          transparent={true}
          visible={this.props.data.showChangeAddressModal}
          onRequestClose={() => {
              console.log('Modal has been closed.');
          }}> 
              <Animated.View style={{height: '100%'}}>
                  <View style={{ flex:1, flexDirection:"column", position:'absolute',
                  height:'100%', width:'100%', alignItems:'center', paddingTop:70,
                  backgroundColor:"black", opacity:1.5}}>
                      <View style={{flex:1,backgroundColor:'#000000',opacity:0.7,
                          height:'100%', width:'100%', justifyContent:'center',
                          position:'absolute', alignSelf:'center'}}>
                      </View>
                      <View style={{ width:'95%', alignSelf:'center',
                      borderRadius:10, zIndex:999, padding:10, 
                      borderWidth:1, borderColor:AppStyles.colorSet.mainTextColor,
                      backgroundColor:'black', opacity:1, paddingBottom:120, height:'auto'}}>
                          <View style={{height:300}}>
                              <TouchableOpacity onPress={()=>{
                                this.props.changeDeliveryAddress(false)
                                }}>
                                  <Image resizeMode={'contain'} source={require('./assets/close.png')} 
                                          style={{height:25, width:25, alignSelf:'flex-end'}}/>
                              </TouchableOpacity>
                              <Text style={[AppStyles.styleSet.textWithYellowColor,
                                {fontSize:25, marginTop:35, alignSelf:'center', fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                Change Delivery Address
                              </Text>
                             {this.searchBarView()}
                              {/* {this.searchAllListView()} */}
                          </View>
                      </View>
                  </View>
              </Animated.View>
           </Modal>
  )
}


showStoreAlert(){
  return(
      <Modal
          animationType={'fade'}
          transparent={true}
          visible={this.props.data.showStoreAlert}
          onRequestClose={() => {
              console.log('Modal has been closed.');
          }}>
      
          <View style={{flex:1, flexDirection:"column", position:'absolute',
          height:'100%', width:'100%', alignItems:'center', justifyContent:'center',
          backgroundColor:"transparent", opacity:1.5}}>
              <View style={{flex:1,backgroundColor:'#000000',opacity:0.7,
                  height:'100%', width:'100%', justifyContent:'center',
                  position:'absolute', alignSelf:'center'}}>
              </View>
              <View style={{ width:'93%', alignSelf:'center',
              borderColor:AppStyles.colorSet.mainThemeForegroundColor, 
              borderWidth:2, borderRadius:10, zIndex:999, padding:10, 
              backgroundColor:'black', opacity:1, paddingBottom:30}}>
                  <TouchableOpacity onPress={()=>{
                    let data = {value:false, selectedItemData:''}
                    this.props.showStoreAlert(data)
                  }}>
                      <Image source={require('./assets/close_yellow.png')} 
                      style={{height:25, width:25, alignSelf:'flex-end'}}/>
                  </TouchableOpacity>
                  <Image resizeMode={'contain'} source={require('./assets/logo_delivery.png')} 
                      style={{height:60, width:90, alignSelf:'center', marginTop:20}}/>
                  <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_SEMIBOLD,
                         fontSize:16, textAlign:'center', marginTop:15}}>
                             {alertText1}

                  </Text>
                  <View style={{flexDirection:'row',marginTop:35, justifyContent:'center', width:'100%'}}>
                      <TouchableOpacity onPress={async()=>{
                          if(this.props.data.selectedItemData.hasOwnProperty('addedFromDetails') && this.props.data.selectedItemData.addedFromDetails){
                            let data = {data:this.props.data.selectedItemData, id:this.props.data.selectedItemData.allSizes[this.props.data.selectedItemData.selectedIndex]._id}
                            await this.props.addToCartFromDetails(data)
                          }else{
                             await this.props.addToCart(this.props.data.selectedItemData)
                          }
                          let data = {value:false, selectedItemData:''}
                          this.props.showStoreAlert(data)
                      }}
                          style={{width:70, padding:7, borderRadius:25, backgroundColor:AppStyles.colorSet.mainTextColor, alignItems:'center'}}>
                              <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                  Yes
                              </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>{
                        let data = {value:false, selectedItemData:''}
                        this.props.showStoreAlert(data)
                      }}
                          style={{width:70, padding:7, borderRadius:25, backgroundColor:'black', alignItems:'center',
                              borderWidth:2, borderColor:AppStyles.colorSet.mainTextColor, marginLeft:20}}>
                              <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                  No
                              </Text>
                      </TouchableOpacity>
                 </View>
                  

              </View>
          </View>
      </Modal>
  )
}


async changeLocation(data, details){
  //console.log('data', JSON.stringify(data))
     //   console.log('data', JSON.stringify(details))
  if(this.props.data.latitude === 0 || this.props.data.latitude === '' || this.props.data.cart.length===0){   
    let coord = {latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng, 
                address: data.description}
    await AsyncStorage.setItem("@saveAddress", JSON.stringify(coord))
    this.props.setLocation(coord)
    if(this.props.data.isLoggedIn){
      this.addAddress(details.geometry.location.lat, details.geometry.location.lng, data.description)
    }
  }else{
    this.setState({latitude:details.geometry.location.lat, longitude:details.geometry.location.lng, address:data.description})
    let coord = {latitude: this.props.data.latitude,
          longitude: this.props.data.longitude, 
          address: this.props.data.address}
    await AsyncStorage.setItem("@saveAddress", JSON.stringify(coord))
    await this.props.setLocation(coord)
    this.props.showChangeAddressAlert(true)
    
  }

  
  // global.latitude = details.geometry.location.lat
  // global.longitude = details.geometry.location.lng
  // global.currentAddress = data.description
 // this.setState({searchAddressText:data.description},()=>this.getData())
}

async addAddress(lat, long, add){
  let body = {
    latitude:lat,
    longitude:long,
    address:add,
  }
  let res = await sendPostRequestWithAccessTokenAndBody(ADD_DELIVERY_ADDRESS, body,  global.accessToken);
  console.log('addAddressAQpp', JSON.stringify(res))
  if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
   // this.setDefault(res.response.userData._id, true)
      //this.getSavedAddressList()
  }else{
      this.setState({isLoading:false})
  }
}

async setDefault(id, value){
  let body = {
      id:id,
      status:value
  }
  let res = await sendPostRequestWithAccessTokenAndBody(SET_DEFAULT_ADDRESS, body,  global.accessToken);
  console.log('setDefault', JSON.stringify(res))
  if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
      
  }else{
      this.setState({isLoading:false})
  }
}




searchBarView(){
  return(
      <View style={{width:'100%', paddingHorizontal:10, marginTop:20, height:'100%'}}>
          <GooglePlacesAutocomplete
              placeholder='Enter Delivery Address'
              ref={(rf) => {this.googleAuto = rf}}
              minLength={2}
             // autoFocus={false}
              keyboardShouldPersistTaps={'always'}
              //returnKeyType={'search'}
             // listViewDisplayed='false'
              fetchDetails={true}
              //isRowScrollable
              //renderDescription={row => row.description}
              onPress={(data, details = null) => {
                  // 'details' is provided when fetchDetails = true
                 // console.log("data", JSON.stringify(details));
                  this.changeLocation(data, details)
                }}
             // autoFocus={true}
              renderLeftButton={()=>
              <View style={{marginBottom:2}}>
                  <Image resizeMode={'contain'} source={require('./assets/search.png')} 
                  style={{height:18, width:18, }}/>
              </View>}
             // getDefaultValue={() => ''}

              query={{
              key: 'AIzaSyAYbSbQqDQm2u092NYdX9-CxcYyRDY6YSk',
              language: 'en',
             // types: 'address'
              }}
              textInputProps={{ placeholderTextColor: AppStyles.colorSet.mainTextColor, 
                fontFamily:AppStyles.fontFamily.M_SEMIBOLD}}
              styles={{
              textInputContainer: {
                  height:Platform.OS==='android'?50:50,
                  textAlign: 'center', 
                  borderRadius:25,
                  borderWidth:1.5, 
                  borderColor:AppStyles.colorSet.mainTextColor,
                  alignItems:'center',
                  paddingHorizontal:10,
                  justifyContent:'center',
                  paddingTop:0,
                  paddingBottom:0
              },
              textInput: {
                  // borderRadius:25,
                  // borderWidth:1, 
                  // borderColor:AppStyles.colorSet.mainTextColor,
                  backgroundColor:'transparent',
                  color:AppStyles.colorSet.mainTextColor,
                  fontFamily:AppStyles.fontFamily.M_BOLD,
                  fontSize:16,
                  height:30,
                  marginLeft:5,
                  marginTop:2,
                  //fontSize: AppStyles.fontSet.middle
              },
              // description: {
              // // fontWeight: 'bold'
              // },
              predefinedPlacesDescription: {
                  color: AppStyles.colorSet.mainTextColor
              },
              listView: {
                  borderWidth: 0,
              },
              }}
              // currentLocation={false}
              // currentLocationLabel='Current location'
              // nearbyPlacesAPI='GooglePlacesSearch'
              // GoogleReverseGeocodingQuery={{
              // }}
              // GooglePlacesSearchQuery={{
              //     rankby: 'distance',
              //     types: 'food'
              // }}
              
              filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
             // debounce={200} 
          />
      </View>

  )
}

showProductSearcView(){
  return(
      <Modal
          animationType={'slide'}
          transparent={true}
          visible={this.props.data.showProductSearchView}
          onRequestClose={() => {
              console.log('Modal has been closed.');
          }}> 
              <Animated.View style={{height: '100%'}}>
                  <View style={{ flex:1, flexDirection:"column", position:'absolute',
                  height:'100%', width:'100%', alignItems:'center', paddingTop:50,
                  backgroundColor:"black", opacity:1.5}}>
                      <View style={{flex:1,backgroundColor:'#000000',opacity:0.7,
                          height:'100%', width:'100%', justifyContent:'center',
                          position:'absolute', alignSelf:'center'}}>
                      </View>
                      <View style={{ width:'93%', alignSelf:'center',
                      borderRadius:10, zIndex:999, padding:10, 
                      backgroundColor:'black', opacity:1, paddingBottom:30}}>
                          <View>
                              <TouchableOpacity onPress={()=>{
                                this.setState({searchAllList:[], searchViewList:[]})
                                this.props.showProductSearchView(false)
                                }}>
                                  <Image resizeMode={'contain'} source={require('./assets/close_white.png')} 
                                          style={{height:25, width:25, alignSelf:'flex-end'}}/>
                              </TouchableOpacity>
                              <View activeOpacity={1} 
                              style={{borderWidth:1, borderColor:AppStyles.colorSet.mainTextColor, width:'100%',
                              borderRadius:25, alignItems:'center', flexDirection:'row', marginTop:35}}>
                                  <TextInput 
                                      ref={(rf) => {this.phone = rf}}
                                      placeholder='Search Products, Brands'
                                      onChangeText={(text)=>this.searchAll(text)}
                                      placeholderTextColor={AppStyles.colorSet.mainTextColor}
                                      style={[AppStyles.styleSet.textInputStyle, {marginHorizontal:15, 
                                          flex:1, fontSize:12, padding:0, margin:10}]}
                                  /> 
                                  <TouchableOpacity onPress={()=>{
                                    this.setState({searchAllList:[], })
                                    if(this.state.searchViewList.length > 0){
                                      this.props.showProductSearchView(false)
                                      RootNavigation.navigate('ProductCategory',{type:'SearchView', item:this.state.searchViewList})}
                                    }
                                  } 
                                  style={{height:'100%', borderTopRightRadius:25,
                                  borderBottomRightRadius:25, width:50,
                                  backgroundColor:AppStyles.colorSet.mainTextColor, alignItems:'center',}}>
                                      <Image resizeMode={'contain'} source={require('./assets/search_white.png')} 
                                      style={{height:18, width:18, alignSelf:'center', flex:1}}/>
                                  </TouchableOpacity>
                              </View>
                              {this.searchAllListView()}
                          </View>
                      </View>
                  </View>
              </Animated.View>
           </Modal>
  )
}
searchAllListItemView(item, index){
  return(
      <TouchableOpacity onPress={()=>{
         this.setState({searchAllList:[], searchViewList:[]})
          this.props.showProductSearchView(false)
          item.type==='Category'?RootNavigation.navigate('ProductCategory',{item:item, type:item.title}):
          RootNavigation.navigate('ProductDetails',{
          productId:item.productId, storeId:item.storeId._id
        })
      }} 
        style={{ backgroundColor:'white', padding:16, borderBottomWidth:0.5, borderBottomColor:'grey', 
         flexDirection:'row',}}>
          <Image resizeMode={item.type==='Category'?'contain':'cover'} source={{uri:IMAGE_BASE_URL+item.image}} style={{height:40, width:32,}}/>
          <View style={{marginLeft:15, alignSelf:'center',}}>
            <Text style={{color:'black', fontSize:15, }}>
                {item.title}
            </Text>
            {item.hasOwnProperty('storeId') && <Text style={{color:'grey', fontSize:12, }}>
                {item.storeId.title}
            </Text>}
          </View>
      </TouchableOpacity>
  )
}

showAddAddressAlert(){
  return(
      <Modal
          animationType={'fade'}
          transparent={true}
          visible={this.props.data.showAddAddressAlert}
          onRequestClose={() => {
              console.log('Modal has been closed.');
          }}>
      
          <View style={{flex:1, flexDirection:"column", position:'absolute',
          height:'100%', width:'100%', alignItems:'center', justifyContent:'center',
          backgroundColor:"transparent", opacity:1.5}}>
              <View style={{flex:1,backgroundColor:'#000000',opacity:0.7,
                  height:'100%', width:'100%', justifyContent:'center',
                  position:'absolute', alignSelf:'center'}}>
              </View>
              <View style={{ width:'93%', alignSelf:'center',
              borderColor:AppStyles.colorSet.mainThemeForegroundColor, 
              borderWidth:2, borderRadius:10, zIndex:999, padding:10, 
              backgroundColor:'black', opacity:1, paddingBottom:30, height:'auto'}}>
                  {/* <TouchableOpacity onPress={()=>this.setState({showAgeAlert:false})}>
                      <Image source={require('./assets/close_yellow.png')} 
                      style={{height:25, width:25, alignSelf:'flex-end'}}/>
                  </TouchableOpacity> */}
                  <View style={{height:350}}>
                    <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_BOLD,
                          fontSize:22, textAlign:'center', marginTop:33}}>
                              {this.props.data.showAreaText?'Enter your delivery address to see if this product is available in your area':'Please enter delivery address to place an order'}

                    </Text>
                    {this.searchBarView()}
                  </View>
                  <TouchableOpacity onPress={()=>this.props.showAddAddressAlert(false)} 
                  style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:25, width:85, borderRadius:30, alignSelf:'center'}]}>
                      <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                          Okay
                      </Text>
                 </TouchableOpacity>
                  

              </View>
          </View>
      </Modal>
  )
}

searchAllListView(){
  if(this.state.searchAllList.length>0){
      return(
          <FlatList
              data={this.state.searchAllList}
              contentContainerStyle={{borderRadius:8, overflow:'hidden'}}
              style={{height:240, width:'100%', backgroundColor:'white', 
              borderRadius:Platform.OS==='ios'?8:15, marginTop:2, }}
              renderItem={({ item, index }) => (
              this.searchAllListItemView(item, index)
              )}
              keyExtractor={item => item._id}
          />
      )
  }
}

async searchAll(text){
  if(text.length===0){
      this.setState({searchAllList:[], searchViewList:[]})
  }
  var credentials = ''
  if(this.props.data.latitude !== 0 && this.props.data.latitude !==''){
      credentials = {
          searchText:text,
          latitude:this.props.data.latitude,
          longitude:this.props.data.longitude
      }
  }else{
    credentials = {
        searchText:text
    }
  }
   let res = await sendPostRequest(SEARCH_ALL, credentials);
   console.log('searchAll', JSON.stringify(res))
   if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
       this.setState({searchAllList:res.response.userData, searchViewList:res.response.proDataFinal})
   }else{
      // this.setState({isLoading:false},()=>alert('Something went wrong'))
   }
}

showLoginFirstAlert(){
  return(
      <Modal
          animationType={'fade'}
          transparent={true}
          visible={this.props.data.showLoginFirstAlert}
          onRequestClose={() => {
              console.log('Modal has been closed.');
          }}>
      
          <View style={{flex:1, flexDirection:"column", position:'absolute',
          height:'100%', width:'100%', alignItems:'center', justifyContent:'center',
          backgroundColor:"transparent", opacity:1.5}}>
              <View style={{flex:1,backgroundColor:'#000000',opacity:0.7,
                  height:'100%', width:'100%', justifyContent:'center',
                  position:'absolute', alignSelf:'center'}}>
              </View>
              <View style={{ width:'93%', alignSelf:'center',
              borderColor:AppStyles.colorSet.mainThemeForegroundColor, 
              borderWidth:2, borderRadius:10, zIndex:999, padding:10, 
              backgroundColor:'black', opacity:1, paddingBottom:30, height:'auto'}}>
                  {/* <TouchableOpacity onPress={()=>this.setState({showAgeAlert:false})}>
                      <Image source={require('./assets/close_yellow.png')} 
                      style={{height:25, width:25, alignSelf:'flex-end'}}/>
                  </TouchableOpacity> */}
                    <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_BOLD,
                          fontSize:22, textAlign:'center', marginTop:33}}>
                              You need to login first
                    </Text>
                  <TouchableOpacity onPress={()=>this.props.showLoginFirstAlert(false)} 
                  style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:25, width:85, borderRadius:30, alignSelf:'center'}]}>
                      <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                          Okay
                      </Text>
                 </TouchableOpacity>
                  

              </View>
          </View>
      </Modal>
  )
}

render(){
    return(
      <SafeAreaView style={{flex:1, backgroundColor:'black'}}>
        <StatusBar barStyle={'light-content'}/>
        {/* <TouchableOpacity onPress={()=>{
          this.props.navigateToMyOrders()
          navigateToMyOrder()
        //   this.props.navigation.dispatch(
        //     CommonActions.reset({
        //         index: 0,
        //         routes: [
        //             { name: 'MyOrder' },
        //         ],
        //     })
        // );
        }} style={{height:25, width:25, backgroundColor:'red'}}>

        </TouchableOpacity> */}
         <AppNavigation/>
         {this.showDifferentStoreAlert()}
         {this.showEnterDeliveryAddressPopup()}
         {this.showProductSearcView()}
         {this.showAddAddressAlert()}
         {this.showLoginFirstAlert()}
         {this.showChangeAddressAlert()}
         {this.showStoreAlert()}
      </SafeAreaView>
    )
  }
}


// const AppDrawerNavigator = createDrawerNavigator({  
//   LoginScreen: Login
 
// });  
const mapStateToProps = (state) => {
  const { data } = state
  return { data }
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
  changeAlertVisibility,
  deleteAll,
  addToCart,
  changeDeliveryAddress,
  setLocation,
  showAddAddressAlert,
  showProductSearchView,
  showLoginFirstAlert,
  showStoreAlert,
  addToCartFromDetails,
  showChangeAddressAlert,
  navigateToMyOrders
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(App);
