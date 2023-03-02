import React from "react";
import { 
    View,
    Image,
} from "react-native"

const WatermarkView = ({props}) => {
    return(
        <View style={{position:'absolute', top:0, right:0, left:0, right:0, height:'100%', 
        width:'100%',alignItems:'center', justifyContent:'center',alignContent:'center'}}>
            <Image resizeMode={'contain'} source={require('../../assets/watermark.png')} 
                imageStyle={{height:100, width:100, top:200, alignSelf:'center', alignContent:'center', backgroundColor:'red'}} 
                style={{flex:1, justifyContent:'center', alignItems:'center', alignContent:'center'}}/>
        </View>
    )
}

export default WatermarkView