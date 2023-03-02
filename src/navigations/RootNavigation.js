import * as React from 'react';
import { CommonActions } from '@react-navigation/native'

export const navigationRef = React.createRef();
export const navigationRefToDrawer = React.createRef();

export function navigateToMyOrder(name, params) {
  navigationRef.current?.navigate('Drawer', {
    screen: 'Drawer',
    params: { navigateTo: 'MyOrder' },
  });
}

export function navigate(name, params) {
  //console.log('rootnavigation', JSON.stringify(params))
  if(name==='ProductDetails'){
     navigationRef.current?.navigate(name, {productId:params.productId, storeId:params.storeId});
  }else if(name==='ProductCategory'){
    navigationRef.current?.navigate(name, {item:params.item, type:params.type});
  }
//   navigationRef.current?.dispatch(
//     CommonActions.navigate({
//         name:'MyOrders'
//     })
// );
}