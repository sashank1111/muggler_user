import { View } from "react-native"
import React, { Component } from 'react';
import { TouchableOpacity } from "react-native";

class Splashtest extends Component{
    constructor(props){
        super(props)
    }

    render(){
        return(
            <TouchableOpacity onPress={()=>this.props.navigation.goBack()} style={{flex:1, backgroundColor:'green'}}>
                
            </TouchableOpacity >
        )

    }
}

// const Splashtest = () =>{
//     return(
//         <View style={{flex:1, backgroundColor:'green'}}>
            
//         </View>
//     )
// }
export default Splashtest