import React,{ Component } from "react";
import {
    SafeAreaView,
    StatusBar,
    View,
    Image,
    ImageBackground,
    Text,
    TextInput,
    TouchableOpacity,
    Platform,
    Linking,
    ScrollView
} from 'react-native'
import MapView,{Marker} from "react-native-maps";
import AppStyles from '../../styles/AppStyles'
import Geolocation from 'react-native-geolocation-service';
import ShowLoader from "../../components/ShowLoader";
import { connect } from 'react-redux';
import BackButton from "../../components/BackButton";
import MapViewDirections from 'react-native-maps-directions';
import { IMAGE_BASE_URL, SOCKET_URL } from "../../Utils/UrlClass";
import SocketIO from 'socket.io-client'
import {Metrics } from '../../Utils/Metrics'
import {logEvent} from '../../Utils/AnalyticsUtils'
const GOOGLE_MAPS_APIKEY = Platform.OS == 'ios' ? 'AIzaSyDdlGOpWnPt-Z6C7c0Z-znyPeB491wlC3I' : 'AIzaSyC2JA9xLBC2znin1OiCC-8VhqjF9lk7CXc'
var socket = ''


class OrderTracking extends Component{
    constructor(props){
        super(props)
        this.state={
            address:'',
            latitude:'',
            longitude:'',
            isLoading:true,
            driverLocation:[],
            data:this.props.route.params.data,
            driverName:'',
            driverNumber:'',
            storeImage:'',
            storeAddress:'',
            storeName:'',
            countryCode:'',
            driverProfileImage:'',
            orderStatus:''
        }
    }
    

    async findCoordinates(){
        Geolocation.getCurrentPosition(
        (position) => {
            this.setState({latitude:position.coords.latitude.toFixed(4),
              longitude:position.coords.longitude.toFixed(4)}
              ,()=>{
                   console.log('userCurrentLocation', this.state.latitude, this.state.longitude)
                  this.setState({isLoading:false})
                })
        },
        (error) => {
            // See error code charts below.
            console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, distanceFilter: 0, 
            forceRequestLocation: true  }
        );
      };


    async componentDidMount(){
        logEvent('Order_tracking_Page')
        if(this.state.data.hasOwnProperty('deliveryTeamId')){
            //console.log('driver', this.state.data)
            this.setState({driverName:this.state.data.deliveryTeamId.firstName, 
                driverNumber:this.state.data.deliveryTeamId.contactNumber,
                countryCode:this.state.data.deliveryTeamId.countryCode,
                driverProfileImage:IMAGE_BASE_URL+this.state.data.deliveryTeamId.profileImage,
                storeAddress:this.state.data.storeId.address,
                storeImage:IMAGE_BASE_URL+this.state.data.storeId.profileImage,
                storeName:this.state.data.storeId.title,
                orderStatus:this.state.data.orderStatus
            })
        }
        await this.connectSocket()
        await this.findCoordinates()
    }

    async connectSocket(){
        socket = SocketIO(SOCKET_URL, { transports: ['websocket']})
        socket.on("getLocation", (msg) => {
            
            let coord = [parseFloat(msg.latitude), parseFloat(msg.longitude)]
            console.log('driverLocation', JSON.stringify(msg))
            this.setState({driverLocation:coord})
        });
        socket.on('connect', () => {
            if(socket.connected){
                console.log("connect", socket.connected);
            }
          });
        socket.on('connect_error', (error) => {
            console.log('Notconnected1!', socket.connected+' '+error);
        });
    }
  

    header(){
        return(
            <View style={{width:'100%', padding:20,  paddingVertical:0, marginTop:10}}>
                <View style={{width:'100%', 
                    }}>
                    <BackButton props={this.props}/>
                    <Image 
                        resizeMode={'stretch'}
                        source={require('../../../assets/order-tracking.png')} 
                        style={{ width:'100%', marginTop:15}}/>
                </View>
            </View>
        )
    }

   
   

    mapView() {
        let lat = parseFloat(this.state.latitude)
        let long = parseFloat(this.state.longitude)
        let origin = { latitude: lat, longitude: long }
        let driverLat = parseFloat(this.state.driverLocation[0])
        let driverLong = parseFloat(this.state.driverLocation[1])
        let driverLocation = {latitude: driverLat, longitude: driverLong}
        //console.log('originMapView', origin)
        //console.log('driverLocMapView', driverLocation)
        return (
            <View style={{ height:500, marginTop: Platform.OS==='android'?20:20 }}>
                {this.state.longitude !== '' ?
                    <MapView
                        style={{ flex: 1 }}
                        mapType='standard'
                        minZoomLevel={0}  // default => 0
                        maxZoomLevel={25}
                        showsUserLocation={true}
                        provider={Platform.OS==='android'?'google':''}
                        zoomEnabled={true}
                        // onMapReady={()=>this.refs.fitToElements(true)}
                        ref={(ref) => { this.refs = ref }}
                        initialRegion={{
                            latitude: lat,
                            longitude: long,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02
                        }}>
                        {!isNaN(driverLat) && <Marker
                            coordinate={{
                                latitude: driverLat,
                                longitude: driverLong,
                            }}
                            description={"This is a marker in React Natve"}
                        >

                            <Image resizeMode='contain' source={require('../../../assets/car.png')} style={{ height: 50, width: 50 }} />

                        </Marker>}
                       {!isNaN(driverLat) && !isNaN(lat) && <MapViewDirections
                            origin={origin}
                            destination={driverLocation}
                            apikey={GOOGLE_MAPS_APIKEY}
                            strokeColor={AppStyles.colorSet.mainTextColor}
                            strokeWidth={4}
                            // resetOnChange={true}
                            mode="DRIVING"
                            onError={(errorMessage) => {
                                console.log(errorMessage);
                            }}
                            onReady={result => {
                                // console.log(result)
                                console.log(`Distance: ${result.distance} km`)
                                console.log(`Duration: ${result.duration} min.`)
                                this.refs.fitToCoordinates(result.coordinates)
                                // this.refs.fitToCoordinates(result.coordinates, {
                                //     edgePadding: {
                                //         right: (Metrics.DeviceWidth / 20),
                                //         bottom: (Metrics.screenHeight / 20),
                                //         left: (Metrics.DeviceWidth / 20),
                                //         top: (Metrics.screenHeight / 20),
                                //     }
                                // });
                            }}
                        />}
                    </MapView>
                    : null}

            </View>
        )

    }



    addAddressButton(){
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

    bottomView(){
        return(
            <View style={{ backgroundColor:'black', marginTop:-5, padding:16, paddingTop:30}}>
                <View style={{width:'100%', flexDirection:'row', justifyContent:'space-between', 
                borderBottomColor:AppStyles.colorSet.mainTextColor, borderBottomWidth:1.5, paddingBottom:18}}>
                    <View style={{flexDirection:'row', alignItems:'center', flex:1}}>
                        <View style={{height:48, width:48, borderRadius:24, overflow:'hidden'}}>
                            <Image source={{uri:this.state.driverProfileImage}} style={{flex:1,}}/>
                        </View>
                        <Text numberOfLines={1} style={[AppStyles.styleSet.textWithWhiteColor, {marginLeft:10, fontSize:14, flex:1}]}>
                            {this.state.driverName}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={()=>Linking.openURL(`tel:${this.state.countryCode+' '+this.state.driverNumber}`)} style={{flexDirection:'row', alignItems:'center',}}>
                        <View style={{ overflow:'hidden',}}>
                            <Image source={require('../../../assets/phone.png')} resizeMode={'contain'} style={{height:20, width:20,}}/>
                        </View>
                        <Text numberOfLines={1} style={[AppStyles.styleSet.textWithWhiteColor, {marginLeft:10, fontSize:14,}]}>
                            +{this.state.countryCode} {this.state.driverNumber}
                        </Text>
                    </TouchableOpacity>
                </View>
                {this.statusView()}
            </View>
        )
    }

    statusView(){
        let isPending = false
        let active = false
        let isOnTheWay = false
        let isDelivered = false
        if(this.state.orderStatus === 'PENDING'){
            isPending = true
        }
        if(this.state.orderStatus === 'CONFIRMED'){
            active = true
            isPending = true
        }
        if(this.state.orderStatus === 'PICKED UP'){
            isOnTheWay = true
            active = true
            isPending = true
        }
        if(this.state.orderStatus === 'ON THE WAY'){
            isOnTheWay = true
            active = true
            isPending = true
        }
        if(this.state.orderStatus === 'DELIVERED'){
            isDelivered = true
            isOnTheWay = true
            active = true
            isPending = true
        }
        if(this.state.orderStatus === 'CANCELLED'){
            isOnTheWay = true
            active = true
            isPending = true
        }
        let activeColor = active?AppStyles.colorSet.mainTextColor:'grey'
        let isOnTheWayColor = isOnTheWay?AppStyles.colorSet.mainTextColor:'grey'
        let isDeliveredColor = isDelivered?AppStyles.colorSet.mainTextColor:'grey'
        let isPendingColor = isPending?AppStyles.colorSet.mainTextColor:'grey'
        return(
            <View style={{marginTop:25}}>
                <View style={{alignItems:'flex-start', flexDirection:'row'}}>
                    <View style={{height:36, width:36, borderRadius:18, 
                         justifyContent:'center', alignItems:'center', 
                         backgroundColor:isPending?AppStyles.colorSet.mainTextColor:'black',
                         borderColor:isPendingColor, borderWidth:1.5, }}>
                        <Image resizeMode={'contain'} source={isPending?require('../../../assets/order-placed-active.png')
                            :require('../../../assets/order-placed-inactive.png')} 
                            style={{height:18, width:18, }}/>
                    </View>
                    <Text style={[AppStyles.styleSet.textWithYellowColor,
                        {marginLeft:15, fontSize:15, marginTop:8, color:isPendingColor}]}>
                        Order placed
                    </Text>
                </View>
                <View style={{alignItems:'flex-start', flexDirection:'row', }}>
                    <View style={{alignItems:'center'}}>
                        <View style={{height:40, width:2.5, backgroundColor:activeColor}}/>
                        <View style={{height:36, width:36, borderRadius:18, 
                         justifyContent:'center', alignItems:'center', 
                         backgroundColor:active?AppStyles.colorSet.mainTextColor:'black',
                         borderColor:activeColor, borderWidth:1.5, }}>
                            <Image resizeMode={'contain'} source={active?require('../../../assets/order-accepted-active.png')
                                :require('../../../assets/order-accepted-inactive.png')} 
                                style={{height:18, width:18, }}/>
                        </View>
                    </View>
                    <Text style={[AppStyles.styleSet.textWithYellowColor,{marginLeft:15, 
                        fontSize:15,  alignSelf:'flex-end', marginBottom:8
                        , color:activeColor}]}>
                        {this.state.orderStatus !== 'CANCELLED'?'Driver Assigned':'Order Cancelled'}
                    </Text>
                </View>
                {this.state.orderStatus !== 'CANCELLED' && <View>
                    <View style={{alignItems:'flex-start', flexDirection:'row', }}>
                        <View style={{alignItems:'center'}}>
                            <View style={{height:40, width:2.5, backgroundColor:isOnTheWayColor}}/>
                            <View style={{height:36, width:36, borderRadius:18, 
                            justifyContent:'center', alignItems:'center', 
                            backgroundColor:isOnTheWay?AppStyles.colorSet.mainTextColor:'black',
                            borderColor:isOnTheWayColor, borderWidth:1.5, }}>
                                <Image resizeMode={'contain'} source={isOnTheWay?require('../../../assets/car-active.png')
                                    :require('../../../assets/car-inactive.png')} 
                                    style={{height:22, width:22, }}/>
                            </View>
                        </View>
                        <Text style={[AppStyles.styleSet.textWithYellowColor,{marginLeft:15, 
                            fontSize:15, marginTop:4, alignSelf:'flex-end', marginBottom:8,
                            color:isOnTheWayColor}]}>
                            On the way
                        </Text>
                    </View>
                    <View style={{alignItems:'flex-start', flexDirection:'row', }}>
                        <View style={{alignItems:'center'}}>
                            <View style={{height:40, width:2.5, backgroundColor:isDeliveredColor}}/>
                            <View style={{height:36, width:36, borderRadius:18, 
                            justifyContent:'center', alignItems:'center', 
                            backgroundColor:isDelivered?AppStyles.colorSet.mainTextColor:'black',
                            borderColor:isDeliveredColor, borderWidth:1.5, }}>
                                <Image resizeMode={'contain'} source={isDelivered?require('../../../assets/home-active-tracking.png')
                                    :require('../../../assets/home-inactive-tracking.png')} 
                                    style={{height:18, width:18, }}/>
                            </View>
                        </View>
                        <Text style={[AppStyles.styleSet.textWithYellowColor,{marginLeft:15, 
                            fontSize:15, marginTop:4, alignSelf:'flex-end', marginBottom:8
                            , color:isDeliveredColor}]}>
                            Delivered
                        </Text>
                    </View>
                    </View>
                }
            </View>
        )
    }

    addressView(){
        return(
            <View style={{padding:16}}>
                <Image source={{uri:this.state.storeImage}} style={{height:80, width:80, borderRadius:15,}}/>
                <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:14, marginTop:10}]}>
                     {this.state.storeName}
                </Text>
                <View style={{flexDirection:'row', marginTop:10,}}>
                    <Image 
                    resizeMode={'contain'}
                    source={require('../../../assets/pin.png')} 
                    style={{height:18, width:16}}/>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,
                         {marginLeft:5, fontSize:12}]}>
                        {this.state.storeAddress}
                    </Text>
                </View>
            </View>
        )
    }

    

    render(){
        let status = 'YOUR BOOZE IS CONFIRMED'
        if(this.state.orderStatus === 'CONFIRMED'){
            status = 'YOUR BOOZE IS CONFIRMED'
        }
        if(this.state.orderStatus === 'PICKED UP'){
            status = 'YOUR BOOZE IS PICKED UP'
        }
        if(this.state.orderStatus === 'ON THE WAY'){
            status = 'YOUR BOOZE IS ON THE WAY'
        }
        if(this.state.orderStatus === 'DELIVERED'){
            status = 'YOUR BOOZE IS DELIVERED'
        }
        if(this.state.orderStatus === 'CANCELLED'){
            status = 'YOUR BOOZE IS CANCELLED'
        }
        return(
            <SafeAreaView style={AppStyles.styleSet.screenContainer}>
                <StatusBar barStyle={'light-content'}/>
                {this.header()}
                <ScrollView style={{flex:1}}>
                    <View style={{flex:1}}>
                        <Text style={[AppStyles.styleSet.textWithYellowColor,
                            {fontFamily:AppStyles.fontFamily.M_SEMIBOLD, alignSelf:'center',
                            marginTop:25,}]}>
                            {status}
                        </Text>
                        {this.mapView()}
                        {this.bottomView()}
                        {this.addressView()}
                    </View>
                 </ScrollView>
                 {this.state.isLoading?<ShowLoader/>:null}
            </SafeAreaView>
        )
    }
}const mapStateToProps = (state) => {
    const { data } = state
    return { data }
};
  


export default connect(mapStateToProps)(OrderTracking);