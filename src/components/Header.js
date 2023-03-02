import React, { Component } from "react";
import { 
    View,
    Image,
} from "react-native"


const Header = ({image}) => {
    return(
        <View style={{marginTop:5, overflow:'hidden'}}>
                <View style={{height:90, width:90, alignSelf:'center', alignItems:'center'}}>
                    <Image 
                    resizeMode={'contain'}
                    source={require('../../assets/Smugglers-logo.png')} 
                    style={{flex:1}}/>
                </View>
                <View style={{height:50, alignSelf:'center', alignItems:'center',marginTop:35,}}>
                    <Image 
                    resizeMode={'contain'}
                    source={image} 
                    style={{flex:1}}/>
                </View>
        </View>
    )
}

export default Header