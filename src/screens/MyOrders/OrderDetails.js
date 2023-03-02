import React,{ Component } from "react";
import {
    SafeAreaView,
    View,
    StatusBar,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    FlatList,
    Modal,
    TextInput,
    Linking
} from 'react-native'
import { Rating } from 'react-native-ratings';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import AppStyles from '../../styles/AppStyles'
import AsyncStorage from '@react-native-community/async-storage';
import { CommonActions } from '@react-navigation/native'
import ShowLoader from "../../components/ShowLoader";
import {ADD_RATING, GET_SINGLE_ORDER_DETAIL, IMAGE_BASE_URL } from "../../Utils/UrlClass";
import { sendPostRequestWithAccessTokenAndBody } from "../../Utils/RestApiService";
import WatermarkView from "../../components/WatermarkView";
import BackButton from "../../components/BackButton";
import { dateDiff } from "../../components/HelperFunctions";
import {showBackButton} from '../../redux/actions'
import ResponseAlert from "../../components/ResponseAlert";


const sendExtraText = "Want me to send your driver something' extra? Feel free to Cashapp or Venmo them"
const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
const rateData = ['Fast delivery', 'Friendly', 'Went above and beyond']

class OrderDetails extends Component{
    constructor(props){
        super(props)
        this.state={
            data:'',
            isLoading:true,
            storeProfileImage:'',
            userLocation:'',
            userFirstName:'',
            userImage:'',
            driverReview:'',
            orderId:this.props.route.params.orderId,
            billingAddress:'',
            driverName:'',
            rateTheDriverModal:false,
            review:'',
            suggestion:'',
            rating:0,
            ratinglikeOption:[],
            responseText:'',
            responseAlert:false

        }
        this.props.navigation.addListener(
            'focus',
               payload => {
                this.getProduct()
                    
                }
          );
    }

    componentDidMount(){
        //console.log('orderId', this.state.orderId)
        this.getProduct()
    }

    async getProduct(){
        this.props.showBackButton(true)
        const credentials={
            id:this.props.route.params.orderId
        }
        let res = await sendPostRequestWithAccessTokenAndBody(GET_SINGLE_ORDER_DETAIL, credentials, global.accessToken);
        console.log('reszz', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({data:res.response.userData[0], 
                storeProfileImage:IMAGE_BASE_URL+res.response.userData[0].storeId.profileImage,
                billingAddress:res.response.userData[0].userBillingAddressId.address,
            },()=>{
                if(this.state.data.hasOwnProperty('deliveryTeamId')){
                    this.setState({driverName:this.state.data.deliveryTeamId.firstName})
                }
                this.setState({isLoading:false})
            })
            
            //this.setState({data: res. isLoading:false})
        }else if (res.statusCode == 401) {
            this.setState({ isLoading: false }, () => {
                AsyncStorage.setItem("user_data", '', () => {
                    global.newAccessToken = ''
                    this.props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                { name: 'Login' },
                            ],
                        })
                    );
                });
            })
        }
        else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    header(){
        return(
            <View style={{width:'100%', paddingBottom:10, marginTop:10}}>
                <BackButton props={this.props}/>
                <Image 
                    resizeMode={'stretch'}
                    source={require('../../../assets/order-details-shape.png')} 
                    style={{ width:'100%', marginTop:15}}/>
            </View>
        )
    }

  
    addressView(){
        return(
            <View style={{marginTop:10}}>
                <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:14, }]}>
                     {this.state.data===''?'':this.state.data.storeId.title}
                </Text>
                <View style={{flexDirection:'row', marginTop:10,}}>
                    <Image 
                    resizeMode={'contain'}
                    source={require('../../../assets/pin.png')} 
                    style={{height:18, width:16}}/>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor, styles.fieldValueStyle,
                         {marginLeft:5}]}>
                        {this.state.data===''?'':this.state.data.storeId.address}
                    </Text>
                </View>
                
                {/* <View style={{flexDirection:'row', marginTop:20, 
                 justifyContent:'space-between', alignItems:'center',}}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:14, }]}>
                        Order Status:
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithYellowColor,{
                    fontSize:14, textTransform:'capitalize'}]}>
                        {this.state.data===''?'':this.state.data.orderStatus}
                    </Text> 
                </View> */}
            </View>
        )
    }

  

    numberOfItemsView(item, index){
        return(
            <View style={{marginTop:15, borderBottomColor:AppStyles.colorSet.mainTextColor, 
                borderBottomWidth:1, paddingBottom:15,}}>
                <View style={{ flexDirection:'row'}}>
                    <View style={{flexDirection:'row',flex:1, paddingRight:10}}>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldValueStyle]}>
                            1.{' '}
                        </Text>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldValueStyle,{flex:1}]}>
                            {item.productName}
                        </Text>
                        <Image source={{uri:IMAGE_BASE_URL+item.productImage}} style={{height:40,width:40,marginLeft:20}} />
                    </View>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldValueStyle]}>
                        $ {item.productPrice}
                    </Text>
                </View>
                <View style={{marginTop:10, flexDirection:'row'}}>
                   <Text style={{fontSize:12, color:'grey', fontFamily:AppStyles.fontFamily.M_SEMIBOLD}}>
                       {item.quantity} * { }
                   </Text>
                   <Text style={{fontSize:12, color:'grey', fontFamily:AppStyles.fontFamily.M_SEMIBOLD}}>
                      {item.allSizes.attributeValue}
                   </Text>
                </View>
            </View>
        )
    }

    itemTotal(){
        
        return(
            <View style={{marginTop:35, borderBottomColor:AppStyles.colorSet.mainTextColor, 
                borderBottomWidth:1, paddingBottom:25}}>
                <View style={{flexDirection:'row', marginTop:0, 
                 justifyContent:'space-between', alignItems:'center',}}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldNameStyle]}>
                        Items Total:
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldValueStyle]}>
                        $ {this.state.data.subTotalAmount}
                    </Text>
                </View>
                <View style={{flexDirection:'row', marginTop:15, 
                 justifyContent:'space-between', alignItems:'center',}}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldNameStyle ]}>
                        Delivery Fee:
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldValueStyle]}>
                        $ {this.state.data.deliveryFee}
                    </Text>
                </View>
                <View style={{flexDirection:'row', marginTop:15, 
                 justifyContent:'space-between', alignItems:'center',}}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldNameStyle]}>
                        Taxes:
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldValueStyle]}>
                        $ {this.state.data.taxAmount}
                    </Text>
                </View>
                <View style={{flexDirection:'row', marginTop:15, 
                 justifyContent:'space-between', alignItems:'center',}}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldNameStyle]}>
                        Driver Tip Amount:
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldValueStyle]}>
                        ${this.state.data.driverTipAmount}
                    </Text>
                </View>
                <View style={{flexDirection:'row', marginTop:15, 
                 justifyContent:'space-between', alignItems:'center',}}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldNameStyle]}>
                        Total:
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldValueStyle]}>
                        ${this.state.data.netAmount}
                    </Text>
                </View>

            </View>
        )
    }

    orderDetails(){
        let date = new Date(this.state.data.createdAt)
        let time = ''
        let minutes = ''
        let hours = ''
        let timeUnit = 'AM'
        if(date.toString().length===1){
            date = '0'+date
        }
        minutes = date.getMinutes()
        if(minutes.toString().length===1){
            minutes = '0'+minutes
        }
        hours = date.getHours()
        if(hours.toString().length===1){
            hours = '0'+hours
        }
        if(hours>11){
            hours =  hours - 12
            timeUnit = 'PM'
        }
        time = hours+':'+minutes+' '+timeUnit
        return(
            <View style={{marginTop:25, paddingBottom:25}}>
                <View style={{flexDirection:'row', 
                  justifyContent:'space-between', alignItems:'center',}}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:13, }]}>
                        Order Details
                    </Text>
                    {/* <Image resizeMode={'contain'} source={require('../../../Assets/Images/dropdown.png')} style={{height:16, width:16}}/> */}
                </View>
                <View style={{flexDirection:'row', marginTop:15, 
                 justifyContent:'space-between', alignItems:'center',}}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:13, }]}>
                        Order Number:
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldValueStyle]}>
                        {this.state.data.serialNumberOrder}
                    </Text>
                </View>
                <View style={{flexDirection:'row', marginTop:15, 
                 justifyContent:'space-between', alignItems:'flex-start',}}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:13, marginRight:15}]}>
                        Delivery Address:
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldValueStyle,
                        {flex:1}]}>
                        {this.state.billingAddress}
                    </Text>
                </View>
                <View style={{flexDirection:'row', marginTop:15, 
                 justifyContent:'space-between', alignItems:'center',}}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:13, }]}>
                        Driver Name:
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldValueStyle]}>
                        {this.state.driverName}
                    </Text>
                </View>
                <View style={{marginTop:15, }}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:13, }]}>
                        Delivery Instructions:
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldValueStyle,{marginTop:15}]}>
                        {this.state.data.hasOwnProperty('driverInstructions')?this.state.data.driverInstructions:''}
                    </Text>
                </View>
                <View style={{marginTop:25, }}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:13, }]}>
                        ORDERED ON:
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,styles.fieldValueStyle,{marginTop:15}]}>
                        {month[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear()+' at '+time}
                    </Text>
                </View>
                <View style={{marginTop:40, }}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:13, }]}>
                        {sendExtraText}
                    </Text>
                    <View style={{flexDirection:'row', marginTop:15}}>
                        <TouchableOpacity onPress={()=>Linking.openURL('https://cash.app/$'+this.state.data.deliveryTeamId.cashAppLink)}>
                            <Image source={require('../../../assets/cash-app.png')} 
                            style={{height:40, width:120,borderRadius:5}}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>Linking.openURL('https://venmo.com/'+this.state.data.deliveryTeamId.venmoLink+'?txn=pay&amount=5')}>
                            <Image 
                            source={require('../../../assets/Venmo-safe.png')} 
                            style={{height:40, width:120, borderRadius:5, marginLeft:10}}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }


    ratingCompleted = (rating) => {
        //console.log("Rating is: " + rating)
        this.setState({rating:rating})
    }

    async addRating(){
        this.setState({isLoading:true})
        const credentials={
            driverReview:this.state.review,
            orderId:this.state.orderId,
            orderSuggestion:this.state.suggestion,
            ratingStar:this.state.rating.toString(),
            ratinglikeOption:this.state.ratinglikeOption.toString()

        }
        let res = await sendPostRequestWithAccessTokenAndBody(ADD_RATING, credentials, global.accessToken);
       // console.log('reszz', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({rateTheDriverModal:false, },()=>this.getProduct())
         }
        else{
            this.setState({isLoading:false, rateTheDriverModal:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    rateTheDriver(){
        return(
            <Modal
                animationType={'slide'}
                transparent={true}
                visible={this.state.rateTheDriverModal}
                onRequestClose={() => {
                    console.log('Modal has been closed.');
                }}> 
                        <View style={{ flex:1, flexDirection:"column", position:'absolute',
                        height:'100%', width:'100%', alignItems:'center',
                        backgroundColor:"transparent", opacity:1.5, justifyContent:'center'}}>
                            <View style={{flex:1,backgroundColor:'#000000',opacity:0.7,
                                height:'100%', width:'100%', justifyContent:'center',
                                position:'absolute', alignSelf:'center'}}>
                            </View>
                            <View style={{ width:'95%', alignSelf:'center',
                            borderRadius:10, zIndex:999, padding:10, marginTop:-100,
                            borderWidth:1, borderColor:AppStyles.colorSet.mainTextColor,
                            backgroundColor:'black', opacity:1, paddingBottom:20, minHeight:500}}>
                                <View style={{flex:1}}>
                                    <TouchableOpacity onPress={()=>this.setState({rateTheDriverModal:false})}>
                                        <Image resizeMode={'contain'} source={require('../../../assets/close.png')} 
                                                style={{height:25, width:25, alignSelf:'flex-end'}}/>
                                    </TouchableOpacity>
                                    <Text style={[AppStyles.styleSet.textWithYellowColor,
                                      {fontSize:18, alignSelf:'center', fontFamily:AppStyles.fontFamily.M_SEMIBOLD}]}>
                                      Rate your Driver
                                    </Text>
                                    <View style={{marginTop:40, alignItems:'flex-start'}}>
                                        <Rating
                                            ratingCount={5}
                                            type={'star'}
                                            startingValue={this.state.rating}
                                            fractions={1}
                                            jumpValue={0.5}
                                            //showRating
                                            imageSize={20}
                                            tintColor={'black'}
                                            selectedColor={AppStyles.colorSet.mainTextColor}
                                            onFinishRating={this.ratingCompleted}
                                            />
                                    </View>
                                    <Text style={[AppStyles.styleSet.textWithYellowColor,
                                      {fontSize:15, marginTop:20, fontFamily:AppStyles.fontFamily.M_SEMIBOLD}]}>
                                      What did you like?
                                    </Text>
                                    <View>
                                        <FlatList
                                            data={rateData}
                                            horizontal
                                            showsVerticalScrollIndicator={false}
                                            style={{marginTop:15, }}
                                            renderItem={({ item, index }) => (
                                            this.rateItemView(item, index)
                                            )}
                                            keyExtractor={item => item}
                                        /> 
                                    </View>
                                    <Text style={[AppStyles.styleSet.textWithYellowColor,
                                      {fontSize:15, marginTop:20, fontFamily:AppStyles.fontFamily.M_SEMIBOLD}]}>
                                      Add a review for your driver
                                    </Text>
                                    <View activeOpacity={1} 
                                    style={{borderWidth:1, borderColor:AppStyles.colorSet.mainTextColor, width:'100%', padding:10,
                                    borderRadius:25, alignItems:'center', flexDirection:'row', marginTop:15}}>
                                        <TextInput 
                                            ref={(rf) => {this.phone = rf}}
                                            placeholder='Type your review here'
                                            onChangeText={(text)=>this.setState({review:text})}
                                            placeholderTextColor={'white'}
                                            value={this.state.review}
                                            style={[AppStyles.styleSet.textInputStyle, {marginHorizontal:15, 
                                                flex:1, fontSize:12, padding:0, height:20}]}
                                        /> 
                                    </View>
                                    <Text style={[AppStyles.styleSet.textWithYellowColor,
                                      {fontSize:15, marginTop:20, fontFamily:AppStyles.fontFamily.M_SEMIBOLD}]}>
                                      Do you have any suggestions for us?
                                    </Text>
                                    <View activeOpacity={1} 
                                    style={{borderWidth:1, borderColor:AppStyles.colorSet.mainTextColor, width:'100%', padding:10,
                                    borderRadius:25, alignItems:'center', flexDirection:'row', marginTop:15}}>
                                        <TextInput 
                                            ref={(rf) => {this.suggestion = rf}}
                                            placeholder='Type your feedback here'
                                            onChangeText={(text)=>this.setState({suggestion:text})}
                                            placeholderTextColor={'white'}
                                            value={this.state.suggestion}
                                            style={[AppStyles.styleSet.textInputStyle, {marginHorizontal:15, 
                                                flex:1, fontSize:12, padding:0, height:20}]}
                                        /> 
                                    </View>
                                    <TouchableOpacity onPress={()=>this.addRating()} style={[AppStyles.styleSet.viewWithYelloBackground, 
                                        {marginTop:25,}]}>
                                        <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                            SUBMIT
                                        </Text>
                                    </TouchableOpacity>
                                    
                                </View>
                            </View>
                        </View>
                 </Modal>
        )
      }

      addRateLikeOption(item, index){
          let data = this.state.ratinglikeOption
          if(data.includes(item)){
              let itemIndex = data.indexOf(item)
              data.splice(itemIndex, 1)
          }else{
              data.push(item)
          }
          this.setState({ratinglikeOption:data})
      }

      rateItemView(item, index){
          return(
              <TouchableOpacity onPress={()=>this.addRateLikeOption(item, index)} style={{borderColor:AppStyles.colorSet.mainTextColor, justifyContent:'center', 
                 backgroundColor:this.state.ratinglikeOption.includes(item)?AppStyles.colorSet.mainTextColor:'black',
                  borderRadius:15, borderWidth:1, padding:6, marginLeft:index!==0?10:0, height:30, alignItems:'center'}}>
                  <Text style={{color:'white', fontSize:12, fontFamily:AppStyles.styleSet.M_REGULAR}}>
                      {item}
                  </Text>
              </TouchableOpacity>
          )
      }


    render(){
    let showTrackButton = true
    if(this.state.data.orderStatus === 'PENDING'){
        showTrackButton = false
    }if(this.state.data.orderStatus === 'DELIVERED'){
        showTrackButton = false
    }
        return(
            <SafeAreaView style={AppStyles.styleSet.screenContainer}>
                <StatusBar barStyle={'light-content'}/>
                <WatermarkView/>
                <ScrollView>
                    <View style={{padding:20, paddingTop:0}}>
                        {this.header()}
                        <View style={{width:'100%', flexDirection:'row', justifyContent:'space-between', marginTop:15, alignItems:'center'}}>
                            <Image resizeMode={'contain'} source={{uri:this.state.storeProfileImage}} style={{height:100, width:100,
                                borderRadius:10, }}/> 
                            {showTrackButton && <TouchableOpacity 
                            onPress={()=>this.props.navigation.navigate('OrderTracking',{data:this.state.data})} style={[AppStyles.styleSet.viewWithYelloBackground,{width:160, height:45}]}>
                                <Text style={[AppStyles.styleSet.textWithWhiteColor, 
                                    {fontSize:12, fontFamily:AppStyles.fontFamily.M_REGULAR}]}>
                                    TRACK YOUR ORDER 
                                </Text>
                            </TouchableOpacity>}
                            {this.state.data.orderStatus==='DELIVERED' && <TouchableOpacity onPress={()=>this.setState({rateTheDriverModal:true})} 
                              style={[AppStyles.styleSet.viewWithYelloBackground, 
                            {marginTop:5, width:130, height:35}]}>
                            <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_SEMIBOLD, fontSize:12}]}>
                                {this.state.data.isRated?'Already Rated!':'Rate Your Driver'}
                            </Text>
                        </TouchableOpacity>}    
                        </View>   
                        {/* </View>  */}
                        
                        {this.addressView()}
                        
                        <Text style={[AppStyles.styleSet.textWithWhiteColor,
                            {fontSize:14, marginTop:25}]}>
                            Items
                        </Text>
                        <FlatList
                            data={this.state.data.products}
                            showsVerticalScrollIndicator={false}
                            style={{flex:1, marginTop:15, }}
                            renderItem={({ item, index }) => (
                            this.numberOfItemsView(item, index)
                            )}
                            keyExtractor={item => item}
                        /> 
                        {this.itemTotal()}
                        {this.orderDetails()}
                        
                        {this.rateTheDriver()}
                        
                       
                    </View>
                </ScrollView>
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
    fieldNameStyle:{
        fontSize:13
    },
    fieldValueStyle:{
        fontSize:12
    }
})

const mapStateToProps = (state) => {
    const { data } = state
    return { data }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
    showBackButton
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(OrderDetails);