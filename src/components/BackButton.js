import React, { Component } from "react";
import { 
    TouchableOpacity,
    Text
} from "react-native"
import AppStyles from '../styles/AppStyles'

const BackButton = ({props}) => {
    return(null
        // <TouchableOpacity 
        //     style={[AppStyles.styleSet.viewWithYelloBackground,{ borderRadius:15, 
        //         height:'auto', padding:5, paddingHorizontal:10, width:'auto', alignSelf:'flex-start',}]} 
        //     onPress={()=>props.navigation.goBack()}>
        //         <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_MEDIUM}}>
        //             Back
        //         </Text>
        // </TouchableOpacity>
    )
}

export default BackButton