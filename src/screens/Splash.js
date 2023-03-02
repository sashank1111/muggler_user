import { 
    ImageBackground,
    SafeAreaView,
    View,
    Image
    } from "react-native"
import React, { Component } from 'react';
// import { StackActions, NavigationActions } from 'react-navigation';
// const resetAction = StackActions.reset({
//     key: undefined,
//     index: 0,
//     actions: [NavigationActions.navigate({ routeName: 'DashboardStack' })],
// });

class Splash extends Component{
    constructor(props){
        super(props)
    }
    // resetTo=(route) =>{
    //     const actionToDispatch = StackActions.reset({
    //       index: 0,
    //       key: null,
    //       actions: [NavigationActions.navigate({ routeName: route })],
    //     });
    //     this.props.navigation.dispatch(actionToDispatch);
    //   }

    render(){
        return(
            <SafeAreaView style={{flex:1, backgroundColor:'black'}}>
                <View style={{flex:1}}>
                    <ImageBackground
                        resizeMode={'stretch'}
                        source={require('../../assets/splash.png')}
                        style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                            <View style={{height:110, width:110}}>
                                <Image 
                                resizeMode={'contain'}
                                source={require('../../assets/Smugglers-logo.png')} 
                                style={{flex:1}}/>
                            </View>
                    </ImageBackground>
                </View>
            </SafeAreaView>
        )
    }

}
export default Splash