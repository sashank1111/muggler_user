import React, { Component } from "react";
import { 
    View,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Image,
    Text,
    TouchableOpacity,
    FlatList,
    Touchable,
    Modal
    } from 'react-native'
import ShowLoader from "../components/ShowLoader";
import StatusBarHeader from "../components/StatusBarHeader";
import AppStyles from '../styles/AppStyles'
import { sendPostRequestWithAccessTokenAndBody } from "../Utils/RestApiService";
import { GET_PRODUCT_DETAIL, IMAGE_BASE_URL } from "../Utils/UrlClass";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addToCart, removeFromCart, showStoreAlert, showBackButton} from '../redux/actions'
import WatermarkView from "../components/WatermarkView";
import BackButton from "../components/BackButton";
import {logEvent} from '../Utils/AnalyticsUtils'
import ResponseAlert from "../components/ResponseAlert";

const alertText = "By choosing this product, you'll be limited to shopping from this store until you clear your cart. Clear your cart to see other stores products."
const sendFirst = "While you’re shopping and checking out, enter the delivery address of whoever the item is going to. Also, enter the phone number of whoever is receiving the gift in the notes for your driver so they can be contacted upon delivery if necessary."
const sendSecond = "If you’d like to attach a note to your order, type “Add this note:” and then your message in the notes for your driver. You can also call/text your driver to let them know your message or the recipients phone number. Please keep your note under 300 characters."
const sendThird = "Choose a delivery time where you know that who you are sending it to is home for certain. If you end up needing to reschedule at any time prior to delivery, feel free to text your driver to arrange a better time."

const noProductText = "Sorry, your selected product is not available at this location, please choose another location or product."

class ProductDetails extends Component{
    constructor(props){
        super(props)
        this.state={
            isLoading:true,
            data:'',
            productId:this.props.route.params.productId,
            storeId:this.props.route.params.storeId,
            similarData:'',
            quantityArray:[],
            showDropdownView:false,
            dropDownData:[],
            selectedIndex:0,
            showStoreAlert:false,
            selectedItemData:'',
            showGiftAlert:false,
            itemViewImageUrl:'',
            itemViewTitle:'',
            stateToCheckAddress:'',
            noProductAlert:false,
            responseAlert:false,
            responseText:'',
            totalQuantity:''

        }
    }

    componentDidMount(){
        logEvent('Product_Details_Page')
        this.getProductDetails()
    }

    componentDidUpdate(){
        if(this.props.data.address !=='' && (this.props.data.address !== this.state.stateToCheckAddress)){
            this.setState({stateToCheckAddress:this.props.data.address},async()=>{
                await this.getProductDetails()
            })
        }
    }

    noProductAlert(){
        return(
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={this.state.noProductAlert}
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
                        <TouchableOpacity onPress={()=>this.setState({noProductAlert:false})}>
                            <Image source={require('../../assets/close_yellow.png')} 
                            style={{height:25, width:25, alignSelf:'flex-end'}}/>
                        </TouchableOpacity>
                        
                        <Text style={{color:AppStyles.colorSet.mainTextColor, fontFamily:AppStyles.fontFamily.M_BOLD,
                               fontSize:25, textAlign:'center', marginTop:33}}>
                                   No Product!
                        </Text>
                        <Text style={{color:AppStyles.colorSet.mainTextColor, fontFamily:AppStyles.fontFamily.M_SEMIBOLD,
                               fontSize:20, textAlign:'center', marginTop:33}}>
                                  {noProductText}
                        </Text>
                        <TouchableOpacity onPress={()=>this.setState({noProductAlert:false})} 
                        style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:25, width:85, borderRadius:30, alignSelf:'center'}]}>
                            <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                GOT IT
                            </Text>
                       </TouchableOpacity>
                        

                    </View>
                </View>
            </Modal>
        )
  }


    

    async getProductDetails(){
        this.props.showBackButton(true)
        const credentials = {
            productId: this.state.productId, 
            storeId:this.state.storeId,
            latitude:this.props.data.latitude,
            longitude:this.props.data.longitude,
            isAddressSelected:this.props.data.address!==''?true:false
        }
        let res = await sendPostRequestWithAccessTokenAndBody(GET_PRODUCT_DETAIL, credentials,  global.accessToken);
        console.log('resProductDetail', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            // this.setState({data:res.response.proData[0], similarData:res.response.similarProData,
            //       dropDownData:res.response.proData[0].allSizes},()=>{
            //       this.setState({isLoading:false})
            // })
            if(res.response.proData.length===0){
                this.setState({proData:[], data:[], similarData:[], dropDownData:[], itemViewImageUrl:''}
                ,()=>this.setState({isLoading:false},()=>this.setState({noProductAlert:true})))
            }else{
                await this.checkSingleCartProduct(res.response.proData[0], '')
                await this.checkCartProducts(res.response.similarProData, 'similar', this.state.data)
                this.setState({
                    dropDownData:res.response.proData[0].allSizes,
                    totalQuantity:res.response.proData[0].allSizes[0].quantity
                },()=>this.setState({isLoading:false}))
            }
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    async checkSingleCartProduct(_data, type){
        let data = _data
        if(this.props.data.cart.length>0){
            for(let i = 0; i < this.props.data.cart.length; i++){
                for(let j = 0; j < data.allSizes.length; j++){
                    if(data.allSizes[j]._id === this.props.data.cart[i]._id){
                        data.allSizes[j] = this.props.data.cart[i]
                    }
                    // if(data.allSizes[0]._id === this.props.data.cart[i]._id){
                    //     data.allSizes[0] = this.props.data.cart[i]
                    //     break;
                    // }
                }
            }
        }
        switch (type){
            case 'similar':
            this.setState({similarData:data})
            break;
            default :
            this.setState({data:data},()=>this.setState({itemViewImageUrl:data.allSizes[0].image, itemView:data.title}))
            break;
        }
       // this.setState({isLoading:false})
    }

    async checkCartProducts(_data, type, proData){
        //console.log('checkCartProducts', JSON.stringify(_data))
        let data = _data
        if(this.props.data.cart.length>0 && data.length>0){
            for(let i = 0; i < data.length; i++){
                for(let j = 0; j < this.props.data.cart.length; j++){
                    if(data[i]._id === this.props.data.cart[j]._id && data[i].allSizes[0]._id === this.props.data.cart[j].allSizes[0]._id){
                        data[i].quantityOfProductInCart=this.props.data.cart[j].quantityOfProductInCart
                        // data.splice(i, 1)
                        // data.splice(i, 0, this.props.data.cart[j])
                    }else{
                    }
                }
            }
        }
        switch (type){
            case 'similar':
            let d = [proData] 
            for(let i=0; i<data.length; i++){
                d.push(data[i])
            }   
            this.setState({similarData:d})
            break;
            default :
            this.setState({data:data})
            break;
        }
       // this.setState({isLoading:false})
    }

    showDropdownView(){
       // if(this.state.showDropdownView){
            return(
                <View style={{width:'100%', marginTop:10}}>
                    <FlatList
                        data={this.state.dropDownData}
                        style={{}}
                        renderItem={({ item, index }) => (
                            this.dropDownItemView(item, index)
                        )}
                        keyExtractor={item => item._id}
                    />
                    
                </View>
            )
       // }{item.attributeId.title}'
    }
    dropDownItemView(item, index){
        if(item.quantity !== 0){
            return( 
                <TouchableOpacity onPress={()=>this.setState({selectedIndex:index})} 
                style={{padding:5, paddingLeft:0,  borderBottomColor:'black',
                    borderBottomWidth:1, flexDirection:'row',  alignItems:'center'}}>
                    <Image 
                        resizeMode={'contain'}
                        source={index===this.state.selectedIndex?require('../../assets/check-active.png'):
                        require('../../assets/check-inactive.png')}
                        style={{height:20, width:20}}/>   
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,
                        {fontFamily:AppStyles.fontFamily.M_BOLD, marginLeft:15, fontSize:14}]}>
                        {item.attributeValue} {item.attributeId.title}
                    </Text>
                </TouchableOpacity>
            )
        }
        
    }


    itemView(){
        //let uri = IMAGE_BASE_URL+this.state.itemViewImageUrl
        let uri = IMAGE_BASE_URL+this.state.data.allSizes[this.state.selectedIndex].image
        return(
            <View style={{ width:'100%', marginTop:10, 
                padding:20,}}>
                <View style={{flex:1}}>
                    <View style={{height:270, width:'100%',}}>
                        <Image resizeMode={'contain'} source={{uri:uri}} style={{flex:1}}/>
                    </View>
                    <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:25, marginTop:10, 
                        fontFamily:AppStyles.fontFamily.M_BOLD,}}>
                        {this.state.itemViewTitle}
                    </Text>
                    {/* <Text numberOfLines={1} style={{color:'grey', fontSize:16, marginTop:10, 
                        fontFamily:AppStyles.fontFamily.M_BOLD,}}>
                        {this.state.data.hasOwnProperty('storeId')?this.state.data.storeId.title:''}
                    </Text> */}
                   {this.state.data !== '' && <View style={{width:'100%', flexDirection:'row',  alignItems:'center', marginTop:20}}>
                       {this.state.data!=='' && <Text style={{color:'white', fontSize:16, fontFamily:AppStyles.fontFamily.M_BOLD}}>
                                {this.state.data.hasOwnProperty('allSizes')?'$'+this.state.data.allSizes[this.state.selectedIndex].finalPrice:''}
                        </Text>}
                        {/* <Text style={{color:'white', fontSize:16, fontFamily:AppStyles.fontFamily.M_BOLD}}>
                                119.99
                        </Text> */}
                    </View>}
                    <View style={{width:'100%',  }}>
                            {/* <TouchableOpacity onPress={()=>this.setState({showDropdownView:!this.state.showDropdownView})} style={{flexDirection:'row'
                                }}>
                                    <Text style={{color:'white', fontSize:14, alignSelf:'center',
                                        fontFamily:AppStyles.fontFamily.M_BOLD, width:70}}>
                                            {this.state.data.hasOwnProperty('allSizes')?
                                            this.state.data.allSizes[this.state.selectedIndex].attributeValue+' '+this.state.data.allSizes[this.state.selectedIndex].attributeId.title
                                            :''}
                                    </Text>
                                    <Image resizeMode={'contain'} source={require('../../assets/down-arrow-white.png')} 
                                    style={{height:16, width:16, marginLeft:12}}/>
                            </TouchableOpacity> */}
                            {this.showDropdownView()}
                        {/* <TouchableOpacity onPress={()=>{
                         if(this.state.data.hasOwnProperty('quantityOfProductInCart')&&this.state.data.quantityOfProductInCart>0){
                            this.props.removeFromCart(this.state.data)
                         }}} style={{marginLeft:15}}>
                            <Image source={require('../../assets/minus.png')} style={{height:18, width:18}}/>
                        </TouchableOpacity>
                        <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, marginHorizontal:5, 
                            fontFamily:AppStyles.fontFamily.M_SEMIBOLD,}}>
                            {this.state.data.hasOwnProperty('quantityOfProductInCart')?this.state.data.quantityOfProductInCart:0}
                        </Text>
                        <TouchableOpacity  onPress={()=> this.props.addToCart(this.state.data)}>
                            <Image source={require('../../assets/add.png')} style={{height:18, width:18}}/>
                        </TouchableOpacity> */}
                     </View>
                     {this.state.data.onSale && <View style={{marginTop:17, flexDirection:'row', alignItems:'center'}}>
                         <Image source={require('../../assets/tag.png')} style={{height:18, width:18,}}/>
                         <Text style={[AppStyles.styleSet.textWithYellowColor,{marginLeft:15, fontSize:16}]}>
                             On-Sale
                         </Text>
                     </View>}
                    {this.state.data.length>0 && <TouchableOpacity onPress={()=>this.setState({showGiftAlert:true})} style={{marginTop:17, flexDirection:'row', alignItems:'center'}}>
                         <Image source={require('../../assets/gift.png')} style={{height:18, width:18,}}/>
                         <Text style={[AppStyles.styleSet.textWithYellowColor,{marginLeft:15, fontSize:16}]}>
                             Sending this as gift?
                         </Text>
                     </TouchableOpacity>}
                </View>
                
                
            </View>
        )
    }

    detailView(){
        if(this.state.data !== ''){
            if(this.state.data.hasOwnProperty('description') && this.state.data.description !==''){
                return(
                    <View style={{padding:10, }}>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor]}>
                            Details
                        </Text>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor,{marginTop:15, fontSize:16}]}>
                            {this.state.data.description}
                        </Text>
                    </View>
                )
            }
        }
    }

    chooseStoreView(){
        return(
            <View style={{padding:10,  marginTop:10, flex:1}}>
                {this.state.data.length>0 && <Text style={[AppStyles.styleSet.textWithYellowColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                    Choose from these stores
                </Text>}
                <View style={{marginTop:15}}>
                    <FlatList
                        data={this.state.similarData}
                        style={{flex:1}}
                        renderItem={({ item, index }) => (
                        this.chooseItemView(item, index)
                        )}
                        keyExtractor={item => item._id}
                    />
                </View>

            </View>
        )
    }

    changeProduct(item){
        this.setState({productId:item.productId, storeId:item.storeId._id, selectedIndex:0, isLoading:true},
            ()=>this.getProductDetails())
    }

    unChooseItemView(item, index){
        let _day = new Date()
        if(this.props.data.cart.length === 0 || (this.props.data.cart.length > 0 && this.props.data.cart[0].storeId._id === item.storeId._id)){
            return(
                <TouchableOpacity onPress={()=>this.changeProduct(item)} style={[AppStyles.styleSet.viewWithYelloBorder, {padding:10, alignItems:'flex-start', height:'auto', 
                borderRadius:10, marginTop:10, borderColor:'grey', opacity:.7}]}>
                    <View style={{width:'100%', justifyContent:'space-between', flexDirection:'row'}}>
                        <Text style={[AppStyles.styleSet.textWithYellowColor,{ fontSize:16,
                        fontSize:16, color:'white', opacity:0.7}]}>
                            {item.storeId.title}
                        </Text>
                        {/* {<Text style={[AppStyles.styleSet.textWithWhiteColor,{marginLeft:15, fontSize:16,
                        fontSize:16, color:'white', opacity:0.7}]}>
                            ${item.allSizes[0].finalPrice}
                        </Text>} */}
                    </View>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,{ fontSize:14,
                        marginTop:10, color:'white', opacity:0.5}]}>
                            Open: {item.storeId.timeSlots[_day.getDay()].openTime} - {item.storeId.timeSlots[_day.getDay()].closeTime}
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,{ fontSize:14,
                        marginTop:10, color:'white', opacity:0.5}]}>
                        Under an hour delivery
                    </Text>
                    <TouchableOpacity  
                            style={[AppStyles.styleSet.viewWithYelloBackground, {height:35, flex:1, marginTop:15, backgroundColor:'grey'}]}>
                                <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:14, fontFamily:AppStyles.colorSet.M_BOLD}]}>
                                    Check the different prices and sizes at this store
                                </Text>
                            </TouchableOpacity>
                </TouchableOpacity>
            )
        }
    }

    async checkInventory(itemData, type){
        switch (type){
            case 'storeAlert':
                if(itemData.selectedItemData.quantityOfProductInCart < this.state.totalQuantity){
                    this.props.showStoreAlert(itemData)
                }else{
                    let alertText = this.state.totalQuantity>1?'There are '+this.state.totalQuantity+' items left in stock':'There is '+this.state.totalQuantity+' item left in stock'
                    this.setState({responseText:alertText, responseAlert:true})
                }
            break;
            case 'addToCart':
                if(itemData.quantityOfProductInCart < this.state.totalQuantity){
                    this.props.addToCart(itemData)
                }else{
                    let alertText = this.state.totalQuantity>1?'There are '+this.state.totalQuantity+' items left in stock':'There is '+this.state.totalQuantity+' item left in stock'
                    this.setState({responseText:alertText, responseAlert:true})
                }
            break;
            default :
            break;    

        }
    }
    

    chooseItemView(item ,index){
        let _day = new Date()
       // console.log('detailItem', JSON.stringify(this.state.similarData))
        if(index === 0){
            return(
            <TouchableOpacity onPress={()=>this.changeProduct(item)} style={[AppStyles.styleSet.viewWithYelloBorder, {padding:10, alignItems:'flex-start', height:'auto', 
                borderRadius:10}]}>
                    <View style={{width:'100%', justifyContent:'space-between', flexDirection:'row'}}>
                        <Text style={[AppStyles.styleSet.textWithYellowColor,{ fontSize:16,
                        fontSize:16, flex:1}]}>
                            {item.storeId.title}
                        </Text>
                       {this.state.data !== '' && <Text style={[AppStyles.styleSet.textWithWhiteColor,{marginLeft:15, fontSize:16,
                        fontSize:16}]}>
                            {this.state.data.hasOwnProperty('allSizes')?'$'+this.state.data.allSizes[this.state.selectedIndex].finalPrice:''}
                        </Text>}
                    </View>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,{ fontSize:14,
                        marginTop:10}]}>
                            Open: {item.storeId.timeSlots[_day.getDay()].openTime} - {item.storeId.timeSlots[_day.getDay()].closeTime}
                    </Text>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,{ fontSize:14,
                        marginTop:10}]}>
                        Under an hour delivery
                    </Text>
                    <View style={{flexDirection:'row', marginTop:25, alignItems:'center'}}>
                        <TouchableOpacity 
                        onPress={()=>{
                            if(item.allSizes[this.state.selectedIndex].hasOwnProperty('quantityOfProductInCart')&&item.allSizes[this.state.selectedIndex].quantityOfProductInCart>0){
                                let data = item.allSizes[this.state.selectedIndex]
                                data.isOnAnotherStore = item.isOnAnotherStore
                                data.title = item.title
                                data.image = item.allSizes[this.state.selectedIndex].image
                                data.storeId = item.storeId
                                data.productId = item.productId
                                this.props.removeFromCart(data)
                            }}}>
                            <Image source={require('../../assets/minus.png')} style={{height:16, width:16}}/>
                        </TouchableOpacity>
                        <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, marginHorizontal:5, 
                            fontFamily:AppStyles.fontFamily.M_SEMIBOLD,}}>
                            {item.allSizes[this.state.selectedIndex].hasOwnProperty('quantityOfProductInCart')?item.allSizes[this.state.selectedIndex].quantityOfProductInCart:0}
                        </Text>
                        <TouchableOpacity onPress={async()=> {
                            if(this.props.data.address===''){
                                let data = item.allSizes[this.state.selectedIndex]
                                data.isOnAnotherStore = item.isOnAnotherStore
                                data.title = item.title
                                data.image = item.allSizes[this.state.selectedIndex].image
                                data.storeId = item.storeId
                                data.productId = item.productId
                                data.showAreaText = true
                                this.props.addToCart(data)
                            }
                            else if(this.props.data.cart.length===0){
                                    let data = item.allSizes[this.state.selectedIndex]
                                    data.isOnAnotherStore = item.isOnAnotherStore
                                    data.title = item.title
                                    data.image = item.allSizes[this.state.selectedIndex].image
                                    data.storeId = item.storeId
                                    data.productId = item.productId
                                    data.quantityOfProductInCart = item.allSizes[0].hasOwnProperty('quantityOfProductInCart')?item.allSizes[0].quantityOfProductInCart:0
                                    let d = {value:true, selectedItemData:data}
                                    await this.checkInventory(d, 'storeAlert')
                                }
                            else{
                                let data = item.allSizes[this.state.selectedIndex]
                                data.isOnAnotherStore = item.isOnAnotherStore
                                data.title = item.title
                                data.image = item.allSizes[this.state.selectedIndex].image
                                data.storeId = item.storeId
                                data.quantityOfProductInCart = item.allSizes[0].hasOwnProperty('quantityOfProductInCart')?item.allSizes[0].quantityOfProductInCart:0
                                data.productId = item.productId
                                await this.checkInventory(data, 'addToCart')
                            }
                            }}>
                            <Image source={require('../../assets/add.png')} style={{height:16, width:16}}/>
                        </TouchableOpacity>
                        <TouchableOpacity  
                        onPress={async()=>  {
                            if(this.props.data.address===''){
                                let data = item.allSizes[this.state.selectedIndex]
                                data.isOnAnotherStore = item.isOnAnotherStore
                                data.title = item.title
                                data.image = item.allSizes[this.state.selectedIndex].image
                                data.storeId = item.storeId
                                data.productId = item.productId
                                data.showAreaText = true
                                this.props.addToCart(data)
                            }
                            else if(this.props.data.cart.length===0){
                                let data = item.allSizes[this.state.selectedIndex]
                                data.isOnAnotherStore = item.isOnAnotherStore
                                data.title = item.title
                                data.image = item.allSizes[this.state.selectedIndex].image
                                data.storeId = item.storeId
                                data.productId = item.productId
                                data.quantityOfProductInCart = item.allSizes[0].hasOwnProperty('quantityOfProductInCart')?item.allSizes[0].quantityOfProductInCart:0
                                let d = {value:true, selectedItemData:data}
                                await this.checkInventory(d, 'storeAlert')
                            }
                            else{
                                let data = item.allSizes[this.state.selectedIndex]
                                data.isOnAnotherStore = item.isOnAnotherStore
                                data.title = item.title
                                data.image = item.allSizes[this.state.selectedIndex].image
                                data.storeId = item.storeId
                                data.quantityOfProductInCart = item.allSizes[0].hasOwnProperty('quantityOfProductInCart')?item.allSizes[0].quantityOfProductInCart:0
                                data.productId = item.productId
                                await this.checkInventory(data, 'addToCart')
                            }
                        }}
                        disabled={item.allSizes[this.state.selectedIndex].hasOwnProperty('quantityOfProductInCart')&&item.allSizes[this.state.selectedIndex].quantityOfProductInCart>0}
                        style={[AppStyles.styleSet.viewWithYelloBackground, {height:35, flex:1, marginLeft:15}]}>
                            <Text style={AppStyles.styleSet.textWithWhiteColor}>
                                {item.allSizes[this.state.selectedIndex].hasOwnProperty('quantityOfProductInCart')&&item.allSizes[this.state.selectedIndex].quantityOfProductInCart>0?'In Your Cart!':'Add to cart'}
                            </Text>
                        </TouchableOpacity>
                    </View>

            </TouchableOpacity>
            )
        }else{
            return(
                this.unChooseItemView(item, index)
            )
        }
    }


  showGiftAlert(){
    return(
        <Modal
            animationType={'fade'}
            transparent={true}
            visible={this.state.showGiftAlert}
            onRequestClose={() => {
                console.log('Modal has been closed.');
            }}>
        
            <View style={{ flexDirection:"column", position:'absolute',
            height:'100%', width:'100%', alignItems:'center', justifyContent:'center',
            backgroundColor:"transparent", opacity:1.5}}>
                <View style={{backgroundColor:'#000000',opacity:0.7,
                    height:'100%', width:'100%', justifyContent:'center',
                    position:'absolute', alignSelf:'center'}}>
                </View>
                <View style={{ width:'93%', alignSelf:'center',
                borderColor:AppStyles.colorSet.mainThemeForegroundColor, 
                borderWidth:2, borderRadius:10, zIndex:999, padding:10, 
                backgroundColor:'black', opacity:1, paddingBottom:30, maxHeight:'75%'}}>
                    <ScrollView style={{}}>
                    <TouchableOpacity onPress={()=>this.setState({showGiftAlert:false})}>
                        <Image source={require('../../assets/close_yellow.png')} 
                        style={{height:25, width:25, alignSelf:'flex-end'}}/>
                    </TouchableOpacity>
                    <Text style={[AppStyles.styleSet.textWithYellowColor, 
                        {fontFamily:AppStyles.fontFamily.M_BOLD, textAlign:'center', fontSize:20}]}>
                        Send it to a friend!
                    </Text>
                    <Text style={{color:AppStyles.colorSet.mainTextColor, fontFamily:AppStyles.fontFamily.M_SEMIBOLD,
                           fontSize:16,  marginTop:15, }}>
                               {sendFirst}
                    </Text>
                    <Text style={{color:AppStyles.colorSet.mainTextColor, fontFamily:AppStyles.fontFamily.M_SEMIBOLD,
                           fontSize:16,  marginTop:15,}}>
                               {sendSecond}
                    </Text>
                    <Text style={{color:AppStyles.colorSet.mainTextColor, fontFamily:AppStyles.fontFamily.M_SEMIBOLD,
                           fontSize:16,  marginTop:15, }}>
                               {sendThird}
                    </Text>
                   
                    <View style={{flexDirection:'row',marginTop:35, justifyContent:'center', width:'100%'}}>
                       
                        <TouchableOpacity onPress={()=>this.setState({showGiftAlert:false})}
                            style={{width:115, padding:7, borderRadius:25, backgroundColor:AppStyles.colorSet.mainTextColor, alignItems:'center',
                                borderWidth:2, borderColor:AppStyles.colorSet.mainTextColor, marginLeft:20}}>
                                <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                    GOT IT
                                </Text>
                        </TouchableOpacity>
                   </View>
                   </ScrollView>
                    

                </View>
            </View>
        </Modal>
    )
}
    


    render(){
        return(
            <SafeAreaView style={{flex:1, backgroundColor:'black'}}>
                <StatusBar barStyle={'light-content'}/>
                <WatermarkView/>
                {/* <StatusBarHeader props={this.props}/> */}
                <View style={{width:'100%', 
                  paddingHorizontal:20, paddingTop:10}}>
                    {/* <TouchableOpacity onPress={()=>this.props.navigation.goBack()}>
                        <Image resizeMode={'contain'} 
                        source={require('../../assets/back-arrow.png')} 
                        style={{height:25, width:25, }}/>
                    </TouchableOpacity> */}
                    <BackButton props={this.props}/>
                    <Image 
                        resizeMode={'contain'}
                        source={require('../../assets/product-shape.png')} 
                        style={{height:30, width:'100%', alignSelf:'center',marginTop:15}}/>
                </View>
                <ScrollView keyboardShouldPersistTaps={'handled'}>
                    {this.state.data!=='' && this.state.data !== null && <View style={{flex:1}}>
                        {this.itemView()}   
                        {this.detailView()} 
                        {this.chooseStoreView()}
                    </View>}
                </ScrollView>
                {/* {this.showStoreAlert()} */}
                {this.showGiftAlert()}
                {this.noProductAlert()}
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
    showStoreAlert,
    showBackButton
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetails);