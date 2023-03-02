import React, { Component } from "react";
import { 
    SafeAreaView, 
    StatusBar, 
    TouchableOpacity, 
    View,
    Text,
    KeyboardAvoidingView,
    ScrollView,
    Image,
    Platform,
    TextInput,
    Keyboard,
    StyleSheet
} from "react-native"
import Header from '../components/Header'
import ShowLoader from "../components/ShowLoader";
import AppStyles from '../styles/AppStyles'
import { EMAIL_EXPRESSION_CHECK } from "../Utils/Helper";
import { sendPostRequest } from "../Utils/RestApiService";
import { FORGOT_PASSWORD } from "../Utils/UrlClass";
import CountryPicker , { DARK_THEME }  from 'react-native-country-picker-modal';
import BackButton from "../components/BackButton";
import ResponseAlert from "../components/ResponseAlert";

class ForgotPassword extends Component{
    constructor(props){
        super(props)
        this.state={
            email:'',
            countryCode:'1',
            cca2:'US',
            isLoading:false,
            phone:'',
            responseText:'',
            showPasswordSent:false
        }
    }

    async forgotPassword(){
        if(this.state.phone===''){
            this.setState({responseText:"Phone number is required", showPasswordSent:true})
        }else {
            this.setState({isLoading:true})
            const credentials={
                contactNumber:this.state.phone,
                countryCode:this.state.countryCode.toString()
            }
            let res = await sendPostRequest(FORGOT_PASSWORD, credentials);
            //console.log('forgot', JSON.stringify(res))
            if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
                this.setState({isLoading:false,responseText:"Password Sent", showPasswordSent:true})
            }else{
                this.setState({isLoading:false,responseText:res.response.status.customMessage, showPasswordSent:true})
            }
        }
    }
    countryPicker(){
        return(
            <View style={{height:30,justifyContent:'center'}}>
                 <CountryPicker
                          countryCode={this.state.cca2}
                          containerButtonStyle={styles.country}
                          withFlag 
                          withModal 
                          withCallingCode 
                          withAlphaFilter
                          withFilter 
                          withCallingCodeButton 
                          onSelect={(country) => this.setState({cca2:country.cca2, countryCode:country.callingCode, iso:country.cca2})} 
                          theme={DARK_THEME}
                         // onClose={()=>this.handleFocus('phoneInput')} 
                  >
                  </CountryPicker>
            </View>
        )
    }

    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    }

    componentWillUnmount(){
        this.keyboardDidShowListener.remove();
    }

    _keyboardDidShow=(e)=>{
        if(Platform.OS==='android'){
            this.scrollview.scrollToEnd()
        }
    }

  
    render(){
        return(
            <SafeAreaView style={AppStyles.styleSet.screenContainer}>
                <StatusBar barStyle={'light-content'}/>
                <KeyboardAvoidingView  
                        style={{
                        flexDirection: 'column', }} 
                        behavior={Platform.OS=='ios'?'position':'height'}
                        enabled
                        keyboardVerticalOffset={Platform.OS=='ios'?30:30}>
                            <ScrollView ref={(el) => {this.scrollview = el}}>
                                <View style={{flex:1, padding:20,}}>
                                    <TouchableOpacity onPress={()=>this.props.navigation.goBack()}>
                                        <Image style={{width:25, marginRight:15}}resizeMode={'contain'} source={require('../../assets/back-arrow.png')}/>
                                    </TouchableOpacity>
                                    <Header image={require('../../assets/forgot-shape.png')}/>
                                    <Text style={AppStyles.styleSet.headerText}>
                                        Enter the phone number
                                    </Text>
                                    <Text style={[AppStyles.styleSet.headerText, {marginTop:2, textAlign:'center'}]}>
                                        associated with your account
                                    </Text>
                                    <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:35}]}>
                                        Phone
                                    </Text>
                                    <View style={[AppStyles.styleSet.textInputView, {marginTop:15,
                                    flexDirection:'row', alignItems:'center',flex:1
                                    }]}>
                                        {this.countryPicker()}
                                        <TextInput 
                                            ref={(rf) => {this.phone = rf}}
                                            placeholder='Phone'
                                            keyboardType={'numeric'}
                                            value={this.state.phone}
                                            onChangeText={(text)=>this.setState({phone:text})}
                                            placeholderTextColor={'#878787'}
                                            style={[AppStyles.styleSet.textInputStyle,{flex:1, marginLeft:5}]}
                                        />
                                    </View>
                                    <View style={{width:'100%', marginTop:30}}>
                                        <TouchableOpacity onPress={()=>this.forgotPassword()} style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:20,}]}>
                                            <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                                SUBMIT
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>
                </KeyboardAvoidingView>
                
                <ResponseAlert
                 visible={this.state.showPasswordSent}
                 responseText={this.state.responseText}
                 onOkayPress={()=>this.setState({showPasswordSent:false, responseText:''})}
                />
                {this.state.isLoading?<ShowLoader/>:null}
                {/* {this.passwordSent()} */}
            </SafeAreaView>
        )
    }
}
const styles = StyleSheet.create({
    country: {
        paddingBottom: Platform.OS === 'ios' ? 0 : 6, 
        marginRight: 10, 
        paddingTop: Platform.OS === 'ios' ? 0 : 5,
      },
})
export default ForgotPassword