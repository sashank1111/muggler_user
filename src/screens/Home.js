import React,{Component} from 'react'
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
    Platform,
    Keyboard,
    Modal,
    Animated,
    Dimensions
} from 'react-native'
import ShowLoader from '../components/ShowLoader'
import StatusBarHeader from '../components/StatusBarHeader'
import AppStyles from '../styles/AppStyles'
import { sendPostRequestWithAccessToken, sendPostRequestWithAccessTokenAndBody, sendPostRequest } from '../Utils/RestApiService'
import { CHECK_SIZE_FOR_INVENTORY, GET_ALL_CATEGORIES, GET_HOME_SCREEN_DATA, IMAGE_BASE_URL, SEARCH_ALL } from '../Utils/UrlClass'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addToCart, removeFromCart, deleteAll, changeDeliveryAddress, setLocation, showStoreAlert, changeSelectedTab, showBackButton} from '../redux/actions'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import WatermarkView from '../components/WatermarkView'
import { IndicatorViewPager, PagerDotIndicator} from 'react-native-best-viewpager'
import { logEvent } from "../Utils/AnalyticsUtils";
import ResponseAlert from '../components/ResponseAlert'
const height = Dimensions.get('window').height


const data = ['Wine', 'Beer', 'Liquor', 'Seltzer', 'Mixers']
const dataImages = [require('../../assets/wine.png'), 
                    require('../../assets/beer.png'),
                    require('../../assets/liquor.png'),
                    require('../../assets/seltzes.png'),
                    require('../../assets/mixers.png')]
const searchAllList = ['ddd', 'dd', 'ckjnk', 'khjbk']                    
var scope = ''
class Home extends Component{
    constructor(props){
        super(props)
        this.state={
            isLoading:true,
            wineData:[],
            beerData:[],
            liquorData:[],
            mixerData:[],
            seltzersData:[],
            searchAddressText:'',
            allCategories:'',
            //showProductSearchBar:false,
            searchAllList:'',
            beerCategoryData:'',
            wineCategoryData:'',
            liquorCategoryData:'',
            seltzersCategoryData:'',
            mixerCategoryData:'',
            stateToCheckAddress:this.props.data.address,
            bannerData:[],
            cartLength:this.props.data.cart.length,
            responseText:'',
            responseAlert:false,
            enableBannerClick:true



        }
        this.modalY = new Animated.Value(0);
        this.props.navigation.addListener(
            'focus',
               payload => {
                  this.getData()
                    
                }
          );
    }

    componentDidUpdate(){
     //   console.log('componentDidUpdate', this.props.data.navigateToMyOrder)
        if(this.props.data.address !=='' && (this.props.data.address !== this.state.stateToCheckAddress)){
            this.setState({stateToCheckAddress:this.props.data.address},async()=>{
                await this.getData()
            })
        }
        if(this.props.data.cart.length !== this.state.cartLength){
            this.setState({cartLength:this.props.data.cart.length}, async()=>{
                await this.getData()
            })
        }
        if(this.props.data.isLoggedIn && this.props.data.navigateToMyOrder){
           // console.log('didUpdateHome', 'myorder')
            this.props.navigation.navigate('MyOrder')
        }
    }

    async componentDidMount(){
        scope = this
        
        if(this.props.data.isLoggedIn && this.props.data.navigateToMyOrder){
            this.props.navigation.navigate('MyOrder')
        }else{
           // console.log('homePros', JSON.stringify(this.props))
            await this.props.changeSelectedTab('Home')
            logEvent('Home_Page')
            await this.getData()
        }
    }

    async getData(){
        this.props.showBackButton(false)
        await this.getAllCategories()
        await this.getHomeScreenData()
    }

   

    async getAllCategories(){
        this.setState({isLoading:true})
        const credentials = {
            latitude:this.props.data.latitude,
            longitude:this.props.data.longitude 
        }
        let res = await sendPostRequest(GET_ALL_CATEGORIES, credentials);
        //console.log('getAllCategories', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({allCategories:res.response.userData},()=>{
                for(let i=0; i<this.state.allCategories.length; i++){
                    if(this.state.allCategories[i].title === 'Wine'){
                        this.setState({wineCategoryData:this.state.allCategories[i]})
                    }else if(this.state.allCategories[i].title === 'Liquor'){
                        this.setState({liquorCategoryData:this.state.allCategories[i]})
                    }else if(this.state.allCategories[i].title === 'Beer'){
                        this.setState({beerCategoryData:this.state.allCategories[i]})
                    }else if(this.state.allCategories[i].title === 'Seltzer'){
                        this.setState({seltzersCategoryData:this.state.allCategories[i]})
                    }else if(this.state.allCategories[i].title === 'Mixers & Extras'){
                        this.setState({mixerCategoryData:this.state.allCategories[i]})
                    } 
                }
            })
        }else{
            this.setState({isLoading:false},()=>{
               // this.setState({responseText:'Something went wrong', responseAlert:true})
                //alert('Something went wrong')
            })
        }
    }

    async getHomeScreenData(){
        const credentials = {
            latitude:this.props.data.latitude,
            longitude:this.props.data.longitude,
            selectedStoreId:this.props.data.cart.length>0?this.props.data.cart[0].storeId._id:''
        }
        let res = await sendPostRequest(GET_HOME_SCREEN_DATA, credentials,  global.accessToken);
        console.log('resHome', JSON.stringify(res.response.getBanners))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({bannerData:res.response.getBanners})
            await this.checkCartProducts(res.response.wineProData, '')
            await this.checkCartProducts(res.response.beerProData, 'Beer')
            await this.checkCartProducts(res.response.liqiuorProData, 'Liquor')
            await this.checkCartProducts(res.response.seltzerProData, 'Seltzer')
            await this.checkCartProducts(res.response.mixedProData, 'Mixers & Extras')
            this.setState({isLoading:false})
            // this.setState({wineData:res.response.wineProData, beerData:res.response.beerProData, liquorData:res.response.liqiuorProData},()=>{
            //     this.setState({isLoading:false})
            // })
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    async checkCartProducts(_data, type){
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
        switch (type){
            case 'Beer':
            this.setState({beerData:data})
            break;
            case 'Liquor':
            this.setState({liquorData:data})
            break;
            case 'Seltzer':
            this.setState({seltzersData:data})
            break;
            case 'Mixers & Extras':
            this.setState({mixerData:data})    
            break;
            default :
            this.setState({wineData:data})
            break;
        }
       // this.setState({isLoading:false})
    }

    
   
    productSearchBarView(){
        if(this.state.showProductSearchBar){
            return(
                <View style={{width:'100%', padding:10, paddingTop:5, paddingHorizontal:20, marginTop:10}}>
                    <TouchableOpacity activeOpacity={1} 
                    style={{borderWidth:1, borderColor:AppStyles.colorSet.mainTextColor, width:'100%', padding:10,
                    borderRadius:25, alignItems:'center', flexDirection:'row', }}>
                        <Image resizeMode={'contain'} source={require('../../assets/search.png')} style={{height:18, width:18, }}/>
                        <TextInput 
                            ref={(rf) => {this.phone = rf}}
                            placeholder='Search Products, Brands'
                            onChangeText={(text)=>this.searchAll(text)}
                            placeholderTextColor={AppStyles.colorSet.mainTextColor}
                            style={[AppStyles.styleSet.textInputStyle, {marginHorizontal:15, flex:1, fontSize:12, padding:0}]}
                        /> 
                    </TouchableOpacity>
                    {this.searchAllListView()}
                </View>
            )
        }
    }
    searchAllListItemView(item, index){
        return(
            <TouchableOpacity onPress={()=>{
                this.hideProductSearchView()
                item.type==='Category'?this.navigateToProductCategory(item, item.title):this.props.navigation.navigate('ProductDetails',{
                productId:item.productId, storeId:item.storeId
              })
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

    searchAllListView(){
        if(this.state.searchAllList.length>0){
            return(
                <FlatList
                    data={this.state.searchAllList}
                    extraData={this.state.searchAllList}
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

    async searchAll(text){
       if(text.length===0){
           this.setState({searchAllList:''})
       }
        const credentials = {
            searchText:text
        }
        let res = await sendPostRequest(SEARCH_ALL, credentials);
        //console.log('resProfile11', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({searchAllList:res.response.userData})
        }else{
           // this.setState({isLoading:false},()=>alert('Something went wrong'))
        }
    }

    async changeLocation(data, details){
        let coord = {latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng, 
            address: data.description,}
            this.setState({stateToCheckAddress:data.description})
        await this.props.setLocation(coord)
        this.getData()
    }

    searchBarView(){
        if(this.props.data.address===''){
            return(
                <View style={{width:'100%', paddingHorizontal:20, marginTop:10}}>
                    <GooglePlacesAutocomplete
                        placeholder='Enter Delivery Address'
                        ref={(rf) => {this.googleAuto = rf}}
                        minLength={2}
                        autoFocus={false}
                        keyboardShouldPersistTaps={'always'}
                        returnKeyType={'search'}
                        listViewDisplayed='false'
                        fetchDetails={true}
                        //isRowScrollable
                        renderDescription={row => row.description}
                        onPress={(data, details = null) => {
                            // 'details' is provided when fetchDetails = true
                        // console.log("data", JSON.stringify(details));
                            this.changeLocation(data, details)
                        }}
                        autoFocus={true}
                        renderLeftButton={()=>
                        <View style={{marginBottom:2}}>
                            <Image resizeMode={'contain'} source={require('../../assets/search.png')} 
                            style={{height:18, width:18, }}/>
                        </View>}
                        getDefaultValue={() => ''}

                        query={{
                        key: 'AIzaSyAYbSbQqDQm2u092NYdX9-CxcYyRDY6YSk',
                        language: 'en',
                        //types: 'address'
                        }}
                        textInputProps={{ placeholderTextColor: AppStyles.colorSet.mainTextColor, 
                            // onChangeText:(text)=>{
                            //     let coord = {
                            //         latitude:this.props.data.latitude,
                            //         longitude:this.props.data.longitude,
                            //         address:text
                            //     }
                            //     this.props.setLocation(coord)
                            // },
                        fontFamily:AppStyles.fontFamily.M_SEMIBOLD
                        //  , value:this.props.data.address
                        }}
                        styles={{
                        textInputContainer: {
                            height:Platform.OS==='android'?50:40,
                            textAlign: 'center', 
                            borderRadius:25,
                            borderWidth:1, 
                            borderColor:AppStyles.colorSet.mainTextColor,
                            alignItems:'center',
                            paddingHorizontal:10,
                            justifyContent:'center',
                            paddingTop:0,
                            paddingBottom:0
                        },
                        textInput: {
                            // borderRadius:25,
                            // borderWidth:1, 
                            // borderColor:AppStyles.colorSet.mainTextColor,
                            backgroundColor:'transparent',
                            color:AppStyles.colorSet.mainTextColor,
                            fontFamily:AppStyles.fontFamily.M_SEMIBOLD,
                            fontSize:12,
                            height:30,
                            marginLeft:5,
                            marginTop:2,
                            //fontSize: AppStyles.fontSet.middle
                        },
                        description: {
                        // fontWeight: 'bold'
                        },
                        predefinedPlacesDescription: {
                            color: AppStyles.colorSet.mainTextColor
                        },
                        listView: {
                            borderWidth: 0,
                        },
                        }}
                        currentLocation={false}
                        currentLocationLabel='Current location'
                        nearbyPlacesAPI='GooglePlacesSearch'
                        // GoogleReverseGeocodingQuery={{
                        // }}
                        // GooglePlacesSearchQuery={{
                        //     rankby: 'distance',
                        //     types: 'food'
                        // }}
                        filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3', 'locality', 'street_address']}
                        debounce={200} 
                    />
                </View>

            )
        }
    }

    _renderDotIndicator() {
        return <PagerDotIndicator 
        selectedDotStyle={{height:12, width:12, borderRadius:6, backgroundColor:AppStyles.colorSet.mainTextColor}} 
        dotStyle={{height:12, width:12, borderRadius:6, backgroundColor:'#e0e0e0'}} 
        style={{position:'absolute', bottom:30, alignSelf:'center'}} pageCount={this.state.bannerData.length} />;
    }

    onPageScrollStateChanged(event){
        //console.log('pager', event.nativeEvent.pageScrollState)
        if(Platform.OS==='android'){
            if(event.nativeEvent.pageScrollState === 'dragging'){
                scope.setState({enableBannerClick:false})
            }else if(event.nativeEvent.pageScrollState === 'idle'){
                scope.setState({enableBannerClick:true})
            }
        }
    }

    pagerView(){
        if(this.props.data.address!=='' && !this.props.data.showAddAddressAlert){
            return(
                <View style={{height:200}}>
                    <IndicatorViewPager
                        ref={(viewPager) => {this.viewPager = viewPager}}
                        style={{height:200,}}
                        autoPlayEnable={true}
                        autoPlayInterval={5000}
                        onPageScrollStateChanged={this.onPageScrollStateChanged}
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

    navigateTo(item, linkUrl){
        if(linkUrl === 'Wine'){
            this.props.navigation.navigate('ProductCategory',{itemId:this.state.wineCategoryData._id, type:linkUrl})
            }else if(linkUrl === 'Beer'){
                this.props.navigation.navigate('ProductCategory',{itemId:this.state.beerCategoryData._id, type:linkUrl})
            }else if(linkUrl === 'Liquor'){
                this.props.navigation.navigate('ProductCategory',{itemId:this.state.liquorCategoryData._id, type:linkUrl})
            }else if(linkUrl === 'Seltzer'){
                this.props.navigation.navigate('ProductCategory',{itemId:this.state.seltzersCategoryData._id, type:linkUrl})
            }else if(linkUrl === 'Mixers & Extras'){
                this.props.navigation.navigate('ProductCategory',{itemId:this.state.mixerCategoryData._id, type:linkUrl})
        }
    }

    bannerClick(item, linkUrl){
        if(Platform.OS==='android'){
            if(item.linkType === 'Category'){
                setTimeout(()=>{
                    this.state.enableBannerClick?this.navigateTo(item, linkUrl):''
                }, 50)
            }else{
                let url = item.bannerLink.split('/')
                let productId = url[url.length-1]
                let storeId = url[url.length-2]
                setTimeout(()=>{
                    console.log('enableBabnner', this.state.enableBannerClick)
                    this.state.enableBannerClick?
                    this.props.navigation.navigate('ProductDetails',{
                        productId:productId, storeId:storeId
                    }):''
                }, 50)
            }
        }else{
            if(item.linkType === 'Category'){
                this.navigateTo(item, linkUrl)
            }else{
                let url = item.bannerLink.split('/')
                let productId = url[url.length-1]
                let storeId = url[url.length-2]
                this.props.navigation.navigate('ProductDetails',{
                    productId:productId, storeId:storeId
                })
               // console.log('url', productId+'   dc'+storeId)

            }
        }
       // this.navigateToProductCategory(this.state.wineCategoryData, type)
        
    }

    bannerView(item, index){
        let imageUrl = IMAGE_BASE_URL+item.image
        let linkUrl = item.bannerLinkMobile
      //  console.log('linkUrl', item.bannerLinkMobile)
        return(
            <TouchableOpacity onPress={()=>{
                this.bannerClick(item, linkUrl)
            }} style={{height:200, width:'100%',}}>
                <ImageBackground source={{uri:imageUrl}} resizeMode={'contain'} style={{flex:1,  justifyContent:'center',paddingLeft:20, }}>
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
    
    categoryView(){
        return(
            <View style={{width:'100%', padding:20, paddingTop:this.props.data.address!==''?0:20}}>
                <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:16, fontFamily:AppStyles.fontFamily.M_SEMIBOLD}}>
                    Categories
                </Text>
                <FlatList
                    data={this.state.allCategories}
                    extraData={this.state.allCategories}
                    horizontal
                    style={{marginTop:15,}}
                    renderItem={({ item, index }) => (
                    this.categoryItemView(item, index)
                    )}
                    keyExtractor={item => item._id}
                />

            </View>
        )
    }

    navigateToProductCategory(item, type){
        this.props.navigation.navigate('ProductCategory',{itemId:item._id, type:type})

    }


    async checkInventory(itemData, type){
        //this.setState({isLoading:true})
        let credentials = {
            productId:type==='storeAlert'?itemData.selectedItemData.productId:itemData.productId,
            sizeId:type==='storeAlert'?itemData.selectedItemData._id:itemData._id,
            storeId:type==='storeAlert'?itemData.selectedItemData.storeId._id:itemData.storeId._id
        }
        let res = await sendPostRequestWithAccessTokenAndBody(CHECK_SIZE_FOR_INVENTORY, credentials,  global.accessToken);
        console.log('CHECK_SIZE_FOR_INVENTORY', JSON.stringify(credentials))
        //console.log('quantity', itemData.selectedItemData.quantityOfProductInCart<res.response.userData.quantity)
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
                switch (type){
                    case 'storeAlert':
                        if(itemData.selectedItemData.quantityOfProductInCart < res.response.userData.quantity){
                            this.props.showStoreAlert(itemData)
                        }else{
                            let alertText = res.response.userData.quantity>1?'There are '+res.response.userData.quantity+' items left in stock':'There is '+res.response.userData.quantity+' item left in stock'
                            this.setState({responseText:alertText, responseAlert:true})
                            
                        }
                    break;
                    case 'addToCart':
                        if(itemData.quantityOfProductInCart < res.response.userData.quantity){
                            this.props.addToCart(itemData)
                        }else{
                            let alertText = res.response.userData.quantity>1?'There are '+res.response.userData.quantity+' items left in stock':'There is '+res.response.userData.quantity+' item left in stock'
                            this.setState({responseText:alertText, responseAlert:true})
                            
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

    categoryItemView(item, index){
        let imageUrl = IMAGE_BASE_URL+item.image
        return(
            <TouchableOpacity onPress={()=>this.navigateToProductCategory(item, item.title)} 
                style={{marginLeft:index!==0?15:0, alignItems:"center",}}>
                <Image resizeMode={'contain'} source={{uri:imageUrl}} style={{height:60, width:60, borderRadius:30, 
                    alignSelf:'center',}}/>
                <Text style={{color:'white', fontSize:14, fontFamily:AppStyles.fontFamily.M_BOLD, marginTop:10}}>
                        {item.title==='Mixers & Extras'?'Mixers':item.title}
                </Text>
            </TouchableOpacity>
        )
    }

    productView(data, type){
        let shape = require('../../assets/wine-shape.png')
        switch (type){
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
            <View style={{width:'100%', padding:20, paddingTop:5}}>
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                        <TouchableOpacity>
                            <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, 
                                fontFamily:AppStyles.fontFamily.M_BOLD, marginLeft:10}}>
                                    {'            '}
                            </Text>
                        </TouchableOpacity>
                        <Image 
                        resizeMode={'contain'}
                        source={shape} 
                        style={{height:30, width:'60%'}}/>
                        <TouchableOpacity>
                            <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, 
                                fontFamily:AppStyles.fontFamily.M_BOLD, marginLeft:10}}>
                                    {'            '}
                            </Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={()=>{
                             if(type === ''){
                                this.navigateToProductCategory(this.state.wineCategoryData, type)
                             }else if(type === 'Beer'){
                                this.navigateToProductCategory(this.state.beerCategoryData, type)
                             }else if(type === 'Liquor'){
                                this.navigateToProductCategory(this.state.liquorCategoryData, type)
                             }else if(type === 'Seltzers'){
                                this.navigateToProductCategory(this.state.seltzersCategoryData, type)
                             }else if(type === 'Mixers & Extras'){
                                this.navigateToProductCategory(this.state.mixerCategoryData, type)
                             }
                             }}>
                            <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, 
                                fontFamily:AppStyles.fontFamily.M_BOLD, marginLeft:10}}>
                                    View all
                            </Text>
                        </TouchableOpacity> */}
                </View>
                <TouchableOpacity style={{alignSelf:'flex-end'}} onPress={()=>{
                        if(type === ''){
                        this.navigateToProductCategory(this.state.wineCategoryData, type)
                        }else if(type === 'Beer'){
                        this.navigateToProductCategory(this.state.beerCategoryData, type)
                        }else if(type === 'Liquor'){
                        this.navigateToProductCategory(this.state.liquorCategoryData, type)
                        }else if(type === 'Seltzer'){
                        this.navigateToProductCategory(this.state.seltzersCategoryData, type)
                        }else if(type === 'Mixers & Extras'){
                        this.navigateToProductCategory(this.state.mixerCategoryData, type)
                        }
                        }}>
                    <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, 
                        fontFamily:AppStyles.fontFamily.M_BOLD, marginTop:10}}>
                            View all
                    </Text>
                </TouchableOpacity>
                <FlatList
                    data={data}
                    extraData={data}
                    horizontal
                    style={{marginTop:5,}}
                    renderItem={({ item, index }) => (
                    this.productItemView(item, index)
                    )}
                    keyExtractor={item => item._id}
                />
            </View>
        )
    }
    productItemView(item, index){
        let imageUrl = IMAGE_BASE_URL+item.allSizes[0].image
        
        return(
            <View 
              style={{marginLeft:index!==0?15:0, width:175, overflow:'hidden', }}>
                <TouchableOpacity onPress={()=>{
                    if(this.props.data.address===''){
                        let data = item.allSizes[0]
                        data.isOnAnotherStore = item.isOnAnotherStore
                        data.title = item.title
                        data.image = item.allSizes[0].image
                        data.storeId = item.storeId
                        data.productId = item.productId
                        this.props.addToCart(data)
                    }else{
                    this.props.navigation.navigate('ProductDetails',{
                    productId:item.productId, storeId:item.storeId._id
                }
                )}
              }} >
                    <View style={{height:'auto', width:'100%', alignItems:'center'}}>
                        <Image resizeMode={'contain'} source={{uri:imageUrl}} 
                        style={{height:250, width:175, }}/>
                        {item.onSale && <TouchableOpacity style={{height:18, width:45, borderRadius:20, justifyContent:'center',
                            backgroundColor:AppStyles.colorSet.mainTextColor, position:'absolute', right:0, top: 0}}>
                                <Text style={{color:'white', fontSize:8, alignSelf:'center',
                                    fontFamily:AppStyles.fontFamily.M_BOLD}}>
                                        On-sale
                                </Text>
                        </TouchableOpacity>}
                    </View>
                        <Text numberOfLines={2} style={{color:AppStyles.colorSet.mainTextColor, fontSize:16, marginTop:5, 
                            fontFamily:AppStyles.fontFamily.M_BOLD, alignSelf:'center', textAlign:'center', height:40}}>
                            {item.title}
                        </Text>
                        <Text numberOfLines={1} style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, marginTop:10, 
                            fontFamily:AppStyles.fontFamily.M_SEMIBOLD, alignSelf:'center', textAlign:'center'}}>
                            {item.isOnAnotherStore?'Multiple Stores':item.storeId.title}
                        </Text>
                        <View style={{flexDirection:'row', width:'100%', justifyContent:'space-between', paddingHorizontal:5}}>
                            <View style={{flexDirection:'row',  alignItems:'center', marginTop:5}}>
                                {!item.isOnAnotherStore && <Text style={{color:'white', fontSize:14, fontFamily:AppStyles.fontFamily.M_BOLD}}>
                                        {item.hasOwnProperty('allSizes')?'$'+item.allSizes[0].finalPrice:''}
                                </Text>}
                                {item.isOnAnotherStore && <Text style={{color:'white', fontSize:14, fontFamily:AppStyles.fontFamily.M_BOLD}}>
                                        {/* ${item.priceRange.min+' - '+'$'+item.priceRange.max} */}
                                        ${item.hasOwnProperty('priceRange')?item.priceRange.min+' - '+'$'+item.priceRange.max:''}
                                </Text>}
                                {item.onSale && <Text style={{color:'grey', fontSize:12, fontFamily:AppStyles.fontFamily.M_BOLD, 
                                        marginLeft:35, textDecorationLine:'line-through'}}>
                                        {item.hasOwnProperty('allSizes')?'$'+item.allSizes[0].finalPrice:''}
                                </Text>}
                            </View>
                            <Text numberOfLines={1} style={{color:'grey', fontSize:14, marginTop:5, 
                                fontFamily:AppStyles.fontFamily.M_SEMIBOLD,}}>
                                {item.allSizes[0].attributeValue}{item.allSizes[0].attributeId.title}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{width:'100%', flexDirection:'row',  alignItems:'center', marginTop:10, justifyContent:'center'}}>
                        <TouchableOpacity
                        onPress={()=>{
                            if(item.allSizes[0].hasOwnProperty('quantityOfProductInCart')&&item.allSizes[0].quantityOfProductInCart>0){
                                let data = item.allSizes[0]
                                data.isOnAnotherStore = item.isOnAnotherStore
                                data.title = item.title
                                data.image = item.allSizes[0].image
                                data.storeId = item.storeId
                                data.productId = item.productId
                                this.props.removeFromCart(data)
                            }}}>
                            <Image source={require('../../assets/minus.png')} style={{height:16, width:16}}/>
                        </TouchableOpacity>
                        <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:14, marginHorizontal:5, 
                            fontFamily:AppStyles.fontFamily.M_SEMIBOLD,}}>
                            {item.allSizes[0].hasOwnProperty('quantityOfProductInCart')?item.allSizes[0].quantityOfProductInCart:0}
                        </Text>
                        <TouchableOpacity onPress={ async()=>{
                            if(this.props.data.address!=='' && item.isOnAnotherStore){
                                this.props.navigation.navigate('ProductDetails',{
                                    productId:item.productId, storeId:item.storeId._id
                                })
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
                        }}>
                            <Image source={require('../../assets/add.png')} style={{height:16, width:16}}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={async()=> {
                            if(this.props.data.address!=='' && item.isOnAnotherStore){
                                this.props.navigation.navigate('ProductDetails',{
                                    productId:item.productId, storeId:item.storeId._id
                                })
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
                        }} 
                        disabled={item.allSizes[0].hasOwnProperty('quantityOfProductInCart')&&item.allSizes[0].quantityOfProductInCart>0}
                        style={{height:20, width:80, borderRadius:20, justifyContent:'center',
                        backgroundColor:AppStyles.colorSet.mainTextColor, marginLeft:15}}>
                            <Text style={{color:'white', fontSize:10, alignSelf:'center',
                                fontFamily:AppStyles.fontFamily.M_BOLD}}>
                                    {item.allSizes[0].hasOwnProperty('quantityOfProductInCart')&&item.allSizes[0].quantityOfProductInCart>0?'In Your Cart!':'Add to cart'}
                            </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    

  
    

    render(){
        return(
            <SafeAreaView style={{flex:1, backgroundColor:'black'}}>
                <StatusBar barStyle={'light-content'}/>
                <WatermarkView/>
                {/* {this.homeHeader()} */}
                <ScrollView keyboardShouldPersistTaps={'always'}>
                    <View>
                        
                        {/* <StatusBarHeader props={this.props}/> */}
                        {this.searchBarView()}
                        {this.productSearchBarView()}
                        {this.props.data.showChangeAddressModal?null:this.pagerView()}
                        {this.categoryView()}
                        {this.state.wineData.length>0?this.productView(this.state.wineData, ''):null}
                        {this.state.beerData.length>0?this.productView(this.state.beerData, 'Beer'):null}
                        {this.state.liquorData.length>0?this.productView(this.state.liquorData, 'Liquor'):null}
                        {this.state.seltzersData.length>0?this.productView(this.state.seltzersData, 'Seltzer'):null}
                        {this.state.mixerData.length>0?this.productView(this.state.mixerData, 'Mixers & Extras'):null}
                    </View>
                </ScrollView>
                {this.state.isLoading?<ShowLoader/>:null}
                <ResponseAlert
                 visible={this.state.responseAlert}
                 responseText={this.state.responseText}
                 onOkayPress={()=>this.setState({responseAlert:false, responseText:''})}
                />
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
    deleteAll,
    changeDeliveryAddress,
    setLocation,
    showStoreAlert,
    changeSelectedTab,
    showBackButton,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Home);