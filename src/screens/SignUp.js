import React, { Component } from "react";
import { 
    SafeAreaView, 
    StatusBar, 
    TouchableOpacity, 
    View,
    Text,
    KeyboardAvoidingView,
    ScrollView,
    Modal,
    Image,
    Platform,
    Keyboard,
    TextInput,
    StyleSheet
} from "react-native"
import Header from '../components/Header'
import AppStyles from '../styles/AppStyles'
import CountryPicker , { DARK_THEME }  from 'react-native-country-picker-modal';
import DatePicker from 'react-native-datepicker'
import { CAPITAL_CHAR_REG_EX, EMAIL_EXPRESSION_CHECK, NUMBER_REG_EX, 
      SMALL_CHAR_REG_EX, SPECIAL_CHAR_REG_EX } from "../Utils/Helper";
import { sendPostRequest } from "../Utils/RestApiService";
import ShowLoader from '../components/ShowLoader'
import { SEND_OTP, VERIFY_OTP, USER_SIGNUP, IMAGE_BASE_URL } from "../Utils/UrlClass";
import AsyncStorage from '@react-native-community/async-storage';
import { CommonActions } from '@react-navigation/native'
import WatermarkView from "../components/WatermarkView";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeLoginStatus} from '../redux/actions'
import { logEvent } from "../Utils/AnalyticsUtils";
import ResponseAlert from "../components/ResponseAlert";
import DeviceInfo from 'react-native-device-info';
// import { StackActions, NavigationActions } from 'react-navigation';

// const loginAction = StackActions.reset({
//     index: 0,
//     actions: [NavigationActions.navigate({ routeName: 'Home' }),
//         ],
//   });


class SignUp extends Component{
    constructor(props){
        super(props)
        this.state={
            email:'',
            firstName:'',
            lastName:'',
            dob:'',
            phone:'',
            verificationCode:'',
            password:'',
            confirmPassword:'',
            instagram:'',
            referralCode:'',
            countryCode:'1',
            iso:'US',
            age:'',
            instagramUserName:'',
            otp1:'',
            otp2:'',
            otp3:'',
            otp4:'',
            isPhoneVerified:false,
            showNameView:true,
            showBirthdayView:false,
            showAgeAlert:false,
            showEmailView:false,
            showPhoneView:false,
            showVerificationCodeView:false,
            showPasswordview:false,
            showInstagramView:false,
            showRefferalView:false,
            isLoading:false,
            passwordSecureTextEntry:true,
            confirmPasswordSecureTextEntry:true,
            cca2:'US',
            responseAlert:false,
            responseText:''

        }
    }

    componentDidMount(){
        logEvent('Signup_Page')
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

    showAgeAlert(){
        return(
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={this.state.showAgeAlert}
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
                    backgroundColor:'black', opacity:1, paddingBottom:30}}>
                        <TouchableOpacity onPress={()=>this.setState({showAgeAlert:false})}>
                            <Image source={require('../../assets/close_yellow.png')} 
                            style={{height:25, width:25, alignSelf:'flex-end'}}/>
                        </TouchableOpacity>
                        <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_BOLD,
                               fontSize:25, textAlign:'center', marginTop:33}}>
                                   You must be 21 years of age or older to proceed

                        </Text>
                        <TouchableOpacity onPress={()=>this.setState({showAgeAlert:false})} style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:45,}]}>
                            <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                I UNDERSTAND
                            </Text>
                       </TouchableOpacity>
                        

                    </View>
                </View>
            </Modal>
        )
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
                        onSelect={(country) => this.setState({cca2:country.cca2, countryCode:country.callingCode.toString(), iso:country.cca2})} 
                        theme={DARK_THEME}
                       // onClose={()=>this.handleFocus('phoneInput')} 
                >
                </CountryPicker>
          </View>
      )
  }


    async next(){
        if(this.state.showNameView){
            if(this.state.firstName === '' && this.state.lastName === ''){
                this.setState({responseText:'All fields are required', responseAlert:true})
            }else if(this.state.firstName === ''){
                this.setState({responseText:'First name is required', responseAlert:true})
                //alert('First name is required')
            }else if(this.state.lastName === ''){
                this.setState({responseText:'Last name is required', responseAlert:true})
               // alert('Last name is required')
            }else{
                this.setState({showNameView:false, showBirthdayView:true})
            }
        }else if(this.state.showBirthdayView){
            if(this.state.dob === ''){
                this.setState({responseText:'Date of birth is required', responseAlert:true})
               // alert('Date of birth is required')
            }else if(this.state.age<21){
                this.setState({showAgeAlert:true})
            }else if(isNaN(this.state.age)){
                this.setState({responseText:'Please enter valid date', responseAlert:true})
               // alert('Please enter valid date')
            }else{
                this.setState({showBirthdayView:false, showEmailView:true})
            }
        }else if(this.state.showEmailView){
            if(this.state.email === ''){
                this.setState({responseText:'Email is required', responseAlert:true})
              //  alert('Email is required')
            }else if(!EMAIL_EXPRESSION_CHECK.test(this.state.email.trim().toLowerCase())){
                this.setState({responseText:'Please enter a valid email', responseAlert:true})
             //   alert('Please enter a valid email')
            }else{
                this.setState({showEmailView:false, showPhoneView:true})
            }
        }else if(this.state.showPhoneView){
            if(this.state.countryCode === ''){
                this.setState({responseText:'Select country', responseAlert:true})
              //  alert('Select country')
            }else if(this.state.phone === ''){
                this.setState({responseText:'Phone number is required', responseAlert:true})
               // alert('Phone number is required')
            }else{
                //this.setState({showPhoneView:false, showVerificationCodeView:false, showPasswordview:true})
                 this.setState({isLoading:true})
                 this.sendOtp()
            }
        }else if(this.state.showVerificationCodeView){
            this.verifyOtp()
        }else if(this.state.showPasswordview){
            if(this.state.password === ''){
                this.setState({responseText:'Password is required', responseAlert:true})
              //  alert('Password is required')
            }else if(this.state.password.length<6){
                this.setState({responseText:'Password must contain at least 6 characters, including at least one number or special character.', responseAlert:true})
               // alert('Password must contain at least 6 characters, including at least one number or special character.')
            }else if((!SMALL_CHAR_REG_EX.test(this.state.password) && (!CAPITAL_CHAR_REG_EX.test(this.state.password)))){
                this.setState({responseText:'Password must contain at least 6 characters, including at least one number or special character.', responseAlert:true})
               // alert('Password must contain at least 6 characters, including at least one number or special character.')
            }else if((!NUMBER_REG_EX.test(this.state.password)) && (!SPECIAL_CHAR_REG_EX.test(this.state.password))){
                this.setState({responseText:'Password must contain at least 6 characters, including at least one number or special character.', responseAlert:true})
               // alert('Password must contain at least 6 characters, including at least one number or special character.')
            }else if(this.state.password !== this.state.confirmPassword){
                this.setState({responseText:'Passwords do not match', responseAlert:true})
               // alert('Passwords do not match')
            }else{
                this.setState({showPasswordview:false, showInstagramView:true})
            }
        }else if(this.state.showInstagramView){
            this.setState({showInstagramView:false, showRefferalView:true})
        }else{
            this.setState({isLoading:true},()=>
            this.submit())
        }
    }

    async sendOtp(){
        this.setState({isLoading:true})
        const credentials={
            contactNumber:this.state.phone,
            countryCode:this.state.countryCode.toString()
        }
        let res = await sendPostRequest(SEND_OTP, credentials);
       // console.log('sendotp', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({showPhoneView:false, showVerificationCodeView:true, isLoading:false})
        }else if(res.hasOwnProperty('response') && res.response.status.statusCode === 400){
            this.setState({isLoading:false},()=>{
                this.setState({responseText:res.response.status.customMessage, responseAlert:true})
                //alert(res.response.status.customMessage)
            })
        }else{
            this.setState({isLoading:false},()=>{
                this.setState({responseText:'Something went wrong', responseAlert:true})
              //  alert('Something went wrong')
            })
        }
    }

    async verifyOtp(){
        let otp = this.state.otp1+this.state.otp2+this.state.otp3+this.state.otp4
        if(otp.length===4){
            this.setState({isLoading:true})
            const credentials={
                contactNumber:this.state.phone,
                countryCode:this.state.countryCode,
                otp:otp
            }
            let res = await sendPostRequest(VERIFY_OTP, credentials);
            console.log('verifyotp', JSON.stringify(res))
            if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
                this.setState({showVerificationCodeView:false, showPasswordview:true,
                    isPhoneVerified:true,
                    otp1:'', otp2:'', otp3:'', otp4:''},()=>this.setState({isLoading:false})
                    )
            }else{
                this.setState({otp1:'', otp2:'', otp3:'', otp4:''},()=>
                this.setState({isLoading:false},()=>{
                    this.otp1.focus()
                    this.setState({responseText:res.response.status.customMessage, responseAlert:true})
                    //alert(res.response.status.customMessage)
                }))
            }
        }else{
            this.setState({otp1:'', otp2:'', otp3:'', otp4:''},()=>this.setState({isLoading:false},()=>
            {
                this.otp1.focus()
                this.setState({responseText:'Enter otp', responseAlert:true})
                //alert('Enter otp')
             }
            ))
        }
    }

    async submit(){
        let dob = this.formatDate(this.state.dob)
        const credentials={
            contactNumber: this.state.phone,
            password: this.state.password,
            firstName: this.state.firstName,
            countryCode: this.state.countryCode,
            iso: this.state.iso,
            lastName: this.state.lastName,
            email: this.state.email,
            isPhoneVerified: this.state.isPhoneVerified,
            loginType: "STANDARD",
            instagramUserName: this.state.instagramUserName,
            dateOfBirth: dob,
            deviceType: Platform.OS==='android'?'ANDROID':'IOS',
            deviceToken: global.fcmToken,
            referalCode:this.state.referralCode,
            appVersion: DeviceInfo.getVersion().toString()
          }
        let res = await sendPostRequest(USER_SIGNUP, credentials);
        console.log('ressSignup', JSON.stringify(res))
          if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
                AsyncStorage.setItem("@userData", JSON.stringify(res.response), ()=>{
                    global.accessToken = res.response.userData.accessToken
                    global.name = res.response.userData.firstName+' '+res.response.userData.lastName
                    if(res.response.userData.profileImage!='' && res.response.userData.profileImage!==undefined){
                        global.profileImage =IMAGE_BASE_URL+res.response.userData.profileImage
                    }
                   let status = {isLoggedIn:true, isFreeDelivery:res.response.userData.isFreeDelivery}
                    this.props.changeLoginStatus(status)
                        this.setState({isLoading:false},()=>{
                            this.props.navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [
                                        { name: 'Drawer' },
                                    ],
                                })
                            );
                        })
                    });
          }else if(res.hasOwnProperty('response') && res.response.status.statusCode === 400){
            this.setState({isLoading:false},()=>{
                this.setState({responseText:res.response.status.customMessage, responseAlert:true})
               // alert(res.response.status.customMessage)
            })
          }else{
              this.setState({isLoading:false},()=>{
                this.setState({responseText:'Something went wrong', responseAlert:true})
                 // alert('Something went wrong')
                })
          }
        

    }

    // showCalendar(){
    //     var maxDate = new Date()
    //     return (
    //         <DatePicker
    //           mode="date"
    //           placeholder="select date"
    //           format="YYYY-MM-DD"
    //           minDate="1930-05-01"
    //           maxDate={maxDate}
    //           confirmBtnText="Confirm"
    //           cancelBtnText="Cancel"
    //           iconSource={require('../../assets/calendar.png')}
    //             style={{width:20}}
    //             //showIcon={false}
    //             customStyles={{
    //                 dateIcon:{
    //                     height:20,
    //                     width:20,
    //                 },
    //                 dateInput:{
    //                     display:'none',
    //                     borderWidth:0
    //                 },
                
    //             }}
    //           onDateChange={(date) => {
    //               let age = this.calculateAge(date)
    //               let _date = this.formatDate(date)
    //               this.setState({dob:_date, age:age})
    //             }}
    //         />
    //       )
    // }

    formatDate(date) {
        let _date = date.split('/')
        let splittedDate = _date[2]+'-'+_date[0]+'-'+_date[1]
        var v_date = new Date(Date.parse(splittedDate))
        var d = new Date(v_date)
        let month = '' + (d.getMonth() + 1)
        let day = '' + d.getDate()
        let year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    }

    calculateAge(birthday){
        let _date = birthday.split('/')
        let splittedDate = _date[2]+'-'+_date[1]+'-'+_date[0]
        var birthdayDate = new Date(Date.parse(splittedDate))
        var ageDifMs = Date.now() - birthdayDate.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    typeOtp(text, type, mode){
        if(text.length>0){
            switch (type){
                case 'otp1':
                    this.setState({otp1:text},()=>this.otp2.focus())
                break;
                case 'otp2':
                    this.setState({otp2:text},()=>this.otp3.focus())
                break;
                case 'otp3':
                    this.setState({otp3:text},()=>this.otp4.focus())
                break;
                case 'otp4':
                    this.setState({otp4:text})
                break;
                default:
                break;
            }
        }else if(mode === 'backspace'){
            switch (type){
                case 'otp1':
                    this.setState({otp1:text})
                break;
                case 'otp2':
                    this.state.otp2.length===1?
                    this.setState({otp2:text}):
                    this.setState({otp2:text},()=>this.otp1.focus())
                break;
                case 'otp3':
                    this.state.otp3.length===1?
                    this.setState({otp3:text}):
                    this.setState({otp3:text},()=>this.otp2.focus())
                break;
                case 'otp4':
                    this.state.otp4.length===1?
                    this.setState({otp4:text}):
                    this.setState({otp4:text},()=>this.otp3.focus())
                break;
                default:
                break;
            }
        }
    }

    responseAlert(){
        return(
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={this.state.responseAlert}
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
                    backgroundColor:'black', opacity:1, paddingBottom:30}}>
                        
                        <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_BOLD,
                               fontSize:25, textAlign:'center', marginTop:33}}>
                                   {this.state.responseText}
                        </Text>
                        <TouchableOpacity onPress={()=>this.setState({responseAlert:false})} 
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

    backPressed(){
        if(this.state.showNameView){
            this.props.navigation.goBack()
        }else if(this.state.showBirthdayView){
            this.setState({showBirthdayView:false, showNameView:true})
        }else if(this.state.showEmailView){
            this.setState({showEmailView:false, showBirthdayView:true})
        }else if(this.state.showPhoneView){
            this.setState({showPhoneView:false, showEmailView:true})
        }else if(this.state.showVerificationCodeView){
            this.setState({showVerificationCodeView:false, showPhoneView:true})
        }else if(this.state.showPasswordview){
            this.setState({showPasswordview:false, showVerificationCodeView:true})
        }else if(this.state.showInstagramView){
            this.setState({showInstagramView:false, showPasswordview:true})
        }else{
            this.setState({showInstagramView:true, showRefferalView:true})
        }
    }

    makeDobFormats(text){
        let newString = text
        if(newString.length===2 && !this.state.dob.includes('/')){
            newString = newString+'/'
        }if(newString.length===5 && this.state.dob.length<5){
            newString = newString+'/'
        }
        this.setState({dob:newString},()=>{
            if(this.state.dob.length===10){
                let age = this.calculateAge(this.state.dob)
                this.setState({age:age})
            }
        })
    }

    makeDobFormat(text){
        let newString = text
        if(newString.length===2 && !this.state.dob.includes('/')){
            newString = newString+'/'
        }if(newString.length===5 && this.state.dob.length<5){
            newString = newString+'/'
        }
        this.setState({dob:newString},()=>{
            if(this.state.dob.length===10){
                let _date = this.state.dob.split('/')
                let splittedDate = _date[2]+'-'+_date[0]+'-'+_date[1]
                var birthdayDate = new Date(Date.parse(splittedDate))
                var ageDifMs = Date.now() - birthdayDate.getTime();
                var ageDate = new Date(ageDifMs);
                let age = Math.abs(ageDate.getUTCFullYear() - 1970);
                this.setState({age:age})
            }
        })
    }

    render(){
        return(
            <SafeAreaView style={AppStyles.styleSet.screenContainer}>
                <StatusBar barStyle={'light-content'}/>
                <WatermarkView/>
                <KeyboardAvoidingView  
                        style={{
                        flexDirection: 'column', }} 
                        behavior={Platform.OS=='ios'?'position':'height'}
                        enabled
                        keyboardVerticalOffset={Platform.OS=='ios'?20:25}>
                            <ScrollView ref={(el) => {this.scrollview = el}} keyboardShouldPersistTaps={'always'}>
                                <View style={{flex:1, padding:20,}}>
                                    {/* <TouchableOpacity onPress={()=>this.backPressed()}>
                                        <Image 
                                        resizeMode={'contain'}
                                        source={require('../../assets/back-arrow.png')}
                                        style={{height:25, width:25,}}/>
                                    </TouchableOpacity> */}
                                    <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between'}}>
                                        <TouchableOpacity 
                                            style={[AppStyles.styleSet.viewWithYelloBackground,{width:65, borderRadius:15, 
                                                height:'auto', padding:5}]} 
                                            onPress={()=>this.backPressed()}>
                                                <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_MEDIUM}}>
                                                    Back
                                                </Text>
                                        </TouchableOpacity>
                                        {this.state.showRefferalView && <TouchableOpacity 
                                            style={[AppStyles.styleSet.viewWithYelloBackground,{width:65, borderRadius:15, 
                                                height:'auto', padding:5}]} 
                                            onPress={()=>{
                                                this.setState({isLoading:true},()=>
                                                 this.submit())
                                            }}>
                                                <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_MEDIUM}}>
                                                    Skip
                                                </Text>
                                        </TouchableOpacity>}
                                    </View>
                                    <Header image={require('../../assets/signup-shape.png')}/>
                                    {this.state.showNameView && <View>
                                        <Text style={[AppStyles.styleSet.headerText, {marginTop:60}]}>
                                            What Is Your Name?
                                        </Text>
                                        <View style={{marginTop:30, flexDirection:'row', justifyContent:'space-between'}}>
                                            <View style={{flex:.48}}>
                                                <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:35}]}>
                                                    First Name
                                                </Text>
                                                <View style={[AppStyles.styleSet.textInputView, {marginTop:12}]}>
                                                    <TextInput 
                                                        placeholder='First Name'
                                                        value={this.state.firstName}
                                                        onChangeText={(text)=>this.setState({firstName:text})}
                                                        placeholderTextColor={'#878787'}
                                                        style={AppStyles.styleSet.textInputStyle}
                                                    />
                                                </View>   
                                            </View>
                                            <View style={{flex:.48}}>
                                                <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:35}]}>
                                                    Last Name
                                                </Text>
                                                <View style={[AppStyles.styleSet.textInputView, {marginTop:12}]}>
                                                    <TextInput 
                                                        placeholder='Last Name'
                                                        value={this.state.lastName}
                                                        onChangeText={(text)=>this.setState({lastName:text})}
                                                        placeholderTextColor={'#878787'}
                                                        style={AppStyles.styleSet.textInputStyle}
                                                    />
                                                </View>   
                                            </View>
                                        </View>
                                    </View>}
                                    {this.state.showBirthdayView && <View>
                                        <Text style={[AppStyles.styleSet.headerText, {marginTop:60}]}>
                                            Birthday Verification
                                        </Text>
                                        <View style={{marginTop:30,}}>
                                                <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:35}]}>
                                                    Date of Birth
                                                </Text>
                                                <View style={[AppStyles.styleSet.textInputView, {marginTop:12, 
                                                     flexDirection:'row', justifyContent:'space-between', alignItems:"center"}]}>
                                                    <TextInput 
                                                       // editable={false}
                                                        placeholder='mm/dd/yyyy'
                                                        maxLength={10}
                                                        //value={this.state.dob.replace(/-/g,'/')}
                                                        value={this.state.dob}
                                                        onChangeText={(text)=>this.makeDobFormat(text)}
                                                        placeholderTextColor={'#878787'}
                                                        style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                                    />
                                                    {/* {this.showCalendar()} */}
                                                </View>   
                                        </View>
                                        
                                    </View>}
                                    {this.state.showEmailView && <View>
                                        <Text style={[AppStyles.styleSet.headerText, {marginTop:60}]}>
                                        What Is Your Email?
                                        </Text>
                                        <View style={{marginTop:30,}}>
                                                <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:35}]}>
                                                    Enter Email
                                                </Text>
                                                <View style={[AppStyles.styleSet.textInputView, {marginTop:12, 
                                                     }]}>
                                                    <TextInput 
                                                        ref={(rf) => {this.email = rf}}
                                                        placeholder='Enter Email'
                                                        value={this.state.email}
                                                        onChangeText={(text)=>this.setState({email:text})}
                                                        placeholderTextColor={'#878787'}
                                                        style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                                    />
                                                </View>   
                                        </View>
                                    </View>}
                                    {this.state.showPhoneView && <View>
                                        <Text style={[AppStyles.styleSet.headerText, {marginTop:60}]}>
                                        What Is Your Phone Number?
                                        </Text>
                                        <View style={{marginTop:30,}}>
                                                <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:35}]}>
                                                    Enter Number
                                                </Text>
                                                <View style={[AppStyles.styleSet.textInputView, {marginTop:12, 
                                                     flexDirection:'row', alignItems:'center', flex:1
                                                     }]}>
                                                    {this.countryPicker()}
                                                    <TextInput 
                                                        ref={(rf) => {this.phone = rf}}
                                                        placeholder='Enter Number'
                                                        value={this.state.phone}
                                                        onChangeText={(text)=>this.setState({phone:text})}
                                                        placeholderTextColor={'#878787'}
                                                        style={[AppStyles.styleSet.textInputStyle,{flex:1, marginLeft:10}]}
                                                    />
                                                </View>   
                                        </View>
                                       
             
                                    </View>}
                                    {this.state.showVerificationCodeView && <View>
                                        <Text style={[AppStyles.styleSet.headerText, {marginTop:60}]}>
                                            Enter Verification Code
                                        </Text>
                                        <Text style={[AppStyles.styleSet.headerText, {marginTop:30, color:'#878787', 
                                            fontFamily:AppStyles.fontFamily.M_SEMIBOLD, fontSize:20}]}>
                                            Sent to {this.state.countryCode} {this.state.phone}
                                        </Text>
                                        <View style={{marginTop:30, flexDirection:'row', justifyContent:'center'}}>
                                                <View style={{height:50, width:50, borderColor:AppStyles.colorSet.mainThemeForegroundColor,
                                                   borderRadius:25, borderWidth:1, justifyContent:'center', alignItems:'center'}}>
                                                    <TextInput 
                                                        ref={(rf) => {this.otp1 = rf}}
                                                        placeholder=''
                                                        keyboardType={'numeric'}
                                                        maxLength={1}
                                                        textAlign={'center'}
                                                        onKeyPress={({ nativeEvent }) => {
                                                            nativeEvent.key === 'Backspace' ? this.typeOtp('', 'otp1', 'backspace') : ''
                                                          }}
                                                        value={this.state.otp1}
                                                        onChangeText={(text)=>{
                                                            this.typeOtp(text, 'otp1')
                                                        }}                                                           
                                                        placeholderTextColor={'#878787'}
                                                        style={[AppStyles.styleSet.textInputStyle,
                                                            {alignSelf:'center', width:20}]}
                                                    />
                                                </View>  
                                                <View style={{height:50, width:50, borderColor:AppStyles.colorSet.mainThemeForegroundColor,
                                                   borderRadius:25, borderWidth:1, justifyContent:'center', alignItems:'center'
                                                    , marginLeft:10}}>
                                                    <TextInput 
                                                        ref={(rf) => {this.otp2 = rf}}
                                                        placeholder=''
                                                        keyboardType={'numeric'}
                                                        maxLength={1}
                                                        textAlign={'center'}
                                                        value={this.state.otp2}
                                                        onKeyPress={({ nativeEvent }) => {
                                                            nativeEvent.key === 'Backspace' ? this.typeOtp('', 'otp2', 'backspace') : ''
                                                          }}
                                                        onChangeText={(text)=>{
                                                            this.typeOtp(text, 'otp2')
                                                        }}
                                                        placeholderTextColor={'#878787'}
                                                        style={[AppStyles.styleSet.textInputStyle,
                                                            {alignSelf:'center', width:20}]}
                                                    />
                                                </View>   
                                                <View style={{height:50, width:50, borderColor:AppStyles.colorSet.mainThemeForegroundColor,
                                                   borderRadius:25, borderWidth:1, justifyContent:'center', alignItems:'center'
                                                    , marginLeft:10}}>
                                                    <TextInput 
                                                        ref={(rf) => {this.otp3 = rf}}
                                                        placeholder=''
                                                        keyboardType={'numeric'}
                                                        maxLength={1}
                                                        textAlign={'center'}
                                                        value={this.state.otp3}
                                                        onKeyPress={({ nativeEvent }) => {
                                                            nativeEvent.key === 'Backspace' ? this.typeOtp('', 'otp3', 'backspace') : ''
                                                          }}
                                                        onChangeText={(text)=>{
                                                            this.typeOtp(text, 'otp3')
                                                        }}
                                                        placeholderTextColor={'#878787'}
                                                        style={[AppStyles.styleSet.textInputStyle,
                                                            {alignSelf:'center', width:20}]}
                                                    />
                                                </View>   
                                                <View style={{height:50, width:50, borderColor:AppStyles.colorSet.mainThemeForegroundColor,
                                                   borderRadius:25, borderWidth:1, justifyContent:'center', alignItems:'center'
                                                    , marginLeft:10}}>
                                                    <TextInput 
                                                        ref={(rf) => {this.otp4 = rf}}
                                                        placeholder=''
                                                        keyboardType={'numeric'}
                                                        maxLength={1}
                                                        textAlign={'center'}
                                                        value={this.state.otp4}
                                                        onKeyPress={({ nativeEvent }) => {
                                                            nativeEvent.key === 'Backspace' ? this.typeOtp('', 'otp4', 'backspace') : ''
                                                          }}
                                                        onChangeText={(text)=>{
                                                            this.typeOtp(text, 'otp4')
                                                        }}
                                                        placeholderTextColor={'#878787'}
                                                        style={[AppStyles.styleSet.textInputStyle,
                                                            {alignSelf:'center', width:20}]}
                                                    />
                                                </View>   
                                        </View>
                                        <View style={{flexDirection:'row', marginTop:30, justifyContent:'center'}}>
                                            <Text style={[AppStyles.styleSet.headerText, { color:'#878787', 
                                                fontFamily:AppStyles.fontFamily.M_SEMIBOLD, fontSize:20}]}>
                                                Didn't receive code?
                                            </Text>
                                            <TouchableOpacity onPress={()=>this.sendOtp()}>
                                                <Text style={[AppStyles.styleSet.headerText, { color:'#878787', marginLeft:5,
                                                    fontFamily:AppStyles.fontFamily.M_SEMIBOLD, fontSize:20, textDecorationLine:'underline'}]}>
                                                    Click here
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        {/* <Text style={[AppStyles.styleSet.textWithWhiteColor, {marginTop:20, alignSelf:'center'}]}>
                                            Resend Code
                                        </Text> */}
                                    </View>}
                                    {this.state.showPasswordview && <View>
                                        <Text style={[AppStyles.styleSet.headerText, {marginTop:60}]}>
                                            Create Password
                                        </Text>
                                        <View style={{marginTop:30,}}>
                                                <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:35}]}>
                                                    Enter Password
                                                </Text>
                                                <View style={[AppStyles.styleSet.textInputView, {marginTop:12, 
                                                     flexDirection:'row', justifyContent:'space-between', alignItems:"center"}]}>
                                                    <TextInput 
                                                        placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022'}
                                                        secureTextEntry={this.state.passwordSecureTextEntry}
                                                        value={this.state.password}
                                                        onChangeText={(text)=>this.setState({password:text})}
                                                        placeholderTextColor={'white'}
                                                        style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                                    />
                                                    <TouchableOpacity onPress={()=>this.setState({passwordSecureTextEntry:!this.state.passwordSecureTextEntry})}>
                                                        <Image resizeMode={'contain'} source={this.state.passwordSecureTextEntry?
                                                        require('../../assets/eye-off.png'):require('../../assets/eye-on.png')} 
                                                               style={{height:20, width:20}}/>
                                                    </TouchableOpacity>
                                                </View>  
                                                <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:25}]}>
                                                    Confirm Password
                                                </Text>
                                                <View style={[AppStyles.styleSet.textInputView, {marginTop:12, 
                                                     flexDirection:'row', justifyContent:'space-between', alignItems:"center"}]}>
                                                    <TextInput 
                                                        placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022'}
                                                        secureTextEntry={this.state.confirmPasswordSecureTextEntry}
                                                        value={this.state.confirmPassword}
                                                        onChangeText={(text)=>this.setState({confirmPassword:text})}
                                                        placeholderTextColor={'white'}
                                                        style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                                    />
                                                    <TouchableOpacity onPress={()=>this.setState({confirmPasswordSecureTextEntry:
                                                        !this.state.confirmPasswordSecureTextEntry})}>
                                                        <Image resizeMode={'contain'} source={this.state.confirmPasswordSecureTextEntry?
                                                        require('../../assets/eye-off.png'):require('../../assets/eye-on.png')} 
                                                               style={{height:20, width:20}}/>
                                                    </TouchableOpacity>
                                                </View>   
                                        </View>
                                    </View>}
                                    {this.state.showInstagramView && <View>
                                        <Text style={[AppStyles.styleSet.headerText, {marginTop:60}]}>
                                           Instagram Handle
                                        </Text>
                                        <View style={{marginTop:30,}}>
                                                <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:35}]}>
                                                    Instagram Handle(optional)
                                                </Text>
                                                <View style={[AppStyles.styleSet.textInputView, {marginTop:12, 
                                                     }]}>
                                                    <TextInput 
                                                        ref={(rf) => {this.instagram = rf}}
                                                        placeholder='Enter Instagram'
                                                        value={this.state.instagram}
                                                        onChangeText={(text)=>this.setState({instagram:text})}
                                                        placeholderTextColor={'#878787'}
                                                        style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                                    />
                                                </View>   
                                        </View>
                                    </View>}
                                    {this.state.showRefferalView && <View>
                                        <Text style={[AppStyles.styleSet.headerText, {marginTop:60, textAlign:'center'}]}>
                                           Got a friend's refferal code? Enter it here! If you don't, go ahead and skip this.
                                        </Text>
                                        <View style={{marginTop:30,}}>
                                                <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:35}]}>
                                                    Referral Code
                                                </Text>
                                                <View style={[AppStyles.styleSet.textInputView, {marginTop:12, 
                                                     }]}>
                                                    <TextInput 
                                                        ref={(rf) => {this.referralCode = rf}}
                                                        placeholder='Enter Refferal code'
                                                        value={this.state.referralCode}
                                                        onChangeText={(text)=>this.setState({referralCode:text})}
                                                        placeholderTextColor={'#878787'}
                                                        style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                                    />
                                                </View>   
                                        </View>
                                    </View>}
                                    <TouchableOpacity onPress={()=>this.next()} style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:35,}]}>
                                        <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                            {!this.state.showRefferalView?'NEXT':'SUBMIT'}
                                        </Text>
                                    </TouchableOpacity>
                                    
                                </View>
                            </ScrollView>
                </KeyboardAvoidingView>
                {/* <View style={{padding:20, width:'100%',}}>
                    <TouchableOpacity style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:15,}]}>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                            NEXT
                        </Text>
                    </TouchableOpacity>
                </View> */}
                {this.showAgeAlert()}
                <ResponseAlert
                 visible={this.state.responseAlert}
                 responseText={this.state.responseText}
                 onOkayPress={()=>this.setState({responseAlert:false, responseText:''})}
                />
                {this.state.isLoading?<ShowLoader/>:null}
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
const mapStateToProps = (state) => {
    const { data } = state
    return { data }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
    changeLoginStatus
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);