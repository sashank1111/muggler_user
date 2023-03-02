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


class Blog extends Component{

    async componentDidMount(){
        SplashScreen.hide()
       
    }

    itemView(){
        return(
            <View>
                <View style={{flexDirection:'row', paddingHorizontal:10, justifyContent:'space-between', alignItems:'center'}}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{height:50, width:50, borderRadius:25, overflow:'hidden',
                        borderColor:AppStyles.colorSet.mainTextColor, borderWidth:1}}>
                            <Image style={{flex:1, backgroundColor:'red', borderRadius:25}}/>
                        </View>
                        <View style={{marginLeft:15, justifyContent:'center'}}>
                            <Text style={{color:'white', fontSize:14, 
                                fontFamily:AppStyles.fontFamily.M_SEMIBOLD}}>
                                    Thomas
                            </Text>
                            <View style={{marginTop:5, flexDirection:'row'}}>
                                <Image source={require('../../assets/blog-time.png')} 
                                 style={{height:12, width:12,}}/>
                                <Text style={{color:'grey', fontSize:10, marginLeft:8,
                                    fontFamily:AppStyles.fontFamily.M_SEMIBOLD}}>
                                        2 mins ago
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Image resizeMode={'contain'} source={require('../../assets/three-dots.png')} 
                    style={{height:18, width:14, }}/>
                </View>
                <Image style={{height:160, width:'100%', backgroundColor:'red', marginTop:15}}/>
                <View style={{paddingHorizontal:10}}>
                    <Text style={{color:'white', fontSize:14, marginTop:15,
                        fontFamily:AppStyles.fontFamily.M_SEMIBOLD}}>
                            Where does it come from?
                    </Text>
                    <Text style={{color:'grey', fontSize:10, marginTop:10,
                        fontFamily:AppStyles.fontFamily.M_SEMIBOLD}}>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                    </Text>
                </View>
                <View style={{flexDirection:'row', marginHorizontal:10, paddingVertical:20, 
                    justifyContent:'space-between', borderColor:AppStyles.colorSet.mainTextColor, borderBottomWidth:1}}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{flexDirection:'row'}}>
                            <Image resizeMode={'contain'} source={require('../../assets/heart.png')} style={{height:14, width:14}}/>
                            <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:12, marginLeft:7,
                                fontFamily:AppStyles.fontFamily.M_SEMIBOLD}}>
                                    8
                            </Text>
                        </View>
                        <View style={{flexDirection:'row', marginLeft:16}}>
                            <Image resizeMode={'contain'} source={require('../../assets/comment.png')} style={{height:14, width:14, }}/>
                            <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:12, marginLeft:7,
                                fontFamily:AppStyles.fontFamily.M_SEMIBOLD}}>
                                    15
                            </Text>
                        </View>
                    </View>
                    <View style={{flexDirection:'row'}}>
                         <Image resizeMode={'contain'} source={require('../../assets/facebook-blog.png')} style={{height:14, width:14,}}/>
                         <Image resizeMode={'contain'} source={require('../../assets/twitter-blog.png')} style={{height:14, width:14,  marginLeft:10}}/>
                         <Image resizeMode={'contain'} source={require('../../assets/linkedin-in-blog.png')} style={{height:14, width:14,  marginLeft:10}}/>
                         <Image resizeMode={'contain'} source={require('../../assets/feather-link.png')} style={{height:14, width:14,  marginLeft:10}}/>
                    </View>
                </View>
            </View>
        )
    }
    render(){
        return(
            <SafeAreaView style={AppStyles.styleSet.screenContainer}>
                <StatusBar barStyle={'light-content'}/>
                <View style={{flexDirection:'column', flex:1, paddingBottom:10}}>
                      <Image 
                        resizeMode={'contain'}
                        source={require('../../assets/blog.png')} 
                        style={{ width:'100%'}}/>
                        <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', paddingHorizontal:10,
                           marginTop:25}}>
                            <TouchableOpacity style={{}}>
                                <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:18, 
                                    fontFamily:AppStyles.fontFamily.M_BOLD, marginLeft:10}}>
                                        All
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>this.props.navigation.navigate('Filter', 
                            {type:this.state.type, categoryId:this.state.itemId})} style={{flexDirection:'row'}}>
                                <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:18, 
                                    fontFamily:AppStyles.fontFamily.M_BOLD, marginLeft:10}}>
                                        Filter
                                </Text>
                                <Image 
                                    resizeMode={'contain'}
                                    source={require('../../assets/filter.png')} 
                                    style={{height:18, width:18, marginLeft:15}}/>
                            </TouchableOpacity>
                        </View>
                        <View style={{marginTop:30}}>
                            {this.itemView()}

                        </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(Blog);