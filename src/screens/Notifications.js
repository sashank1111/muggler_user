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
    Modal,
    FlatList
} from 'react-native'
import { sendPostRequestWithAccessToken, sendPostRequestWithAccessTokenAndBody } from "../Utils/RestApiService";
import { ACCEPT_OR_DECLINE_ORDER, GET_NOTIFICATIONS_LIST } from "../Utils/UrlClass";
import AppStyles from '../styles/AppStyles'
import {dateDiff} from '../components/HelperFunctions'
import ShowLoader from "../components/ShowLoader";
import WatermarkView from "../components/WatermarkView";
import BackButton from "../components/BackButton";
import StatusBarHeader from "../components/StatusBarHeader";
import {logEvent} from '../Utils/AnalyticsUtils'
import ResponseAlert from "../components/ResponseAlert";
import { showBackButton} from '../redux/actions'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
class Notifications extends Component{
    constructor(props){
        super(props)
        this.state={
            showDeliveryStatusModal:false,
            isLoading:true,
            data:'',
            responseAlert:false,
            responseText:''

        }
        this.props.navigation.addListener(
            'focus',
               payload => {
                   this.setState({isLoading:true},()=>this.getNotifications())
                }
          );


    }

    componentDidMount(){
        logEvent('Notification_Page')
      
        this.getNotifications()
    }


    async getNotifications(){
        this.props.showBackButton(true)
        this.setState({isLoading:true})
        let res = await sendPostRequestWithAccessToken(GET_NOTIFICATIONS_LIST,  global.accessToken);
        console.log('resN', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
           
            this.setState({data:res.response.userData},()=>this.setState({isLoading:false}))
            
            //this.setState({data: res. isLoading:false})
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }
    }

    async acceptDecline(id, isAccepted){
        this.setState({isLoading:true})
        const credentials = {
            orderId: id,
            isAccepted: isAccepted
        }
        let res = await sendPostRequestWithAccessTokenAndBody(ACCEPT_OR_DECLINE_ORDER, credentials, global.newAccessToken);
        console.log('res22', JSON.stringify(res))
        if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
            if(isAccepted){
                this.props.navigation.navigate('Tab')
                
            }else{
                await this.getNotifications()
            }
            
            //console.log('res', JSON.stringify(res))
            //this.setState({data: res. isLoading:false})
        }else if(res.hasOwnProperty('response') && res.response.status.statusCode === 400){
            this.setState({isLoading:false},()=>this.setState({responseText:res.response.status.customMessage, responseAlert:true}))
        }else{
            this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
        }

    }

    header(){
        return(
                <View style={{ overflow:'hidden', width:'100%'}}>
                    {/* <TouchableOpacity onPress={()=>this.props.navigation.goBack()}>
                        <Image 
                        resizeMode={'contain'}
                        source={require('../../assets/back-arrow.png')}
                        style={{height:25, width:25,}}/>
                    </TouchableOpacity> */}
                    <BackButton props={this.props}/>
                    <Image 
                        resizeMode={'stretch'}
                        source={require('../../assets/notification-shape.png')} 
                        style={{height:30, width:'100%', alignSelf:'center', marginTop:15}}/>
                </View>
        )
    }

    acceptDeclineView(item){
        if(!item.orderId.isDeliveryTeamAccepted){
            return(
                <View style={{width:'100%', flexDirection:'row', marginTop:15}}>
                    <TouchableOpacity onPress={()=>this.acceptDecline(item.orderId._id, true)} style={[AppStyles.styleSet.viewWithYelloBackground,{flex:1,height:35}]}>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:13}]}>
                            ACCEPT
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>this.acceptDecline(item.orderId._id, false)} style={[AppStyles.styleSet.viewWithYelloBackground,{flex:1,height:35, marginLeft:10}]}>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor,{fontSize:13}]}>
                            DECLINE
                        </Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    itemView(item, index){
        let date = dateDiff(item.createdAt)
        return(
            <TouchableOpacity 
            onPress={()=>this.props.navigation.navigate('OrderDetails',{orderId: item.orderId})}
                style={{flexGrow:1, borderBottomWidth:1.5, borderBottomColor:AppStyles.colorSet.mainTextColor, paddingBottom:20}}>
                <Text style={{alignSelf:'flex-end', fontSize:12, color:'#d3d3d3', marginTop:10}}>
                    {date}
                </Text>
                <View style={{flexDirection:'row', width:'100%',}}>
                    <Image source={require('../../assets/notification.png')} 
                     style={{height:68, width:68, borderRadius:34,}}/>
                    <View style={{marginLeft:15, flex:1}}>
                        <Text style={AppStyles.styleSet.textWithYellowColor}>
                            {item.title}
                        </Text>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor, {marginTop:5, fontSize:15,
                           fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                            {item.text}
                        </Text>
                        {/* {this.acceptDeclineView(item)} */}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

   
    render(){
        return(
            <SafeAreaView style={AppStyles.styleSet.screenContainer}>
                <StatusBar barStyle={'light-content'}/>
                {/* <StatusBarHeader props={this.props}/> */}
                <WatermarkView/>
                <ScrollView>
                    <View style={{padding:20, paddingTop:5}}>
                        {this.header()}
                        <FlatList
                            data={this.state.data}
                            showsVerticalScrollIndicator={false}
                            style={{flex:1 }}
                            renderItem={({ item, index }) => (
                            this.itemView(item, index)
                            )}
                            keyExtractor={item => item}
                        />
                        
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
  


export default connect(mapStateToProps, mapDispatchToProps)(Notifications);