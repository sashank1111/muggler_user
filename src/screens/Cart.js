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
    FlatList
} from 'react-native'
import StatusBarHeader from "../components/StatusBarHeader";
import AppStyles from '../styles/AppStyles'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addToCart, removeFromCart, deleteFromCart, showLoginFirstAlert, showBackButton, navigateToCart} from '../redux/actions'
import { APPLY_COUPON_CODE, CHECK_SIZE_FOR_INVENTORY, GET_DELIVER_FEE, IMAGE_BASE_URL } from "../Utils/UrlClass";
import { sendPostRequestWithAccessTokenAndBody } from "../Utils/RestApiService";
import ShowLoader from '../components/ShowLoader'
import WatermarkView from "../components/WatermarkView";
import BackButton from "../components/BackButton";
import {logEvent} from '../Utils/AnalyticsUtils'
import ResponseAlert from "../components/ResponseAlert";
class Cart extends Component{
    constructor(props){
        super(props)
        this.state={
            subTotal:this.props.data.subTotal.toFixed(2),
            isLoading:true,
            deliveryFee:0,
            discount:0,
            taxes:0,
            totalAmount:0,
            couponCode:'',
            responseAlert:false,
            responseText:'',
            totalCartCount:this.props.data.totalCartCount,
            storeName:'',
            taxRate:''
            

        }
        this.props.navigation.addListener(
            'focus',
               payload => {
                this.props.navigateToCart('Home')
                if(this.props.data.cart.length>0){
                    this.getDeliveryFee()
                 }else{
                     this.setState({isLoading:false})
                 }
                    
                }
          );
    }

    componentDidMount(){
        logEvent('Cart_Page')
        if(this.props.data.cart.length>0){
           this.getDeliveryFee()
        }else{
            this.setState({isLoading:false})
        }
    }

    componentDidUpdate(){
        let props_data_totalCartCount = parseFloat(this.props.data.totalCartCount)
        let state_totalCartCount = parseFloat(this.state.totalCartCount)
        if(props_data_totalCartCount !== 0 && props_data_totalCartCount !== state_totalCartCount){
            let totalCartCount = props_data_totalCartCount
            this.setState({totalCartCount:totalCartCount, subTotal:this.props.data.subTotal},()=>this.calculateTaxes())
        }
    }

    async getDeliveryFee(){
        this.props.showBackButton(true)
        const credentials = {
            storeId:this.props.data.cart.length>0?this.props.data.cart[0].storeId._id:''
        }
        let res = await sendPostRequestWithAccessTokenAndBody(GET_DELIVER_FEE, credentials,  global.accessToken);
        //console.log('getDeliveryFee', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({deliveryFee:this.props.data.isFreeDelivery?0:res.response.userData[0].adminArea.fees,
                storeName:res.response.userData[0].title, taxRate:res.response.userData[0].taxRate},
                ()=>this.calculateTaxes())
           // console.log('cartgetStore', JSON.stringify(res.response.userData))
           
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    async applyCouponCode(){
        //this.setState({discount:12},()=>this.calculateTaxes())
        if(this.state.couponCode!==''){
            if(this.props.data.isLoggedIn){
                this.setState({isLoading:true})
                const credentials = {
                    code:this.state.couponCode
                }
                let res = await sendPostRequestWithAccessTokenAndBody(APPLY_COUPON_CODE, credentials,  global.accessToken);
                console.log('resCoupon', JSON.stringify(res))
                if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
                    if(res.response.userData[0].type === 1){
                        let discountPercentage = res.response.userData[0].discountPercentage/100
                        let discount = this.state.deliveryFee * discountPercentage
                        this.setState({discount:discount},()=>this.calculateTaxes())

                    }else{
                        this.setState({discount:res.response.userData[0].discountAmount},()=>this.calculateTaxes())
                    }
                    
                    
                }else{
                    this.setState({isLoading:false},()=>this.setState({responseText:res.response.status.customMessage, responseAlert:true}))
                }
            }else{
                this.props.showLoginFirstAlert(true)
                this.props.navigateToCart('Cart')
                this.props.navigation.navigate('Login')
            }
        }else{
            this.setState({responseText:'Please enter coupon code', responseAlert:true})
           // alert('Please enter coupon code')
        }
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
        console.log('q2', q2+' '+q1)
        let t = q1 * q2
        let q3 = q1 * 0.04
        let processingFees = q3 + 0.30
        let taxes = t
       // let taxes = t + processingFees
        console.log('taxes', taxes.toFixed(2))
       // let taxes = ((subTotal+ deliveryDiscount)* 0.1265)+ .3
       // console.log('taxes',taxes+' '+ subTotal+' '+deliveryDiscount+' '+this.state.deliveryFee+' '+ this.state.discount)
        this.setState({taxes:taxes.toFixed(2), subTotal:subTotal},()=>this.calculateTotal())
    }


    

    async calculateTotal(){
        let deliveryDiscount = this.state.deliveryFee
        if(this.state.discount>0 && this.state.deliveryFee>=this.state.discount){
            //console.log('firest', deliveryDiscount)
            deliveryDiscount = this.state.deliveryFee - parseFloat(this.state.discount)
        }else if(this.state.discount>0){
            deliveryDiscount = 0
        }
        let total = parseFloat(this.state.subTotal) + parseFloat(deliveryDiscount) + parseFloat(this.state.taxes)

        let q3 = total * 0.04
        console.log('totalBeforeprocessing fees', total+'   '+this.state.taxes)
        let processingFees = q3 + 0.30
        let taxes = parseFloat(this.state.taxes) + parseFloat(processingFees)
        total = total + parseFloat(processingFees)
       // let taxes = t + processingFees
        console.log('calculateTotal', total+' '+q3+' '+ processingFees+' '+taxes)
       // console.log('total', total)
        this.setState({totalAmount:total, taxes:taxes.toFixed(2)},()=>this.setState({isLoading:false}))
    }


    homeHeader(){
        return(
            <View style={{width:'100%',  paddingTop:10, paddingHorizontal:20,
                }}>
                <BackButton props={this.props}/>
                <Image 
                    resizeMode={'stretch'}
                    source={require('../../assets/cart-shape.png')} 
                    style={{ width:'100%', marginTop:15}}/>
            </View>
        )
    }

    couponView(){
        return(
            <View>
                <View style={{marginTop:30,}}>
                        <Text style={[AppStyles.styleSet.textWithYellowColor,{ marginTop:35, fontSize:16}]}>
                            HAVE A COUPON CODE?
                        </Text>
                        <View style={{flexDirection:'row',marginTop:16, width:'100%', alignItems:'center'}}>
                            <View style={[AppStyles.styleSet.textInputView, { flex:.7
                                }]}>
                                <TextInput 
                                    ref={(rf) => {this.couponCode = rf}}
                                    placeholder=''
                                    value={this.state.couponCode}
                                    onChangeText={(text)=>this.setState({couponCode:text})}
                                    placeholderTextColor={'#878787'}
                                    style={[AppStyles.styleSet.textInputStyle, ]}
                                />
                            </View> 
                            <TouchableOpacity onPress={()=>this.applyCouponCode()} style={[AppStyles.styleSet.viewWithYelloBackground, 
                                { flex:.3, marginLeft:15}]}>
                                <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                    APPLY
                                </Text>
                            </TouchableOpacity>
                        </View>  
                </View>
            </View>
        )
    }

    subTotalView(){
        let subTotal = parseFloat(this.props.data.subTotal).toFixed(2)
        let taxes = parseFloat(this.state.taxes).toFixed(2)
        let totalAmount = parseFloat(this.state.totalAmount).toFixed(2)
        return(
            <View style={{marginTop:25}}>
                <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:16}]}>
                    Free Delivery
                </Text>
                <View style={{marginTop:15, borderColor:AppStyles.colorSet.mainTextColor,
                    borderWidth:2, borderRadius:10, paddingVertical:15}}>
                        <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', paddingHorizontal:15}}>
                            <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                                Sub Total
                            </Text>
                            <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                                ${subTotal}
                            </Text>
                        </View>
                        <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', marginTop:15, paddingHorizontal:15}}>
                            <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                                Delivery Charge
                            </Text>
                            <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                                ${this.state.deliveryFee}
                            </Text>
                        </View>
                        <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', marginTop:15, paddingHorizontal:15}}>
                            <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                                Discount
                            </Text>
                            <Text style={[AppStyles.styleSet.textWithYellowColor,{color:this.state.discount>0?'grey':AppStyles.colorSet.mainTextColor}]}>
                                {this.state.discount>0?'- ':''}${this.state.discount}
                            </Text>
                        </View>
                        <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', marginTop:15, paddingHorizontal:15}}>
                            <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                                Taxes and fees
                            </Text>
                            <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                                ${taxes}
                            </Text>
                        </View>
                        <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', 
                        marginTop:15, borderTopColor:AppStyles.colorSet.mainTextColor, borderTopWidth:1, 
                        paddingHorizontal:15, paddingTop:15}}>
                            <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                                Total Amount
                            </Text>
                            <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                                ${totalAmount}
                            </Text>
                        </View>
                </View>

            </View>
        )
    }

    async checkInventory(itemData){
        //this.setState({isLoading:true})
        let credentials = {
            productId:itemData.productId,
            sizeId:itemData._id,
            storeId:itemData.storeId._id
        }
        let res = await sendPostRequestWithAccessTokenAndBody(CHECK_SIZE_FOR_INVENTORY, credentials,  global.accessToken);
        console.log('CHECK_SIZE_FOR_INVENTORY', JSON.stringify(credentials))
        //console.log('quantity', itemData.selectedItemData.quantityOfProductInCart<res.response.userData.quantity)
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
                if(itemData.quantityOfProductInCart < res.response.userData.quantity){
                    this.props.addToCart(itemData)
                }else{
                    let alertText = res.response.userData.quantity>1?'There are '+res.response.userData.quantity+' items left in stock':'There is '+res.response.userData.quantity+' item left in stock'
                    this.setState({responseText:alertText, responseAlert:true})
                            
                    
                }
                
            //this.setState({savedCards:res.response.userData},()=>this.setState({isLoading:false}))
           
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    itemView(item, index){
        return(
            <View style={{ padding:5, paddingBottom:20, flexDirection:'row', paddingTop:15,
                borderBottomColor:AppStyles.colorSet.mainTextColor, borderBottomWidth:1}}>
                <Image source={{uri:IMAGE_BASE_URL+item.image}} style={{height:70, width:50,}}/>
                <View style={{flex:1,paddingLeft:15, paddingBottom:5}}>
                    <View style={{paddingTop:10, flexDirection:'row',
                    alignItems:'center', flex:1, justifyContent:'space-between',}}>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor,{flex:1}]}>
                            {item.title}
                        </Text>
                        <TouchableOpacity onPress={async()=>{
                             await this.calculateTaxes()
                             this.props.deleteFromCart(item)
                            }}>
                            <Image resizeMode={'contain'} source={require('../../assets/trash-white.png')} 
                            style={{height:14, width:14}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection:'row',
                    alignItems:'center', flex:1, justifyContent:'space-between', marginTop:5}}>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:16}]}>
                           ${item.finalPrice}
                        </Text>
                        <View style={{flexDirection:'row',  alignItems:'center', }}>
                            <TouchableOpacity onPress={()=>{
                                if(item.hasOwnProperty('quantityOfProductInCart')&&item.quantityOfProductInCart>0){
                                    this.props.removeFromCart(item)
                                }}}>
                                <Image source={require('../../assets/minus-white.png')} style={{height:16, width:16}}/>
                            </TouchableOpacity>
                            <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:14, marginHorizontal:5}]}>
                                {item.quantityOfProductInCart}
                            </Text>
                            <TouchableOpacity onPress={()=> this.checkInventory(item)}>
                                <Image source={require('../../assets/plus-white.png')} style={{height:16, width:16}}/>
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:16, }]}>
                                {item.attributeValue+' '+item.attributeId.title}
                            </Text>
                           {/* <Image style={{height:16, width:16, backgroundColor:'red'}}/> */}
                        </View>
                    </View>
                </View>

            </View>
        )
    }

    nullView(){
        if(this.props.data.cart.length===0){
            return(
                <ScrollView>
                    <View style={{flex:1, alignItems:'center', justifyContent:'space-between', paddingHorizontal:20}}>
                        <View style={{alignItems:'center'}}>
                        <Image resizeMode={'contain'} source={require('../../assets/empty-cart-vector.png')} 
                        style={{height:350, width:300, marginTop:70}}/>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor,{
                                fontSize:23, fontFamily:AppStyles.fontFamily.M_BOLD, marginTop:30}]}>
                                Your Cart is Empty
                            </Text>
                        </View>
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate('Home')} 
                        style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:35, }]}>
                            <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                CONTINUE SHOPPING
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )
        }
    }


    render(){
        return(
            <SafeAreaView style={{flex:1, backgroundColor:'black'}}>
                <StatusBar barStyle={'light-content'}/>
                <WatermarkView/>
                {/* <StatusBarHeader props={this.props}/> */}
                {this.homeHeader()}
                {this.props.data.cart.length>0 && <ScrollView style={{flex:1}}>
                    <View style={{ padding:20}}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontSize:16, color:'grey', }]}>
                        Purchased from and delivered by:
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor, 
                        {fontSize:16, color:'grey', fontFamily:AppStyles.fontFamily.M_BOLD, marginBottom:15}]}>
                        {this.state.storeName}
                    </Text>
                      <FlatList
                            data={this.props.data.cart}
                            style={{}}
                            renderItem={({ item, index }) => (
                            this.itemView(item, index)
                            )}
                            keyExtractor={item => item._id}
                      />
                      {this.couponView()}
                      {this.subTotalView()}
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate('Checkout',{
                            storeId:this.props.data.cart[0].storeId._id,
                            discount:this.state.discount
                        })} style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:35, }]}>
                            <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                NEXT
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate('Home')}>
                            <Text style={[AppStyles.styleSet.textWithYellowColor, 
                                { marginTop:20, alignSelf:'center'}]}>
                                Continue Shopping
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>}
                {this.nullView()}
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
    showLoginFirstAlert,
    showBackButton,
    navigateToCart
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Cart);