import React, { Component } from "react";
import {
    View,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Image,
    Text,
    ScrollView,
    TextInput,
    Modal,
    FlatList,
    KeyboardAvoidingView,
    Platform
} from 'react-native'
import StatusBarHeader from "../components/StatusBarHeader";
import AppStyles from '../styles/AppStyles'
import {Switch} from 'react-native-switch'
import WatermarkView from "../components/WatermarkView";
import { connect } from 'react-redux';
import BackButton from "../components/BackButton";
import { sendPostRequestWithAccessTokenAndBody } from "../Utils/RestApiService";
import { CHECK_SIZE_BEFORE_ORDER_PLACE, GET_SAVED_CARDS, GET_SECRET_CLIENT, PLACE_ORDER, PLACE_ORDER_V2 } from "../Utils/UrlClass";
//import Stripe from 'react-native-stripe-api'
import ShowLoader from "../components/ShowLoader";
import { bindActionCreators } from 'redux';
import { logEvent } from "../Utils/AnalyticsUtils";
import { addToCart, removeFromCart, deleteFromCart, deleteAll, showLoginFirstAlert, setFreeDelivery} from '../redux/actions'
import ResponseAlert from "../components/ResponseAlert";
import { CommonActions } from '@react-navigation/native'
import { StripeProvider, useStripe, CardField, confirmPayment } from '@stripe/stripe-react-native';


const whatDidYouLikeData = ['Free delivery', 'Friendly', 'Went above and beyond']
const testStripeKey = 'pk_test_YnwYfVcts8x8yRpTH8oCjFF000i9zR5HU4'

const liveStripeKey = 'pk_live_vfUcGFBtiuNLLPVpEBsLIW8D00gF1DJlmH'




const testStripeKey2 = 'pk_test_uIwLYGZc4bRelLSmtv3ejycq00m9RgjPrh'
const testStripekey3 = 'sk_test_Ol7qDjhJ4Tx1BD2oCDMe9rrP00ot6wXpQq'


class Payment extends Component{
    constructor(props){
        super(props)
        this.state={
            cardNumber:'',
            valid:'',
            cvv:'',
            holderName:'',
            saveCard:false,
            showRatingView:false,
            savedCards:this.props.route.params.cardData!==undefined?this.props.route.params.cardData:[],
            selectedCardIndex:-1,
            products:this.props.data.cart,
            storeId:this.props.route.params.storeId!==undefined?this.props.route.params.storeId:'',
            driverInstructions:this.props.route.params.driverInstructions!==undefined?this.props.route.params.driverInstructions:'',
            subTotalAmount:this.props.route.params.subTotalAmount!==undefined?this.props.route.params.subTotalAmount:'',
            netAmount:this.props.route.params.netAmount!==undefined?this.props.route.params.netAmount:'',
            deliveryFee:this.props.route.params.deliveryFee!==undefined?this.props.route.params.deliveryFee:'',
            driverTipPercentage:this.props.route.params.driverTipPercentage!==undefined?this.props.route.params.driverTipPercentage:'',
            driverTipAmount:this.props.route.params.driverTipAmount!==undefined?this.props.route.params.driverTipAmount:'',
            taxAmount:this.props.route.params.taxAmount!==undefined?this.props.route.params.taxAmount:'',
            //freeDeliveryCode:'',
            //isFreeDeliveryCodeApplied:false,
            isScheduled:this.props.route.params.isScheduled!==undefined?this.props.route.params.isScheduled:'',
            scheduleDateTimeStart:this.props.route.params.scheduleDateTimeStart!==undefined?this.props.route.params.scheduleDateTimeStart:'',
            scheduleDateTimeEnd:this.props.route.params.scheduleDateTimeEnd!==undefined?this.props.route.params.scheduleDateTimeEnd:'',
            userBillingAddressId:this.props.route.params.userBillingAddressId!==undefined?this.props.route.params.userBillingAddressId:'',
            address:this.props.route.params.address!==undefined?this.props.route.params.address:'',
            latitude:this.props.route.params.latitude!==undefined?this.props.route.params.latitude:'',
            longitude:this.props.route.params.longitude!==undefined?this.props.route.params.longitude:"",
            deliveryTimeSlot:this.props.route.params.deliveryTimeSlot!==undefined?this.props.route.params.deliveryTimeSlot:'',
            stripeToken:'',
            isLoading:true,
            orderPlacedAlert:false,
            responseAlert:false,
            responseText:'',
            cardDetails:'',
            paymentIntentId:'',
            paymentMethodId:'',
            isCardValid:false
        }
    }

    componentDidMount(){
        logEvent('Checkout_payment_Page')
        //console.log('state',JSON.stringify(this.props))
        if(this.props.route.params.payment!==undefined){
            this.setState({isLoading:false})
         
        }else{
            this.setState({isLoading:false})
           // this.getSavedCards()
        }
    }

    async getSavedCards(){
        let credentials = {
            
        }
        let res = await sendPostRequestWithAccessTokenAndBody(GET_SAVED_CARDS, credentials,  global.accessToken);
        console.log('GET_SAVED_CARDS', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({savedCards:res.response.userData},()=>this.setState({isLoading:false}))
           
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }



    headerImage(){
        return(
            <View style={{width:'100%',  paddingVertical:10, paddingHorizontal:20,
                flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                {/* <TouchableOpacity onPress={()=>this.props.navigation.goBack()}>
                    <Image resizeMode={'contain'} source={require('../../assets/back-arrow.png')} style={{height:25, width:25, }}/>
                </TouchableOpacity> */}
                <View style={{width:70}}>
                    <BackButton props={this.props}/>

                </View>
                {/* <Image 
                    resizeMode={'contain'}
                    source={require('../../assets/checkout-shape.png')} 
                    style={{ width:'65%'}}/> */}
                {/* <View style={{height:25, width:25, }}>
                </View> */}
            </View>
        )
    }

    nullView(){
        return(
            <View style={{flex:1, alignItems:'center', justifyContent:'space-between', paddingHorizontal:20}}>
                <View style={{alignItems:'center'}}>
                  <Image resizeMode={'contain'} source={require('../../assets/empty-cart-vector.png')} 
                  style={{height:350, width:300, marginTop:70}}/>
                  <Text style={[AppStyles.styleSet.textWithWhiteColor,{
                        fontSize:23, fontFamily:AppStyles.fontFamily.M_BOLD, marginTop:30}]}>
                        No Saved Cards
                    </Text>
                </View>
                <TouchableOpacity style={[AppStyles.styleSet.viewWithYelloBackground, {marginBottom:35, }]}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                        Pay
                    </Text>
                </TouchableOpacity>

            </View>
        )
    }
    showRatingView(){
        return(
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={this.state.showRatingView}
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
                    borderWidth:2, borderRadius:10, zIndex:999, padding:14, 
                    backgroundColor:'black', opacity:1, paddingBottom:30}}>
                        <TouchableOpacity onPress={()=>this.setState({showRatingView:false})}>
                            <Image source={require('../../assets/close_yellow.png')} 
                            style={{height:25, width:25, alignSelf:'flex-end'}}/>
                        </TouchableOpacity>
                        <View>
                            <Text style={[AppStyles.styleSet.textWithYellowColor, {
                                 fontSize:18,alignSelf:'center'
                            }]}>
                                Rate your Driver
                            </Text>
                            <Text style={[AppStyles.styleSet.textWithYellowColor, {
                                 fontSize:16,marginTop:20
                            }]}>
                                What did you like?
                            </Text>
                            <View style={{flexDirection:'row', width:'100%', marginTop:20,    
                                flexWrap:'wrap', justifyContent:'flex-start'}}>
                                {whatDidYouLikeData.map((item, index) => {
                                    return(
                                    <TouchableOpacity onPress={()=>this.setState({showCustomAmountView:!this.state.showCustomAmountView})} 
                                    style={{marginLeft:index!==0?15:0, padding:5, paddingHorizontal:15,
                                        borderRadius:24, borderColor:AppStyles.colorSet.mainTextColor, borderWidth:1.5, justifyContent:'center',
                                        alignItems:'center', marginTop:index===2?15:0}}>
                                        <Text style={{color:'white', 
                                            fontSize:14, fontFamily:AppStyles.fontFamily.M_BOLD,}}>
                                                {item}
                                        </Text>
                                    </TouchableOpacity>)
                                })}
                            </View>
                            <Text style={[AppStyles.styleSet.textWithYellowColor, {
                                 fontSize:16,marginTop:20
                            }]}>
                               Add a review for your driver
                            </Text>
                            <View style={[AppStyles.styleSet.textInputView, 
                            {marginTop:12, 
                                    }]}>
                                <TextInput 
                                    ref={(rf) => {this.valid = rf}}
                                    placeholder='Type your review here'
                                    value={this.state.valid}
                                    onChangeText={(text)=>this.setState({valid:text})}
                                    placeholderTextColor={'#878787'}
                                    style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                />
                            </View> 
                            <Text style={[AppStyles.styleSet.textWithYellowColor, {
                                 fontSize:16,marginTop:20
                            }]}>
                               Do you have any suggestions for us?
                            </Text>
                            <View style={[AppStyles.styleSet.textInputView, 
                            {marginTop:12, 
                                    }]}>
                                <TextInput 
                                    ref={(rf) => {this.valid = rf}}
                                    placeholder='Type your ffedback here'
                                    value={this.state.valid}
                                    onChangeText={(text)=>this.setState({valid:text})}
                                    placeholderTextColor={'#878787'}
                                    style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                />
                            </View> 
                            <TouchableOpacity style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:25, }]}>
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

    savedCardsView(){
        return(
            <View style={{width:'100%', paddingHorizontal:22, paddingBottom:15}}>
               {this.props.route.params.payment===undefined && <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:16, 
                    fontFamily:AppStyles.fontFamily.M_BOLD}}>
                    Use saved payment information
                </Text>}
                <FlatList
                    data={this.state.savedCards}
                    style={{}}
                    nestedScrollEnabled
                    renderItem={({ item, index }) => (
                        this.savedcardItemVieW(item, index)
                    )}
                    keyExtractor={item => item._id}
                />
            </View>
            
        )
    }

    savedcardItemVieW(item, index){
        let visible = true
        return(
            <View style={{width:'100%',marginTop:15, flexDirection:'row',}}>
                <TouchableOpacity onPress={()=>{
                    if(this.state.selectedCardIndex ===  index){
                        this.setState({selectedCardIndex:-1})
                    }else{
                        this.setState({selectedCardIndex:index})
                    }
                }}>
                   <Image 
                        resizeMode={'contain'}
                        source={this.state.selectedCardIndex ===  index?require('../../assets/check-active.png'):
                        require('../../assets/check-inactive.png')}
                        style={{height:20, width:20}}/>
                </TouchableOpacity>
                <View style={{marginLeft:15, justifyContent:'space-between', flexDirection:'row', width:'100%', flex:1}}>
                    <View>
                        {/* <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:12, 
                            fontFamily:AppStyles.fontFamily.M_BOLD}}>
                            Name
                        </Text> */}
                        <Text style={{color:'white', fontSize:12, 
                            fontFamily:AppStyles.fontFamily.M_BOLD}}>
                            ... .... .... {item.card.last4}
                        </Text>
                    </View>
                    <View style={{alignItems:'flex-end'}}>
                        <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:12, 
                            fontFamily:AppStyles.fontFamily.M_BOLD}}>
                            Exp {item.card.exp_month}/{item.card.exp_year}
                        </Text>
                        {this.state.selectedCardIndex ===  index && <TouchableOpacity onPress={()=>this.getClientSecret('savedCards', item.id)} style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:10, width:70, 
                            height:30,}]}>
                            <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_SEMIBOLD, fontSize:14}]}>
                                Pay
                            </Text>
                        </TouchableOpacity>}
                    </View>
                </View>
            </View>
        )
    }

    async checkInventory(address, products, type, id){
        let credentials = {
            products:products
        }
       // console.log('creds', JSON.stringify(credentials))
        let res = await sendPostRequestWithAccessTokenAndBody(CHECK_SIZE_BEFORE_ORDER_PLACE, credentials,  global.accessToken);
        //console.log('CHECK_SIZE_BEFORE_ORDER_PLACE', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.placeOrder(address, products, type, id)
           // this.setState({savedCards:res.response.userData},()=>this.setState({isLoading:false}))
           
        }else if(res.hasOwnProperty('response') && res.response.status.statusCode === 406){
            this.setState({isLoading:false},()=>this.setState({responseText:res.response.userData, responseAlert:true}))
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    validate(){
        // if(this.state.holderName === '' && this.state.cardNumber === '' && this.state.cvv === '' && this.state.valid === ''){
        //     this.setState({responseText:'All fields are required', responseAlert:true})
        // }else if(this.state.cvv === ''){
        //     this.setState({responseText:'Enter cvv', responseAlert:true})
        // }else if(this.state.valid === ''){
        //     this.setState({responseText:'Enter expiry date', responseAlert:true})
        // }else if(this.state.holderName === ''){
        //     this.setState({responseText:'Enter card holder name', responseAlert:true})
        // }else{
        //     this.getStripeToken()
        // }
        if(this.state.isCardValid){
            this.getClientSecret()
        }else{
            this.setState({responseText:'Please enter valid card details', responseAlert:true})
        }

    }

    async getClientSecret(type, id){
        this.setState({isLoading:true})
        let credentials = ''
        if(type === 'savedCards'){
            credentials = {
                amount: this.state.netAmount,
                pm: id
            }
        }else{
            credentials = {
                amount: this.state.netAmount
            }
        }
        //console.log('creds', JSON.stringify(credentials))
        let res = await sendPostRequestWithAccessTokenAndBody(GET_SECRET_CLIENT, credentials,  global.accessToken);
        //console.log('getClientSecret', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
           // this.setState({savedCards:res.response.userData},()=>this.setState({isLoading:false}))
           
           if(type === 'savedCards'){
               this.setState({paymentIntentId:res.response.userData.id},()=> {
                this.changeProductFormat(type, id)
               })
               
           }else{
              this.createStripeId(res.response.userData.client_secret)
           }
           
        }else if(res.hasOwnProperty('response') && res.response.status.statusCode === 406){
            this.setState({isLoading:false},()=>this.setState({responseText:res.response.userData, responseAlert:true}))
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    async createStripeId(client_secret){
        //console.log('client_secret', JSON.stringify(client_secret))
        //const { confirmPayment, handleCardAction } = useStripe()
       // let cardDetails = {"brand": "MasterCard", "complete": true, "expiryMonth": 11, "expiryYear": 24, "last4": "4242"}
        let cardDetails = this.state.cardDetails
        let name = 'Test'
        let res = await confirmPayment(client_secret, {
            type: 'Card',
            billingDetails: {cardDetails}
        })
        if(res.hasOwnProperty('paymentIntent') && res.paymentIntent !== undefined){
            // this.setState({savedCards:res.response.userData},()=>this.setState({isLoading:false}))
           this.setState({paymentIntentId:res.paymentIntent.id, paymentMethodId:res.paymentIntent.paymentMethodId},()=>{
               this.changeProductFormat()
           })
            
         }
       
    }


    

   

    async getStripeToken(){
        let valid = this.state.valid.split('/')
       // console.log('valid', valid[0])
       // console.log('valid', valid[1])
       // address_zip: '567890'
        this.setState({isLoading:true})
        const client = new Stripe(testStripeKey);
        client.createToken({  
            number:this.state.cardNumber,
            exp_month:valid[0], 
            exp_year:valid[1], 
            cvc:this.state.cvv}).then((data)=>{
                if(data.hasOwnProperty('error')){
                    this.setState({responseText:data.error.message, responseAlert:true})
                    this.setState({isLoading:false})
                }else{
                    console.log(JSON.stringify(data))
                    this.setState({stripeToken:data.id},()=>
                    //this.placeOrder(address)
                    this.changeProductFormat()
                    )
                    
                }
//                    console.log('stripeData', JSON.stringify(data))
            }).catch((e)=>{
                this.setState({responseText:e, responseAlert:true})
                console.log(e)
            })
    }

    async changeProductFormat(type, id){
        this.setState({isLoading:true})
        let address = this.state.address
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
        this.checkInventory(address, products, type, id)
        //this.placeOrder(address, products, type, id)
    }

    async placeOrder(address, products, type, id){
        let body = ''
        if(!this.state.isScheduled){
            if(type==='savedCards'){
                body = {
                    products:products,
                    storeId:this.state.storeId,
                    driverInstructions:this.state.driverInstructions,
                    subTotalAmount:this.state.subTotalAmount,
                    needToSaveCard:this.state.saveCard,
                    netAmount:this.state.netAmount,
                    deliveryFee:this.state.deliveryFee,
                    driverTipPercentage:this.state.driverTipPercentage,
                    driverTipAmount:this.state.driverTipAmount,
                    taxAmount:this.state.taxAmount,
                    freeDeliveryCode:'',
                    isFreeDeliveryCodeApplied:false,
                    isScheduled:this.state.isScheduled,
                    scheduleDateTimeStart:this.state.scheduleDateTimeStart,
                    scheduleDateTimeEnd:this.state.scheduleDateTimeEnd,
                    userBillingAddressId:address._id,
                    address:address,
                    latitude:this.state.latitude,
                    longitude:this.state.longitude,
                    //cardToken: this.state.stripeToken
                    isFreeDeliveryReferral:this.props.data.isFreeDelivery,
                    paymentId:this.state.paymentIntentId,
                    paymentMethod:this.state.paymentMethodId,
                    //isFromApp:1
                }

            }else{
                body = {
                    products:products,
                    storeId:this.state.storeId,
                    driverInstructions:this.state.driverInstructions,
                    subTotalAmount:this.state.subTotalAmount,
                    needToSaveCard:this.state.saveCard,
                    netAmount:this.state.netAmount,
                    deliveryFee:this.state.deliveryFee,
                    driverTipPercentage:this.state.driverTipPercentage,
                    driverTipAmount:this.state.driverTipAmount,
                    taxAmount:this.state.taxAmount,
                    freeDeliveryCode:'',
                    isFreeDeliveryCodeApplied:false,
                    isScheduled:this.state.isScheduled,
                    scheduleDateTimeStart:this.state.scheduleDateTimeStart,
                    scheduleDateTimeEnd:this.state.scheduleDateTimeEnd,
                    userBillingAddressId:address._id,
                    address:address,
                    latitude:this.state.latitude,
                    longitude:this.state.longitude,
                    isFreeDeliveryReferral:this.props.data.isFreeDelivery,
                    paymentId:this.state.paymentIntentId,
                    paymentMethod:this.state.paymentMethodId
                    //isFromApp:1
                }
            }
        }else{
            if(type === 'savedCards'){
                body = {
                    products:products,
                    storeId:this.state.storeId,
                    driverInstructions:this.state.driverInstructions,
                    subTotalAmount:this.state.subTotalAmount,
                    needToSaveCard:this.state.saveCard,
                    netAmount:this.state.netAmount,
                    deliveryFee:this.state.deliveryFee,
                    driverTipPercentage:this.state.driverTipPercentage,
                    driverTipAmount:this.state.driverTipAmount,
                    taxAmount:this.state.taxAmount,
                    freeDeliveryCode:'',
                    isFreeDeliveryCodeApplied:false,
                    isScheduled:this.state.isScheduled,
                    scheduleDateTimeStart:this.state.scheduleDateTimeStart,
                    scheduleDateTimeEnd:this.state.scheduleDateTimeEnd,
                    userBillingAddressId:address._id,
                    address:address,
                    latitude:this.state.latitude,
                    longitude:this.state.longitude,
                    paymentId:this.state.paymentIntentId,
                    paymentMethod:this.state.paymentMethodId,
                }
            }else{
                body = {
                    products:products,
                    storeId:this.state.storeId,
                    driverInstructions:this.state.driverInstructions,
                    subTotalAmount:this.state.subTotalAmount,
                    needToSaveCard:this.state.saveCard,
                    netAmount:this.state.netAmount,
                    deliveryFee:this.state.deliveryFee,
                    driverTipPercentage:this.state.driverTipPercentage,
                    driverTipAmount:this.state.driverTipAmount,
                    taxAmount:this.state.taxAmount,
                    freeDeliveryCode:'',
                    isFreeDeliveryCodeApplied:false,
                    isScheduled:this.state.isScheduled,
                    scheduleDateTimeStart:this.state.scheduleDateTimeStart,
                    scheduleDateTimeEnd:this.state.scheduleDateTimeEnd,
                    userBillingAddressId:address._id,
                    address:address,
                    latitude:this.state.latitude,
                    longitude:this.state.longitude,
                    deliveryTimeSlot:this.state.deliveryTimeSlot,
                    paymentId:this.state.paymentIntentId,
                    paymentMethod:this.state.paymentMethodId
                }
            }
        }   
        //console.log('placeOrderCred', JSON.stringify(body))
            let res = await sendPostRequestWithAccessTokenAndBody(PLACE_ORDER_V2, body,  global.accessToken);
           // console.log('placeOrder', JSON.stringify(res))
            if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
             
                this.setState({isLoading:false},()=>{
                    this.setState({orderPlacedAlert:true},async()=>{
                       await this.props.deleteAll()
                        await this.props.setFreeDelivery()
                    })
                })
            }else{
                this.setState({isLoading:false})
            }
    }

    // async placeOrder12thJan(address, products, type, id){
    //     let body = ''
    //     if(!this.state.isScheduled){
    //         if(type==='savedCards'){
    //             body = {
    //                 products:products,
    //                 storeId:this.state.storeId,
    //                 driverInstructions:this.state.driverInstructions,
    //                 subTotalAmount:this.state.subTotalAmount,
    //                 needToSaveCard:this.state.saveCard,
    //                 netAmount:this.state.netAmount,
    //                 deliveryFee:this.state.deliveryFee,
    //                 driverTipPercentage:this.state.driverTipPercentage,
    //                 driverTipAmount:this.state.driverTipAmount,
    //                 taxAmount:this.state.taxAmount,
    //                 freeDeliveryCode:'',
    //                 isFreeDeliveryCodeApplied:false,
    //                 isScheduled:this.state.isScheduled,
    //                 scheduleDateTimeStart:this.state.scheduleDateTimeStart,
    //                 scheduleDateTimeEnd:this.state.scheduleDateTimeEnd,
    //                 userBillingAddressId:address._id,
    //                 address:address,
    //                 latitude:this.state.latitude,
    //                 longitude:this.state.longitude,
    //                 paymentType:'Online',
    //                 //cardToken: this.state.stripeToken
    //                 cardId: id,
    //                 isFreeDeliveryReferral:this.props.data.isFreeDelivery
    //                 //isFromApp:1
    //             }

    //         }else{
    //             body = {
    //                 products:products,
    //                 storeId:this.state.storeId,
    //                 driverInstructions:this.state.driverInstructions,
    //                 subTotalAmount:this.state.subTotalAmount,
    //                 needToSaveCard:this.state.saveCard,
    //                 netAmount:this.state.netAmount,
    //                 deliveryFee:this.state.deliveryFee,
    //                 driverTipPercentage:this.state.driverTipPercentage,
    //                 driverTipAmount:this.state.driverTipAmount,
    //                 taxAmount:this.state.taxAmount,
    //                 freeDeliveryCode:'',
    //                 isFreeDeliveryCodeApplied:false,
    //                 isScheduled:this.state.isScheduled,
    //                 scheduleDateTimeStart:this.state.scheduleDateTimeStart,
    //                 scheduleDateTimeEnd:this.state.scheduleDateTimeEnd,
    //                 userBillingAddressId:address._id,
    //                 address:address,
    //                 latitude:this.state.latitude,
    //                 longitude:this.state.longitude,
    //                 paymentType:'Online',
    //                 cardToken: this.state.stripeToken,
    //                 isFreeDeliveryReferral:this.props.data.isFreeDelivery
    //                 //isFromApp:1
    //             }
    //         }
    //     }else{
    //         if(type === 'savedCards'){
    //             body = {
    //                 products:products,
    //                 storeId:this.state.storeId,
    //                 driverInstructions:this.state.driverInstructions,
    //                 subTotalAmount:this.state.subTotalAmount,
    //                 needToSaveCard:this.state.saveCard,
    //                 netAmount:this.state.netAmount,
    //                 deliveryFee:this.state.deliveryFee,
    //                 driverTipPercentage:this.state.driverTipPercentage,
    //                 driverTipAmount:this.state.driverTipAmount,
    //                 taxAmount:this.state.taxAmount,
    //                 freeDeliveryCode:'',
    //                 isFreeDeliveryCodeApplied:false,
    //                 isScheduled:this.state.isScheduled,
    //                 scheduleDateTimeStart:this.state.scheduleDateTimeStart,
    //                 scheduleDateTimeEnd:this.state.scheduleDateTimeEnd,
    //                 userBillingAddressId:address._id,
    //                 address:address,
    //                 latitude:this.state.latitude,
    //                 longitude:this.state.longitude,
    //                 paymentType:'Online',
    //                 //cardToken: this.state.stripeToken
    //                 cardId: id
    //                 //isFromApp:1
    //             }
    //         }else{
    //             body = {
    //                 products:products,
    //                 storeId:this.state.storeId,
    //                 driverInstructions:this.state.driverInstructions,
    //                 subTotalAmount:this.state.subTotalAmount,
    //                 needToSaveCard:this.state.saveCard,
    //                 netAmount:this.state.netAmount,
    //                 deliveryFee:this.state.deliveryFee,
    //                 driverTipPercentage:this.state.driverTipPercentage,
    //                 driverTipAmount:this.state.driverTipAmount,
    //                 taxAmount:this.state.taxAmount,
    //                 freeDeliveryCode:'',
    //                 isFreeDeliveryCodeApplied:false,
    //                 isScheduled:this.state.isScheduled,
    //                 scheduleDateTimeStart:this.state.scheduleDateTimeStart,
    //                 scheduleDateTimeEnd:this.state.scheduleDateTimeEnd,
    //                 userBillingAddressId:address._id,
    //                 address:address,
    //                 latitude:this.state.latitude,
    //                 longitude:this.state.longitude,
    //                 paymentType:'Online',
    //                 cardToken: this.state.stripeToken,
    //                 deliveryTimeSlot:this.state.deliveryTimeSlot,
    //             // isFromApp:1
    //             }
    //         }
    //     }   
    //     //console.log('placeOrderCred', JSON.stringify(body))
    //         let res = await sendPostRequestWithAccessTokenAndBody(PLACE_ORDER, body,  global.accessToken);
    //         console.log('placeOrder', JSON.stringify(res))
    //         if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
             
    //             this.setState({isLoading:false},()=>{
    //                 this.setState({orderPlacedAlert:true},async()=>{
    //                    await this.props.deleteAll()
    //                     await this.props.setFreeDelivery()
    //                 })
    //             })
    //         }else{
    //             this.setState({isLoading:false})
    //         }
    // }


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
                                   Great! Your order has been placed!
                        </Text>
                        <TouchableOpacity onPress={()=>this.setState({orderPlacedAlert:false},()=>{
                            this.props.navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [
                                        { name: 'Home' },
                                    ],
                                })
                            );
                        })} 
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

  makeValidFormat(text){
    let newString = text
    if(newString.length===2 && !this.state.valid.includes('/')){
        newString = newString+'/'
    }
    this.setState({valid:newString})
   }
   

    stripeView(){
        return(
            <CardField
                    postalCodeEnabled={false}
                   // autofocus
                    placeholder={{
                        number: '4242 4242 4242 4242',
                    }}
                    cardStyle={{
                        backgroundColor: '#FFFFFF',
                        textColor: AppStyles.colorSet.mainTextColor,
                    }}
                    style={{
                        width: '100%',
                        height: 50,
                        marginVertical: 10,
                    }}
                    onCardChange={(cardDetails) => {
                        console.log('cardDetails', cardDetails);
                        if(cardDetails.complete){
                            this.setState({cardDetails, isCardValid:true})
                        }else{
                            this.setState({isCardValid:false})
                        }
                    }}
                    onFocus={(focusedField) => {
                        console.log('focusField', focusedField);
                    }}
            />
        ) 
    }
    render(){
        return(
            <SafeAreaView style={{flex:1, backgroundColor:'black'}}>
                <StatusBar barStyle={'light-content'}/>
                <WatermarkView/>
                {/* <StatusBarHeader props={this.props}/> */}
                {this.headerImage()}
                <KeyboardAvoidingView  
                        style={{flex:1,
                       }} 
                        behavior={Platform.OS=='ios'?'position':'height'}
                        enabled
                        keyboardVerticalOffset={Platform.OS=='ios'?20:30}>
                    <ScrollView  style={{height:'100%', marginBottom:20, }}>
                        {this.savedCardsView()}
                        <View style={{flex:1, padding:20, paddingTop:0}}>
                            <StripeProvider
                                publishableKey={testStripeKey}
                                >
            
                            {this.stripeView()}
                            </StripeProvider>
                            {/* <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:15, fontFamily:AppStyles.fontFamily.M_BOLD, fontSize:20}]}>
                                Add new method of payment
                            </Text>
                            <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:20}]}>
                                Card Number
                            </Text>
                            <View style={[AppStyles.styleSet.textInputView, {marginTop:12, 
                                    }]}>
                                <TextInput 
                                    ref={(rf) => {this.cardNumber = rf}}
                                    placeholder='Enter card number'
                                    maxLength={16}
                                    value={this.state.cardNumber}
                                    onChangeText={(text)=>this.setState({cardNumber:text})}
                                    placeholderTextColor={'#878787'}
                                    style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                />
                            </View>
                            <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:25}]}>
                                Valid Until (MM/YY)
                            </Text>
                            <View style={[AppStyles.styleSet.textInputView, {marginTop:12, 
                                    }]}>
                                <TextInput 
                                    ref={(rf) => {this.valid = rf}}
                                    placeholder='Enter card valid date'
                                    value={this.state.valid}
                                    onChangeText={(text)=>this.makeValidFormat(text)}
                                    placeholderTextColor={'#878787'}
                                    style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                />
                            </View>   
                            <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:25}]}>
                                CVV
                            </Text>
                            <View style={[AppStyles.styleSet.textInputView, {marginTop:12, 
                                    }]}>
                                <TextInput 
                                    ref={(rf) => {this.cvv = rf}}
                                    placeholder='Enter CVV number'
                                    value={this.state.cvv}
                                    maxLength={4}
                                    onChangeText={(text)=>this.setState({cvv:text})}
                                    placeholderTextColor={'#878787'}
                                    style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                />
                            </View>   
                            <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:25}]}>
                                Card Holder Name
                            </Text>
                            <View style={[AppStyles.styleSet.textInputView, {marginTop:12, 
                                    }]}>
                                <TextInput 
                                    ref={(rf) => {this.holderName = rf}}
                                    placeholder='Card Holder Name'
                                    value={this.state.holderName}
                                    onChangeText={(text)=>this.setState({holderName:text})}
                                    placeholderTextColor={'#878787'}
                                    style={[AppStyles.styleSet.textInputStyle,{flex:1,}]}
                                />
                            </View>   */}
                            <View style={{width:'100%', justifyContent:'space-between', flexDirection:'row', 
                                marginTop:25, alignItems:'center'}}>
                                    <Text style={[AppStyles.styleSet.textWithYellowColor,{flex:1, marginRight:10}]}>
                                            Save this card for future transaction
                                        </Text>
                                        <Switch
                                                value={this.state.saveCard}
                                                changeValueImmediately={true}
                                                activeText={''}
                                                backgroundActive={AppStyles.colorSet.mainTextColor}
                                                circleActiveColor={'black'}
                                                inActiveText={''}
                                                innerCircleStyle={{height:20, width:20, 
                                                    borderRadius:10, margin:8,
                                                justifyContent:'center', alignItems:'center'
                                                , 
                                            }}
                                            containerStyle={{ transform:[{ scaleX: .9 }, { scaleY: .9 }] }}
                                            onValueChange={(value)=>this.setState({saveCard:value})}
                                            
                                        />
                            </View> 
                        </View>
                        <View style={{width:'100%', paddingHorizontal:20}}>
                            <TouchableOpacity onPress={()=>this.validate()} style={[AppStyles.styleSet.viewWithYelloBackground, 
                                {marginBottom:75,}]}>
                                <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                    Pay
                                </Text>
                            </TouchableOpacity>
                        </View>
                        
                </ScrollView>
                
                </KeyboardAvoidingView>
                {/* {this.nullView()} */}
                {this.showRatingView()}
                {this.orderPlacedAlert()}
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
    setFreeDelivery
    }, dispatch)
);
  
export default connect(mapStateToProps, mapDispatchToProps)(Payment);