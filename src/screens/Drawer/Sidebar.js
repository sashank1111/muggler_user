import React from 'react'
import {
    DrawerContentScrollView,
    DrawerItem,
    DrawerItemList 
} from '@react-navigation/drawer'
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Linking
} from 'react-native'
import AppStyles from '../../styles/AppStyles'
import { CommonActions } from '@react-navigation/native'
import AsyncStorage from '@react-native-community/async-storage';
import { sendPostRequestWithAccessToken } from '../../Utils/RestApiService'
import { LOGOUT } from '../../Utils/UrlClass'
import { useDispatch } from 'react-redux'
import {changeLoginStatus, changeSelectedTab} from '../../redux/actions'


function Sidebar({mainProps, ...props}){

    const dispatch = useDispatch()
    let status = {isLoggedIn:false, isFreeDelivery:false}
    const logout = value => dispatch(changeLoginStatus(status))
    const changeTab = value => dispatch(changeSelectedTab(value))

    return(
        <DrawerContentScrollView {...props} 
        contentContainerStyle={{ }}
             style={{backgroundColor:'black', borderRightColor:AppStyles.colorSet.mainTextColor, 
             borderRightWidth:1, height:'100%'}}>
            <SafeAreaView style={{height:'100%'}}>
                <TouchableOpacity onPress={()=>props.navigation.closeDrawer()} style={{alignSelf:'flex-end', marginRight:22}}>
                    <Image resizeMode={'contain'} source={require('../../../assets/close.png')} style={{height:22, width:22}}/>
                </TouchableOpacity>
                {mainProps.data.isLoggedIn && <View>
                    <View style={{alignSelf:'center', marginTop:10, justifyContent:'center', alignItems:'center'}}>
                        <Image source={global.profileImage!==''&&global.profileImage!==null&&global.profileImage!==undefined?
                        {uri:global.profileImage}:
                        require('../../../assets/team-placeholder.png')} 
                        style={{ height:100,  width:100, borderRadius:50}}/>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor, 
                            {marginTop:15, fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:20}]}>
                            {global.name}
                        </Text>
                    </View>
                </View>}
                <View style={{marginTop:mainProps.data.isLoggedIn?30:130,flex:1,  }}>
                {!mainProps.data.isLoggedIn && <DrawerItem
                    label={'Login'}
                    onPress={()=>{
                        changeTab('Login')
                        props.navigation.navigate('Login')
                        }}
                    labelStyle={{color:mainProps.data.selectedTab==='Login'?AppStyles.colorSet.mainTextColor:'#d3d3d3', 
                    fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:18, fontWeight:'bold',}}
                    icon={({}) => (
                        <Image  resizeMode={'contain'}
                                source={mainProps.data.selectedTab==='Login'?require('../../../assets/login-active.png'):
                                require('../../../assets/login-inactive.png')}
                                style={{height:22, width:22}}/>
                    )}
                    >
                </DrawerItem>}
                <DrawerItem
                    label={'Home'}
                    onPress={()=>{
                        changeTab('Home')
                        props.navigation.navigate('Home')
                        }}
                    labelStyle={{color:mainProps.data.selectedTab==='Home'?AppStyles.colorSet.mainTextColor:'#d3d3d3', 
                    fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:18, fontWeight:'bold',}}
                    icon={({}) => (
                        <Image  resizeMode={'contain'}
                                source={mainProps.data.selectedTab==='Home'?require('../../../assets/home-active.png'):
                                require('../../../assets/home-inactive.png')}
                                style={{height:22, width:22}}/>
                    )}
                    >
                </DrawerItem>
                <DrawerItem
                    label={'Cart'}
                    onPress={()=>{
                        changeTab('Cart')
                        props.navigation.navigate('Cart')
                        }}
                    labelStyle={{color:mainProps.data.selectedTab==='Cart'?AppStyles.colorSet.mainTextColor:'#d3d3d3', 
                    fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:18, fontWeight:'bold',}}
                    icon={({}) => (
                        <Image  resizeMode={'contain'}
                                source={mainProps.data.selectedTab==='Cart'?require('../../../assets/cart-active.png'):
                                require('../../../assets/cart-inactive.png')}
                                style={{height:22, width:22}}/>
                    )}
                    >
                </DrawerItem>
                {mainProps.data.isLoggedIn && <DrawerItem
                    label={'My Orders'}
                    onPress={()=>{
                        changeTab('MyOrder')
                        props.navigation.navigate('MyOrder')
                        }}
                    labelStyle={{color:mainProps.data.selectedTab==='MyOrder'?AppStyles.colorSet.mainTextColor:'#d3d3d3', 
                    fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:18, fontWeight:'bold',}}
                    icon={({}) => (
                        <Image  resizeMode={'contain'}
                                source={mainProps.data.selectedTab==='MyOrder'?require('../../../assets/cart-active.png'):
                                require('../../../assets/cart-inactive.png')}
                                style={{height:22, width:22}}/>
                    )}
                    >
                </DrawerItem>}
                {mainProps.data.isLoggedIn && <DrawerItem
                    label={'Profile'}
                    onPress={()=>{
                        changeTab('Profile')
                        props.navigation.navigate('Profile')
                        }}
                    labelStyle={{color:mainProps.data.selectedTab==='Profile'?AppStyles.colorSet.mainTextColor:'#d3d3d3', 
                    fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:18, fontWeight:'bold',}}
                    icon={({}) => (
                        <Image  resizeMode={'contain'}
                                source={mainProps.data.selectedTab==='Profile'?require('../../../assets/profile-active.png'):
                                require('../../../assets/profile-inactive.png')}
                                style={{height:22, width:22}}/>
                    )}
                    >
                </DrawerItem>}
                <DrawerItem
                    label={'Contact'}
                    onPress={()=>{
                        changeTab('Contact')
                        props.navigation.navigate('Contact')
                        }}
                    labelStyle={{color:mainProps.data.selectedTab==='Contact'?AppStyles.colorSet.mainTextColor:'#d3d3d3', 
                    fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:18, fontWeight:'bold',}}
                    icon={({}) => (
                        <Image  resizeMode={'contain'}
                                source={mainProps.data.selectedTab==='Contact'?require('../../../assets/contact-active.png'):
                                require('../../../assets/contact-inactive.png')}
                                style={{height:22, width:22}}/>
                    )}
                    >
                </DrawerItem>
                
                <DrawerItem
                 label={'Privacy Policy'}
                 onPress={()=>{
                     props.navigation.closeDrawer()
                     Linking.openURL('https://mysmugglers.com/privacy-policy')
                    }}
                 labelStyle={{color: '#d3d3d3', fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:18, fontWeight:'bold',}}
                 icon={({}) => (
                    <Image  resizeMode={'contain'}
                            source={require('../../../assets/privacy-inactive.png')}
                            style={{height:22, width:22}}/>
                 )}
                >
                </DrawerItem>
                <DrawerItem
                 label={'Terms of Conditions'}
                 onPress={()=>{
                     props.navigation.closeDrawer()
                     Linking.openURL('https://mysmugglers.com/terms-of-service')
                    }}
                 labelStyle={{color:'#d3d3d3', fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:17, fontWeight:'bold',flex:1}}
                 icon={({}) => (
                    <Image  resizeMode={'contain'}
                            source={require('../../../assets/privacy-inactive.png')}
                            style={{height:22, width:22}}/>
                 )}
                >
                </DrawerItem>
                
                </View>
                <DrawerItemList {...props}/>
               {mainProps.data.isLoggedIn && <View style={{justifyContent:'flex-end', marginBottom:15}}>
                    <DrawerItem 
                    label='Log Out'
                    onPress={async()=>{
                    let res = await sendPostRequestWithAccessToken(LOGOUT,  global.accessToken);
                     //console.log('resLogout', JSON.stringify(res))
                        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
                            AsyncStorage.setItem("@userData", '',()=>{
                                global.accessToken = ''
                                props.navigation.closeDrawer()
                                logout(false)
                                    props.navigation.dispatch(
                                        CommonActions.reset({
                                            index: 0,
                                            routes: [
                                                { name: 'Login' },
                                            ],
                                        })
                                    );
                            });
                        }else{
                            AsyncStorage.setItem("@userData", '',()=>{
                                global.accessToken = ''
                                props.navigation.closeDrawer()
                                logout(false)
                                    props.navigation.dispatch(
                                        CommonActions.reset({
                                            index: 0,
                                            routes: [
                                                { name: 'Login' },
                                            ],
                                        })
                                    );
                            });
                        }
                        
                    }}
                    labelStyle={{color:'#d3d3d3', fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:18, fontWeight:'bold',}}
                    icon={({}) => (
                        <Image  resizeMode={'contain'}
                                source={require('../../../assets/log-out.png')}
                                style={{height:22, width:22}}/>
                    )}
                    >

                    </DrawerItem>

                </View>}
                
            </SafeAreaView>

        </DrawerContentScrollView>
    )

}
export default Sidebar