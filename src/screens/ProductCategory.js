import React,{Component, PureComponent} from 'react'
import {
    View,
    SafeAreaView,
    StatusBar,
    Image,
    Text,
    TextInput,
    ImageBackground,
    FlatList,
    ScrollView,
    TouchableOpacity,
    Touchable,
    Platform
} from 'react-native'
import ShowLoader from '../components/ShowLoader'
import StatusBarHeader from '../components/StatusBarHeader'
import AppStyles from '../styles/AppStyles'
import { sendPostRequestWithAccessToken, sendPostRequestWithAccessTokenAndBody } from '../Utils/RestApiService'
import { CHECK_SIZE_FOR_INVENTORY, GET_CATEGORY_DATA, GET_DATA_CATEGORY_WISE, GET_FILTER_DATA, GET_HOME_SCREEN_DATA, IMAGE_BASE_URL } from '../Utils/UrlClass'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addToCart, removeFromCart, showBackButton, showStoreAlert} from '../redux/actions'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import WatermarkView from '../components/WatermarkView'
import BackButton from '../components/BackButton'
import { IndicatorViewPager, PagerDotIndicator} from 'react-native-best-viewpager'
import {logEvent} from '../Utils/AnalyticsUtils'
import ResponseAlert from '../components/ResponseAlert'


const keyExtractor = (item) => item._id
const keyGenerator = (item) => '_' + Math.random().toString(36).substr(2, 9) + item._id
const data = ['Wine', 'Beer', 'Liquor', 'Seltzer', 'Mixers']
const dataImages = [require('../../assets/wine.png'), 
                    require('../../assets/beer.png'),
                    require('../../assets/liquor.png'),
                    require('../../assets/Seltzer.png'),
                    require('../../assets/mixers.png')]
                    var scope = ''
class ProductCategory extends Component{
    constructor(props){
        super(props)
        this.state={
            isLoading:true,
            data:'',
            beerData:'',
            liquorData:'',
            searchAddressText:'',
            itemId:this.props.route.params.itemId,
            type:this.props.route.params.type,
            subCategoryId:[],
            brandIds:[],
            containerIds:[],
            countryIds:[],
            storeIds:[],
            subCategoryTypesIds:[],
            sortBy:[],
            priceFilter:[],
            tagIds:[],
            bannerData:[],
            cartLength:this.props.data.cart.length,
            stateToCheckAddress:this.props.data.address,
            responseAlert:false,
            responseText:'',
            pageNumber:0,
            needMorePagination:true,
            enableBannerClick:true
            
        }
        this.props.navigation.addListener(
            'focus',
               payload => {
                   if(payload !== undefined && this.props.route.params.liquorArray !== undefined && this.props.route.params.liquorArray !== '' && this.state.type !=='SearchView'){
                   // alert(this.props.route.params.liquorArray)
                   // console.log('payloadProps', JSON.stringify(this.props.route.params))
                    //console.log('productCategoryItemPayload', JSON.stringify(this.props.route.params.sortArray))
                    {   this.setState({pageNumber:0},()=>
                        this.applyFilter(this.props.route.params.liquorArray,
                        this.props.route.params.containerArray, this.props.route.params.brandArray,
                        this.props.route.params.countryArray, this.props.route.params.storeArray,
                        this.props.route.params.varietyArray, this.props.route.params.sortArray,
                        this.props.route.params.priceArray, this.props.route.params.tagsArray,))
                    }   
                   }else if(this.state.type !=='SearchView'){
                    this.getHomeScreenData(this.state.subCategoryId, this.state.containerIds,
                        this.state.brandIds, this.state.countryIds, this.state.storeIds, this.state.subCategoryTypesIds,
                        this.state.sortBy, this.state.priceFilter, this.state.tagIds
                        )
                   }
               }
          );

          this.navigateToProductDetails = this.navigateToProductDetails.bind(this)
          this.addToCart = this.addToCart.bind(this)
          this.removeFromCart = this.removeFromCart.bind(this)
          this.showStoreAlert = this.showStoreAlert.bind(this)
          this.showResponseAlert = this.showResponseAlert.bind(this)
    }

    async componentDidMount(){
        scope = this
        logEvent('Category_Page')
        if(this.state.type !== 'SearchView'){
            await this.getFilterData()
            this.getHomeScreenData(this.state.subCategoryId, this.state.containerIds,
                this.state.brandIds, this.state.countryIds, this.state.storeIds, this.state.subCategoryTypesIds,
                this.state.sortBy, this.state.priceFilter, this.state.tagIds
                )
        }else{
            this.getSearchData()
        }
    }

    getSearchData(){
       // console.log('searchdta', this.props.route.params.item)
        this.setState({data:this.props.route.params.item},()=> this.setState({isLoading:false}))

    }

    componentDidUpdate(){
        if(this.props.data.address !=='' && (this.props.data.address !== this.state.stateToCheckAddress)){
            this.setState({stateToCheckAddress:this.props.data.address},async()=>{
                await this.getHomeScreenData(this.state.subCategoryId, this.state.containerIds,
                    this.state.brandIds, this.state.countryIds, this.state.storeIds, this.state.subCategoryTypesIds,
                    this.state.sortBy, this.state.priceFilter, this.state.tagIds
                    )
            })
        }
        if(this.props.data.cart.length !== this.state.cartLength){
            this.setState({cartLength:this.props.data.cart.length}, async()=>{
                await this.getHomeScreenData(this.state.subCategoryId, this.state.containerIds,
                    this.state.brandIds, this.state.countryIds, this.state.storeIds, this.state.subCategoryTypesIds,
                    this.state.sortBy, this.state.priceFilter, this.state.tagIds
                    )
            })
        }
    }

    async getFilterData(){
        var credentials = ''
        if(this.props.data.address===''){
            credentials = {
                categoryId: this.state.itemId
            }
        }else{
            credentials = {
                categoryId: this.state.itemId,
                latitude:this.props.data.latitude,
                longitude:this.props.data.longitude
            }
        }
        
        let res = await sendPostRequestWithAccessTokenAndBody(GET_FILTER_DATA, credentials,  global.accessToken);
       // console.log('resFilterData', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({bannerData:res.response.getBanners},()=>this.setState({isLoading:false}))
            
            
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    async getHomeScreenData(liquor, container, brand, country, store, variety, sort, price, tags, pageNumber, itemId){
       // this.onEndReachedCalledDuringMomentum = true;
        this.setState({isLoading:true}) 
        this.props.showBackButton(true)
        let storeIds = []
        let _pageNumber = 0
        if (pageNumber !== undefined) {
            _pageNumber = pageNumber + 1
            this.setState({ pageNumber: _pageNumber })
        }
        if(this.props.data.addedProductStoreId !== ''){
            storeIds = [this.props.data.addedProductStoreId]
        }
        if(store !== undefined && store.length>0){
            for(let i =0; i<store.length; i++){
                if(!storeIds.includes(store[i])){
                    storeIds.push(store[i])
                }
            }
        }
        let sortValue = ''
       // console.log('getHomeScreenData sort', JSON.stringify(sort))
        if(sort.length>0){
            switch (sort[0]) {
                case 'Smuggler Select':
                    sortValue = 'smugglerSelect'
                    break;
                case 'Best Seller':
                    sortValue = 'bestSeller'
                    break;    
                case 'On Sale':
                    sortValue = 'onSale'
                    break;
                case 'Price: Low to High':
                    sortValue = 'priceLTH'
                    break;
                case 'Price: High to Low':
                    sortValue = 'priceHTL'
                    break;
                case 'A to Z':
                    sortValue = 'ATZ'
                    break;
                case 'Z to A':
                    sortValue = 'ZTA'
                    break;
                default:
                    break;
            }
        }
        let priceValue = ''
        if(price.length>0){
            switch (price[0]) {
                case 'Under $20':
                    priceValue = '20'
                    break;
                case '$20 To $40':
                    priceValue = '20-40'
                    break;
                case '$40 To $60':
                    priceValue = '40-60'
                    break;
                case '$60 And Up':
                    priceValue = '60'
                    break;
                default:
                    break;
            }
        }
        let credentials = {}
        if(this.props.data.latitude===0){
            credentials = {
                // latitude:this.props.data.latitude,
                // longitude:this.props.data.longitude,
                categoryId: itemId!==undefined?itemId:this.state.itemId, 
                subCategoryId: liquor,
                brandIds:brand,
                containerIds:container,
                countryIds:country,
                storeIds:storeIds,
                subCategoryTypesIds:variety,
                sortBy:sortValue,
                priceFilter:priceValue,
                tagIds:tags,
                selectedStoreId:this.props.data.cart.length>0?this.props.data.cart[0].storeId._id:'',
                pageNumber:_pageNumber
    
            }
        }else{
            credentials = {
                latitude:this.props.data.latitude,
                longitude:this.props.data.longitude,
                categoryId: itemId!==undefined?itemId:this.state.itemId, 
                subCategoryId: liquor,
                brandIds:brand,
                containerIds:container,
                countryIds:country,
                storeIds:storeIds,
                subCategoryTypesIds:variety,
                sortBy:sortValue,
                priceFilter:priceValue,
                tagIds:tags,
                selectedStoreId:this.props.data.cart.length>0?this.props.data.cart[0].storeId._id:'',
                pageNumber:_pageNumber
            }
        }
        //console.log('productCategoryRes', JSON.stringify(credentials))
        let res = await sendPostRequestWithAccessTokenAndBody(GET_CATEGORY_DATA, credentials,  global.accessToken);
        //console.log('categoryRes', JSON.stringify(res.response.needMorePagi))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
           // this.setState({bannerData:res.response.getBanners})
            // for(let i=0; i<res.response.proData.length; i++){
            //     console.log('isOnAnotherStore', res.response.proData[i].isOnAnotherStore)
            //     if(res.response.proData[i].isOnAnotherStore){
            //     console.log('priceRange', res.response.proData[i].priceRange)
            //     }
            // }
            this.setState({needMorePagination:res.response.needMorePagi},()=>
            this.checkCartProducts(res.response.proData, pageNumber))
            // this.setState({data:res.response.proData},()=>{
            //       this.setState({isLoading:false})
            // })
        }else{
           // console.log('productCategory', JSON.stringify(res))
            this.setState({isLoading:false},()=>{
               //this.setState({responseText:'Something went wrong', responseAlert:true})
            })
        }
    }

    async applyFilter(liquor, container, brand, country, store, variety, sort, price, tags, pageNumber){
        this.props.showBackButton(true)
        this.setState({isLoading:true})
        let storeIds = []
        let _pageNumber = 0
        if (pageNumber !== undefined) {
            _pageNumber = pageNumber + 1
            this.setState({ pageNumber: _pageNumber })
        }
        if(this.props.data.addedProductStoreId !== ''){
            storeIds = [this.props.data.addedProductStoreId]
        }
        if(store !== undefined && store.length>0){
            for(let i =0; i<store.length; i++){
                if(!storeIds.includes(store[i])){
                    storeIds.push(store[i])
                }
            }
        }
        let sortValue = ''
       // console.log('getHomeScreenData sort', JSON.stringify(sort))
        if(sort.length>0){
            switch (sort[0]) {
                case 'Smuggler Select':
                    sortValue = 'smugglerSelect'
                    break;
                case 'Best Seller':
                    sortValue = 'bestSeller'
                    break;    
                case 'On Sale':
                    sortValue = 'onSale'
                    break;
                case 'Price: Low to High':
                    sortValue = 'priceLTH'
                    break;
                case 'Price: High to Low':
                    sortValue = 'priceHTL'
                    break;
                case 'A to Z':
                    sortValue = 'ATZ'
                    break;
                case 'Z to A':
                    sortValue = 'ZTA'
                    break;
                default:
                    break;
            }
        }
        let priceValue = ''
        if(price.length>0){
            switch (price[0]) {
                case 'Under $20':
                    priceValue = '20'
                    break;
                case '$20 To $40':
                    priceValue = '20-40'
                    break;
                case '$40 To $60':
                    priceValue = '40-60'
                    break;
                case '$60 And Up':
                    priceValue = '60'
                    break;
                default:
                    break;
            }
        }
        let credentials = {}
        if(this.props.data.latitude===0){
            credentials = {
                // latitude:this.props.data.latitude,
                // longitude:this.props.data.longitude,
                categoryId: this.state.itemId, 
                subCategoryId: liquor,
                brandIds:brand,
                containerIds:container,
                countryIds:country,
                storeIds:storeIds,
                subCategoryTypesIds:variety,
                sortBy:sortValue,
                priceFilter:priceValue,
                tagIds:tags,
                selectedStoreId:this.props.data.cart.length>0?this.props.data.cart[0].storeId._id:'',
                pageNumber:_pageNumber
    
            }
        }else{
            credentials = {
                latitude:this.props.data.latitude,
                longitude:this.props.data.longitude,
                categoryId: this.state.itemId, 
                subCategoryId: liquor,
                brandIds:brand,
                containerIds:container,
                countryIds:country,
                storeIds:storeIds,
                subCategoryTypesIds:variety,
                sortBy:sortValue,
                priceFilter:priceValue,
                tagIds:tags,
                selectedStoreId:this.props.data.cart.length>0?this.props.data.cart[0].storeId._id:'',
                pageNumber:_pageNumber
            }
        }
        //console.log('productCategoryRes', JSON.stringify(credentials))
        let res = await sendPostRequestWithAccessTokenAndBody(GET_CATEGORY_DATA, credentials,  global.accessToken);
       // console.log('categoryResFilter', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({needMorePagination:res.response.needMorePagi},()=>
            this.checkCartProducts(res.response.proData))
            // this.setState({data:res.response.proData},()=>{
            //       this.setState({isLoading:false})
            // })
        }else{
           // console.log('productCategory', JSON.stringify(res))
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    async checkCartProducts(_data, pageNumber){
        let data = _data
        if(this.props.data.cart.length>0){
            for(let i = 0; i < data.length; i++){
                for(let j = 0; j < this.props.data.cart.length; j++){
                    if(data[i].allSizes[0]._id === this.props.data.cart[j]._id){
                        data[i].allSizes[0] = this.props.data.cart[j]
                    }else{
                    }
                }
            }
        }
        if (pageNumber !== undefined) {
            this.setState({data:this.state.data.concat(data)},()=>{
                this.setState({isLoading:false})
                
            })
        }else{
            this.setState({data:data},()=>{
                this.setState({isLoading:false})
                
            })
        }
       // this.setState({isLoading:false})
    }

    homeHeader(){
        return(
            <View style={{width:'100%',  padding:10, paddingHorizontal:20,
                flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                    <TouchableOpacity onPress={()=>this.props.navigation.openDrawer()}>
                        <Image resizeMode={'contain'} source={require('../../assets/side-menu.png')} style={{height:25, width:25, }}/>
                    </TouchableOpacity>
                    <View style={{marginLeft:15, justifyContent:'space-between', height:40}}>
                        <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, fontFamily:AppStyles.fontFamily.M_BOLD}}>
                            Deliver to
                        </Text>
                        <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:12, fontFamily:AppStyles.fontFamily.M_SEMIBOLD}}>
                            {this.state.searchAddressText}
                        </Text>
                    </View>
                </View>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                    <TouchableOpacity onPress={()=>this.props.navigation.navigate('Notifications')}>
                        <Image resizeMode={'cover'} source={require('../../assets/notification.png')} style={{height:30, width:30, marginRight:15}}/>
                    </TouchableOpacity>
                    <Image resizeMode={'contain'} source={require('../../assets/cart-active.png')} style={{height:25, width:25, marginRight:15}}/>
                    <Image resizeMode={'contain'} source={require('../../assets/search.png')} style={{height:25, width:25, }}/>
                </View>
            </View>
        )
    }


    searchBarView(){
        return(
            <View style={{width:'100%', padding:10, paddingTop:10, paddingHorizontal:20}}>
                <TouchableOpacity activeOpacity={1} 
                style={{borderWidth:1, borderColor:AppStyles.colorSet.mainTextColor, width:'100%', padding:10,
                borderRadius:25, alignItems:'center', flexDirection:'row', }}>
                    <Image resizeMode={'contain'} source={require('../../assets/search.png')} style={{height:18, width:18, }}/>
                    <TextInput 
                        ref={(rf) => {this.phone = rf}}
                        placeholder='Search Products, Brands'
                        onChangeText={(text)=>this.setState({phone:text})}
                        placeholderTextColor={AppStyles.colorSet.mainTextColor}
                        style={[AppStyles.styleSet.textInputStyle, {marginHorizontal:15, flex:1, fontSize:12, padding:0}]}
                    /> 
                </TouchableOpacity>
            </View>
        )
    }

    productView(data){
        let shape = require('../../assets/wine-shape.png')
        switch (this.state.type){
            case 'Liquor':
            shape = require('../../assets/liquor-shape.png') 
            break;
            case 'Beer':
            shape = require('../../assets/beer-shape.png')
            break;
            case 'Seltzer':
            shape = require('../../assets/Seltzer.png')
            break;
            case 'Mixers & Extras':
            shape = require('../../assets/mixer.png')    
            break;
            default:
            break;               
        }
        return(
            <View style={{width:'100%',}}>
                
                <FlatList
                    data={data}
                    numColumns={2}
                    ListHeaderComponent={()=>{
                        return(
                            <View>
                                {this.props.data.showChangeAddressModal?null:this.pagerView()}
                                <View style={{width:'100%', paddingHorizontal:20
                                        }}>
                                            {/* <TouchableOpacity onPress={()=>this.props.navigation.goBack()}>
                                                <Image resizeMode={'contain'} 
                                                source={require('../../assets/back-arrow.png')} 
                                                style={{height:25, width:25, }}/>
                                            </TouchableOpacity> */}
                                            {/* <BackButton props={this.props}/> */}
                                            {this.state.type !== 'SearchView' && <Image 
                                                resizeMode={'stretch'}
                                                source={shape} 
                                                style={{height:30, width:'100%', alignSelf:'center', }}/>
                                        }
                                        </View>
                                        {this.state.type !== 'SearchView' && <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', paddingHorizontal:20}}>
                                            <TouchableOpacity style={{marginTop:15}}>
                                                <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:18, 
                                                    fontFamily:AppStyles.fontFamily.M_BOLD, marginLeft:10}}>
                                                        All
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={()=>this.props.navigation.navigate('Filter', {type:this.state.type, categoryId:this.state.itemId})} style={{marginTop:15, flexDirection:'row'}}>
                                                <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:18, 
                                                    fontFamily:AppStyles.fontFamily.M_BOLD, marginLeft:10}}>
                                                        Filter
                                                </Text>
                                                <Image 
                                                    resizeMode={'contain'}
                                                    source={require('../../assets/filter.png')} 
                                                    style={{height:18, width:18, marginLeft:15}}/>
                                            </TouchableOpacity>
                                        </View>}
                                </View>
                        )
                    }}
                    extraData={this.state}
                    removeClippedSubviews={true}
                    style={{marginBottom:10, height:'100%',}}
                    //initialNumToRender={10}
                    bounces={false}
                    onEndReachedThreshold={0.1}
                   // onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
                    onEndReached={() => !this.state.isLoading & this.state.needMorePagination ?
                        this.getHomeScreenData(this.state.subCategoryId, this.state.containerIds,
                            this.state.brandIds, this.state.countryIds, this.state.storeIds, this.state.subCategoryTypesIds,
                            this.state.sortBy, this.state.priceFilter, this.state.tagIds, this.state.pageNumber
                            ) : null}
                    //onEndReached={()=>alert('ewc')}
                    renderItem={({ item, index }) => (
                   // this.productItemView(item, index)
                    <ItemView 
                      item={item}
                      index={index}
                      data={this.props.data}
                      addToCart={this.addToCart}
                      removeFromCart={this.removeFromCart}
                      showStoreAlert={this.showStoreAlert}
                      showResponseAlert={this.showResponseAlert}
                      navigateToProductDetails={this.navigateToProductDetails}
                    />
                    )}
                    //keyExtractor={item => item._id}
                    keyExtractor={keyGenerator}
                />

            </View>
        )
    }

    navigateToProductDetails(productId, storeId){
        this.props.navigation.navigate('ProductDetails',{
            productId:productId, storeId:storeId
            })
    }

    addToCart(data){
        this.props.addToCart(data)
    }
    removeFromCart(data){
        this.props.removeFromCart(data)
    }
    showStoreAlert(data){
        this.props.showStoreAlert(data)
    }

    showResponseAlert(text){
        this.setState({responseText:text, responseAlert:true})
    }

    // productItemView(item, index){
    //     return(
    //         <View style={{flex:.48, marginTop:20, flexDirection:'column', overflow:'hidden', paddingHorizontal:10}}>
    //             <TouchableOpacity onPress={()=>{
    //                 if(this.props.data.address===''){
    //                     let data = item.allSizes[0]
    //                     data.isOnAnotherStore = item.isOnAnotherStore
    //                     data.title = item.title
    //                     data.image = item.image
    //                     data.storeId = item.storeId
    //                     data.productId = item.productId
    //                     this.props.addToCart(data)
    //                 }else{
    //                 this.props.navigation.navigate('ProductDetails',{
    //                 productId:item.productId, storeId:item.storeId._id
    //              })}
    //              }}>
    //                 <View style={{height:270, width:'100%' }}>
    //                     <View style={{width:'100%', height:270}}>
                            
    //                         <Image source={{uri:IMAGE_BASE_URL+item.image}} 
    //                         style={{flex:1}} resizeMode={'contain'}/>
                        
    //                    {item.allSizes[0].onSale && <TouchableOpacity style={{padding:5, borderRadius:20, justifyContent:'center',
    //                         backgroundColor:'transparent', position:'absolute', right:10, top: 10, 
    //                         borderColor:AppStyles.colorSet.mainTextColor, borderWidth:1}}>
    //                             <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:10, alignSelf:'center',
    //                                 fontFamily:AppStyles.fontFamily.M_BOLD}}>
    //                                     On Sale
    //                             </Text>
    //                     </TouchableOpacity>}
    //                     {item.bestSeller && <TouchableOpacity style={{ padding:5, borderRadius:20, justifyContent:'center',
    //                         backgroundColor:'transparent', position:'absolute', left:10, top: 10, 
    //                         borderColor:AppStyles.colorSet.mainTextColor, borderWidth:1}}>
    //                             <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:10, alignSelf:'center',
    //                                 fontFamily:AppStyles.fontFamily.M_BOLD}}>
    //                                     Best Seller
    //                             </Text>
    //                     </TouchableOpacity>}
    //                     </View>
    //                 </View>
    //                 <Text numberOfLines={2} style={{color:AppStyles.colorSet.mainTextColor, fontSize:16, marginTop:10, 
    //                     fontFamily:AppStyles.fontFamily.M_BOLD, textAlign:'center', alignSelf:'center'}}>
    //                     {item.title}
    //                 </Text>
    //                 <Text numberOfLines={1} style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, marginTop:10, 
    //                     fontFamily:AppStyles.fontFamily.M_BOLD, textAlign:'center', alignSelf:'center'}}>
    //                     {item.isOnAnotherStore?'Multiple Stores':item.storeId.title}
    //                 </Text>
    //                 <View style={{width:'90%', justifyContent:'space-between', flexDirection:'row', alignSelf:'center'}}>
    //                     <View style={{ flexDirection:'row',  alignItems:'center', marginTop:5,}}>
    //                         {!item.isOnAnotherStore && <Text style={{color:'white', fontSize:14, fontFamily:AppStyles.fontFamily.M_BOLD}}>
    //                         ${item.allSizes[0].finalPrice}
    //                         </Text>}
    //                         {item.isOnAnotherStore && <Text style={{color:'white', fontSize:12, fontFamily:AppStyles.fontFamily.M_BOLD}}>
    //                                 ${item.priceRange.min+' - '+'$'+item.priceRange.max}
    //                         </Text>}
    //                     {/* {item.allSizes[0].onSale && <Text style={{color:'grey', fontSize:12, fontFamily:AppStyles.fontFamily.M_BOLD, 
    //                                 marginLeft:35, textDecorationLine:'line-through'}}>
    //                                 ${item.price}
    //                         </Text>} */}
    //                     </View>
    //                     <Text numberOfLines={1} style={{color:'grey', fontSize:14, marginTop:5, 
    //                         fontFamily:AppStyles.fontFamily.M_SEMIBOLD,}}>
    //                         {item.allSizes[0].attributeValue}{item.allSizes[0].attributeId.title}
    //                     </Text>
    //                 </View>
    //             </TouchableOpacity>
    //             <View style={{width:'95%', flexDirection:'row',  alignItems:'center', marginTop:10, justifyContent:'space-between', alignSelf:'center'}}>
    //                 <View style={{flexDirection:'row', justifyContent:'center'}}>
    //                     <TouchableOpacity onPress={()=>{
    //                         if(item.allSizes[0].hasOwnProperty('quantityOfProductInCart')&&item.allSizes[0].quantityOfProductInCart>0){
    //                             let data = item.allSizes[0]
    //                             data.isOnAnotherStore = item.isOnAnotherStore
    //                             data.title = item.title
    //                             data.image = item.image
    //                             data.storeId = item.storeId
    //                             data.productId = item.productId
    //                             this.props.removeFromCart(data)
    //                         }}}>
    //                         <Image source={require('../../assets/minus.png')} style={{height:18, width:18}}/>
    //                     </TouchableOpacity>
    //                     <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, marginHorizontal:4, 
    //                         fontFamily:AppStyles.fontFamily.M_SEMIBOLD,}}>
    //                         {item.allSizes[0].hasOwnProperty('quantityOfProductInCart')?item.allSizes[0].quantityOfProductInCart:0}
    //                     </Text>
    //                     <TouchableOpacity onPress={()=> {
    //                         if(this.props.data.address!=='' && item.isOnAnotherStore){
    //                             this.props.navigation.navigate('ProductDetails',{
    //                                 productId:item.productId, storeId:item.storeId._id
    //                             })
    //                         }else if(this.props.data.address===''){
    //                             let data = item.allSizes[0]
    //                             data.isOnAnotherStore = item.isOnAnotherStore
    //                             data.title = item.title
    //                             data.image = item.image
    //                             data.storeId = item.storeId
    //                             data.productId = item.productId
    //                             this.props.addToCart(data)
    //                         }
    //                         else if(this.props.data.cart.length===0 || this.props.data.cart[0].storeId._id !== item.storeId._id){
    //                             let data = item.allSizes[0]
    //                             data.isOnAnotherStore = item.isOnAnotherStore
    //                             data.title = item.title
    //                             data.image = item.image
    //                             data.storeId = item.storeId
    //                             data.productId = item.productId
    //                             let d = {value:true, selectedItemData:data}
    //                             this.props.showStoreAlert(d)
    //                         }
    //                         else{
    //                             let data = item.allSizes[0]
    //                             data.isOnAnotherStore = item.isOnAnotherStore
    //                             data.title = item.title
    //                             data.image = item.image
    //                             data.storeId = item.storeId
    //                             data.productId = item.productId
    //                             this.props.addToCart(data)
    //                         }
    //                         //this.props.addToCart(item)
    //                         }}>
    //                         <Image source={require('../../assets/add.png')} style={{height:18, width:18}}/>
    //                     </TouchableOpacity>
    //                 </View>
    //                 <TouchableOpacity onPress={()=> {if(this.props.data.address!=='' && item.isOnAnotherStore){
    //                         this.props.navigation.navigate('ProductDetails',{
    //                             productId:item.productId, storeId:item.storeId._id
    //                         })
    //                     }else if(this.props.data.address===''){
    //                         let data = item.allSizes[0]
    //                         data.isOnAnotherStore = item.isOnAnotherStore
    //                         data.title = item.title
    //                         data.image = item.image
    //                         data.storeId = item.storeId
    //                         data.productId = item.productId
    //                         this.props.addToCart(data)
    //                     }
    //                     else if(this.props.data.cart.length===0 || this.props.data.cart[0].storeId._id !== item.storeId._id){
    //                         let data = item.allSizes[0]
    //                         data.isOnAnotherStore = item.isOnAnotherStore
    //                         data.title = item.title
    //                         data.image = item.image
    //                         data.storeId = item.storeId
    //                         data.productId = item.productId
    //                         let d = {value:true, selectedItemData:data}
    //                         this.props.showStoreAlert(d)
    //                     }
    //                     else{
    //                         let data = item.allSizes[0]
    //                         data.isOnAnotherStore = item.isOnAnotherStore
    //                         data.title = item.title
    //                         data.image = item.image
    //                         data.storeId = item.storeId
    //                         data.productId = item.productId
    //                         this.props.addToCart(data)
    //                     }
    //                     //this.props.addToCart(item)
    //                 }} 
    //                 style={{height:25, width:80, borderRadius:20, justifyContent:'center',
    //                 backgroundColor:AppStyles.colorSet.mainTextColor, marginLeft:8}}>
    //                     <Text style={{color:'white', fontSize:10, alignSelf:'center',
    //                            fontFamily:AppStyles.fontFamily.M_BOLD}}>
    //                            {item.allSizes[0].hasOwnProperty('quantityOfProductInCart')&&item.allSizes[0].quantityOfProductInCart>0?'In Your Cart!':'Add to cart'}
    //                     </Text>
    //                </TouchableOpacity>
    //             </View>
    //         </View>
    //     )
    // }

    
    _renderDotIndicator() {
        return <PagerDotIndicator 
        selectedDotStyle={{height:12, width:12, borderRadius:6, backgroundColor:AppStyles.colorSet.mainTextColor}} 
        dotStyle={{height:12, width:12, borderRadius:6, backgroundColor:'#e0e0e0'}} 
        style={{position:'absolute', bottom:30, alignSelf:'center'}} pageCount={this.state.bannerData.length} />;
    }

    onPageScrollStateChanged(event){
        console.log('pager', event.nativeEvent.pageScrollState)
        if(Platform.OS==='android'){
            if(event.nativeEvent.pageScrollState === 'dragging'){
                //scope.setState({enableBannerClick:false})
            }else if(event.nativeEvent.pageScrollState === 'idle'){
               // scope.setState({enableBannerClick:true})
            }
        }
    }

    pagerView(){
        if(!this.props.data.showAddAddressAlert && this.state.type !== 'SearchView'){
            return(
                <View style={{height:200}}>
                    <IndicatorViewPager
                        ref={(viewPager) => {this.viewPager = viewPager}}
                        style={{height:200, }}
                        autoPlayEnable={true}
                        autoPlayInterval={5000}
                        //onPageScrollStateChanged={this.onPageScrollStateChanged}
                        indicator={this._renderDotIndicator()}
                    >

                    {this.state.bannerData.map((item, index)=>{
                        return this.bannerView(item, index)
                    })}

                    </IndicatorViewPager>
                </View>
            )
        }
    }

    refreshScreen(itemId, urk){
        this.setState({type:urk})
        this.getHomeScreenData(this.state.subCategoryId, this.state.containerIds,
            this.state.brandIds, this.state.countryIds, this.state.storeIds, this.state.subCategoryTypesIds,
            this.state.sortBy, this.state.priceFilter, this.state.tagIds, undefined, itemId
            )
    }

    navigateTo(itemId, linkUrl){
        console.log('itemId', itemId+' '+linkUrl)
        if(linkUrl === 'Wine'){
            this.refreshScreen(itemId, linkUrl)
            }else if(linkUrl === 'Beer'){
                this.refreshScreen(itemId, linkUrl)
            }else if(linkUrl === 'Liquor'){
                this.refreshScreen(itemId, linkUrl)
            }else if(linkUrl === 'Seltzer'){
                this.refreshScreen(itemId, linkUrl)
            }else if(linkUrl === 'Mixers & Extras'){
                this.refreshScreen(itemId, linkUrl)
        }
    }

    bannerView(item, index){
        let imageUrl = IMAGE_BASE_URL+item.image
        let linkUrl = item.bannerLinkMobile
        let itemId = item._id
        return(
            <TouchableOpacity disabled 
            // onPress={()=>{
            //     Platform.OS==='android'?
            //     setTimeout(()=>{
            //         this.state.enableBannerClick?this.navigateTo(itemId, linkUrl):''
            //     }, 100):
            //     this.navigateTo(itemId, linkUrl)
            // }} 
            style={{height:200, width:'100%',}}>
                <ImageBackground resizeMode={'contain'} source={{uri:imageUrl}} style={{flex:1,  justifyContent:'center',paddingLeft:20, }}>
                    <Text style={{color:'white', fontSize:20, fontFamily:AppStyles.fontFamily.M_BOLD}}>
                        {item.title}
                    </Text>
                    <Text style={{color:'white', width:200,
                    fontSize:12, fontFamily:AppStyles.fontFamily.M_BOLD, 
                    marginTop:5}}>
                        {item.subTitle}
                    </Text>
                </ImageBackground>

            </TouchableOpacity>
        )
    }


    render(){
        return(
            <SafeAreaView style={{flex:1, backgroundColor:'black'}}>
                <StatusBar barStyle={'light-content'}/>
                <WatermarkView/>
                {/* <ScrollView 
                style={{flex:1, paddingBottom:Platform.OS==='android'?5:25}} 
                //contentContainerStyle={{flex:1}} 
                keyboardShouldPersistTaps={'handled'}> */}
                    <View style={{height:'100%', }}>
                        
                        {/* <StatusBarHeader props={this.props}/> */}
                        {/* {this.searchBarView()} */}
                        {/* {this.props.data.showChangeAddressModal?null:this.pagerView()} */}
                        {this.productView(this.state.data)}
                    </View>
                {/* </ScrollView> */}
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


class ItemView extends PureComponent{
    constructor(props){
        super(props)
        this.state={

        }
    }

    async checkInventory(itemData, type){
        //this.setState({isLoading:true})
        let credentials = {
            productId:type==='storeAlert'?itemData.selectedItemData.productId:itemData.productId,
            sizeId:type==='storeAlert'?itemData.selectedItemData._id:itemData._id,
            storeId:type==='storeAlert'?itemData.selectedItemData.storeId._id:itemData.storeId._id
        }
        let res = await sendPostRequestWithAccessTokenAndBody(CHECK_SIZE_FOR_INVENTORY, credentials,  global.accessToken);
        console.log('CHECK_SIZE_FOR_INVENTORY', JSON.stringify(res))
       // console.log('quantity', itemData.selectedItemData.quantityOfProductInCart<res.response.userData.quantity)
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
                switch (type){
                    case 'storeAlert':
                        if(itemData.selectedItemData.quantityOfProductInCart < res.response.userData.quantity){
                            this.props.showStoreAlert(itemData)
                        }else{
                            let alertText = res.response.userData.quantity>1?'There are '+res.response.userData.quantity+' items left in stock':'There is '+res.response.userData.quantity+' item left in stock'
                            this.props.showResponseAlert(alertText)
                           // this.setState({responseText:alertText, responseAlert:true})
                            
                        }
                    break;
                    case 'addToCart':
                        if(itemData.quantityOfProductInCart < res.response.userData.quantity){
                            this.props.addToCart(itemData)
                        }else{
                            let alertText = res.response.userData.quantity>1?'There are '+res.response.userData.quantity+' items left in stock':'There is '+res.response.userData.quantity+' item left in stock'
                            this.props.showResponseAlert(alertText)
                            //this.setState({responseText:alertText, responseAlert:true})
                            
                            
                        }
                    break;
                    default :
                    break;    

                }
            //this.setState({savedCards:res.response.userData},()=>this.setState({isLoading:false}))
           
        }else{
            //this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }


    render(){
        let item = this.props.item
        return(
            <View style={{flex:.48, marginTop:20, flexDirection:'column', overflow:'hidden', paddingHorizontal:10}}>
                <TouchableOpacity 
                onPress={()=>{
                    if(this.props.data.address===''){
                        let data = item.allSizes[0]
                        data.isOnAnotherStore = item.isOnAnotherStore
                        data.title = item.title
                        data.image = item.allSizes[0].image
                        data.storeId = item.storeId
                        data.productId = item.productId
                        this.props.addToCart(data)
                    }else{
                    
                    this.props.navigateToProductDetails(item.productId, item.storeId._id)
                    }
                 }}
                 >
                    <View style={{height:270, width:'100%' }}>
                        <View style={{width:'100%', height:270}}>
                            
                            <Image source={{uri:IMAGE_BASE_URL+item.allSizes[0].image}} 
                            style={{flex:1}} resizeMode={'contain'}/>
                        
                       {item.allSizes[0].onSale && <TouchableOpacity style={{padding:5, borderRadius:20, justifyContent:'center',
                            backgroundColor:'transparent', position:'absolute', right:10, top: 10, 
                            borderColor:AppStyles.colorSet.mainTextColor, borderWidth:1}}>
                                <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:10, alignSelf:'center',
                                    fontFamily:AppStyles.fontFamily.M_BOLD}}>
                                        On Sale
                                </Text>
                        </TouchableOpacity>}
                        {item.bestSeller && <TouchableOpacity style={{ padding:5, borderRadius:20, justifyContent:'center',
                            backgroundColor:'transparent', position:'absolute', left:10, top: 10, 
                            borderColor:AppStyles.colorSet.mainTextColor, borderWidth:1}}>
                                <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:10, alignSelf:'center',
                                    fontFamily:AppStyles.fontFamily.M_BOLD}}>
                                        Best Seller
                                </Text>
                        </TouchableOpacity>}
                        </View>
                    </View>
                    <Text numberOfLines={2} style={{color:AppStyles.colorSet.mainTextColor, fontSize:16, marginTop:10, 
                        fontFamily:AppStyles.fontFamily.M_BOLD, textAlign:'center', alignSelf:'center', height:40}}>
                        {item.title}
                    </Text>
                    <Text numberOfLines={1} style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, marginTop:10, 
                        fontFamily:AppStyles.fontFamily.M_BOLD, textAlign:'center', alignSelf:'center'}}>
                        {item.isOnAnotherStore?'Multiple Stores':item.storeId.title}
                    </Text>
                    <View style={{width:'90%', justifyContent:'space-between', flexDirection:'row', alignSelf:'center'}}>
                        <View style={{ flexDirection:'row',  alignItems:'center', marginTop:5,}}>
                            {!item.isOnAnotherStore && <Text style={{color:'white', fontSize:14, fontFamily:AppStyles.fontFamily.M_BOLD}}>
                            ${item.allSizes[0].finalPrice}
                            </Text>}
                            {item.isOnAnotherStore && <Text style={{color:'white', fontSize:12, fontFamily:AppStyles.fontFamily.M_BOLD}}>
                                    ${item.priceRange.min+' - '+'$'+item.priceRange.max}
                            </Text>}
                        {/* {item.allSizes[0].onSale && <Text style={{color:'grey', fontSize:12, fontFamily:AppStyles.fontFamily.M_BOLD, 
                                    marginLeft:35, textDecorationLine:'line-through'}}>
                                    ${item.price}
                            </Text>} */}
                        </View>
                        <Text numberOfLines={1} style={{color:'grey', fontSize:14, marginTop:5, 
                            fontFamily:AppStyles.fontFamily.M_SEMIBOLD,}}>
                            {item.allSizes[0].attributeValue}{item.allSizes[0].attributeId.title}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={{width:'95%', flexDirection:'row',  alignItems:'center', marginTop:10, justifyContent:'space-between', alignSelf:'center'}}>
                    <View style={{flexDirection:'row', justifyContent:'center'}}>
                        <TouchableOpacity onPress={()=>{
                            if(item.allSizes[0].hasOwnProperty('quantityOfProductInCart')&&item.allSizes[0].quantityOfProductInCart>0){
                                let data = item.allSizes[0]
                                data.isOnAnotherStore = item.isOnAnotherStore
                                data.title = item.title
                                data.image = item.allSizes[0].image
                                data.storeId = item.storeId
                                data.productId = item.productId
                                this.props.removeFromCart(data)
                            }}}>
                            <Image source={require('../../assets/minus.png')} style={{height:18, width:18}}/>
                        </TouchableOpacity>
                        <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, marginHorizontal:4, 
                            fontFamily:AppStyles.fontFamily.M_SEMIBOLD,}}>
                            {item.allSizes[0].hasOwnProperty('quantityOfProductInCart')?item.allSizes[0].quantityOfProductInCart:0}
                        </Text>
                        <TouchableOpacity onPress={async()=> {
                            if(this.props.data.address!=='' && item.isOnAnotherStore){
                                this.props.navigateToProductDetails(item.productId, item.storeId._id)
                                // this.props.navigation.navigate('ProductDetails',{
                                //     productId:item.productId, storeId:item.storeId._id
                                // })
                            }else if(this.props.data.address===''){
                                let data = item.allSizes[0]
                                data.isOnAnotherStore = item.isOnAnotherStore
                                data.title = item.title
                                data.image = item.allSizes[0].image
                                data.storeId = item.storeId
                                data.productId = item.productId
                                this.props.addToCart(data)
                            }
                            else if(this.props.data.cart.length===0 || this.props.data.cart[0].storeId._id !== item.storeId._id){
                                let data = item.allSizes[0]
                                data.isOnAnotherStore = item.isOnAnotherStore
                                data.title = item.title
                                data.image = item.allSizes[0].image
                                data.storeId = item.storeId
                                data.productId = item.productId
                                data.quantityOfProductInCart = item.allSizes[0].hasOwnProperty('quantityOfProductInCart')?item.allSizes[0].quantityOfProductInCart:0
                                let d = {value:true, selectedItemData:data}
                                await this.checkInventory(d, 'storeAlert')
                            }
                            else{
                                let data = item.allSizes[0]
                                data.isOnAnotherStore = item.isOnAnotherStore
                                data.title = item.title
                                data.image = item.allSizes[0].image
                                data.storeId = item.storeId
                                data.quantityOfProductInCart = item.allSizes[0].hasOwnProperty('quantityOfProductInCart')?item.allSizes[0].quantityOfProductInCart:0
                                data.productId = item.productId
                                await this.checkInventory(data, 'addToCart')
                            }
                            //this.props.addToCart(item)
                            }}>
                            <Image source={require('../../assets/add.png')} style={{height:18, width:18}}/>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={async()=> {if(this.props.data.address!=='' && item.isOnAnotherStore){
                            this.props.navigateToProductDetails(item.productId, item.storeId._id)
                            // this.props.navigation.navigate('ProductDetails',{
                            //     productId:item.productId, storeId:item.storeId._id
                            // })
                        }else if(this.props.data.address===''){
                            let data = item.allSizes[0]
                            data.isOnAnotherStore = item.isOnAnotherStore
                            data.title = item.title
                            data.image = item.allSizes[0].image
                            data.storeId = item.storeId
                            data.productId = item.productId
                            this.props.addToCart(data)
                        }
                        else if(this.props.data.cart.length===0 || this.props.data.cart[0].storeId._id !== item.storeId._id){
                            let data = item.allSizes[0]
                            data.isOnAnotherStore = item.isOnAnotherStore
                            data.title = item.title
                            data.image = item.allSizes[0].image
                            data.storeId = item.storeId
                            data.productId = item.productId
                            data.quantityOfProductInCart = item.allSizes[0].hasOwnProperty('quantityOfProductInCart')?item.allSizes[0].quantityOfProductInCart:0
                            let d = {value:true, selectedItemData:data}
                            await this.checkInventory(d, 'storeAlert')
                        }
                        else{
                            let data = item.allSizes[0]
                            data.isOnAnotherStore = item.isOnAnotherStore
                            data.title = item.title
                            data.image = item.allSizes[0].image
                            data.storeId = item.storeId
                            data.quantityOfProductInCart = item.allSizes[0].hasOwnProperty('quantityOfProductInCart')?item.allSizes[0].quantityOfProductInCart:0
                            data.productId = item.productId
                            await this.checkInventory(data, 'addToCart')
                        }
                        //this.props.addToCart(item)
                    }} 
                    style={{height:25, width:80, borderRadius:20, justifyContent:'center',
                    backgroundColor:AppStyles.colorSet.mainTextColor, marginLeft:8}}>
                        <Text style={{color:'white', fontSize:10, alignSelf:'center',
                               fontFamily:AppStyles.fontFamily.M_BOLD}}>
                               {item.allSizes[0].hasOwnProperty('quantityOfProductInCart')&&item.allSizes[0].quantityOfProductInCart>0?'In Your Cart!':'Add to cart'}
                        </Text>
                   </TouchableOpacity>
                </View>
            </View>
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
    showBackButton,
    }, dispatch)
);
//connect(mapStateToProps, mapDispatchToProps)(ItemView);
export default connect(mapStateToProps, mapDispatchToProps)(ProductCategory);