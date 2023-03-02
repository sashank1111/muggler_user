import React,{ Component } from "react";
import {
    SafeAreaView,
    StatusBar,
    View,
    Image,
    ImageBackground,
    Text,
    TextInput,
    Modal,
    Keyboard,
    TouchableOpacity
} from 'react-native'
import MapView from "react-native-maps";
import AppStyles from '../styles/AppStyles'
import Geolocation from 'react-native-geolocation-service';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { ADD_DELIVERY_ADDRESS, UPDATE_DELIVERY_ADDRESS } from "../Utils/UrlClass";
import { sendPostRequestWithAccessTokenAndBody } from "../Utils/RestApiService";
import ShowLoader from "../components/ShowLoader";
import Geocoder from 'react-native-geocoding';
import { connect } from 'react-redux';
import BackButton from "../components/BackButton";
import ResponseAlert from "../components/ResponseAlert";
class AddAddress extends Component{
    constructor(props){
        super(props)
        this.state={
            address:'',
            latitude:'',
            longitude:'',
            isLoading:true,
            addressName:'',
            forceRefresh:'',
            navigateFrom:this.props.route.params.navigateFrom,
            updateData:this.props.route.params.updateData,
            showLocationButton:true,
            showSuccessAert:false,
            alertMessage:'',
            showErrorAlert:false,
            date:'',
            responseAlert:false,
            responseText:''

        }
    }

    async findCoordinates(){
        Geolocation.getCurrentPosition(
        (position) => {
            this.setState({latitude:position.coords.latitude.toFixed(4),
              longitude:position.coords.longitude.toFixed(4)}
              ,()=>this.findReverseGeoCode(this.state.latitude, this.state.longitude))
        },
        (error) => {
            // See error code charts below.
            console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, distanceFilter: 0, 
            forceRequestLocation: true  }
        );
      };

      async findReverseGeoCode(lat, long){
        Geocoder.init("AIzaSyAYbSbQqDQm2u092NYdX9-CxcYyRDY6YSk");
        Geocoder.from(lat, long)
              .then(json => {
                      var addressComponent = json.results[0].formatted_address
                      this.setState({addressName:addressComponent},()=>this.setState({isLoading:false}))
            //global.currentAddress = addressComponent
              })
              .catch(error => console.warn(error));
      }


    async componentDidMount(){
       // console.log('updateDta', this.state.updateData)
       await this.findCoordinates()
       

    }

    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
      }
        
      componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
      }
        
      _keyboardDidShow = () => {
        this.setState({showLocationButton:false})
      }
        
      _keyboardDidHide = () => {
        this.setState({showLocationButton:true})
      }

    header(){
        return(
            <View style={{width:'100%', padding:20,  paddingBottom:10, paddingTop:0}}>
                <View style={{width:'100%',  paddingTop:10,
                    }}>
                    <BackButton props={this.props}/>
                    <Image 
                        resizeMode={'stretch'}
                        source={require('../../assets/location.png')} 
                        style={{ width:'100%', marginTop:15}}/>
                </View>
            </View>
        )
    }

    searchBarViews(){
        return(
            <View style={{width:'100%', padding:10, paddingTop:15, paddingHorizontal:20}}>
                <TouchableOpacity activeOpacity={1} 
                style={{borderWidth:1, borderColor:AppStyles.colorSet.mainTextColor, 
                width:'100%', padding:10,height:50,
                borderRadius:35, alignItems:'center', flexDirection:'row', }}>
                    <Image resizeMode={'contain'} source={require('../../assets/search.png')} 
                    style={{height:22, width:22, }}/>
                    <TextInput 
                        ref={(rf) => {this.address = rf}}
                        placeholder='Enter Deliver Address'
                        value={this.state.address}
                        onChangeText={(text)=>this.setState({address:text})}
                        placeholderTextColor={AppStyles.colorSet.mainTextColor}
                        style={[AppStyles.styleSet.textInputStyle, {marginHorizontal:15, flex:1, fontSize:16, padding:0, 
                            fontFamily:AppStyles.fontFamily.M_REGULAR}]}
                    />
                </TouchableOpacity>
            </View>
        )
    }

    changeLocation(data, details){
       // console.log('changeLocationAdd', JSON.stringify(details))
      //  console.log('changeLocationAddData', JSON.stringify(data))
        this.setState({latitude:details.geometry.location.lat, 
          longitude:details.geometry.location.lng, addressName:data.description},()=>{
            this.refs.animateToRegion({
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005
              })
          })
    }

    changeSeachText = (text) => {
        if(this.placesRef.isFocused()){
          this.setState({addressName:text})
        }
    }
    

    searchBarView(){
        return(
            <View style={{width:'100%', paddingHorizontal:20, marginTop:10, position:'absolute', flex:1}}>
                <GooglePlacesAutocomplete
                    placeholder='Search your address'
                    minLength={2}
                    ref={ref => {this.placesRef = ref}}
                    autoFocus={false}
                    keyboardShouldPersistTaps={'always'}
                    returnKeyType={'search'}
                    listViewDisplayed='false'
                    fetchDetails={true}
                    //isRowScrollable
                    renderDescription={row => row.description}
                    onPress={(data, details = null) => {
                        // 'details' is provided when fetchDetails = true
                       // console.log("data", JSON.stringify(details));
                        this.changeLocation(data, details)
                      }}
                    autoFocus={true}
                    renderLeftButton={()=>
                    <View style={{marginBottom:2}}>
                        <Image resizeMode={'contain'} source={require('../../assets/search.png')} 
                        style={{height:18, width:18, }}/>
                    </View>}
                    getDefaultValue={() => ''}

                    query={{
                    key: 'AIzaSyAYbSbQqDQm2u092NYdX9-CxcYyRDY6YSk',
                    language: 'en',
                    types: 'address'
                    }}
                    textInputProps={{ 
                        placeholderTextColor: AppStyles.colorSet.mainTextColor, 
                        fontFamily:AppStyles.fontFamily.M_SEMIBOLD, 
                        flex:1,
                      onChangeText: (text) => { 
                              this.changeSeachText(text)
                      },
                      value:this.state.addressName
                    }}
                    styles={{
                    textInputContainer: {
                        height:Platform.OS==='android'?50:40,
                        textAlign: 'center', 
                        borderRadius:25,
                        borderWidth:1, 
                        borderColor:AppStyles.colorSet.mainTextColor,
                        alignItems:'center',
                        paddingHorizontal:10,
                        justifyContent:'center',
                        paddingTop:0,
                        paddingBottom:0
                    },
                    container:{flex:1},
                    textInput: {
                        // borderRadius:25,
                        // borderWidth:1, 
                        // borderColor:AppStyles.colorSet.mainTextColor,
                        backgroundColor:'transparent',
                        color:AppStyles.colorSet.mainTextColor,
                        fontFamily:AppStyles.fontFamily.M_SEMIBOLD,
                        fontSize:12,
                        height:35,
                        marginLeft:5,
                        marginTop:2,
                        //fontSize: AppStyles.fontSet.middle
                    },
                    description: {
                    // fontWeight: 'bold'
                    },
                    predefinedPlacesDescription: {
                        color: AppStyles.colorSet.mainTextColor
                    },
                    listView: {
                        borderWidth: 0,
                    },
                    }}
                    currentLocation={false}
                    currentLocationLabel='Current location'
                    nearbyPlacesAPI='GooglePlacesSearch'
                    // GoogleReverseGeocodingQuery={{
                    // }}
                    // GooglePlacesSearchQuery={{
                    //     rankby: 'distance',
                    //     types: 'food'
                    // }}
                    filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
                    debounce={200} 
                />
            </View>

        )
    }

    mapView(){
        let lat = parseFloat(this.state.latitude)
        let long = parseFloat(this.state.longitude)
        return(
            <View style={{flex:1, marginTop:70}}>
                {this.state.longitude!==''?
                <MapView
                      style={{flex:1}}
                      key={this.state.forceRefresh}
                      mapType='standard'
                      minZoomLevel={0}  // default => 0
                      maxZoomLevel={15}
                      //provider={'google'}
                      showsUserLocation={true}
                      zoomEnabled={true}
                      ref={(ref) => { this.refs = ref }}
                      onMapReady={()=>this.refs.fitToElements(true)}
                      initialRegion={{
                        latitude: lat,
                        longitude: long,
                        latitudeDelta:0,
                        longitudeDelta:0
                      }}>

                        {/* <MapView.Marker
                        coordinate={{latitude:this.state.latitude, 
                            longitude:this.state.longitude}}
                        >
                        </MapView.Marker> */}
                </MapView>
                :null}
                
            </View>
        )

    }

    showSuccessAert(){
        return(
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={this.state.showSuccessAert}
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
                        <View style={{}}>
                          <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_BOLD,
                                fontSize:22, textAlign:'center', marginTop:33}}>
                                    Address successfully updated!
                          </Text>
                        </View>
                        <TouchableOpacity onPress={()=>this.setState({showSuccessAert:false},()=>this.props.navigation.navigate('Checkout',{addressData:this.state.data}))} 
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

      showErrorAlert(){
        return(
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={this.state.showErrorAlert}
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
                        <View style={{}}>
                          <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_BOLD,
                                fontSize:22, textAlign:'center', marginTop:33}}>
                                    Address seems outside the store delivery area! Please choose another location.
                          </Text>
                        </View>
                        <TouchableOpacity onPress={()=>this.setState({showErrorAlert:false})} 
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

    async useThisLocation(){
        this.setState({isLoading:true})
        let credentials = ''
        console.log('savedAddress', this.state.navigateFrom)
        if(this.state.navigateFrom === 'updateSavedAddress'){
            credentials = {
                latitude:this.state.latitude,
                longitude:this.state.longitude,
                address:this.state.addressName,
                id:this.state.updateData._id
               // type:'cart'
            }

        }else if(this.state.navigateFrom === 'savedAddress'){
            credentials = {
                latitude:this.state.latitude,
                longitude:this.state.longitude,
                address:this.state.addressName,
               // type:'cart'
            }
        }else{
            credentials = {
                latitude:this.state.latitude,
                longitude:this.state.longitude,
                address:this.state.addressName,
                storeId:this.props.data.cart[0].storeId._id,
                type:'store'
              ///  type:'cart'
            }

        }   
            let res = ''
            if(this.state.navigateFrom === 'updateSavedAddress'){
                res = await sendPostRequestWithAccessTokenAndBody(UPDATE_DELIVERY_ADDRESS, credentials,  global.accessToken);
            }else{
                res = await sendPostRequestWithAccessTokenAndBody(ADD_DELIVERY_ADDRESS, credentials,  global.accessToken);
            }
            console.log('useThisLocation', JSON.stringify(res))
            if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
                this.setState({isLoading:false}
                    ,()=>{
                        if(this.state.navigateFrom === 'updateSavedAddress'){
                            this.props.navigation.goBack()
                        }else if(this.state.navigateFrom === 'savedAddress'){
                            this.props.navigation.goBack()
                        }else{
                            this.setState({data:res.response.userData, showSuccessAert:true})
                            
                        }
                    }
                )
            }else if(res.hasOwnProperty('response') && res.response.status.statusCode === 400){
                this.setState({isLoading:false}
                    ,()=>{
                        if(this.state.navigateFrom !== 'savedAddress'){
                            this.setState({responseText:res.response.status.customMessage, responseAlert:true})
                        }else{
                            this.setState({responseText:'Something went wrong', responseAlert:true})
                           // alert('Something went wrong')
                        }
                    }
                )
            }else if(res.hasOwnProperty('response') && res.response.status.statusCode === 402){
                this.setState({isLoading:false}
                    ,()=>{
                        if(this.state.navigateFrom !== 'savedAddress'){
                            this.setState({showErrorAlert:true})
                            //alert('You have entered the address outside delivery area. Please select another delivery address.')
                        }else{
                            this.setState({responseText:'Something went wrong', responseAlert:true})
                           // alert('Something went wrong')
                        }
                    }
                )
            }else{
                this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
            }
    }

    addAddressButton(){
        if(this.state.showLocationButton){
            return(
                <View style={{ bottom:50, width:'100%',position:'absolute', paddingHorizontal:20}}>
                    <TouchableOpacity onPress={()=>this.useThisLocation()} style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:35,}]}>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor, 
                            {fontFamily:AppStyles.fontFamily.M_SEMIBOLD}]}>
                            USE THIS LOCATION
                        </Text>
                    </TouchableOpacity>
                </View>
            )
         }
    }

    

    render(){
        return(
            <SafeAreaView style={AppStyles.styleSet.screenContainer}>
                <StatusBar barStyle={'light-content'}/>
                {this.header()}
                <View style={{flex:1}}>
                    {this.mapView()}
                    {this.searchBarView()}
                    
                 </View>
                 {this.addAddressButton()}
                 {this.showSuccessAert()}
                 {this.showErrorAlert()}
                 <ResponseAlert
                    visible={this.state.responseAlert}
                    responseText={this.state.responseText}
                    onOkayPress={()=>this.setState({responseAlert:false, responseText:''})}
                />
                 {this.state.isLoading?<ShowLoader/>:null}
            </SafeAreaView>
        )
    }
}const mapStateToProps = (state) => {
    const { data } = state
    return { data }
};
  


export default connect(mapStateToProps)(AddAddress);