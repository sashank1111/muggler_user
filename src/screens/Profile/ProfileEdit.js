import React,{ Component } from "react";
import {
    SafeAreaView,
    StatusBar,
    View,
    Image,
    ImageBackground,
    TextInput,
    Text,
    KeyboardAvoidingView,
    ScrollView,
    TouchableOpacity
} from 'react-native'
import { sendPostRequest, sendPostRequestWithAccessToken, sendPostRequestWithAccessTokenAndBody } from "../../Utils/RestApiService";
import AppStyles from '../../styles/AppStyles'
import { GET_PROFILE, UPDATE_PROFILE } from "../../Utils/UrlClass";
import AsyncStorage from '@react-native-community/async-storage';
import ShowLoader from "../../components/ShowLoader";
import DatePicker from 'react-native-datepicker'
import StatusBarHeader from "../../components/StatusBarHeader";
import WatermarkView from "../../components/WatermarkView";
import { connect } from 'react-redux';
import BackButton from "../../components/BackButton";
import ResponseAlert from "../../components/ResponseAlert";
class ProfileEdit extends Component{
    constructor(props){
        super(props)
        this.state={
            firstName:'',
            lastName:'',
            email:'',
            contactNumber:'',
            countryCode:'91',
            isLoading:true,
            data:'',
            dob:'',
            instagram:'',
            password:'',
            responseAlert:false,
            responseText:''

        }
    }

    componentDidMount(){
        this.getProfile()
    }

    async getProfile(){
        
        let res = await sendPostRequestWithAccessToken(GET_PROFILE,  global.accessToken);
        console.log('resProfileEdit', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            let _dob = ''
            this.setState({data:res.response.userData[0]},()=>{
                if(this.state.data.hasOwnProperty('dateOfBirth')){
                        let v_date = new Date(Date.parse(this.state.data.dateOfBirth))
                        var d = new Date(v_date)
                        let month = '' + (d.getMonth() + 1)
                        let day = '' + d.getDate()
                        let year = d.getFullYear();
                    
                        if (month.length < 2) 
                            month = '0' + month;
                        if (day.length < 2) 
                            day = '0' + day;
                    
                        _dob = [month, day, year].join('/');
                }
                this.setState({firstName:this.state.data.firstName,
                lastName:this.state.data.lastName, email:this.state.data.email,
                password:this.state.data.password,
                dob:_dob,
                contactNumber:this.state.data.contactNumber,
                countryCode:this.state.data.countryCode},()=>this.setState({isLoading:false}))

            }
            )
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    header(){
        return(
            <View style={{width:'100%', padding:20, flexDirection:'row', paddingBottom:0}}>
                <TouchableOpacity onPress={()=>this.props.navigation.openDrawer()} style={{flex:1, flexDirection:'row', alignItems:'center'}}>
                    <Image 
                        source={require('../../../assets/side-menu.png')} 
                        resizeMode={'contain'}
                        style={{height:35, width:35, }}
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

    async save(){
        this.setState({isLoading:true})
        let dob = this.formatDate(this.state.dob)
        // if(isNaN(dob)){
        //     alert('Please enter valid date')
        //     return
        // }
        const credentials={
            firstName:this.state.firstName,
            lastName:this.state.lastName,
            email:this.state.email,
            //countryCode:this.state.countryCode,
            //contactNumber:this.state.contactNumber,
            password:this.state.password,
            dateOfBirth: dob
        }
        let res = await sendPostRequestWithAccessTokenAndBody(UPDATE_PROFILE, credentials, global.accessToken);
        console.log('profileEdit', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            AsyncStorage.setItem("@userData", JSON.stringify(res.response.userData), async()=>{
                global.name=this.state.firstName+' '+this.state.lastName
                //  await AsyncStorage.setItem('accessToken', JSON.stringify(res.response.userData.accessToken))
                 // global.newAccessToken = res.response.userData.accessToken
                  this.setState({
                          isLoading: false
                      },()=>this.props.navigation.goBack())
               });
        }else if(res.hasOwnProperty('statusCode') && res.statusCode === 400 && res.message === 'dateOfBirth must be a number of milliseconds or valid date string'){
            this.setState({responseText:'Please enter valid dob', responseAlert:true, isLoading:false})
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    showCalendar(){
        var maxDate = new Date()
        return (
            <DatePicker
              mode="date"
              placeholder="select date"
              format="YYYY-MM-DD"
              minDate="1930-05-01"
              maxDate={maxDate}
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              iconSource={require('../../../assets/calendar.png')}
                style={{width:20}}
                //showIcon={false}
                customStyles={{
                    dateIcon:{
                        height:20,
                        width:20,
                    },
                    dateInput:{
                        display:'none',
                        borderWidth:0
                    },
                
                }}
              onDateChange={(date) => {
                  let _date = this.formatDate(date)
                  this.setState({dob:_date})
                }}
            />
          )
    }


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

    makeDobFormats(text){
        let newString = text
        if(newString.length===2 && !this.state.dob.includes('/')){
            newString = newString+'/'
        }if(newString.length===5 && this.state.dob.length<5){
            newString = newString+'/'
        }
        this.setState({dob:newString})
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
                {/* <StatusBarHeader props={this.props}/> */}
                <KeyboardAvoidingView  
                        style={{
                        flexDirection: 'column', flex:1}} 
                        behavior={Platform.OS=='ios'?'position':'height'}
                        enabled
                        keyboardVerticalOffset={Platform.OS=='ios'?20:30}>
                    <ScrollView keyboardShouldPersistTaps={'always'} style={{ marginBottom:15}}>
                        <View style={{width:'100%',  paddingHorizontal:20, paddingTop:10,
                            }}>
                            <BackButton props={this.props}/>
                            <Image 
                                resizeMode={'stretch'}
                                source={require('../../../assets/profile-info.png')} 
                                style={{ width:'100%', marginTop:15}}/>
                        </View>
                        <View style={{flex:1, padding:20,}}>
                        <View style={{marginTop:15, flexDirection:'row', justifyContent:'space-between'}}>
                                <View style={{flex:.48}}>
                                    <Text style={[AppStyles.styleSet.textWithYellowColor,{}]}>
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
                                    <Text style={[AppStyles.styleSet.textWithYellowColor,{}]}>
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
                            <View>
                                <View style={{marginTop:30,}}>
                                    <Text style={[AppStyles.styleSet.textWithYellowColor,{ }]}>
                                        Date of Birth
                                    </Text>
                                    <View style={[AppStyles.styleSet.textInputView, {marginTop:12, 
                                            flexDirection:'row', justifyContent:'space-between', alignItems:"center"}]}>
                                        <TextInput 
                                            //editable={false}
                                            placeholder='Date of Birth'
                                            value={this.state.dob}
                                            onChangeText={(text)=>this.makeDobFormat(text)}
                                            placeholderTextColor={'#878787'}
                                            style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                        />
                                        {/* {this.showCalendar()} */}
                                    </View>   
                                </View>
                            </View>
                            <View style={{marginTop:30,}}>
                                    <Text style={[AppStyles.styleSet.textWithYellowColor]}>
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
                            <View style={{marginTop:30,}}>
                                    <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                                        Enter Number
                                    </Text>
                                    <View style={[AppStyles.styleSet.textInputView, {marginTop:12, 
                                            }]}>
                                        <TextInput 
                                            ref={(rf) => {this.contactNumber = rf}}
                                            placeholder='Enter number'
                                            editable={false}
                                            value={this.state.contactNumber}
                                            onChangeText={(text)=>this.setState({contactNumber:text})}
                                            placeholderTextColor={'#878787'}
                                            style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                        />
                                    </View>   
                            </View>
                            <View style={{marginTop:30,}}>
                                    <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                                        Instagram Handle(optional)
                                    </Text>
                                    <View style={[AppStyles.styleSet.textInputView, {marginTop:12, 
                                            }]}>
                                        <TextInput 
                                            ref={(rf) => {this.instagram = rf}}
                                            placeholder=''
                                            value={this.state.instagram}
                                            onChangeText={(text)=>this.setState({instagram:text})}
                                            placeholderTextColor={'#878787'}
                                            style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                        />
                                    </View>   
                            </View>
                        </View>
                        <View style={{marginHorizontal:20, marginTop:30}}>
                            <TouchableOpacity onPress={()=>this.save()} style={[AppStyles.styleSet.viewWithYelloBackground, {}]}>
                                <Text style={AppStyles.styleSet.textWithWhiteColor}>
                                    SAVE
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
}const mapStateToProps = (state) => {
    const { data } = state
    return { data }
  };
  
  export default connect(mapStateToProps)(ProfileEdit);