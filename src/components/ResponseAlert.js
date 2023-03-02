import React, { Component } from "react";
import { 
    View,
    TouchableOpacity,
    Modal,
    Text
} from "react-native"
import AppStyles from '../styles/AppStyles'


const ResponseAlert = ({visible, responseText, onOkayPress}) => {
    return(
        <Modal
            animationType={'fade'}
            transparent={true}
            visible={visible}
            onRequestClose={() => {
                console.log('Modal has been closed.');
            }}>
        
            <View style={{flex:1, flexDirection:"column", position:'absolute',
            height:'100%', width:'100%', alignItems:'center', justifyContent:'center',
            backgroundColor:"transparent", opacity:1.5}}>
                <View style={{flex:1,backgroundColor:'#000000',opacity:0.7,
                    height:'100%', width:'100%', justifyContent:'center',
                    position:'absolute', alignSelf:'center'}}>
                </View>
                <View style={{ width:'93%', alignSelf:'center',
                borderColor:AppStyles.colorSet.mainThemeForegroundColor, 
                borderWidth:2, borderRadius:10, zIndex:999, padding:10, 
                backgroundColor:'black', opacity:1, paddingBottom:30}}>
                    
                    <Text style={{color:'white', fontFamily:AppStyles.fontFamily.M_BOLD,
                           fontSize:25, textAlign:'center', marginTop:33}}>
                               {responseText}
                    </Text>
                    <TouchableOpacity onPress={()=>onOkayPress(!visible)} 
                    style={[AppStyles.styleSet.viewWithYelloBackground, {marginTop:25, width:85, borderRadius:30, alignSelf:'center'}]}>
                        <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                            Okay
                        </Text>
                   </TouchableOpacity>
                    

                </View>
            </View>
        </Modal>
    )
}


export default ResponseAlert