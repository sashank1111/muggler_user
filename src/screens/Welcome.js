import React, { Component } from "react";
import { 
    SafeAreaView, 
    StatusBar, 
    TouchableOpacity, 
    View,
    Text,
    Image,
    ScrollView
} from "react-native"
import AppStyles from '../styles/AppStyles'
import AsyncStorage from '@react-native-community/async-storage';
import { CommonActions } from '@react-navigation/native'
import SplashScreen from 'react-native-splash-screen'
import { bindActionCreators } from 'redux';
import { changeLoginStatus, setLocation, changeSelectedTab} from '../redux/actions'
import { connect } from 'react-redux';


class Welcome extends Component{

    async componentDidMount(){
        SplashScreen.hide()
        await AsyncStorage.getItem('@userData', '').then( async(value)=>{
            await AsyncStorage.getItem('@saveAddress', '').then( async(savedAddress)=>{
            console.log('welcome', JSON.parse(value))
                if(value === null || value === undefined || value === ''){
                    let status = {isLoggedIn:false, isFreeDelivery:false}
                    if(savedAddress === null || savedAddress === undefined || savedAddress === ''){
                        
                    }else{
                        let sd = JSON.parse(savedAddress)
                        console.log('welcomedscxwe', sd.address)
                        this.props.setLocation(sd)
                    }
                    this.props.changeLoginStatus(status)
                    //SplashScreen.hide()
                
                }else{
                    var data = JSON.parse(value)
                // console.log('welcomeUserData', JSON.stringify(data))
                    global.accessToken = data.userData.accessToken
                    global.name = data.userData.firstName+' '+data.userData.lastName
                    if(data.userData.profileImage!==''&&data.userData.profileImage!==undefined){
                    global.profileImage = data.userData.profileImage
                    }
                    // if(data.savedAddressData.length>0){
                    //     let coord = {latitude: data.savedAddressData[0].location.coordinates[0],
                    //         longitude: data.savedAddressData[0].location.coordinates[1], 
                    //         address: data.savedAddressData[0].address}
                    //     this.props.setLocation(coord)
                    // }
                    if(savedAddress === null || savedAddress === undefined || savedAddress === ''){
                        if(data.savedAddressData.length>0){
                            let coord = {latitude: data.savedAddressData[0].location.coordinates[0],
                                longitude: data.savedAddressData[0].location.coordinates[1], 
                                address: data.savedAddressData[0].address}
                            this.props.setLocation(coord)
                        }
                    }else{
                        let sd = JSON.parse(savedAddress)
                        this.props.setLocation(sd)
                    }
                    let status = {isLoggedIn:true, isFreeDelivery:data.userData.isFreeDelivery}
                    await this.props.changeLoginStatus(status)
                    await this.props.changeSelectedTab('Home')
                // await this.props.changeLoginStatus(true)
                    //SplashScreen.hide()
                    this.props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                { name: 'Drawer' },
                            ],
                        })
                    );
                }
            });
        });
    }
    render(){
        return(
            <SafeAreaView style={AppStyles.styleSet.screenContainer}>
                <StatusBar barStyle={'light-content'}/>
                <View style={{flexDirection:'column', justifyContent:'space-between', flex:1, paddingBottom:10}}>
                  <ScrollView contentContainerStyle={{flex:1, paddingBottom:30, marginBottom:20}}>  
                    <View style={{flex:1}}/>
                    <View style={{flex:1, alignItems:'center',}}>
                            <View style={{height:110, width:60, alignSelf:'center'}}>
                                <Image 
                                resizeMode={'contain'}
                                source={require('../../assets/Smugglers-logo.png')} 
                                style={{flex:1}}/>
                            </View>
                    </View>
                    <View style={{padding:20,flex:1, paddingBottom:40}}>
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate('Drawer')} style={AppStyles.styleSet.viewWithYelloBorder}>
                            <Text style={AppStyles.styleSet.textWithYellowColor}>
                                BROWSE THE AISLES
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate('Drawer', 
                        {
                            screen: 'Drawer',
                            params: { navigateTo: 'Login' },
                        })} 
                        style={[AppStyles.styleSet.viewWithYelloBorder, {marginTop:20}]}>
                            <Text style={AppStyles.styleSet.textWithYellowColor}>
                                I HAVE AN ACCOUNT
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity  onPress={()=>this.props.navigation.navigate('Signup')} style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:20}]}>
                            <Text style={AppStyles.styleSet.textWithWhiteColor}>
                                I'M NEW TO THIS
                            </Text>
                        </TouchableOpacity>
                        <View style={{marginTop:35, flexDirection:'row',  alignSelf:'center', justifyContent:'center', marginBottom:15, flexWrap:'wrap'}}>
                            <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:16,}}>Contact</Text>
                            <Text style={{color:AppStyles.colorSet.mainTextColor, fontFamily:AppStyles.fontFamily.M_SEMIBOLD,
                                fontSize:16, marginLeft:5}}>
                                whatsup@901smugglers.com
                            </Text>
                        </View>
                    </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        )
    }
}const mapStateToProps = (state) => {
    const { data } = state
    return { data }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
    changeLoginStatus,
    setLocation,
    changeSelectedTab
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);