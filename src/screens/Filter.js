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
    Touchable
} from 'react-native'
import CheckBox from '@react-native-community/checkbox';
import AppStyles from '../styles/AppStyles'
import CheckBoxListView from '../components/CheckBoxListView';
import RangeSlider from 'rn-range-slider';
import ShowLoader from '../components/ShowLoader';
import { sendPostRequestWithAccessTokenAndBody } from '../Utils/RestApiService';
import { GET_FILTER_DATA } from '../Utils/UrlClass';
import { connect } from 'react-redux';
import ResponseAlert from '../components/ResponseAlert';
const data = ['chItem1', 'chItem2', 'chItem3', 'chItem4' ]


class Filter extends Component{
    constructor(props){
        super(props)
        this.state={
            showSortDropdownView:false,
            showLiquorDropdownView:false,
            showVarietyDropdownView:false,
            showBrandDropdownView:false,
            showPriceDropdownView:false,
            showCountryDropdownView:false,
            showContainerDropdownView:false,
            showTagsDropdownView:false,
            showStoreDropdownView:false,
            sortArray:[],
            liquorArray:[],
            varietyArray:[],
            priceArray:[],
            brandArray:[],
            countryArray:[],
            containerArray:[],
            tagsArray:[],
            storeArray:[],
            rangeLow:0,
            rangeHigh:50,
            responseText:'',
            responseAlert:false,
            isLoading:true,
            categoryId:this.props.route.params.categoryId,
            checkBoxData:[
                {
                    title:'Sort',
                    data:[{title:'Smuggler Select'}, {title:'Best Seller'}, {title:'On Sale'}, {title:'Price: Low to High'}, 
                    {title:'Price: High to Low'}, {title:'A to Z'}, {title:'Z to A'}]
                },
                {
                    title:'Liquor Type',
                    data:[]
                },
                {
                    title:'Variety',
                    data:[]
                },
                {
                    title:'Brand',
                    data:[]
                },
                {
                    title:'Price',
                    data:[{title:'Under $20'}, {title:'$20 To $40'}, {title:'$40 To $60'}, {title:'$60 And Up'}]
                },
                {
                    title:'Country',
                    data:[]
                },
                {
                    title:'Container',
                    data:[]
                },
                {
                    title:'Tags',
                    data:[]
                },
                {
                    title:'Store',
                    data:[]
                }
            ]
        }
        this.onCheckBoxValueChange = this.onCheckBoxValueChange.bind(this)
    }

   


    componentDidMount(){
        this.getFilterData()
       
    }

    async getFilterData(){
        var credentials = ''
        if(this.props.data.address===''){
            credentials = {
                categoryId: this.state.categoryId
            }
        }else{
            credentials = {
                categoryId: this.state.categoryId,
                latitude:this.props.data.latitude,
                longitude:this.props.data.longitude
            }
        }
        // if(this.props.data.latitude === 0 || this.props.data.latitude === ''){
        //     credentials = {
        //         brandIds: [],
        //         categoryId: this.state.categoryId,
        //         containerIds: [],
        //         countryIds: [],
        //         priceFilter: "",
        //         selectedStoreId: "",
        //         storeIds: [],
        //         subCategoryId: [],
        //         subCategoryTypesIds: [],
        //         tagIds: [],
        //     }
        // }else{
        //     credentials = {
        //             brandIds: [],
        //             categoryId: this.state.categoryId,
        //             containerIds: [],
        //             countryIds: [],
        //             priceFilter: "",
        //             selectedStoreId: "",
        //             storeIds: [],
        //             subCategoryId: [],
        //             subCategoryTypesIds: [],
        //             tagIds: [],
        //             latitude:this.props.data.latitude,
        //             longitude:this.props.data.longitude
        //         }
        // }
        let res = await sendPostRequestWithAccessTokenAndBody(GET_FILTER_DATA, credentials,  global.accessToken);
       // console.log('resFilterData', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            let mainArray = this.state.checkBoxData
            mainArray[1].data = res.response.allSubCatArray
            mainArray[2].data = res.response.allSubCatTypeArray
            mainArray[3].data = res.response.allBrandsArray
            mainArray[5].data = res.response.allCountryArray
            mainArray[6].data = res.response.allContainersArray
            mainArray[7].data = res.response.allTagsArray
            mainArray[8].data = res.response.allStoresArray
            this.setState({checkBoxData:mainArray},()=>this.setState({isLoading:false}))
            
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

     homeHeader(){
        return(
            <View style={{paddingVertical:10, paddingHorizontal:20}}>
                <Image 
                        resizeMode={'contain'}
                        source={require('../../assets/fitlers-shape.png')} 
                        style={{ width:'100%'}}/>
                <View style={{width:'100%', marginTop:15,
                    flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                        <TouchableOpacity 
                            style={[AppStyles.styleSet.viewWithYelloBackground,{borderRadius:15, 
                                height:'auto', padding:5, width:110,}]} 
                                onPress={()=>{
                                    this.props.navigation.navigate('ProductCategory',{
                                        sortArray:this.state.sortArray,
                                        liquorArray:this.state.liquorArray,
                                        varietyArray:this.state.varietyArray,
                                        brandArray:this.state.brandArray,
                                        priceArray:this.state.priceArray,
                                        countryArray:this.state.countryArray,
                                        containerArray:this.state.containerArray,
                                        tagsArray:this.state.tagsArray,
                                        storeArray:this.state.storeArray
                                    })
                                }}>
                                <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_MEDIUM}}>
                                    See Results
                                </Text>
                        </TouchableOpacity>
                
                    
                    <TouchableOpacity onPress={()=>this.clear()}>
                        <Text style={{color:AppStyles.colorSet.mainTextColor, fontSize:16, fontFamily:AppStyles.fontFamily.M_BOLD}}>
                                Clear filter
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    onCheckBoxValueChange(value, index, mainIndex){
        
        let title = this.state.checkBoxData[mainIndex].title
        let data = this.state.checkBoxData[mainIndex].data[index]._id
        let dataTitle = this.state.checkBoxData[mainIndex].data[index].title
        //console.log('onCheckBoxValueChange', dataTitle+' '+JSON.stringify(data))
        switch (title){
            case 'Sort':
                if(value){
                    if(!this.state.sortArray.includes(dataTitle)){
                      this.setState({sortArray:[dataTitle]})
                    }
                }else{
                    let array = this.state.sortArray
                    let itemIndex = array.indexOf(dataTitle)
                    if(itemIndex > -1){
                        array.splice(itemIndex, 1)
                        this.setState({sortArray:array})
                    }
                }
            break;
            case 'Liquor Type':
                if(value){
                    if(!this.state.liquorArray.includes(data)){
                      this.setState({liquorArray:[...this.state.liquorArray, data]})
                    }
                }else{
                    let array = this.state.liquorArray
                    let itemIndex = array.indexOf(data)
                    if(itemIndex > -1){
                        array.splice(itemIndex, 1)
                        this.setState({liquorArray:array})
                    }
                }
            break; 
            case 'Variety':
                if(value){
                    if(!this.state.varietyArray.includes(data)){
                      this.setState({varietyArray:[...this.state.varietyArray, data]})
                    }
                }else{
                    let array = this.state.varietyArray
                    let itemIndex = array.indexOf(data)
                    if(itemIndex > -1){
                        array.splice(itemIndex, 1)
                        this.setState({varietyArray:array})
                    }
                }
            break;  
            case 'Brand':
                if(value){
                    if(!this.state.brandArray.includes(data)){
                      this.setState({brandArray:[...this.state.brandArray, data]})
                    }
                }else{
                    let array = this.state.brandArray
                    let itemIndex = array.indexOf(data)
                    if(itemIndex > -1){
                        array.splice(itemIndex, 1)
                        this.setState({brandArray:array})
                    }
                }
            break; 
            case 'Price':
                if(value){
                    if(!this.state.priceArray.includes(dataTitle)){
                      this.setState({priceArray:[dataTitle]})
                    }
                }else{
                    let array = this.state.priceArray
                    let itemIndex = array.indexOf(dataTitle)
                    if(itemIndex > -1){
                        array.splice(itemIndex, 1)
                        this.setState({priceArray:array})
                    }
                }
            break; 
            case 'Country':
                if(value){
                    if(!this.state.countryArray.includes(data)){
                      this.setState({countryArray:[...this.state.countryArray, data]})
                    }
                }else{
                    let array = this.state.countryArray
                    let itemIndex = array.indexOf(data)
                    if(itemIndex > -1){
                        array.splice(itemIndex, 1)
                        this.setState({countryArray:array})
                    }
                }
            break; 
            case 'Container':
                if(value){
                    if(!this.state.containerArray.includes(data)){
                      this.setState({containerArray:[...this.state.containerArray, data]})
                    }
                }else{
                    let array = this.state.containerArray
                    let itemIndex = array.indexOf(data)
                    if(itemIndex > -1){
                        array.splice(itemIndex, 1)
                        this.setState({containerArray:array})
                    }
                }
            break; 
            case 'Tags':
                if(value){
                    if(!this.state.tagsArray.includes(data)){
                      this.setState({tagsArray:[...this.state.tagsArray, data]})
                    }
                }else{
                    let array = this.state.tagsArray
                    let itemIndex = array.indexOf(data)
                    if(itemIndex > -1){
                        array.splice(itemIndex, 1)
                        this.setState({tagsArray:array})
                    }
                }
            break; 
            case 'Store':
                if(value){
                    if(!this.state.storeArray.includes(data)){
                      this.setState({storeArray:[...this.state.storeArray, data]})
                    }
                }else{
                    let array = this.state.storeArray
                    let itemIndex = array.indexOf(data)
                    if(itemIndex > -1){
                        array.splice(itemIndex, 1)
                        this.setState({storeArray:array})
                    }
                }
            break;           
        }
       
       
        
    }

    changeVisibility(title){
        switch (title){
            case 'Sort':
            this.setState({showSortDropdownView:!this.state.showSortDropdownView})
            break;
            case 'Liquor Type':
            this.setState({showLiquorDropdownView:!this.state.showLiquorDropdownView})
            break; 
            case 'Variety':
            this.setState({showVarietyDropdownView:!this.state.showVarietyDropdownView})
            break;  
            case 'Brand':
            this.setState({showBrandDropdownView:!this.state.showBrandDropdownView})
            break; 
            case 'Price':
            this.setState({showPriceDropdownView:!this.state.showPriceDropdownView})
            break; 
            case 'Country':
            this.setState({showCountryDropdownView:!this.state.showCountryDropdownView})
            break; 
            case 'Container':
            this.setState({showContainerDropdownView:!this.state.showContainerDropdownView})
            break; 
            case 'Tags':
            this.setState({showTagsDropdownView:!this.state.showTagsDropdownView})
            break; 
            case 'Store':
            this.setState({showStoreDropdownView:!this.state.showStoreDropdownView})
            break;           
        }

    }


   

    categoryView(title, index){
        let visibility = true
        let selectedData = ''
        switch (title){
            case 'Sort':
            visibility = this.state.showSortDropdownView
            selectedData = this.state.sortArray
            break;
            case 'Liquor Type':
            visibility = this.state.showLiquorDropdownView
            selectedData = this.state.liquorArray
            break;  
            case 'Variety':
            visibility = this.state.showVarietyDropdownView
            selectedData = this.state.varietyArray
            break;  
            case 'Brand':
            visibility = this.state.showBrandDropdownView
            selectedData = this.state.brandArray
            break; 
            case 'Price':
            visibility = this.state.showPriceDropdownView
            selectedData = this.state.priceArray
            break;
            case 'Country':
            visibility = this.state.showCountryDropdownView
            selectedData = this.state.countryArray
            break;
            case 'Container':
            visibility = this.state.showContainerDropdownView
            selectedData = this.state.containerArray
            break;
            case 'Tags':
            visibility = this.state.showTagsDropdownView
            selectedData = this.state.tagsArray
            break;
            case 'Store':
            visibility = this.state.showStoreDropdownView
            selectedData = this.state.storeArray
            break;       
        }

        let titleToShow = title
        if(title==='Liquor Type'){
            titleToShow = this.props.route.params.type+' Type'
        }else if(title==='Country'){
            titleToShow='Origin'
        } 
        return(
            <View>
                <TouchableOpacity onPress={()=>this.changeVisibility(title)} style={{marginTop:10, paddingVertical:30,
                 borderBottomColor:'grey',
                    borderBottomWidth:0.5, overflow:'hidden',
                    justifyContent:'space-between', flexDirection:'row', alignItems:'center'}}>
                    <View style={{flexDirection:'row', alignItems:'center'}}>    
                        {title==='Sort' && <Image 
                            resizeMode={'contain'}
                            source={require('../../assets/sort.png')}
                            style={{ width:16, height:16, marginRight:10}}/>}
                        <Text style={[AppStyles.styleSet.textWithYellowColor]}>
                            {titleToShow}
                        </Text>
                    </View>
                    <Image 
                        resizeMode={'contain'}
                        source={!visibility?require('../../assets/plus_filter.png'):require('../../assets/minus_filter.png')}
                        style={{ width:16, height:16, }}/>
                </TouchableOpacity>
                <CheckBoxListView 
                    visibility={visibility}
                    data={this.state.checkBoxData} 
                    onCheckBoxValueChange={this.onCheckBoxValueChange}
                    mainIndex={index}
                    selectedData={selectedData}
                />
            </View>
        )
    }

    handleCall=(low,high)=>{
       // console.log('>>slider',low,high)
        this.setState({rangeLow:low, rangeHigh:high})
    }

    priceRangeView(){
        return(
            <View style={{marginTop:35, width:'100%'}}>
                <Text style={AppStyles.styleSet.textWithWhiteColor}>
                    PRICE
                </Text>
                <RangeSlider
                    style={{marginTop:20}}
                    min={18}
                    max={54}
                    step={1}
                    low = {this.state.rangeLow}
                    high = {this.state.rangeHigh}
                    renderThumb={()=>{
                        return(
                            <View style={{height:25, width:25, borderRadius:12.5, backgroundColor:AppStyles.colorSet.mainTextColor}}/>
                        )
                    }}
                    renderRail={()=>{
                        return(<View style={{height:2,backgroundColor:AppStyles.colorSet.mainTextColor,flex:1}}/>)
                    }}
                    renderRailSelected={()=>{
                        return(<View style={{height:2,backgroundColor:AppStyles.colorSet.mainTextColor,flex:1}}/>)
                    }}
                    onValueChanged={this.handleCall}
                />
                <View style={{marginTop:25, width:'100%', justifyContent:'space-between', flexDirection:'row'}}>
                    <Text style={AppStyles.styleSet.textWithWhiteColor}>
                        ${this.state.rangeLow}
                    </Text>
                    <Text style={AppStyles.styleSet.textWithWhiteColor}>
                        ${this.state.rangeHigh}
                    </Text>
                </View>
            </View>
        )
    }

    clear(){
        this.setState({sortArray:[], liquorArray:[], varietyArray:[], priceArray:[],
         brandArray:[], countryArray:[], containerArray:[], tagsArray:[], storeArray:[]})
    }

    render(){
        return(
            <SafeAreaView style={{flex:1, backgroundColor:'black'}}>
               <StatusBar barStyle={'light-content'}/>
               {this.homeHeader()}
               <ScrollView style={{flex:1, marginBottom:30}} >
                   <View style={{paddingHorizontal:20, justifyContent:'space-between', flex:1,}}>
                        <View style={{flex:1}}>
                            
                            {this.categoryView('Sort', 0)}
                            {this.categoryView('Liquor Type', 1)}
                            {/* {this.priceRangeView()} */}
                            {this.categoryView('Variety', 2)}
                            {this.categoryView('Brand', 3)}
                            {this.categoryView('Price', 4)}
                            {this.categoryView('Country', 5)}
                            {this.categoryView('Container', 6)}
                            {this.categoryView('Tags', 7)}
                            {this.categoryView('Store', 8)}
                        </View>
                        {/* <TouchableOpacity style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:35,}]}>
                            <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                APPLY
                            </Text>
                        </TouchableOpacity> */}
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
}const mapStateToProps = (state) => {
    const { data } = state
    return { data }
  };
  
  export default connect(mapStateToProps)(Filter);