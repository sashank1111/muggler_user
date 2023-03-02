import React,{ Component } from "react";
import {
    SafeAreaView,
    StatusBar,
    View,
    Image,
    ImageBackground,
    Text,
    FlatList,
    TouchableOpacity
} from 'react-native'
import { sendPostRequestWithAccessToken, sendPostRequestWithAccessTokenAndBody } from "../../Utils/RestApiService";
import { DELETE_SAVED_ADDRESS, GET_PROFILE, GET_SAVED_ADDRESS_LIST, IMAGE_UPLOAD, SET_DEFAULT_ADDRESS } from "../../Utils/UrlClass";
import AppStyles from '../../styles/AppStyles'
import AsyncStorage from '@react-native-community/async-storage';
import ShowLoader from "../../components/ShowLoader";
import StatusBarHeader from "../../components/StatusBarHeader";
import WatermarkView from "../../components/WatermarkView";
import { connect } from 'react-redux';
import BackButton from "../../components/BackButton";
import { Switch } from 'react-native-switch';
import ResponseAlert from "../../components/ResponseAlert";
import { bindActionCreators } from 'redux';
import { setLocation } from '../../redux/actions'
const data = ['ewd', 'wed', 'wed']


class SavedAddress extends Component{
    constructor(props){
        super(props)
        this.state={
            data:'',
            profileImage:'',
            isLoading:false,
            showImagePickerModal:false,
            profileImagePath:'',
            isLoading:true,
            switchValueIndex:-1,
            responseText:'',
            responseAlert:false
        }
        this.props.navigation.addListener(
            'focus',
               payload => {
                  this.getSavedAddressList()
                    
                }
          );
        
    }

    componentDidMount(){
        this.getSavedAddressList()
    }
 
    async getSavedAddressList(){
        let body = {}
        let res = await sendPostRequestWithAccessTokenAndBody(GET_SAVED_ADDRESS_LIST, body,  global.accessToken);
        //console.log('savedAddress', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({data:res.response.addresData},()=>this.setState({isLoading:false}))
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    async deleteSavedAddress(id){
        this.setState({isLoading:true})
        let body = {
            id:id
        }
        let res = await sendPostRequestWithAccessTokenAndBody(DELETE_SAVED_ADDRESS, body,  global.accessToken);
        console.log('savedAddress', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
           this.getSavedAddressList()
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    itemView(item, index){
        let switchValue = false
        if(this.state.switchValueIndex === index || item.isDefault){
            switchValue = true
        }
        return(
            <View style={{borderColor:AppStyles.colorSet.mainTextColor, borderWidth:2,
                borderRadius:12, padding:16,  marginTop:15}}>
                <View style={{ flexDirection:'row', alignItems:'center'}}>
                        <Image source={require('../../../assets/home.png')} resizeMode={'contain'} style={{height:40, width:40,}}/>
                        <View style={{marginLeft:15, flex:1, marginRight:10}}>
                            <Text style={AppStyles.styleSet.textWithWhiteColor}>HOME</Text>
                            <Text style={[AppStyles.styleSet.textWithWhiteColor, {marginTop:10, fontSize:16}]}>
                                {item.address}
                            </Text>
                        </View>
                        <View style={{flexDirection:'row'}}>
                            <TouchableOpacity onPress={()=>this.props.navigation.navigate('AddAddress', {navigateFrom:'updateSavedAddress', updateData:item})} >
                                <Image resizeMode={'contain'} source={require('../../../assets/pencil-white.png')} style={{height:16, width:16, }}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>this.deleteSavedAddress(item._id)}>
                                 <Image resizeMode={'contain'} source={require('../../../assets/trash-white.png')} style={{height:16, width:16, marginLeft:12}}/>
                            </TouchableOpacity>
                        </View>
                </View>
                <View style={{flexDirection:'row', marginTop:15, alignItems:'center'}}>
                    <Text style={[AppStyles.styleSet.textWithYellowColor, { fontSize:16, marginRight:15}]}>
                        Make it Default
                    </Text>
                    {this.switchView(item._id, switchValue, index)}
                </View>
            </View>
        )
    }

    onValueChange = (id, value, index) =>{
        if(value){
           this.setState({switchValueIndex:index, isLoading:true},()=>this.setDefault(id, value, index))
        }else{
            this.setState({switchValueIndex:-1, isLoading:true},()=>this.setDefault(id, value, index))
        }
    }

    async setDefault(id, value, index){
        let body = {
            id:id,
            status:value
        }
        let res = await sendPostRequestWithAccessTokenAndBody(SET_DEFAULT_ADDRESS, body,  global.accessToken);
        console.log('setDefault', JSON.stringify(res))
        console.log('defaultAdd', JSON.stringify(this.state.data[index]))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
//             let data = this.state.data[index]
//             let coord = {latitude: data.location.coordinates[0],
//                 longitude: data.location.coordinates[1], 
//                 address: data.address}
//    // await AsyncStorage.setItem("@saveAddress", JSON.stringify(coord))
//             await this.props.setLocation(coord)
            this.getSavedAddressList()
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    switchView(id, switchValue, index){
        return(
            <Switch
            value={switchValue}
            changeValueImmediately
            backgroundActive={AppStyles.colorSet.mainTextColor}
            activeText={''}
            inActiveText={''}
            innerCircleStyle={{
            height: 22,
            width: 22,
            borderRadius: 11,
            backgroundColor:'black',
            justifyContent: 'center',
            alignItems: 'center',
            borderColor: 'black',
            }}
            //containerStyle={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            onValueChange={(value) => this.onValueChange(id, value, index)}
        />
        )
    }

    render(){
        return(
            <SafeAreaView style={AppStyles.styleSet.screenContainer}>
                <StatusBar barStyle={'light-content'}/>
                <WatermarkView/>
                {/* <StatusBarHeader props={this.props}/> */}
                <View style={{width:'100%',  paddingHorizontal:20, 
                    }}>
                    <BackButton props={this.props}/>
                    <Image 
                        resizeMode={'stretch'}
                        source={require('../../../assets/saved-address.png')} 
                        style={{ width:'100%', marginTop:15}}/>
                </View>
                <FlatList
                    data={this.state.data}
                    style={{marginTop:15, paddingHorizontal:20}}
                    renderItem={({ item, index }) => (
                    this.itemView(item, index)
                    )}
                    keyExtractor={item => item._id}
                />
                <View style={{marginHorizontal:20, marginTop:30, marginBottom:20}}>
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('AddAddress', {navigateFrom:'savedAddress'})} style={[AppStyles.styleSet.viewWithYelloBackground, {}]}>
                        <Text style={AppStyles.styleSet.textWithWhiteColor}>
                            ADD NEW ADDRESS
                        </Text>
                    </TouchableOpacity>
                </View>
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

const mapDispatchToProps = dispatch => (
    bindActionCreators({
    setLocation,
    }, dispatch)
  );


export default connect(mapStateToProps, mapDispatchToProps)(SavedAddress);