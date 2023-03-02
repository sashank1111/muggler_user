import React,{ Component } from "react";
import {
    SafeAreaView,
    View,
    StatusBar,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList
} from 'react-native'
import AppStyles from '../../styles/AppStyles'
import { createStackNavigator } from '@react-navigation/stack';
import StatusBarHeader from "../../components/StatusBarHeader";
import ShowLoader from "../../components/ShowLoader";
import { sendPostRequestWithAccessTokenAndBody } from "../../Utils/RestApiService";
import { GET_ORDERS } from "../../Utils/UrlClass";
import WatermarkView from "../../components/WatermarkView";
const weekDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
import { connect } from 'react-redux';
import {logEvent} from '../../Utils/AnalyticsUtils'
import { bindActionCreators } from 'redux';
import ResponseAlert from "../../components/ResponseAlert";
import {navigateToMyOrders, showBackButton} from '../../redux/actions'
class MyOrder extends Component{
    constructor(props){
        super(props)
        this.state={
            tabSelected:"current",
            activeOrderData:'',
            isLoading:true,
            pastOrderData:'',
            orderData:'',
            responseAlert:false,
            responseText:''

        }
        this.props.navigation.addListener(
            'focus',
               payload => {
                  this.getOrderlist()
                    
                }
          );
    }

    componentDidMount(){
        logEvent('MyOrder_Page')
        if(this.props.data.navigateToMyOrder){
            this.props.navigateToMyOrders(false)
        }
        this.getOrderlist()
    }


    async getOrderlist(){
        this.props.showBackButton(true)
        this.setState({isLoading:true})
        const credentials = {
        }
        let res = await sendPostRequestWithAccessTokenAndBody(GET_ORDERS, credentials,  global.accessToken);
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            this.setState({activeOrderData:res.response.proDataActive, pastOrderData:res.response.proDataDelivered}
                ,()=>{
                    if(this.state.tabSelected==='current'){
                       this.setState({orderData: this.state.activeOrderData, isLoading:false})
                    }else{
                        this.setState({orderData: this.state.pastOrderData, isLoading:false})
                    }
                })
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    tab(){
        return(
            <View style={{padding:20, paddingTop:10}}>
                <View style={[AppStyles.styleSet.viewWithYelloBorder, {alignItems:'flex-start', flexDirection:'row'}]}>
                    <TouchableOpacity onPress={()=>this.setState({orderData:this.state.activeOrderData, tabSelected:'current'},()=>this.getOrderlist())} 
                    style={[styles.selectedTab, {flex:.5, borderBottomLeftRadius:30, borderBottomRightRadius:30, 
                        borderTopRightRadius:30, 
                          borderTopLeftRadius:30, backgroundColor:this.state.tabSelected==='current'?
                          AppStyles.colorSet.mainTextColor:'black'}]}>
                        <Text style={this.state.tabSelected==='current'?
                        AppStyles.styleSet.textWithWhiteColor:AppStyles.styleSet.textWithYellowColor}>
                            Current Orders
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>this.setState({orderData:this.state.pastOrderData,tabSelected:'past'},()=>this.getOrderlist())} 
                    style={[styles.selectedTab, {flex:.5, borderTopLeftRadius:30,
                        borderBottomLeftRadius:30, borderBottomRightRadius:30, 
                          borderTopRightRadius:30, backgroundColor:this.state.tabSelected==='past'?
                          AppStyles.colorSet.mainTextColor:'black'}]}>
                        <Text style={this.state.tabSelected==='past'?
                        AppStyles.styleSet.textWithWhiteColor:AppStyles.styleSet.textWithYellowColor}>
                              Past Orders
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    renderTab(){
        return(
            <View style={{flex:1, padding:20, paddingTop:0, }}>
                <FlatList
                    data={this.state.orderData}
                    showsVerticalScrollIndicator={false}
                    style={{flex:1, }}
                    renderItem={({ item, index }) => (
                    this.itemView(item, index)
                    )}
                    keyExtractor={item => item}
                />
            </View>
        )
    }

    itemView(item, index){
        let deliverTime = ''
        let openTime = ''
        let closeTime = ''
        let minutes = ''
        let hours = ''
        let timeUnit = 'AM'
        let orderStatus = item.orderStatus
        if(orderStatus === 'PENDING'){
            orderStatus = 'ORDER PLACED'
        }else if(orderStatus == 'CONFIRMED'){
            orderStatus = 'DRIVER ASSIGNED'
        }
        // if(item.isScheduled){
        //     let _date = new Date(item.scheduleDateTimeStart)
        //     let date = _date.getDate()
        //     if(date.toString().length===1){
        //         date = '0'+date
        //     }
        //     deliverTime = month[_date.getMonth()]+' '+date+', '+_date.getFullYear()
        //     openTime = item.deliveryTimeSlot
        // }else{
            let _date = new Date(item.createdAt)
            let date = _date.getDate()
            if(date.toString().length===1){
                date = '0'+date
            }
            deliverTime = month[_date.getMonth()]+' '+date+', '+_date.getFullYear()
            minutes = _date.getMinutes()
            if(minutes.toString().length===1){
                minutes = '0'+minutes
            }
            hours = _date.getHours()
            if(hours.toString().length===1){
                hours = '0'+hours
            }
            if(hours>11){
                hours =  hours - 12
                timeUnit = 'PM'
            }
            openTime = hours+':'+minutes+' '+timeUnit
            closeTime = (hours+1)+':'+minutes+' '+timeUnit
        // }
        return(
            <TouchableOpacity onPress={()=>this.props.navigation.navigate('OrderDetails',{orderId:item._id})} style={{width:'100%', marginTop:20, borderBottomWidth:1.5, 
                borderBottomColor:AppStyles.colorSet.mainTextColor, paddingBottom:20}}>
                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                    <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%'}}>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor,{color:'#d3d3d3', 
                        fontSize:15}]}>
                            {item.serialNumberOrder}
                        </Text>
                        <Text style={[AppStyles.styleSet.textWithYellowColor,{
                        fontSize:15, marginLeft:15}]}>
                            {orderStatus}
                        </Text>
                    </View>
                    
                </View>
                <View style={{flexDirection:'row', marginTop:10}}>
                    <Text style={[AppStyles.styleSet.textWithWhiteColor,{color:'#d3d3d3', 
                    fontSize:15}]}>
                        ${item.netAmount}
                    </Text>
                </View>
                <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:10}}>
                    <View style={{flexDirection:'row', flex:1, }}>
                        <Image 
                        resizeMode={'contain'}
                        source={require('../../../assets/pin.png')} 
                        style={{height:18, width:16,}}/>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor,{
                        fontSize:15, marginLeft:15, marginRight:10, flex:1}]}>
                            {item.userBillingAddressId.address}
                        </Text>
                    </View>
                    <View style={{justifyContent:'center'}}>
                        <Image 
                            resizeMode={'contain'}
                            source={require('../../../assets/right-arrow.png')} 
                            style={{height:20, width:20,}}/>
                    </View>
                </View>
                <Text style={[AppStyles.styleSet.textWithWhiteColor,{
                fontSize:15, marginTop:15, flex:1}]}>
                    {deliverTime} at {' '+openTime}
                </Text>
            </TouchableOpacity>
        )
    }


    render(){
        return(
            <SafeAreaView style={AppStyles.styleSet.screenContainer}>
                    <StatusBar barStyle={'light-content'}/>
                    <WatermarkView/>
                    {/* <StatusBarHeader props={this.props}/> */}
                    <View style={{height:50,alignItems:'center', paddingHorizontal:20,paddingTop:10}}>
                        <Image 
                        resizeMode={'contain'}
                        source={require('../../../assets/my-order.png')} 
                        style={{flex:1}}/>
                    </View>
                    <View style={{flex:1,}}>
                        {this.tab()}
                        {this.renderTab()}
                    </View>
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
    selectedTab:{
        height:'100%',
        backgroundColor:AppStyles.colorSet.mainTextColor,
        justifyContent:'center', 
        alignItems:'center', 
    },
    unselectedTab:{

    }
})
const mapStateToProps = (state) => {
    const { data } = state
    return { data }
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
    navigateToMyOrders,
    showBackButton
    }, dispatch)
);


export default connect(mapStateToProps, mapDispatchToProps)(MyOrder);