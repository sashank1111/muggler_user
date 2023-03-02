import React ,{Component} from 'react';
import {
    ActivityIndicator,
    View,
    Platform,} from 'react-native';
import { APP_YELLOW_COLOR } from './screens/Utils/ConstantClass';
import AppStyles from '../styles/AppStyles'
class ShowLoader extends Component{
    render(){ 
        return(
            <View style={{width:'100%',height:'100%',
                            position:'absolute',justifyContent:'center',
                            alignSelf:'center', backgroundColor:'transparent'}}>
                    <View style={{alignSelf:'center',borderRadius:5,padding:10,
                    backgroundColor:'transparent', opacity:1, height:100, width:100,
                     justifyContent:'center', alignItems:'center'}}>
                            <ActivityIndicator 
                            style={{height:100, width:100}}
                            size={Platform.OS==='android'?100:'large'} color={AppStyles.colorSet.mainTextColor} 
                            />
                    </View>       
            </View>
        )
//             return(
//                 <View style={{width:'100%',height:'100%',
//                 backgroundColor:'#000000',
//                 opacity:.5,
//                 position:'absolute',justifyContent:'center'}}>
//         <View style={{alignSelf:'center'
//         ,borderRadius:5,padding:10,
//         flexDirection:'column',
//         backgroundColor:'transparent'}}>
//                 <ActivityIndicator 
//                     animating={true}
//                     size='large'
//                      />
      
//         </View>       
// </View>
//             )
        }

}
export default ShowLoader;