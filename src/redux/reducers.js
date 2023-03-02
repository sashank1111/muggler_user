import { combineReducers } from 'redux';
import { ADD_TO_CART, REMOVE_FROM_CART, 
  DELETE_FROM_CART, DELETE_ALL, CHANGE_ALERT_VISIBILITY, SET_LOCATION, 
  SHOW_CHANGE_ADDRESS_MODAL, CHANGE_LOGIN_STATUS,SHOW_PRODUCT_SEARCH_VIEW_MODAL,
  SHOW_ADD_ADDRESS_ALERT, SHOW_LOGIN_FIRST_ALERT, SHOW_STORE_ALERT, SET_FREE_DELIVERY, 
  SHOW_CHANGE_ADDRESS_ALERT, CHANGE_SELECTED_TAB, NAVIGATE_TO_MYORDERS, SHOW_BACK_BUTTON, NAVIGATE_TO_CART } from '../Utils/Constants';
import {View} from 'react-native'
import React from 'react'
import { sendPostRequestWithAccessTokenAndBody } from '../Utils/RestApiService';
import { CHECK_SIZE_FOR_INVENTORY } from '../Utils/UrlClass';
const _ = require('lodash');

const INITIAL_STATE = {
  cart:[],
  totalCartCount:0,
  subTotal:0,
  showDifferentStoreAlert:false,
  savedItem:'',
  latitude:0,
  longitude:0,
  address:'',
  showChangeAddressModal:false,
  addedProductStoreId:'',
  isLoggedIn:false,
  showProductSearchView:false,
  showAddAddressAlert:false,
  showLoginFirstAlert:false,
  showStoreAlert:false,
  selectedItemData:'',
  isFreeDelivery:false,
  showChangeAddressAlert:false,
  selectedTab:'Login',
  showAreaText:false,
  navigateToMyOrder:false,
  showBackButton:false,
  navigateToCart:'Home'
}

  const reducers = (state = INITIAL_STATE, action) => {
    let data, totalCount;
    let subTotal = state.subTotal
    console.log('type', action.type)
    switch (action.type) {
      case ADD_TO_CART:
       // console.log('AddedStoreItemId', action.payload.storeId.title)
         if(state.address === ''){
           state.showAddAddressAlert = true
           let showAreaText = state.showAreaText
            if(action.payload.hasOwnProperty('showAreaText')){
              showAreaText = action.payload.showAreaText
            }
           return{
             ...state,
             showAddAddressAlert:state.showAddAddressAlert,
             showAreaText: showAreaText
           }
         }
          data = action.payload
          //console.log('dataReducer', JSON.stringify(data))
          // let credentials = {
          //   productId:data.productId,
          //   sizeId:data._id
          //  }
          // let res = await sendPostRequestWithAccessTokenAndBody(CHECK_SIZE_FOR_INVENTORY, credentials,  global.accessToken);
          // console.log('CHECK_SIZE_FOR_INVENTORY', JSON.stringify(res))
          // if(res.hasOwnProperty('response') && res.response.status.statusCode === 200){
          //     this.setState({savedCards:res.response.userData},()=>this.setState({isLoading:false}))
             
          // }else{
          //     this.setState({isLoading:false},()=>this.setState({responseText:'Something went wrong', responseAlert:true}))
          // }
          if(state.cart.length>0){
            if(state.cart[0].storeId._id !== data.storeId._id){
              state.showDifferentStoreAlert = true
              state.savedItem = data
              return {
                ...state,
                showDifferentStoreAlert: state.showDifferentStoreAlert,
                savedItem:state.savedItem
              }
            }
          }
          if(state.cart.includes(data)){
            let index = state.cart.indexOf(data)
            data.quantityOfProductInCart = state.cart[index].quantityOfProductInCart+1
            state.cart.splice(index, 1)
            state.cart.splice(index, 0, data)
          }else{
            data.quantityOfProductInCart = 1
            state.cart.push(data)
          }
          totalCount = state.totalCartCount+1
          subTotal = subTotal+data.finalPrice
          state.addedProductStoreId = data.storeId._id
          return { 
            ...state,
            cart: state.cart,
            totalCartCount: totalCount,
            subTotal: subTotal,
            savedItem:'',
            showDifferentStoreAlert:false,
            addedProductStoreId:state.addedProductStoreId,
            showAreaText: false
          }
      case REMOVE_FROM_CART:
            data = action.payload
            if(state.cart.includes(data)){
              let index = state.cart.indexOf(data)
              if(data.quantityOfProductInCart>1){
                data.quantityOfProductInCart = state.cart[index].quantityOfProductInCart-1
              }else{
                data.quantityOfProductInCart = 0
                state.cart.splice(index, 1)
              }
              totalCount = state.totalCartCount
              if(totalCount===1){
                state.addedProductStoreId=''
              }
              if(totalCount>0){
                  totalCount = state.totalCartCount-1
              }
              
            }else{
            }
            subTotal = subTotal-data.finalPrice
            return { 
              ...state,
              cart: state.cart,
              totalCartCount: totalCount,
              subTotal: subTotal,
              addedProductStoreId:state.addedProductStoreId
            }
      case DELETE_FROM_CART:    
             data = action.payload  
             if(state.cart.includes(data)){
               let index = state.cart.indexOf(data)
               totalCount = state.totalCartCount - state.cart[index].quantityOfProductInCart
               if(state.cart[index].quantityOfProductInCart>1){
                 for(let i=0; i<data.quantityOfProductInCart; i++){
                  subTotal = subTotal-data.finalPrice
                 }
               }else{
                 subTotal = subTotal-data.finalPrice
               }
               state.cart.splice(index, 1)
             }
             return {
               ...state,
               cart: state.cart,
               totalCartCount: totalCount,
               subTotal: subTotal
             }

      case DELETE_ALL:
         for(let i = 0; i < state.cart.length; i++){
             state.cart[i].quantityOfProductInCart = 0
         }
        return {
          ...state,
          cart: [],
          totalCartCount: 0,
          subTotal: 0,
          addedProductStoreId:''
        }
        
      case CHANGE_ALERT_VISIBILITY:
        state.showDifferentStoreAlert = false
        
        return {
          ...state,
          showDifferentStoreAlert:state.showDifferentStoreAlert
        }
      case SHOW_CHANGE_ADDRESS_ALERT:
        state.showChangeAddressAlert = action.payload
        
      return {
        ...state,
        showChangeAddressAlert: state.showChangeAddressAlert

      }

      case SET_LOCATION:
        data = action.payload
        // if(state.latitude !== 0){
        //   return {
        //     ...state,
        //     showAddAddressAlert:false,
        //     showChangeAddressAlert:false,
        //     showChangeAddressAlert:true
        //   }
        // }
        for(let i = 0; i < state.cart.length; i++){
          state.cart[i].quantityOfProductInCart = 0
        }
       // console.log('setLocation', data)
        state.latitude = data.latitude
        state.longitude = data.longitude
        state.address = data.address
        state.showAddAddressAlert = false
        state.showChangeAddressModal = false
        
        return {
          ...state,
          latitude: state.latitude,
          longitude: state.longitude,
          address: state.address,
          showAddAddressAlert: state.showAddAddressAlert,
          showChangeAddressModal: state.showChangeAddressModal ,
          cart: [],
          totalCartCount: 0,
          subTotal: 0,
          addedProductStoreId:'',
        }

      case SHOW_CHANGE_ADDRESS_MODAL:
        state.showChangeAddressModal = action.payload

        return{
          ...state,
          showChangeAddressModal:state.showChangeAddressModal

        }
        case SHOW_PRODUCT_SEARCH_VIEW_MODAL:
        state.showProductSearchView = action.payload

        return{
          ...state,
          showProductSearchView:state.showProductSearchView

        }
      case CHANGE_LOGIN_STATUS:
        let value = action.payload
        //state.isLoggedIn = value
        // if(!value.isLoggedIn){
        //   state.address = ''
        //   state.latitude = 0
        //   state.longitude = 0
        // }

        return{
          ...state,
          isLoggedIn:value.isLoggedIn,
          isFreeDelivery:value.isFreeDelivery,
          address:state.address,
          latitude:state.latitude,
          longitude:state.longitude

        }
        case SHOW_ADD_ADDRESS_ALERT:
        //let value = action.payload
        state.showAddAddressAlert = action.payload

        return{
          ...state,
          showAddAddressAlert:state.showAddAddressAlert

        }
        case SHOW_LOGIN_FIRST_ALERT:
        //let value = action.payload
        state.showLoginFirstAlert = action.payload

        return{
          ...state,
          showLoginFirstAlert:state.showLoginFirstAlert

        }
        case SHOW_STORE_ALERT:
        //let value = action.payload
        data = action.payload
        state.showStoreAlert = data.value
        state.selectedItemData = data.selectedItemData

        return{
          ...state,
          showStoreAlert:state.showStoreAlert,
          selectedItemData:state.selectedItemData

        }
        case SET_FREE_DELIVERY:
        //let value = action.payload
        

        return{
          ...state,
          isFreeDelivery:false

        }

        case CHANGE_SELECTED_TAB:
          console.log('reducersChangeSelectedTab', action.payload)
          data = action.payload

        return{
          ...state,
          selectedTab:data
        }

        case SHOW_BACK_BUTTON:
          return {
            ...state,
            showBackButton:action.payload
          }

        case NAVIGATE_TO_MYORDERS:
          data = action.payload

          return {
            ...state,
            navigateToMyOrder:data
          }

        case NAVIGATE_TO_CART:
          data = action.payload

          return {
            ...state,
            navigateToCart:data
          }
      default:
        return state
    }
  };
  
  export default combineReducers({
    data: reducers
  });
