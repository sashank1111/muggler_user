import React, { Component } from "react";
import {
    View,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Image,
    Text,
    ScrollView,
    Linking
} from 'react-native'
import StatusBarHeader from "../components/StatusBarHeader";
import AppStyles from '../styles/AppStyles'
import {Switch} from 'react-native-switch'
import { App } from "react-native-firebase";
import { connect } from 'react-redux';
import WatermarkView from "../components/WatermarkView";
import BackButton from "../components/BackButton";
import { bindActionCreators } from 'redux';
const reachOutText = 'Please do not hesitate to reach out to us if you have any comments, questions, or concerns.'
import {showBackButton} from '../redux/actions'



class Contact extends Component{
    constructor(props){
        super(props)
        this.state={
            
        }
    }

    componentDidMount(){
        this.props.showBackButton(true)
    }

    headerImage(){
        return(
            <View style={{width:'100%',  marginTop:10,paddingTop: 0, paddingHorizontal:20
                    }}>
                <BackButton props={this.props}/>
                <Image 
                    resizeMode={'stretch'}
                    source={require('../../assets/contact.png')} 
                    style={{ width:'100%', marginTop:15}}/>
            </View>
        )
    }

    render(){
        return(
            <SafeAreaView style={{flex:1, backgroundColor:'black'}}>
                <StatusBar barStyle={'light-content'}/>
                <WatermarkView/>
                {/* <StatusBarHeader props={this.props}/> */}
                {this.headerImage()}
                <ScrollView style={{flex:1, marginBottom:20}}>
                    <View style={{flex:1, padding:20, alignItems:'center'}}>
                        <Text style={[AppStyles.styleSet.headerText, {marginTop:60,
                           fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:24}]}>
                            Follow us on IG or twitter
                        </Text>
                        <Text style={[AppStyles.styleSet.textWithYellowColor, {marginTop:30,
                           fontFamily:AppStyles.fontFamily.M_BOLD, }]}>
                            @mysmuglers
                        </Text>
                        <View style={{marginTop:30, flexDirection:'row'}}>
                            <TouchableOpacity onPress={()=>Linking.openURL('https://www.instagram.com/my.smugglers/')} style={{width:70, height:70,
                              borderRadius:35,}}>
                                  <Image resizeMode={'contain'} source={require('../../assets/insta.png')} style={{flex:1}}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>Linking.openURL('https://twitter.com/Mysmugglers/')} style={{width:70, height:70,
                              borderRadius:35, marginLeft:10}}>
                                  <Image resizeMode={'contain'} source={require('../../assets/twitter.png')} style={{flex:1}}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>{
                                  const FANPAGE_ID = 'my.smugglers'
                                  let FANPAGE_URL_FOR_APP = ''
                                  if(Platform.OS==='ios'){
                                      FANPAGE_URL_FOR_APP = `fb://profile?id=${FANPAGE_ID}`
                                  }else{
                                      FANPAGE_URL_FOR_APP = `fb://page/${FANPAGE_ID}`
                                  }
                                  const FANPAGE_URL_FOR_BROWSER = `https://fb.com/${FANPAGE_ID}`
                                  Linking.canOpenURL(FANPAGE_URL_FOR_APP)
                                    .then((supported) => {
                                      if (!supported) {
                                        Linking.openURL(FANPAGE_URL_FOR_BROWSER)
                                      } else {
                                        Linking.openURL(FANPAGE_URL_FOR_APP)
                                      }})
                                    .catch(err => console.error('An error occurred', err))
                              //  Linking.openURL('https://www.facebook.com/my.smugglers/')
                            
                            }}  style={{width:70, height:70,
                              borderRadius:35, marginLeft:10}}>
                                  <Image resizeMode={'contain'} source={require('../../assets/fb.png')} style={{flex:1}}/>
                            </TouchableOpacity>
                        </View>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor, {marginTop:30,
                           fontFamily:AppStyles.fontFamily.M_SEMIBOLD, textAlign:'center'}]}>
                            {reachOutText}
                        </Text>
                        <Text style={[AppStyles.styleSet.headerText, {marginTop:60,
                           fontFamily:AppStyles.fontFamily.M_SEMIBOLD, fontSize:24}]}>
                            Email us at
                        </Text>
                        <Text onPress={()=>Linking.openURL('mailto:whatsup@901smugglers.com')} style={[AppStyles.styleSet.textWithWhiteColor, {marginTop:10,
                           fontFamily:AppStyles.fontFamily.M_SEMIBOLD, textAlign:'center'}]}>
                            whatsup@901smugglers.com
                        </Text>
                        <Text style={[AppStyles.styleSet.textWithYellowColor, {marginTop:10,
                           fontFamily:AppStyles.fontFamily.M_SEMIBOLD, textAlign:'center'}]}>
                            Text or call{' '}
                            <Text onPress={()=>Linking.openURL(`tel:9012863737`)} style={[AppStyles.styleSet.textWithWhiteColor, {marginTop:10,
                            fontFamily:AppStyles.fontFamily.M_SEMIBOLD, textAlign:'center'}]}>
                                9012863737
                            </Text>
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}const mapStateToProps = (state) => {
    const { data } = state
    return { data }
};
  
const mapDispatchToProps = dispatch => (
    bindActionCreators({
    showBackButton,
    }, dispatch)
);


export default connect(mapStateToProps, mapDispatchToProps)(Contact);