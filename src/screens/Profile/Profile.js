import React,{ Component } from "react";
import {
    SafeAreaView,
    StatusBar,
    View,
    Image,
    ImageBackground,
    Text,
    Modal,
    TouchableOpacity,
    PermissionsAndroid,
    Platform,
    ScrollView
} from 'react-native'
import { sendPostRequestWithAccessToken, sendPostRequestWithAccessTokenAndBody } from "../../Utils/RestApiService";
import { GET_PROFILE, IMAGE_BASE_URL, IMAGE_UPLOAD, LOGOUT, UPDATE_PROFILE_IMAGE } from "../../Utils/UrlClass";
import AppStyles from '../../styles/AppStyles'
import ImagePicker from 'react-native-image-crop-picker';
import { CommonActions } from '@react-navigation/native'
import AsyncStorage from '@react-native-community/async-storage';
import ShowLoader from "../../components/ShowLoader";
import StatusBarHeader from "../../components/StatusBarHeader";
import WatermarkView from "../../components/WatermarkView";
import { connect } from 'react-redux';
import Clipboard from '@react-native-community/clipboard';
import { bindActionCreators } from 'redux';
import { changeLoginStatus, showBackButton} from '../../redux/actions'
import {logEvent} from '../../Utils/AnalyticsUtils'
import ResponseAlert from "../../components/ResponseAlert";

const referralText = 'This is your referral code! If a friend enters this code when creating their profile, both of you will get a Free Delivery credited to your account! Refer as many people as you can, and never pay for delivery.'
const createFormData=(image)=>{
    var data = new FormData();
    data.append('document', {
    uri:  Platform.OS === "android" ? image.path : image.path.replace("file://", ""), 
    name: `big${Date.now()}.jpg`,
    type: 'image/*'
    })
    console.log("createFormData", JSON.stringify(data))
    return data
  }



class Profile extends Component{
    constructor(props){
        super(props)
        this.state={
            data:'',
            profileImage:'',
            isLoading:true,
            showImagePickerModal:false,
            showRefferalAlert:false,
            responseAlert:false,
            responseText:''
        }
        this.props.navigation.addListener(
            'focus',
               payload => {
                 this.getProfile()
                  // console.log('ewdsc')
                  // this.setState({isLoading:true},()=>this.getProfile())
                   //console.log('props',JSON.stringify(this.props.screenProps.navigation.getParam('trackingNumber','')))
                    
                }
          );
    }

    componentDidMount(){
      logEvent('Profile_Page')
        this.getProfile()
    }

  //   async getProfile(){
        
  //     let res = await sendPostRequestWithAccessToken(GET_PROFILE,  global.accessToken);
  //     console.log('res', JSON.stringify(res))
  //     if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
  //         this.setState({data:res.response.userData[0]},()=>{
  //             this.setState({profileImage:this.state.data.profileImage,
  //             },()=>this.setState({isLoading:false},()=>console.log('image', this.state.profileImage)))

  //         }
  //         )
  //     }else{
  //         this.setState({isLoading:false},()=>alert('Something went wrong'))
  //     }
  // }

    showImagePickerModal(){
        return(
      
          <Modal
              animationType={'fade'}
              transparent={true}
              visible={this.state.showImagePickerModal}
              onRequestClose={() => {
                  console.log('Modal has been closed.');
              }}>
          
              <View style={{flex:1, flexDirection:"column", position:'absolute',
              height:'100%', width:'100%', alignItems:'center', justifyContent:'center',
              backgroundColor:"transparent", opacity:1.5}}>
                  <View style={{flex:1,backgroundColor:'#000000',opacity:0.5,
                      height:'100%', width:'100%', justifyContent:'center',
                      position:'absolute', alignSelf:'center'}}>
                  </View>
                  <View style={{ 
                  width:'88%',
                  backgroundColor:'white', opacity:1.5, padding:20}}>
                        <Text style={{fontSize:23, color:'black', fontWeight:'bold'}}>Select a Photo</Text>
                        <TouchableOpacity onPress={()=>this._chooseFile('camera')} style={{marginTop:20}}>
                          <Text style={{fontSize:20, color:'black', }}>Take Photo...</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this._chooseFile('library')} style={{marginTop:20}}>
                          <Text style={{fontSize:20, color:'black', }}>Choose from Library...</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.setState({showImagePickerModal:false})} style={{marginTop:30, alignSelf:'flex-end'}}>
                          <Text style={{fontSize:20, color:'black', }}>CANCEL</Text>
                        </TouchableOpacity>
                  </View>
                     
              </View>
          </Modal>
      )
      }

      async _chooseFile (type) {
        const options = {
          cameraType:'front'
        }
        if (Platform.OS === 'android') {
          PermissionsAndroid.requestMultiple(
            [PermissionsAndroid.PERMISSIONS.CAMERA, 
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]
            ).then((result) => {
              if (result['android.permission.CAMERA']
              && result['android.permission.READ_EXTERNAL_STORAGE']
              && result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted') {
                if(type==='camera'){
                  ImagePicker.openCamera({cropping:true, mediaType:'photo', height:450, width:400})
                  .then(image => {
                    this.setState({ showImagePickerModal:false, isLoading:true},()=>{
                     // console.log('image.path', image.path)
                      this.imageUpload(image)
                    })
                    
                   // console.log('imagePickerImage',image);
                  });
                }else{
                  ImagePicker.openPicker({cropping:true, mediaType:'photo', height:450, width:400
                  }).then(image => {
                    this.setState({ showImagePickerModal:false, isLoading:true},()=>{
                      this.imageUpload(image)
                    })
                  });
                }
                
              } else if (result['android.permission.CAMERA']
              || result['android.permission.READ_EXTERNAL_STORAGE']
              || result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'never_ask_again') {
                this.setState({responseText:"Required permissions denied", responseAlert:true})
              }
            });
        }else{
          if(type==='camera'){
            ImagePicker.openCamera({cropping:true
            }).then(image => {
              this.setState({ showImagePickerModal:false, isLoading:true},()=>{
                this.imageUpload(image)
              })
              
             // console.log('imagePickerImage',image);
            });
          }else{
            ImagePicker.openPicker({
            }).then(image => {
              this.setState({ showImagePickerModal:false, isLoading:true},()=>{
                this.imageUpload(image)
              })
            });
          }
          
        }
    };


  async imageUpload(source) { 
    try {
      let response = await fetch(
        IMAGE_UPLOAD,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Type': 'multipart/form-data',
                'Authorization': global.accessToken
            },
             body: createFormData(source)
        }
      );
      console.log('imageUpload', JSON.stringify(response))
     
      if (response.status == 200) {
            response.json().then(data => {
              console.log('imageUpload', JSON.stringify(data))
              let imageUrl = data.response.userImage
              //alert(imageUrl)
                // this.setState({profileImage:imageUrl}
                //   ,()=>{
                //   this.save()
                // }
                // )
                this.save(imageUrl)
            
         });
      }
    } catch (error) {
      this.setState({isLoading:false})
      console.error(error);
    }
}

    async save(imageUrl){
      this.setState({isLoading:true})
      const credentials={
        profileImage:imageUrl
      }
      let res = await sendPostRequestWithAccessTokenAndBody(UPDATE_PROFILE_IMAGE, credentials, global.accessToken);
      console.log('profileSave', JSON.stringify(res))
      if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
        AsyncStorage.setItem("@userData", JSON.stringify(res.response.userData), async()=>{
          global.profileImage=IMAGE_BASE_URL+res.response.userData[0].profileImage
        //  await AsyncStorage.setItem('accessToken', JSON.stringify(res.response.userData.accessToken))
         // global.newAccessToken = res.response.userData.accessToken
          this.setState({
                  isLoading: false,
                  profileImage:IMAGE_BASE_URL+res.response.userData[0].profileImage
              })
       });
      }else{
          this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
      }
    }

    async getProfile(){
        this.props.showBackButton(true)
        let res = await sendPostRequestWithAccessToken(GET_PROFILE,  global.accessToken);
        console.log('resProfile11', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
          
            this.setState({data:res.response.userData[0]},()=>{
                if(this.state.data.profileImage!==null || this.state.data.profileImage!==''){
                    this.setState({profileImage:IMAGE_BASE_URL+res.response.userData[0].profileImage},()=>
                    this.setState({isLoading:false}))
                }else{
                  this.setState({isLoading:false})
                }
            })
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    header(){
        return(
            <View style={{width:'100%', padding:20, flexDirection:'row', paddingBottom:0}}>
               <TouchableOpacity onPress={()=>this.props.navigation.openDrawer()}>
                        <Image 
                            resizeMode={'contain'}
                            source={require('../../../assets/side-menu.png')} 
                            style={{height:35, width:35,}}
                        />
                </TouchableOpacity>
                <View style={{flex:1, flexDirection:'row', alignItems:'center', justifyContent:'flex-end'}}>
                     <TouchableOpacity onPress={()=>this.props.navigation.navigate('NotificationScreen')}>
                        <Image resizeMode={'center'} source={require('../../../assets/notification.png')} 
                        style={{height:40, width:40}}/>
                     </TouchableOpacity>
                </View>
            </View>
        )
    }

    profileImageView(){
        return(
            <TouchableOpacity activeOpacity={1} onPress={()=>this.setState({showImagePickerModal:true})} style={{alignSelf:'center', marginTop:10
               }}>
                <Image 
                source={this.state.profileImage===''?require('../../../assets/team-placeholder.png'):
                        {uri:this.state.profileImage}} 
                style={{ height:200,  width:200, borderRadius:100}}/>
                <View style={{position:'absolute', bottom:10, right:10, height:40,
                   width:40,  borderRadius:20, justifyContent:'center', alignItems:'center'}}>
                       <Image resizeMode={'contain'} source={require('../../../assets/camera-icon.png')} style={{flex:1,  borderRadius:20}}/>
                </View>
            </TouchableOpacity>
        )
    }

    showRefferalAlert(){
      return(
          <Modal
              animationType={'fade'}
              transparent={true}
              visible={this.state.showRefferalAlert}
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
                      <TouchableOpacity onPress={()=>this.setState({showRefferalAlert:false})}>
                          <Image source={require('../../../assets/close_yellow.png')} 
                          style={{height:25, width:25, alignSelf:'flex-end'}}/>
                      </TouchableOpacity>
                      <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_SEMIBOLD,
                             fontSize:20, textAlign:'center', marginTop:33}}>
                                 {referralText}

                      </Text>
                  </View>
              </View>
          </Modal>
      )
}

  changePasswordView(){
    if(!this.state.isLoading && this.state.data.hasOwnProperty('loginType') && this.state.data.loginType === 'STANDARD'){
      return(
            <TouchableOpacity onPress={()=>this.props.navigation.navigate('ChangePassword')} 
            style={{width:'100%', justifyContent:'space-between', marginTop:30, flexDirection:'row',
                  borderBottomColor:AppStyles.colorSet.mainTextColor, borderBottomWidth:1, paddingBottom:25}}>
                <Text style={AppStyles.styleSet.textWithYellowColor}>
                    Change Password
                </Text>
                <Image resizeMode={'contain'} source={require('../../../assets/right-arrow.png')} style={{height:20, width:20, }}/>
            </TouchableOpacity>
      )
    }
  }


    render(){
        return(
            <SafeAreaView style={AppStyles.styleSet.screenContainer}>
                <StatusBar barStyle={'light-content'}/>
                <WatermarkView/>
                {/* <StatusBarHeader props={this.props}/> */}
                <View style={{height:30,alignItems:'center', paddingHorizontal:20, width:'100%', marg:10}}>
                    <Image 
                    resizeMode={'stretch'}
                    source={require('../../../assets/profile-shape.png')} 
                    style={{flex:1}}/>
                </View>
                <ScrollView>
                  <View style={{flex:1, padding:20}}>
                      {this.profileImageView()}
                      <Text style={[AppStyles.styleSet.textWithWhiteColor,{marginTop:25, alignSelf:'center', fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                          {this.state.data.firstName+' '}{this.state.data.lastName}
                      </Text>
                      <View style={{width:'100%', marginTop:25, 
                          borderBottomColor:AppStyles.colorSet.mainTextColor, borderBottomWidth:1, paddingBottom:25}}>
                          <View style={{width:'100%', justifyContent:'space-between', flexDirection:'row'}}>
                            <Text style={AppStyles.styleSet.textWithYellowColor}>
                                Your Referral Code
                            </Text>
                            {/* <Image resizeMode={'contain'} source={require('../../../assets/right-arrow.png')} style={{height:20, width:20}}/>
                          */}
                          </View>
                          <View style={{width:'100%', justifyContent:'space-between', flexDirection:'row', marginTop:15}}>
                            <Text style={AppStyles.styleSet.textWithWhiteColor}>
                                {this.state.data.referalCode}
                            </Text>
                            <TouchableOpacity onPress={()=>Clipboard.setString(this.state.data.referalCode)}>
                              <Image resizeMode={'contain'} source={require('../../../assets/copy.png')} style={{height:20, width:20}}/>
                            </TouchableOpacity>
                          </View>
                      </View>
                      <TouchableOpacity onPress={()=>this.props.navigation.navigate('ProfileEdit')} style={{width:'100%', justifyContent:'space-between', marginTop:25, flexDirection:'row',
                          borderBottomColor:AppStyles.colorSet.mainTextColor, borderBottomWidth:1, paddingBottom:25}}>
                          <Text style={AppStyles.styleSet.textWithYellowColor}>
                              Personal Information
                          </Text>
                          <Image resizeMode={'contain'} source={require('../../../assets/right-arrow.png')} style={{height:20, width:20, }}/>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>this.props.navigation.navigate('SavedAddress')} style={{width:'100%', justifyContent:'space-between', marginTop:25, flexDirection:'row',
                          borderBottomColor:AppStyles.colorSet.mainTextColor, borderBottomWidth:1, paddingBottom:25}}>
                          <Text style={AppStyles.styleSet.textWithYellowColor}>
                              Saved Address
                          </Text>
                          <Image resizeMode={'contain'} source={require('../../../assets/right-arrow.png')} style={{height:20, width:20, }}/>
                      </TouchableOpacity>
                      {/* <TouchableOpacity onPress={()=>this.props.navigation.navigate('Payment',{payment:'payment'})} style={{width:'100%', justifyContent:'space-between', marginTop:25, flexDirection:'row',
                          borderBottomColor:AppStyles.colorSet.mainTextColor, borderBottomWidth:1, paddingBottom:25}}>
                          <Text style={AppStyles.styleSet.textWithYellowColor}>
                              Payment
                          </Text>
                          <Image resizeMode={'contain'} source={require('../../../assets/right-arrow.png')} style={{height:20, width:20, }}/>
                      </TouchableOpacity> */}
                      <TouchableOpacity onPress={()=>this.props.navigation.navigate('MyOrder')} style={{width:'100%', justifyContent:'space-between', marginTop:30, flexDirection:'row',
                          borderBottomColor:AppStyles.colorSet.mainTextColor, borderBottomWidth:1, paddingBottom:25}}>
                          <Text style={AppStyles.styleSet.textWithYellowColor}>
                              My Orders
                          </Text>
                          <Image resizeMode={'contain'} source={require('../../../assets/right-arrow.png')} style={{height:20, width:20, }}/>
                      </TouchableOpacity>
                      {this.changePasswordView()}
                      <TouchableOpacity onPress={ async()=>{
                      let res = await sendPostRequestWithAccessToken(LOGOUT,  global.accessToken);
                      console.log('resLogout', JSON.stringify(res))
                          if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
                              AsyncStorage.setItem("@userData", '',()=>{
                                 global.accessToken = ''
                                 let status = {isLoggedIn:false, isFreeDelivery:false}
                                 this.props.changeLoginStatus(status)
                                      this.props.navigation.dispatch(
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
                                 let status = {isLoggedIn:false, isFreeDelivery:false}
                                 this.props.changeLoginStatus(status)
                                      this.props.navigation.dispatch(
                                          CommonActions.reset({
                                              index: 0,
                                              routes: [
                                                  { name: 'Login' },
                                              ],
                                          })
                                      );
                              });
                          }
                          
                      }} style={{width:'100%', justifyContent:'space-between', marginTop:25, flexDirection:'row',
                          borderBottomColor:AppStyles.colorSet.mainTextColor, borderBottomWidth:1, paddingBottom:25}}>
                          <Text style={AppStyles.styleSet.textWithYellowColor}>
                              Logout
                          </Text>
                      </TouchableOpacity>
                  </View>
                </ScrollView>
                {this.showImagePickerModal()}
                {this.showRefferalAlert()}
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
const mapStateToProps = (state) => {
  const { data } = state
  return { data }
};
const mapDispatchToProps = dispatch => (
  bindActionCreators({
  changeLoginStatus,
  showBackButton
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Profile);