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
    StyleSheet,
    Modal,
    Animated,
    Linking,
    FlatList,
} from "react-native"
import Header from '../components/Header'
import ShowLoader from "../components/ShowLoader";
import AppStyles from '../styles/AppStyles'
import { APPLE_LOGIN, FB_LOGIN, GOOGLE_LOGIN, IMAGE_BASE_URL, SEARCH_ALL, SEND_OTP, USER_LOGIN, VERIFY_OTP } from "../Utils/UrlClass";
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeDeliveryAddress, changeLoginStatus, setLocation,changeSelectedTab, showBackButton} from '../redux/actions'
import { logEvent } from "../Utils/AnalyticsUtils";
import DeviceInfo from 'react-native-device-info';
//import { StackActions, NavigationActions } from 'react-navigation';
import {
    GoogleSignin,
    statusCodes
  } from '@react-native-community/google-signin';
  import {
    AccessToken,
    GraphRequest,
    GraphRequestManager,
    LoginManager,
    } from 'react-native-fbsdk';
import { WEB_CLIENT_ID } from '../Utils/Keys';
import { SignInWithAppleButton } from 'react-native-apple-authentication'
import { sendPostRequest, sendPostRequestWithAccessTokenAndBody } from "../Utils/RestApiService";
import { CommonActions } from '@react-navigation/native'
import CountryPicker , { DARK_THEME }  from 'react-native-country-picker-modal';
import WatermarkView from "../components/WatermarkView";
import { appleAuth } from '@invertase/react-native-apple-authentication';
import ResponseAlert from "../components/ResponseAlert";

//import SplashScreen from "react-native-splash-screen";
// const loginAction = StackActions.reset({
//     index: 0,
//     actions: [NavigationActions.navigate({ routeName: 'Home' }),
//         ],
//   });



class Login extends Component{
    constructor(props){
        super(props)
        this.state={
            phone:'',
            password:'',
            isLoading:false,
            userInfo:'',
            countryCode:'1',
            cca2:'US',
            showProductSearcView:false,
            searchAllList:[],
            responseText:'',
            responseAlert:false,
            showLoginView:true,
            showPhoneView:false,
            showVerificationCodeView:false,
            iso:'US',
            otp1:'',
            otp2:'',
            otp3:'',
            otp4:'',
            socialData:'',
            isPhoneVerified:false
        }
        this.props.navigation.addListener(
            'focus',
               payload => {
                   this.props.showBackButton(false)
                   this.props.changeSelectedTab('Login')
                }
          );

        
    }

   async componentDidMount(){
        await AsyncStorage.setItem("@userData", '',()=>{
            global.accessToken = ''
            this.props.changeLoginStatus(false)
            this.props.changeSelectedTab('Login')
                
        });
        logEvent('Login_Page')
        //SplashScreen.hide()
        this.configureGoogleSign()

    }
    
    async facebookLogin() {
        LoginManager.logOut();
        try {
          const result = await LoginManager.logInWithPermissions([
            "public_profile",
            "email",
          ]);

          if (result.isCancelled) {
            throw new Error("User cancelled request");
          }
    
          console.log(
            `Login success with permissions: ${result.grantedPermissions.toString()}`
          );
    
          const data = await AccessToken.getCurrentAccessToken();
    
          if (!data) {
            throw new Error(
              "Something went wrong obtaining the users access token"
            );
          }

          this.getInformationFromAccessToken(data.accessToken)
    
        } catch (e) {
          console.error('fberror',e);
        }
      }

      getInformationFromAccessToken(accessToken){
        const parameters = {
            fields: {
            string: 'id, first_name, last_name, email',
            },
            };

        const myProfileRequest = new GraphRequest(
            '/me',
                {accessToken, parameters: parameters},
                    (error, myProfileInfoResult) => {
                        if (error) {
                            console.log('login info has error: ' + error);
                        } else {
                           // console.log('login info : ', JSON.stringify(myProfileInfoResult));
                            this.loginThroughFB(myProfileInfoResult)
                            
                        }
                },
        );    

    new GraphRequestManager().addRequest(myProfileRequest).start();   

    }

    configureGoogleSign() {
        GoogleSignin.configure({
          webClientId: WEB_CLIENT_ID,
          offlineAccess: false
        });
    }

    googleSignIn = async () => {
        try {
          await GoogleSignin.hasPlayServices();
          const userInfo = await GoogleSignin.signIn();
          this.setState({ userInfo }, async()=>
          { console.log('userInfo', JSON.stringify(userInfo))
              this.loginThroughGoogle(userInfo.user)
            
            }
          );
        } catch (error) {
            console.log('erre', error)
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow
          } else if (error.code === statusCodes.IN_PROGRESS) {
            // operation (e.g. sign in) is in progress already
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // play services not available or outdated
          } else {
            // some other error happened
          }
         
        }
    };
    async loginThroughFB(user){
        this.setState({isLoading:true})
        const credentials={
            firstName: user.first_name,
            email: user.email,
            fbId: user.id,
            loginType: "FACEBOOK",
            deviceType: Platform.OS==='android'?'ANDROID':'IOS',
            deviceToken: global.fcmToken,
            appVersion: DeviceInfo.getVersion().toString()
          }
          //console.log('fbCred', JSON.stringify(credentials))
         let res = await sendPostRequest(FB_LOGIN, credentials);
         console.log('ressFB', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            if(!res.response.userData.isPhoneVerified){
                this.setState({socialData:res.response, isLoading:false},()=>this.setState({showLoginView:false, showPhoneView:true}))
            }else{
                AsyncStorage.setItem("@userData", JSON.stringify(res.response),()=>{
                    global.accessToken = res.response.userData.accessToken
                    global.name = res.response.userData.firstName+' '+res.response.userData.lastName
                    global.profileImage =IMAGE_BASE_URL+res.response.userData.profileImage
                    if(res.response.savedAddressData.length>0 && this.props.data.cart.length===0){
                        let coord = {latitude: res.response.savedAddressData[0].location.coordinates[0],
                            longitude: res.response.savedAddressData[0].location.coordinates[1], 
                            address: res.response.savedAddressData[0].address}
                        this.props.setLocation(coord)
                    }
                    let status = {isLoggedIn:true, isFreeDelivery:res.response.userData.isFreeDelivery}
                    this.props.changeLoginStatus(status)
                    this.setState({isLoading:false},()=>
                    {
                        this.props.navigation.navigate(this.props.data.navigateToCart)
                        // this.props.navigation.dispatch(
                        //     CommonActions.reset({
                        //         index: 0,
                        //         routes: [
                        //             { name: 'Drawer' },
                        //         ],
                        //     })
                        // );
                    })
                });
            }
        }else if(res.statusCode === 400){
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    async loginThroughApple(user){
        this.setState({isLoading:true})
        const credentials={
            firstName: user.hasOwnProperty('fullName') && user.fullName.givenName!==null?user.fullName.givenName+' '+user.fullName.familyName:'',
            email: user.email!==null?user.email:'',
            appleId: user.user,
            loginType: "APPLE",
            deviceType: Platform.OS==='android'?'ANDROID':'IOS',
            deviceToken: global.fcmToken,
            appVersion: DeviceInfo.getVersion().toString()
          }
          //console.log('fbCred', JSON.stringify(credentials))
         let res = await sendPostRequest(APPLE_LOGIN, credentials);
         console.log('ressApple', JSON.stringify(res.response))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            if(!res.response.userData.isPhoneVerified){
                this.setState({socialData:res.response, isLoading:false},()=>this.setState({showLoginView:false, showPhoneView:true}))
            }else{
                AsyncStorage.setItem("@userData", JSON.stringify(res.response),()=>{
                    global.accessToken = res.response.userData.accessToken
                    global.name = res.response.userData.firstName+' '+res.response.userData.lastName
                    global.profileImage =IMAGE_BASE_URL+res.response.userData.profileImage
                    if(res.response.savedAddressData.length>0 && this.props.data.cart.length===0){
                        let coord = {latitude: res.response.savedAddressData[0].location.coordinates[0],
                            longitude: res.response.savedAddressData[0].location.coordinates[1], 
                            address: res.response.savedAddressData[0].address}
                        this.props.setLocation(coord)
                    }
                    let status = {isLoggedIn:true, isFreeDelivery:res.response.userData.isFreeDelivery}
                    this.props.changeLoginStatus(status)
                    this.setState({isLoading:false},()=>
                    {
                        this.props.navigation.navigate(this.props.data.navigateToCart)
                        // this.props.navigation.dispatch(
                        //     CommonActions.reset({
                        //         index: 0,
                        //         routes: [
                        //             { name: 'Drawer' },
                        //         ],
                        //     })
                        // );
                    })
                });
            }
        }else if(res.statusCode === 400){
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    async loginThroughGoogle(user){
        await GoogleSignin.signOut();
        this.setState({isLoading:true})
        const credentials={
            firstName: user.givenName,
            lastName:user.familyName,
            email: user.email,
            googleId: user.id,
            loginType: "GOOGLE",
            deviceType: Platform.OS==='android'?'ANDROID':'IOS',
            deviceToken: global.fcmToken,
            appVersion: DeviceInfo.getVersion().toString()
          }
         let res = await sendPostRequest(GOOGLE_LOGIN, credentials);
         console.log('ressGoogle', JSON.stringify(res.response))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            if(!res.response.userData.isPhoneVerified){
                this.setState({socialData:res.response, isLoading:false},()=>this.setState({showLoginView:false, showPhoneView:true}))
            }else{
                AsyncStorage.setItem("@userData", JSON.stringify(res.response),()=>{
                    global.accessToken = res.response.userData.accessToken
                    global.name = res.response.userData.firstName+' '+res.response.userData.lastName
                    global.profileImage =IMAGE_BASE_URL+res.response.userData.profileImage
                    if(res.response.savedAddressData.length>0 && this.props.data.cart.length===0){
                        let coord = {latitude: res.response.savedAddressData[0].location.coordinates[0],
                            longitude: res.response.savedAddressData[0].location.coordinates[1], 
                            address: res.response.savedAddressData[0].address}
                        this.props.setLocation(coord)
                    }
                    let status = {isLoggedIn:true, isFreeDelivery:res.response.userData.isFreeDelivery}
                    this.props.changeLoginStatus(status)
                    this.props.changeSelectedTab('Home')
                    this.setState({isLoading:false},()=>
                    {
                        this.props.navigation.navigate(this.props.data.navigateToCart)
                        // this.props.navigation.dispatch(
                        //     CommonActions.reset({
                        //         index: 0,
                        //         routes: [
                        //             { name: 'Drawer' },
                        //         ],
                        //     })
                        // );
                    })
                });
            }
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }



    async signOut() {
        try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        setIsLoggedIn(false);
        } catch (error) {
        Alert.alert('Something else went wrong... ', error.toString());
        }
    }

    submit(){
        if(this.state.password === '' && this.state.phone === ''){
           // alert('All fields are required')
            this.setState({responseText:'All fields are required', responseAlert:true})
        }else if(this.state.password === ''){
            //alert('Password is required')
            this.setState({responseText:'Password is required', responseAlert:true})
        }else if(this.state.phone === ''){
           // alert('Phone number is required')
            this.setState({responseText:'Phone number is required', responseAlert:true})
        }else{
            this.login()
        }

    }

    async login(){
        this.setState({isLoading:true})
        const credentials={
            contactNumber:this.state.phone,
            deviceToken:global.fcmToken,
            deviceType:Platform.OS==='android'?'ANDROID':"IOS",
            password:this.state.password,
            countryCode:this.state.countryCode.toString(),
            appVersion: DeviceInfo.getVersion().toString()
        }
       console.log('loginCred', JSON.stringify(credentials))
        let res = await sendPostRequest(USER_LOGIN, credentials);
        console.log('login', JSON.stringify(res.response.userData.isFreeDelivery))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            AsyncStorage.setItem("@userData", JSON.stringify(res.response),()=>{
                global.accessToken = res.response.userData.accessToken
                global.name = res.response.userData.firstName+' '+res.response.userData.lastName
                if(res.response.userData.profileImage!='' && res.response.userData.profileImage!==undefined){
                    global.profileImage =IMAGE_BASE_URL+res.response.userData.profileImage
                }
                if(res.response.savedAddressData.length>0 && this.props.data.cart.length===0){
                    let coord = {latitude: res.response.savedAddressData[0].location.coordinates[0],
                        longitude: res.response.savedAddressData[0].location.coordinates[1], 
                        address: res.response.savedAddressData[0].address}
                    this.props.setLocation(coord)
                }
                let status = {isLoggedIn:true, isFreeDelivery:res.response.userData.isFreeDelivery}
                this.props.changeLoginStatus(status)
                this.setState({isLoading:false},()=>
                {
                    this.props.navigation.navigate(this.props.data.navigateToCart)
                    // this.props.navigation.dispatch(
                    //     CommonActions.reset({
                    //         index: 0,
                    //         routes: [
                    //             { name: 'Drawer' },
                    //         ],
                    //     })
                    // );
                })
            });
        }else if(res.hasOwnProperty('response') && res.response.status.statusCode === 400){
            this.setState({isLoading:false},()=>{
               // alert(res.response.status.customMessage)
                this.setState({responseText:res.response.status.customMessage, responseAlert:true})
            })
        }else{
            this.setState({isLoading:false},()=>{
                this.setState({responseText:res.message, responseAlert:true})
               // alert(res.message)
            })
        }
    }


    appleSignIn = async (result) => {
        console.log('apple', JSON.stringify(result))

    }

    async verifyOtp(){
        let otp = this.state.otp1+this.state.otp2+this.state.otp3+this.state.otp4
        if(otp.length===4){
            this.setState({isLoading:true})
            const credentials={
                contactNumber:this.state.phone,
                countryCode:this.state.countryCode.toString(),
                otp:otp,
                userId:this.state.socialData.userData._id
            }
            let res = await sendPostRequest(VERIFY_OTP, credentials);
            console.log('verifyotp', JSON.stringify(res))
            if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
                AsyncStorage.setItem("@userData", JSON.stringify(this.state.socialData),()=>{
                    global.accessToken = this.state.socialData.userData.accessToken
                    global.name = this.state.socialData.userData.firstName+' '+this.state.socialData.userData.lastName
                    global.profileImage = IMAGE_BASE_URL+this.state.socialData.userData.profileImage
                    if(this.state.socialData.savedAddressData.length>0){
                        let coord = {latitude: this.state.socialData.savedAddressData[0].location.coordinates[0],
                            longitude: this.state.socialData.savedAddressData[0].location.coordinates[1], 
                            address: this.state.socialData.savedAddressData[0].address}
                        this.props.setLocation(coord)
                    }
                    let status = {isLoggedIn:true, isFreeDelivery:this.state.socialData.userData.isFreeDelivery}
                    this.props.changeLoginStatus(status)
                    this.setState({showVerificationCodeView:false, showPasswordview:true,
                        isPhoneVerified:true, showPhoneView:false, showLoginView:true,
                        socialData:'',
                        otp1:'', otp2:'', otp3:'', otp4:'', isLoading:false},()=>
                    {
                        this.props.navigation.navigate(this.props.data.navigateToCart)
                        // this.props.navigation.dispatch(
                        //     CommonActions.reset({
                        //         index: 0,
                        //         routes: [
                        //             { name: 'Drawer' },
                        //         ],
                        //     })
                        // );
                    })
                });
            }else if(res.hasOwnProperty('response')){
                this.setState({otp1:'', otp2:'', otp3:'', otp4:''},()=>
                this.setState({isLoading:false},()=>{
                    this.otp1.focus()
                    this.setState({responseText:res.response.status.customMessage, responseAlert:true})
                    //alert(res.response.status.customMessage)
                }))
            }else{
                alert('Something went wrong')
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

  searchAllListView(){
    if(this.state.searchAllList.length>0){
        return(
            <FlatList
                data={this.state.searchAllList}
                style={{height:240, width:'100%', backgroundColor:'white', 
                borderBottomLeftRadius:5, borderBottomRightRadius:5, marginTop:2}}
                renderItem={({ item, index }) => (
                this.searchAllListItemView(item, index)
                )}
                keyExtractor={item => item._id}
            />
        )
    }
}

showProductSearchView(){
    this.setState({showProductSearcView:true})
}

hideProductSearchView = () => {
    this.setState({showProductSearcView:false, searchAllList:[]})
  }

async searchAll(text){

    if(text.length===0){
        this.setState({searchAllList:''})
    }
     const credentials = {
         searchText:text
     }
     let res = await sendPostRequestWithAccessTokenAndBody(SEARCH_ALL, credentials, global.accessToken);
     console.log('resProfile11', JSON.stringify(res))
     if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
         this.setState({searchAllList:res.response.userData})
     }else{
        // this.setState({isLoading:false},()=>alert('Something went wrong'))
     }
 }

 componentWillMount () {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
}

componentWillUnmount(){
    this.keyboardDidShowListener.remove();
}

_keyboardDidShow=(e)=>{
    if(Platform.OS==='android' && !this.state.showLoginView){
        this.scrollview.scrollToEnd()
    }
}


navigateToProductCategory(item, type){
    this.props.navigation.navigate('ProductCategory',{item:item, type:type})
}

searchAllListItemView(item, index){
    return(
        <TouchableOpacity onPress={()=>{
            this.hideProductSearchView()
            item.type==='Category'?this.navigateToProductCategory(item, item.title):''
        }} 
          style={{ backgroundColor:'white', padding:16, borderBottomWidth:0.5, borderBottomColor:'grey', 
           flexDirection:'row',}}>
            <Image source={{uri:IMAGE_BASE_URL+item.image}} style={{height:30, width:30,}}/>
            <Text style={{color:'black', fontSize:15, marginLeft:15}}>
                {item.title}
            </Text>
        </TouchableOpacity>
    )
}  

async sendOtp(){
    this.setState({isLoading:true})
    const credentials={
        contactNumber:this.state.phone,
        countryCode:this.state.countryCode.toString()
    }
    let res = await sendPostRequest(SEND_OTP, credentials);
    console.log('sendotp', JSON.stringify(res))
    if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
        this.setState({showPhoneView:false, showVerificationCodeView:true, isLoading:false})
    }else if(res.hasOwnProperty('response') && res.response.status.statusCode === 400){
        this.setState({isLoading:false},()=>alert(res.response.status.customMessage))
    }else{
        this.setState({isLoading:false},()=>alert('Something went wrong'))
    }
}

async onAppleButtonPress(){
    const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
    
      // get current authentication state for user
      // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
      const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
    
      // use credentialState response to ensure the user is authenticated
      if (credentialState === appleAuth.State.AUTHORIZED) {
          console.log('credentialState', JSON.stringify(credentialState))
          console.log('appleResponse', JSON.stringify(appleAuthRequestResponse))
          this.loginThroughApple(appleAuthRequestResponse)
        // user is authenticated
      }
    
}

async next(){
    if(this.state.showPhoneView){
         if(this.state.countryCode === ''){
             alert('Select country')
         }else if(this.state.phone === ''){
             alert('Phone number is required')
         }else{
             //this.setState({showPhoneView:false, showVerificationCodeView:false, showPasswordview:true})
              this.setState({isLoading:true})
              this.sendOtp()
         }
     }else if(this.state.showVerificationCodeView){
         this.verifyOtp()
     }
 }

    render(){
        return(
            <SafeAreaView style={AppStyles.styleSet.screenContainer}>
                {/* <StatusBar barStyle={'light-content'}/> */}
                <WatermarkView/>
                <KeyboardAvoidingView  
                        style={{flex:1,
                        flexDirection: 'column',}} 
                        behavior={Platform.OS=='ios'?'position':'height'}
                        enabled
                        keyboardVerticalOffset={Platform.OS=='ios'?20:30}>
                             <ScrollView ref={(el) => {this.scrollview = el}}  showsVerticalScrollIndicator={false}>
                               {this.state.showPhoneView && <TouchableOpacity 
                                        style={[AppStyles.styleSet.viewWithYelloBackground,{width:65, borderRadius:15, 
                                            height:'auto', padding:5, marginLeft:16}]} 
                                        onPress={()=>this.setState({showPhoneView:false, showLoginView:true})}>
                                            <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_MEDIUM}}>
                                                Back
                                            </Text>
                                </TouchableOpacity>}
                                <View style={{paddingTop:20}}>
                                    <Header image={require('../../assets/login-shape.png')}/>
                                </View>
                                
                                {this.state.showLoginView && <View>
                                  <View style={{flex:1, padding:20,}}>
                                    
                                    {/* <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:35}]}>
                                        Phone
                                    </Text> */}
                                    <View style={[AppStyles.styleSet.textInputView, {marginTop:35,
                                    flexDirection:'row', alignItems:'center',flex:1
                                    }]}>
                                        {this.countryPicker()}
                                        <TextInput 
                                            ref={(rf) => {this.phone = rf}}
                                            placeholder='Phone'
                                            value={this.state.phone}
                                            onChangeText={(text)=>this.setState({phone:text})}
                                            placeholderTextColor={'#878787'}
                                            style={[AppStyles.styleSet.textInputStyle,{flex:1, marginLeft:5}]}
                                        />
                                    </View>
                                    {/* <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:20}]}>
                                        Password
                                    </Text> */}
                                    <View style={[AppStyles.styleSet.textInputView, {marginTop:25}]}>
                                        <TextInput 
                                            ref={(rf) => {this.password = rf}}
                                            secureTextEntry
                                            value={this.state.password}
                                            placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022'}
                                            onChangeText={(text)=>this.setState({password:text})}
                                            placeholderTextColor={'#878787'}
                                            style={AppStyles.styleSet.textInputStyle}
                                        />
                                    </View>
                                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('ForgotPassword')}>
                                        <Text style={[AppStyles.styleSet.textWithWhiteColor,{ marginTop:20, 
                                            textDecorationLine:'underline', alignSelf:'flex-end'}]}>
                                            Forgot your Password?
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={()=>this.submit()} style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:25,}]}>
                                        <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                            LOGIN
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                
                                <View style={{flex:1, paddingHorizontal:20, alignItems:'center'}}>
                                    <View style={{height:50, alignSelf:'center', alignItems:'center',}}>
                                        <Image 
                                        resizeMode={'contain'}
                                        source={require('../../assets/or-shape.png')} 
                                        style={{flex:1}}/>
                                    </View>
                                    <View style={{flexDirection:'row', marginTop:15}}>
                                        <TouchableOpacity onPress={()=>this.facebookLogin()}>
                                            <Image source={require('../../assets/fb.png')} style={{height:40, width:40}}/>
                                        </TouchableOpacity>
                                        {Platform.OS==='ios' && <TouchableOpacity onPress={()=>this.onAppleButtonPress()}>
                                            <Image source={require('../../assets/apple.png')} style={{height:40, width:40, marginLeft:20}}/>
                                        </TouchableOpacity>}
                                        <TouchableOpacity onPress={()=>this.googleSignIn()}>
                                            <Image source={require('../../assets/google.png')} style={{height:40, width:40, marginLeft:20}}/>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{marginTop:25, flexDirection:'row'}}>
                                            <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:16}}>
                                                Don't have an account?
                                            </Text>
                                            <Text onPress={()=>this.props.navigation.navigate('Signup')} style={{color:AppStyles.colorSet.mainTextColor, fontFamily:AppStyles.fontFamily.M_BOLD,
                                                fontSize:16, marginLeft:10, textDecorationLine:'underline'}}>
                                                Sign Up
                                            </Text>
                                    </View>
                                    <View style={{marginTop:25, flexDirection:'row', flex:1}}>
                                            <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:16, flex:1, textAlign:'center'}}>
                                                By signing up you agree to our{' '}
                                                <Text onPress={()=>Linking.openURL('https://mysmugglers.com/terms-of-service')} style={{color:AppStyles.colorSet.mainTextColor, 
                                                fontFamily:AppStyles.fontFamily.M_BOLD,
                                                    fontSize:16, marginLeft:10, textDecorationLine:'underline'}}>
                                                    Terms of Service
                                                </Text>
                                                <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:14}}>
                                                    {'  '}and{'  '}
                                                </Text>
                                                <Text onPress={()=>Linking.openURL('https://mysmugglers.com/privacy-policy')} style={{color:AppStyles.colorSet.mainTextColor, fontFamily:AppStyles.fontFamily.M_BOLD,
                                                    fontSize:16, marginLeft:10, textDecorationLine:'underline'}}>
                                                    Privacy Policy
                                                </Text>
                                            </Text>
                                            
                                    </View>
                                    {/* <View style={{marginTop:5, flexDirection:'row', paddingLeft:30}}>
                                            <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:14}}>
                                                and
                                            </Text>
                                            <Text style={{color:AppStyles.colorSet.mainTextColor, fontFamily:AppStyles.fontFamily.M_BOLD,
                                                fontSize:16, marginLeft:10, textDecorationLine:'underline'}}>
                                                Privacy Policy
                                            </Text>
                                    </View> */}

                                </View>
                              </View>}
                              {this.state.showPhoneView && <View style={{padding:20}}>
                                  
                                        <Text style={[AppStyles.styleSet.headerText, {marginTop:30}]}>
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
                                    {!this.state.showLoginView && <View style={{marginTop:35, paddingHorizontal:20}}>
                                        <TouchableOpacity onPress={()=>this.next()} 
                                        style={[AppStyles.styleSet.viewWithYelloBackground, {}]}>
                                            <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                                {'NEXT'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>}
                            </ScrollView>
              
              
              
                </KeyboardAvoidingView>
                
                {/* {this.showProductSearcView()} */}
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
    changeDeliveryAddress,
    changeLoginStatus,
    setLocation,
    changeSelectedTab,
    showBackButton
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Login);