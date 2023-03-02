import React, { Component } from "react";
import {
    View,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Image,
    Text,
    Alert,
    ScrollView,
    TextInput,
    FlatList,
    Modal,
    TouchableOpacityBase
} from 'react-native'
import { App } from "react-native-firebase";
import StatusBarHeader from "../components/StatusBarHeader";
import AppStyles from '../styles/AppStyles'
import DatePicker from 'react-native-datepicker'
import { CHECK_ASAP_AND_TIME, CHECK_SIZE_BEFORE_ORDER_PLACE, GET_DELIVER_FEE, GET_SAVED_ADDRESS_LIST, PLACE_ORDER } from "../Utils/UrlClass";
import { sendPostRequestWithAccessToken, sendPostRequestWithAccessTokenAndBody } from "../Utils/RestApiService";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addToCart, removeFromCart, deleteFromCart, deleteAll, showLoginFirstAlert, navigateToCart} from '../redux/actions'
import ShowLoader from "../components/ShowLoader";
import BackButton from "../components/BackButton";
import { last } from "lodash";
import {logEvent} from '../Utils/AnalyticsUtils'
import ResponseAlert from "../components/ResponseAlert";
//Stripe Key- pk_test_YnwYfVcts8x8yRpTH8oCjFF000i9zR5HU4

//sk_test_eu8x26DOGqElA6qBt4HgWS5d0050XakmYw
const testStripeKey = 'pk_test_YnwYfVcts8x8yRpTH8oCjFF000i9zR5HU4'



const driverData = ['10', '15', '20', '25', 'CUSTOM AMOUNT']
const data = ['10%', '15%', '20%', '25%', 'CUSTOM AMOUNT']

class Checkout extends Component{
    constructor(props){
        super(props)
        this.state={
            selectedDeliverDate:'',
            selectedDeliverEndDate:'',
            instructions:'',
            showCustomAmountView:false,
            customAmount:0,
            isCardChecked:false,
            isdeliveryTimeAsapChecked:true,
            isLoading:true,
            data:'',
            showDropdownTimeView:false,
            timeData:[],
            selectedTime:'',
            driverTip:0,
            taxes:'',
            deliveryFee:'',
            discount:this.props.route.params.discount,
            totalAmount:'',
            addressData:'',
            addressList:[],
            driverTipPercentage:0,
            stripeToken:'',
            demoAddress:'',
            showAddressDropdownView:false,
            selectedAddress:this.props.data.address,
            selectedAddressLat:this.props.data.latitude,
            selectedAddressLong:this.props.data.longitude,
            selectedDeliverDateToShow:'',
            orderPlacedAlert:false,
            showSelectAddressAlert:false,
            driverTipItem:'',
            showAsap: true,
            responseText:'',
            responseAlert:false,
            storeName:'',
            taxRate:'',
            taxesToSend:'',
            stateToCheckAddress:this.props.data.address,
            cardData:[]

        }
        this.props.navigation.addListener(
            'focus',
               payload => {
                   this.props.navigateToCart('Home')
                   if(payload !== undefined && this.props.route.params.addressData !== undefined){
                    //console.log('payload', JSON.stringify(this.props.route.params.addressData))
                       this.setState({selectedAddress:this.props.route.params.addressData.address,
                     selectedAddressLat:this.props.route.params.addressData.location.coordinates[0],
                     selectedAddressLong:this.props.route.params.addressData.location.coordinates[1]},()=>this.getDetails())

                   }
               }
          );
    }

    async componentDidMount(){
        logEvent('Checkout_Page')
        this.getDetails()
        
        
    }

    componentDidUpdate(){
           if(this.props.data.address !=='' && (this.props.data.address !== this.state.stateToCheckAddress)){
               this.setState({stateToCheckAddress:this.props.data.address},async()=>{
                   this.props.navigation.navigate('Cart')
               })
           }
       }

    async getDetails(){
        await this.getDeliveryAddressList()
        await this.getDeliveryFee()
        await this.getAsapDate()
        
    }



    async getDeliveryAddressList(){
        let credentials = {
            storeId:this.props.data.cart[0].storeId._id
        }
       
        let res = await sendPostRequestWithAccessTokenAndBody(GET_SAVED_ADDRESS_LIST, credentials,  global.accessToken);
        console.log('GET_SAVED_ADDRESS_LIST', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({addressList:res.response.addresData, cardData:res.response.paymentMethods.data})
           
        }else{
           // this.setState({isLoading:false},()=>alert('Something went wrong'))
        }
    }
    async getDeliveryFee(){
        const credentials = {
            storeId:this.props.route.params.storeId
        }
        let res = await sendPostRequestWithAccessTokenAndBody(GET_DELIVER_FEE, credentials,  global.accessToken);
       // console.log('GET_SAVED_ADDRESS_LIST', JSON.stringify(res.response.userData[0].title))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){

            // let current_date = new Date()
            // let current_time = current_date.getHours()
            // let current_time_plus_one = current_date.setHours(current_date.getHours()+1)
            // let current_whole_time = ''
            // if(current_time > 12){
            //     current_time = current_time - 12+':00 PM'
            //     current_time_plus_one = current_date.getHours() - 12+':00 PM'
            //     current_whole_time = current_time+'-'+current_time_plus_one
            // }
            // console.log('current_time', current_time+' '+current_time_plus_one)
            // console.log('current_whole_time', current_whole_time)








            //console.log('timeDataCheckout', JSON.stringify(res.response.userData[0].timeSlots))
            this.setState({data:res.response.userData[0].timeSlots,storeName:res.response.userData[0].title,
                deliveryFee:this.props.data.isFreeDelivery?0:res.response.userData[0].adminArea.fees,
                 taxRate:res.response.userData[0].taxRate},()=>this.calculateTaxes())
           
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong.', responseAlert:true}))
        }
    }

    async getAsapDate(){
        let _date = new Date()
        this.setState({selectedDeliverDate:_date},()=>{
            _date.setHours(_date.getHours()+1)
            this.setState({selectedDeliverEndDate:_date, selectedTime:''},()=>{
                this.getDatesfromServer()
            
            })
        })
        
    }

    async getDatesfromServer(){
        let credentials = {
            storeId:this.props.data.cart[0].storeId._id,
            date:this.state.selectedDeliverDate,
            isAsap:this.state.isdeliveryTimeAsapChecked
        }
       
        let res = await sendPostRequestWithAccessTokenAndBody(CHECK_ASAP_AND_TIME, credentials,  global.accessToken);
       // console.log('GET_DATES', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({timeData:res.response.timSlots, showAsap:res.response.needToShowASAP},()=>this.setState({isLoading:false}))
           // this.setState({addressList:res.response.addresData})
           
        }else{
            this.setState({isLoading:false})
        }
    }

    headerImage(){
        return(
            <View style={{width:'100%',  paddingTop:10, paddingHorizontal:20,
                }}>
                <BackButton props={this.props}/>
                <Image 
                    resizeMode={'stretch'}
                    source={require('../../assets/checkout-shape.png')} 
                    style={{ width:'100%', marginTop:15}}/>
                
            </View>
        )
    }

    deliveryTimeView(){
        return(
            <View style={{marginTop:5}}>
                <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:16}]}>
                    Delivery Time
                </Text>
                <View style={{marginTop:15, flexDirection:'row'}}>
                    {this.state.showAsap && <TouchableOpacity onPress={()=>this.setState({ isdeliveryTimeAsapChecked:!this.state.isdeliveryTimeAsapChecked},()=>this.getAsapDate())} style={{flexDirection:'row', alignItems:'center'}}>
                        <Image source={!this.state.isdeliveryTimeAsapChecked?require('../../assets/uncheck.png'):
                          require('../../assets/check.png')} style={{height:16, width:16,}}/>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:14, 
                            marginLeft:14,}]}>
                            ASAP
                        </Text>
                    </TouchableOpacity>}
                    <TouchableOpacity onPress={()=>this.setState({selectedDeliverDate:'',selectedDeliverDateToShow:'', selectedDeliverEndDate:'', isdeliveryTimeAsapChecked:!this.state.isdeliveryTimeAsapChecked})} 
                    style={{flexDirection:'row', alignItems:'center', marginLeft:this.state.showAsap?40:0}}>
                        <Image source={this.state.isdeliveryTimeAsapChecked?require('../../assets/uncheck.png'):
                          require('../../assets/check.png')}  style={{height:16, width:16, }}/>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:14, 
                            marginLeft:14,}]}>
                            Schedule Your Order
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    calendarView(){
        if(!this.state.isdeliveryTimeAsapChecked){
            return(
                <View>
                    <View style={{width:'100%', flexDirection:'row',
                    justifyContent:'space-between', marginTop:20, alignItems:'center'}}>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:16}]}>
                            Select Delivery Date
                        </Text>
                        {this.showCalendar()}
                    </View>
                    {this.state.selectedDeliverDate!=='' && <Text style={[AppStyles.styleSet.textWithYellowColor, 
                        {fontSize:16, marginTop:5}]}>
                        {this.state.selectedDeliverDateToShow}
                    </Text>}
                    {this.state.selectedDeliverDateToShow !== '' && this.state.timeData.length===0 && <Text style={[AppStyles.styleSet.textWithYellowColor, 
                        {fontSize:16, marginTop:5}]}>
                        Sorry! There is no time slot with the selected date, please choose another date
                    </Text>}
                    {this.state.selectedDeliverDate !== '' && <View style={{width:'100%', marginTop:15}}>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:16}]}>
                            Select Time
                        </Text>
                        <View style={{marginTop:10}}>
                            <TouchableOpacity onPress={()=>this.setState({showDropdownTimeView:!this.state.showDropdownTimeView})} 
                            style={{flexDirection:'row'
                                }}>
                                    <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, alignSelf:'center',
                                        fontFamily:AppStyles.fontFamily.M_BOLD, minWidth:70}}>
                                           {this.state.selectedTime===''?'Time':this.state.selectedTime}
                                    </Text>
                                    <Image resizeMode={'contain'} source={require('../../assets/down-arrow-white.png')} 
                                    style={{height:16, width:16, marginLeft:12}}/>
                            </TouchableOpacity>
                            {this.showDropdownTimeView()}
                        </View>
                    </View>}
                    
                </View>
            )
        }
    }

    showDropdownTimeView(){
        if(this.state.showDropdownTimeView){
            //let 
            return(
                <View style={{width:'100%', maxHeight:150, backgroundColor:'white', width:200}}>
                    <FlatList
                        data={this.state.timeData}
                        style={{}}
                        nestedScrollEnabled
                        renderItem={({ item, index }) => (
                            this.dropDownItemView(item, index)
                        )}
                        keyExtractor={item => item._id}
                    />
                </View>
            )
        }
    }
    dropDownItemView(item, index){
   
         let time = item.openTime+'-'+item.closeTime
    
           return( 
               <TouchableOpacity onPress={()=>this.setState({selectedTime:time, showDropdownTimeView:false})} 
               style={{padding:5, paddingLeft:5,  borderBottomColor:'black',
                   borderBottomWidth:1}}>
                   <Text style={{color:'black', fontFamily:AppStyles.fontFamily.M_BOLD}}>
                       {item.openTime+'-'+item.closeTime}
                   </Text>
               </TouchableOpacity>
           )
    
       
   }

    showCalendar(){
        var minDate = new Date()
        return (
            <DatePicker
              mode="date"
              placeholder="select date"
              format="YYYY-MM-DD"
              minDate={minDate}
              maxDate='2022-12-11'
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              iconSource={require('../../assets/calendar.png')}
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
                  let _date = new Date(Date.parse(date))
                //   var offset = _date.getTimezoneOffset()
                //   if(!offset.toString().includes('-')){
                //     _date.setTime( _date.getTime() + _date.getTimezoneOffset()*60*1000 );
                //   } 
                  let month = _date.getMonth()+1
                  let d = _date.getDate()
                  
                  if(month.toString().length===1){
                      month='0'+month
                  }
                  if(d.toString().length===1){
                        d='0'+d
                  }
                  this.setState({selectedDeliverDateToShow:month+'/'+d+'/'+_date.getFullYear(), selectedDeliverDate:date, isLoading:true},()=>this.getDatesfromServer())
                  
                }}
            />
          )
    }

   

   convertTime12to24 = (time12h) => {
        const [time, modifier] = time12h.split(' ');
      
        let [hours, minutes] = time.split(':');
      
        if (hours === '12') {
            if(modifier === 'AM'){
                hours = '24';

            }else{
                hours = '12';
            }
         
        }
      
        if (modifier === 'PM' && hours !== '12') {
          hours = parseInt(hours, 10) + 12;
        }
      
        return `${hours}`;
      }

     

    

    addDeliveryAddressView(){
        let address = 'Select Address'
       // console.log('addressList', JSON.stringify(this.state.addressList))
        if(this.state.addresData!=='' && this.state.addresData !== undefined && this.state.addresData !== null){
            address = this.state.addresData.address
        }else if(this.state.addressList.length>0){
            address = this.state.addressList[0].address
        }
        return(
            <View>
                <View style={{width:'100%', flexDirection:'row',
                    justifyContent:'space-between', marginTop:20, alignItems:'center'}}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:16}]}>
                        Delivery Address
                    </Text>
                    <TouchableOpacity onPress={()=>{
                        if(!this.props.data.isLoggedIn){
                            this.props.showLoginFirstAlert(true)
                            this.props.navigateToCart('Cart')
                            this.props.navigation.navigate('Login')
                        }else{
                            this.props.navigation.navigate('AddAddress', {navigateFrom:'checkout'})
                        }
                        }} style={{flexDirection:'row', alignItems:'center'}}>
                        <Text style={[AppStyles.styleSet.textWithYellowColor, {fontSize:14}]}>
                            Add New
                        </Text>
                        <Image source={require('../../assets/plus.png')} style={{height:16, width:16, marginLeft:15}}/>
                    </TouchableOpacity>
                </View>
                <View style={{width:'100%', flexDirection:'row', marginTop:15, alignItems:'center'}}>
                    <Image source={require('../../assets/home.png')} style={{height:20, width:22,}}/> 
                    <TouchableOpacity 
                    style={{flexDirection:'row'}}
                    onPress={()=>this.setState({showAddressDropdownView:!this.state.showAddressDropdownView})}>
                        <Text style={[AppStyles.styleSet.textWithYellowColor, {fontSize:14, marginLeft:18}]}>
                            {this.state.selectedAddress===''?'Select Address':this.state.selectedAddress}
                        </Text>
                       <Image resizeMode={'contain'} source={require('../../assets/down-arrow-white.png')} 
                                style={{height:16, width:16, marginLeft:12}}/>
                    </TouchableOpacity>
                </View>
                {this.showAddressDropdownView()}
                <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:16, marginTop:25}]}>
                    Instructions for your driver
                </Text>
                <View style={[AppStyles.styleSet.textInputView, {marginTop:16, 
                        }]}>
                    <TextInput 
                        ref={(rf) => {this.instagram = rf}}
                        placeholder=''
                        value={this.state.instructions}
                        onChangeText={(text)=>this.setState({instructions:text})}
                        placeholderTextColor={'#878787'}
                        style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                    />
                </View>  
            </View>

        )
    }

    showAddressDropdownView(){
        if(this.state.showAddressDropdownView){
            //let 
            return(
                <View style={{width:'100%', maxHeight:150, backgroundColor:'white', 
                width:'100%', marginTop:5}}>
                    <FlatList
                        data={this.state.addressList}
                        nestedScrollEnabled
                        style={{}}
                        renderItem={({ item, index }) => (
                            this.dropDownAddressItemView(item, index)
                        )}
                        keyExtractor={item => item._id}
                    />
                </View>
            )
        }
    }
    dropDownAddressItemView(item, index){
        return( 
            <TouchableOpacity onPress={()=>this.setState({selectedAddress:item.address,
                selectedAddressLat:item.location.coordinates[0],
                selectedAddressLong:item.location.coordinates[1],
                 showAddressDropdownView:false})} 
            style={{padding:5, paddingLeft:5,  borderBottomColor:'black',
                borderBottomWidth:1}}>
                <Text style={{color:'black', fontFamily:AppStyles.fontFamily.M_BOLD}}>
                    {item.address}
                </Text>
            </TouchableOpacity>
        )
        
    }
    


    changeCustomAmount(text){
        if(text.length>0){
          this.setState({customAmount:text, driverTip:text},()=>this.calculateTotal('driverTip'))
        }else{
            this.setState({customAmount:0, driverTip:0},()=>this.calculateTotal('driverTip'))
        }

    }

    driverTipView(){
        return(
            <View style={{}}>
                <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:16, marginTop:25}]}>
                    Driver Tip
                </Text>
                <FlatList
                    data={driverData}
                    horizontal
                    style={{marginTop:15,}}
                    renderItem={({ item, index }) => (
                    this.categoryItemView(item, index)
                    )}
                    keyExtractor={item => item._id}
                />
                {this.state.showCustomAmountView && <View>               
                    <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:16, marginTop:25}]}>
                        Custom Amount
                    </Text>
                    <View style={[AppStyles.styleSet.textInputView, {marginTop:16, 
                            }]}>
                        <TextInput 
                            ref={(rf) => {this.instagram = rf}}
                            placeholder=''
                            value={this.state.customAmount}
                            onChangeText={(text)=>this.changeCustomAmount(text)}
                            placeholderTextColor={'#878787'}
                            style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                        />
                    </View> 
                </View>}
                <View style={{width:'100%', flexDirection:'row',
                    justifyContent:'space-between', marginTop:20, alignItems:'center',
                    borderBottomColor:AppStyles.colorSet.mainTextColor, borderBottomWidth:1,
                     paddingBottom:26}}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:16}]}>
                        Driver Tip Amount
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:16}]}>
                        ${this.state.driverTip}
                    </Text>
                </View>
                {/* <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:16, marginTop:25}]}>
                        Payment Method
                    </Text>
                <View style={{width:'100%', flexDirection:'row',
                    justifyContent:'space-between', marginTop:20, alignItems:'center',
                    borderBottomColor:AppStyles.colorSet.mainTextColor, borderBottomWidth:1,
                     paddingBottom:26}}>
                    <TouchableOpacity onPress={()=>this.setState({isCardChecked:!this.state.isCardChecked})} style={{flexDirection:'row', alignItems:'center'}}>
                        <Image source={!this.state.isCardChecked?require('../../assets/uncheck.png'):
                          require('../../assets/check.png')} style={{height:16, width:16, }}/>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:14, 
                            marginLeft:14,}]}>
                            Card
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('Payment')} style={{flexDirection:'row'}}>
                        <Text style={[AppStyles.styleSet.textWithYellowColor, {fontSize:14, alignItems:'center'}]}>
                            Add New
                        </Text>
                        <Image source={require('../../assets/plus.png')} style={{height:16, width:16, marginLeft:15}}/>
                    </TouchableOpacity>
                </View> */}
            </View>
        )
    }

    
    async calculateTaxes(){
        let deliveryDiscount = parseFloat(this.state.deliveryFee)
        let subTotal = parseFloat(this.props.data.subTotal)
        if(this.state.discount>0 && this.state.deliveryFee>=this.state.discount){
            deliveryDiscount = this.state.deliveryFee - parseFloat(this.state.discount)
        }else if(this.state.discount>0){
            deliveryDiscount = this.state.deliveryFee
            subTotal = subTotal - (this.state.discount - deliveryDiscount)
        }
       // console.log('sub', subTotal+' deliveryDiscount '+ deliveryDiscount)
        let q1 = parseFloat(subTotal) + parseFloat(deliveryDiscount)
        if(this.state.discount>0 && this.state.deliveryFee<this.state.discount){
            q1 = parseFloat(subTotal)
        }
       // console.log('q1', q1)
        let q2 = this.state.taxRate/100
       // console.log('q2', q2)
        let t = q1 * q2
        let q3 = q1 * 0.04
        let processingFees = q3 + 0.30
        let taxes = t
       // let taxes = ((subTotal+ deliveryDiscount)* 0.1265)+ .3
        //console.log('taxes',taxes+' '+ subTotal+' '+deliveryDiscount+' '+this.state.deliveryFee+' '+ this.state.discount)
        this.setState({taxes:taxes.toFixed(2), subTotal:this.props.data.subTotal, taxesToSend:t},()=>this.calculateTotal())
    }


    calculateTotal(type){
        let q1 = this.state.deliveryFee - this.state.discount
        let total = parseFloat(this.props.data.subTotal) + parseFloat(q1) + parseFloat(this.state.taxes) + parseFloat(this.state.driverTip)
        var taxes;
        if(type!=='driverTip'){
            var q3 = total * 0.04
            var processingFees = q3 + 0.30
            taxes = parseFloat(this.state.taxes) + parseFloat(processingFees)
            total = total + parseFloat(processingFees)
        }
        
        this.setState({totalAmount:total.toFixed(2), taxes:type!=='driverTip'?taxes.toFixed(2):this.state.taxes},()=>this.setState({isLoading:false}))
    }

    async calculateDriverTip(item){
        this.setState({isLoading:true})
        let driverTip = this.state.totalAmount / 100 * item;
        this.setState({driverTip:driverTip.toFixed(2), customAmount:0, driverTipPercentage:item},()=>this.calculateTotal('driverTip'))
    }

   

    navigateToPayment(address){
        this.props.navigation.navigate('Payment',{
                //products:this.state.selectedAddress,
                storeId:this.props.route.params.storeId,
                driverInstructions:this.state.instructions,
                subTotalAmount:this.props.data.subTotal,
                //needToSaveCard:true,
                netAmount:this.state.totalAmount,
                deliveryFee:this.state.deliveryFee,
                driverTipPercentage:this.state.driverTipPercentage,
                driverTipAmount:this.state.customAmount===0?this.state.driverTip:this.state.customAmount,
                taxAmount:this.state.taxesToSend,
                //freeDeliveryCode:'',
                //isFreeDeliveryCodeApplied:false,
                isScheduled:!this.state.isdeliveryTimeAsapChecked,
                scheduleDateTimeStart:this.state.selectedDeliverDate,
                scheduleDateTimeEnd:this.state.selectedDeliverDate,
                userBillingAddressId:address._id,
                address:address,
                latitude:this.state.selectedAddressLat,
                longitude:this.state.selectedAddressLong,
                deliveryTimeSlot:this.state.selectedTime,
                cardData:this.state.cardData

        })
    }

    async placeOrderValidation(){
        let address = this.state.selectedAddress
        // if(this.state.addresData!=='' && this.state.addresData !== undefined && this.state.addresData !== null){
        //     address = this.state.addresData
        // }else if(this.state.addressList.length>0){
        //     address = this.state.addressList[0]
        // }
        if(!this.state.showAsap && this.state.isdeliveryTimeAsapChecked){
            this.setState({isLoading:false, responseText:'Please select schedule your order option!', responseAlert:true})
        }else if(!this.state.isdeliveryTimeAsapChecked){
            //alert(this.state.selectedTime)
            if(this.state.selectedDeliverDate === ''){
                this.setState({isLoading:false, responseText:'Please select date first!', responseAlert:true})
               // alert('Please select date')
            }else if(this.state.selectedTime === ''){
                this.setState({isLoading:false, responseText:'Please select time slot first!', responseAlert:true})
               // alert('Please select time')
            }else if(address === ''){
                this.setState({showSelectAddressAlert:true})
            }else{
               this.navigateToPayment(address)
            }
        }else{
            if(address === ''){
                this.setState({showSelectAddressAlert:true})
            }else{
                this.navigateToPayment(address)
            }
        }
    }
    showSelectAddressAlert(){
        return(
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={this.state.showSelectAddressAlert}
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
                    backgroundColor:'black', opacity:1, paddingBottom:30, height:'auto'}}>
                        {/* <TouchableOpacity onPress={()=>this.setState({showAgeAlert:false})}>
                            <Image source={require('./assets/close_yellow.png')} 
                            style={{height:25, width:25, alignSelf:'flex-end'}}/>
                        </TouchableOpacity> */}
                          <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_BOLD,
                                fontSize:22, textAlign:'center', marginTop:33}}>
                                    Please select address
      
                          </Text>
                        <TouchableOpacity onPress={()=>this.setState({showSelectAddressAlert:false})} 
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

    async changeProductFormat(){
        this.setState({isLoading:true})
        let products = []
        
        for(let i=0; i<this.props.data.cart.length; i++){
            let product = {}
            let item = this.props.data.cart[i]
            //console.log('changeProductFormat', JSON.stringify(item.productId))
            product.productId = item.productId
            product.quantity = item.quantityOfProductInCart
            product.productImage = item.image
            product.productName = item.title
            product.productPrice = item.price
            product.storeId = item.storeId._id
            product.allSizes = item
            products.push(product)
        }
        this.checkInventory(products)
        //this.placeOrder(address, products, type, id)
    }

    async checkInventory(products){
        let credentials = {
            products:products
        }
       // console.log('creds', JSON.stringify(credentials))
        let res = await sendPostRequestWithAccessTokenAndBody(CHECK_SIZE_BEFORE_ORDER_PLACE, credentials,  global.accessToken);
        console.log('CHECK_SIZE_BEFORE_ORDER_PLACE_CHECKOUT', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.placeOrderValidation()
           // this.setState({savedCards:res.response.userData},()=>this.setState({isLoading:false}))
           
        }else if(res.hasOwnProperty('response') && res.response.status.statusCode === 406){
            this.setState({isLoading:false},()=>this.setState({responseText:res.response.userData, responseAlert:true}))
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }




    orderPlacedAlert(){
        return(
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={this.state.orderPlacedAlert}
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
                                   Order Placed
                        </Text>
                        <TouchableOpacity onPress={()=>this.setState({orderPlacedAlert:false},()=>this.props.navigation.navigate('Home'))} 
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

    categoryItemView(item, index){
        let isSelected = false
        if(this.state.driverTipItem === item){
            isSelected = true
        }
        if(index !== 4){
            return(
                <TouchableOpacity onPress={()=>{
                    if(this.state.driverTipItem===item){
                        this.setState({driverTipItem:''},()=>this.calculateDriverTip(0))

                    }else{
                        this.setState({driverTipItem:item},async()=>{
                            await this.calculateDriverTip(0)
                            this.calculateDriverTip(item)
                        })
                    }
                }}
                style={{marginLeft:index!==0?15:0, height:48, width:48,
                    borderRadius:24, borderColor:AppStyles.colorSet.mainTextColor,
                     borderWidth:1.5, justifyContent:'center',
                    alignItems:'center', backgroundColor:isSelected?AppStyles.colorSet.mainTextColor:'transparent'}}>
                    <Text style={{color:isSelected?'white':AppStyles.colorSet.mainTextColor, 
                        fontSize:14, fontFamily:AppStyles.fontFamily.M_BOLD,}}>
                            {item}%
                    </Text>
                </TouchableOpacity>
            )
        }else{
            return(
                <TouchableOpacity onPress={()=>{
                    if(this.state.driverTipItem===item){
                        this.setState({showCustomAmountView:!this.state.showCustomAmountView, driverTipItem:''},()=>this.calculateDriverTip(0))
                    }else{
                        this.setState({showCustomAmountView:!this.state.showCustomAmountView, driverTipItem:item},()=>this.calculateDriverTip(0))
                    }
                }} 
                style={{marginLeft:index!==0?15:0, padding:5, paddingHorizontal:10,
                    borderRadius:24, borderColor:AppStyles.colorSet.mainTextColor, borderWidth:1.5, justifyContent:'center',
                    alignItems:'center', backgroundColor:isSelected?AppStyles.colorSet.mainTextColor:'transparent'}}>
                    <Text style={{color:'white', 
                        fontSize:14, fontFamily:AppStyles.fontFamily.M_BOLD,}}>
                            {item}
                    </Text>
                </TouchableOpacity>
            )

        }
    }

    subTotalView(){
        return(
            <View >
                <View style={{marginTop:20}}>
                    <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', 
                    }}>
                        <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                            Sub Total
                        </Text>
                        <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                            ${parseFloat(this.props.data.subTotal).toFixed(2)}
                        </Text>
                    </View>
                </View>
                <View style={{marginTop:15}}>
                    <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', 
                    }}>
                        <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                            Delivery Charges
                        </Text>
                        <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                            ${this.state.deliveryFee}
                        </Text>
                    </View>
                </View>
                <View style={{marginTop:20}}>
                    <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', 
                    }}>
                        <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                            Discount
                        </Text>
                        <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                           {this.state.discount>0?'- ':''}${this.state.discount}
                        </Text>
                    </View>
                </View>
                <View style={{marginTop:20}}>
                    <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', 
                    }}>
                        <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                            Taxes and fees
                        </Text>
                        <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                            ${this.state.taxes}
                        </Text>
                    </View>
                </View>
                <View style={{marginTop:20,borderBottomColor:AppStyles.colorSet.mainTextColor, borderBottomWidth:1,
                     paddingBottom:26}}>
                    <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', 
                    }}>
                        <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                            Driver Tip Amount
                        </Text>
                        <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                            ${this.state.driverTip}
                        </Text>
                    </View>
                </View>
                <View style={{marginTop:20}}>
                    <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', 
                    }}>
                        <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                            Total Amount
                        </Text>
                        <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                            ${parseFloat(this.state.totalAmount).toFixed(2)}
                        </Text>
                    </View>
                </View>
            </View>
        )
    }


    render(){
        return(
            <SafeAreaView style={{flex:1, backgroundColor:'black'}}>
                <StatusBar barStyle={'light-content'}/>
                {/* <StatusBarHeader props={this.props}/> */}
                {this.headerImage()}
                <ScrollView style={{flex:1, marginBottom:20}}>
                    <View style={{flex:1, padding:20}}>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:16, color:'grey', }]}>
                            Purchased from and delivered by:
                        </Text>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor, 
                            {fontSize:16, color:'grey', fontFamily:AppStyles.fontFamily.M_BOLD, marginBottom:15}]}>
                            {this.state.storeName}
                        </Text>
                        {this.deliveryTimeView()}
                        {this.calendarView()}
                        {this.addDeliveryAddressView()}
                        {this.driverTipView()}
                        {this.subTotalView()}
                    </View>
                    <View style={{paddingHorizontal:20}}>
                        <TouchableOpacity onPress={()=>{
                            if(!this.props.data.isLoggedIn){
                                this.props.showLoginFirstAlert(true)
                                this.props.navigateToCart('Cart')
                                this.props.navigation.navigate('Login')
                            }else{
                              this.changeProductFormat()
                            }
                            }} style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:35,}]}>
                            <Text style={[AppStyles.styleSet.textWithWhiteColor, 
                                {fontFamily:AppStyles.fontFamily.M_SEMIBOLD,}]}>
                                PLACE ORDER
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                {this.orderPlacedAlert()}
                {this.showSelectAddressAlert()}
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
    addToCart,
    removeFromCart,
    deleteFromCart,
    deleteAll,
    showLoginFirstAlert,
    navigateToCart
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Checkout);