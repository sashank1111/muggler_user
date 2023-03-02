import React, { useState, useEffect } from 'react';
import { SafeAreaView,
        View,
        StatusBar,
        ScrollView,
        TouchableOpacity,
        Text
          } from 'react-native';
import WatermarkView from '../components/WatermarkView';
import { StripeProvider, useStripe, CardField } from '@stripe/stripe-react-native';
import AppStyles from '../styles/AppStyles'

const testStripeKey = 'pk_test_YnwYfVcts8x8yRpTH8oCjFF000i9zR5HU4'
const client_secret = 'pi_3KH6CtJLwTfQk1qt1Ck1iMAg_secret_rQYcdUdXVE0EhHVJ8z67xk5ka'

const PaymentNew = ({navigation}) => {

    const { confirmPayment, handleCardAction } = useStripe()
    const [paymentIntentId, setPaymentIntentId] = useState('')
    const [paymentMethodId, setPaymentMethodId] = useState('')
    

    const headerImage = () => {
        return(
            <View style={{width:'100%',  paddingVertical:10, paddingHorizontal:20,
                flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                {/* <View style={{width:70}}>
                    <BackButton props={this.props}/>
                </View> */}
            </View>
        )
    }

    const stripeView = () =>{
        return(
            <CardField
                    postalCodeEnabled={false}
                    autofocus
                    placeholder={{
                        number: '4242 4242 4242 4242',
                    }}
                    cardStyle={{
                        backgroundColor: '#FFFFFF',
                        textColor: AppStyles.colorSet.mainTextColor,
                    }}
                    style={{
                        width: '100%',
                        height: 50,
                        marginVertical: 10,
                    }}
                    onCardChange={(cardDetails) => {
                        console.log('cardDetails', cardDetails);
                        if(cardDetails.complete){
                         //   this.setState({cardDetails})
                        }
                    }}
                    onFocus={(focusedField) => {
                        console.log('focusField', focusedField);
                    }}
            />
        ) 
    }


    async function createStripeId(){
        
        let cardDetails = {"brand": "MasterCard", "complete": true, "expiryMonth": 11, "expiryYear": 24, "last4": "4242"}
        const name = 'Test'
        //let res = await confirmPayment(client_secret, cardDetails)
        const {error, paymentIntent} = await confirmPayment(client_secret, {
            type: 'Card',
            billingDetails: {name}
        })
        console.log(error)
        if(paymentIntent !== undefined){
            console.log(paymentIntent)
            setPaymentIntentId(paymentIntent.id)
            setPaymentMethodId(paymentIntent.paymentMethodId)
        }
    }



    return(
        <SafeAreaView style={{flex:1, backgroundColor:'black'}}>
                <StatusBar barStyle={'light-content'}/>
                <WatermarkView/>
                {headerImage()}
                <ScrollView style={{flex:1, marginBottom:20, padding:25}}>
                    <StripeProvider
                        publishableKey={testStripeKey}
                        >
    
                       {stripeView()}
                    </StripeProvider>
                    <View style={{width:'100%', paddingHorizontal:20}}>
                        <TouchableOpacity onPress={()=>createStripeId()} 
                        style={[AppStyles.styleSet.viewWithYelloBackground, {marginBottom:35, marginTop:35}]}>
                            <Text style={[AppStyles.styleSet.textWithWhiteColor, {fontFamily:AppStyles.fontFamily.M_BOLD}]}>
                                Pay
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
        </SafeAreaView>
    )

}

export default PaymentNew




