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
    TextInput
} from "react-native"
import ResponseAlert from "../../components/ResponseAlert";
import ShowLoader from "../../components/ShowLoader";
import AppStyles from '../../styles/AppStyles'
import { sendPostRequestWithAccessTokenAndBody } from "../../Utils/RestApiService";
import { CHANGE_PASSWORD } from "../../Utils/UrlClass";


class ChangePassword extends Component{
    constructor(props){
        super(props)
        this.state={
            isLoading:false,
            oldPassword:'',
            newPassword:'',
            confirmPassword:'',
            responseAlert:false,
            responseText:''
        }
    }

    header(){
        return(
            <View style={{flexDirection:'row', alignItems:'center', overflow:'hidden', paddingHorizontal:20}}>
                {/* <TouchableOpacity onPress={()=>this.props.navigation.goBack()}>
                    <Image 
                    resizeMode={'contain'}
                    source={require('../../../assets/back-arrow.png')}
                    style={{height:25, width:25,}}/>
                </TouchableOpacity> */}
                <View style={{height:50, alignItems:'center', overflow:'hidden', flex:1, marginLeft:15}}>
                    <Image 
                    resizeMode={'contain'}
                    resizeMethod={'scale'}
                    source={require('../../../assets/change-password.png')} 
                    style={{flex:1}}/>
                </View>
            </View>
        )
    }

    validate(){
        if(this.state.oldPassword === '' && this.state.newPassword === '' && this.state.confirmPassword){
            this.setState({responseText:'All fields are required', responseAlert:true})
        }else if(this.state.oldPassword === ''){
            this.setState({responseText:'Please enter old password', responseAlert:true})
        }else if(this.state.newPassword === ''){
            this.setState({responseText:'Please enter new password', responseAlert:true})
        }else if(this.state.confirmPassword === ''){
            this.setState({responseText:'Please enter confirm password', responseAlert:true})
        }else if(this.state.newPassword !== this.state.confirmPassword){
            this.setState({responseText:'Passwords are not matching', responseAlert:true})
        }else{
            this.changePassword()
        }
    }

    async changePassword(){
        this.setState({isLoading:true})
        let body = {
            oldPassword:this.state.oldPassword,
            newPassword:this.state.newPassword
        }

        let res = await sendPostRequestWithAccessTokenAndBody(CHANGE_PASSWORD,body,  global.accessToken);
        console.log('res', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({isLoading:false},()=>
            this.setState({responseText:'Password has changed', responseAlert:true}))
                
        }else if(res.hasOwnProperty('response') && res.response.status.statusCode === 400){
            this.setState({isLoading:false},()=>this.setState({responseText:res.response.status.customMessage, responseAlert:true}))

        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
        
    }

    

    render(){
        return(
            <SafeAreaView style={AppStyles.styleSet.screenContainer}>
                <StatusBar barStyle={'light-content'}/>
                {this.header()}
                <KeyboardAvoidingView  
                        style={{
                        flexDirection: 'column', }} 
                        behavior={Platform.OS=='ios'?'position':'height'}
                        enabled
                        keyboardVerticalOffset={Platform.OS=='ios'?20:30}>
                            <ScrollView>
                                <View style={{flex:1, padding:20,}}>
                                    <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:20, 
                                        fontFamily:AppStyles.fontFamily.M_SEMIBOLD}}>
                                        Old Password
                                    </Text>
                                    <View style={[AppStyles.styleSet.textInputView, {marginTop:20}]}>
                                        <TextInput 
                                            ref={(rf) => {this.oldPassword = rf}}
                                            placeholder='Old Password'
                                            numberOfLines={1}
                                            secureTextEntry
                                            value={this.state.oldPassword}
                                            onChangeText={(text)=>this.setState({oldPassword:text})}
                                            placeholderTextColor={'#878787'}
                                            style={[AppStyles.styleSet.textInputStyle, {flex:1}]}
                                        />
                                    </View>
                                    <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:20, 
                                        fontFamily:AppStyles.fontFamily.M_SEMIBOLD, marginTop:15}}>
                                        New Password
                                    </Text>
                                    <View style={[AppStyles.styleSet.textInputView, {marginTop:20}]}>
                                        <TextInput 
                                            ref={(rf) => {this.newPassword = rf}}
                                            placeholder='New Password'
                                            numberOfLines={1}
                                            secureTextEntry
                                            value={this.state.newPassword}
                                            onChangeText={(text)=>this.setState({newPassword:text})}
                                            placeholderTextColor={'#878787'}
                                            style={[AppStyles.styleSet.textInputStyle, {flex:1}]}
                                        />
                                    </View>
                                    <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:20, 
                                        fontFamily:AppStyles.fontFamily.M_SEMIBOLD, marginTop:15}}>
                                        Confirm Password
                                    </Text>
                                    <View style={[AppStyles.styleSet.textInputView, {marginTop:20}]}>
                                        <TextInput 
                                            ref={(rf) => {this.confirmPassword = rf}}
                                            placeholder='Confirm Password'
                                            numberOfLines={1}
                                            secureTextEntry
                                            value={this.state.confirmPassword}
                                            onChangeText={(text)=>this.setState({confirmPassword:text})}
                                            placeholderTextColor={'#878787'}
                                            style={[AppStyles.styleSet.textInputStyle, {flex:1}]}
                                        />
                                    </View>
                                </View>
                                <View style={{padding:20, width:'100%'}}>
                                    <TouchableOpacity onPress={()=>this.validate()} style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:20,}]}>
                                        <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                            SUBMIT
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                </KeyboardAvoidingView>
                <ResponseAlert
                 visible={this.state.responseAlert}
                 responseText={this.state.responseText}
                 onOkayPress={()=>this.setState({responseAlert:false, responseText:''})}
                />
                {this.state.isLoading?<ShowLoader/>:null}
            </SafeAreaView>
        )
    }
}export default ChangePassword