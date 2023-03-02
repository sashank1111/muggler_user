import React, { Component } from "react";
import { 
    View,
    Image,
    Text, 
    TouchableOpacity,
    Touchable
} from "react-native"
import AppStyles from '../styles/AppStyles'
import { useDispatch } from 'react-redux'
import {changeDeliveryAddress} from '../redux/actions'




const StatusBarHeader = ({props}) => {

    const dispatch = useDispatch()
    const setDeliveryAddress = value => dispatch(changeDeliveryAddress(value))


    return(
        <View style={{width:'100%',  padding:10, paddingHorizontal:20,
            flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', flex:1}}>
                <TouchableOpacity onPress={()=>props.navigation.openDrawer()}>
                    <Image resizeMode={'contain'} source={require('../../assets/side-menu.png')} style={{height:25, width:25, }}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setDeliveryAddress(true)}style={{marginLeft:15, justifyContent:'space-between', height:40, flex:1,}}>
                        <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, fontFamily:AppStyles.fontFamily.M_BOLD}}>
                            Delivery Address
                        </Text>
                    <Text numberOfLines={2} style={{color:AppStyles.colorSet.mainTextColor, fontSize:12, 
                        fontFamily:AppStyles.fontFamily.M_SEMIBOLD,  marginRight:10}}>
                       {props.data.address}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <TouchableOpacity onPress={()=>props.navigation.navigate('Notifications')}>
                    <Image resizeMode={'cover'} source={require('../../assets/notification.png')} style={{height:25, width:25, marginRight:15}}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>props.navigation.navigate('Cart')}>
                        <Image resizeMode={'contain'} source={require('../../assets/cart_home.png')} style={{height:25, width:25, marginRight:15}}/>
                        {props.data.totalCartCount!==0 && <View style={{backgroundColor:'white', height:16, width:16,
                         borderRadius:8, position:'absolute', top:-5, right:5, 
                         //borderColor:AppStyles.colorSet.mainTextColor,
                          borderWidth:1, justifyContent:'center', alignItems:'center'}}>
                              <Text style={{color:AppStyles.colorSet.mainTextColor, alignSelf:'center', fontSize:9}}>
                                  {props.data.totalCartCount}
                              </Text>
                        </View>}
                    </TouchableOpacity>
            </View>
        </View>
    )
}

export default StatusBarHeader