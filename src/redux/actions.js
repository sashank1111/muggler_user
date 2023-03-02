import { ADD_TO_CART, DELETE_FROM_CART, REMOVE_FROM_CART, DELETE_ALL, 
    CHANGE_ALERT_VISIBILITY, SET_LOCATION, SHOW_CHANGE_ADDRESS_MODAL,
     CHANGE_LOGIN_STATUS, SHOW_PRODUCT_SEARCH_VIEW_MODAL, SHOW_ADD_ADDRESS_ALERT,
     SHOW_LOGIN_FIRST_ALERT, SHOW_STORE_ALERT,ADD_TO_CART_FROM_DETAILS, SET_FREE_DELIVERY,
     SHOW_CHANGE_ADDRESS_ALERT, CHANGE_SELECTED_TAB, NAVIGATE_TO_MYORDERS, SHOW_BACK_BUTTON,
     NAVIGATE_TO_CART } from "../Utils/Constants";

export const addToCart = (count) => (
    {
        type: ADD_TO_CART,
        payload: count
    }
);

export const addToCartFromDetails = (count) => (
    {
        type: ADD_TO_CART_FROM_DETAILS,
        payload: count
    }
);

export const removeFromCart = (count) => (
    {
        type: REMOVE_FROM_CART,
        payload: count
    }
);

export const deleteFromCart = (count) => (
    {
        type: DELETE_FROM_CART,
        payload: count
    }
);

export const deleteAll = (count) => (
    {
        type:DELETE_ALL,
        payload:count
    }
)

export const changeAlertVisibility = (count) => (
    {
        type:CHANGE_ALERT_VISIBILITY,
        payload:count
    }
)

export const setLocation = (count) => (
    {
        type:SET_LOCATION,
        payload:count
    }
)

export const changeDeliveryAddress = (count) => (
    {
        type:SHOW_CHANGE_ADDRESS_MODAL,
        payload:count
    }
)

export const changeLoginStatus = (count) => (
    {
        type:CHANGE_LOGIN_STATUS,
        payload:count
    }
)

export const showProductSearchView = (count) => (
    {
        type:SHOW_PRODUCT_SEARCH_VIEW_MODAL,
        payload:count
    }
)

export const showAddAddressAlert = (count) => (
    {
        type:SHOW_ADD_ADDRESS_ALERT,
        payload:count
    }
)

export const showLoginFirstAlert = (count) => (
    {
        type:SHOW_LOGIN_FIRST_ALERT,
        payload:count
    }
)


export const showStoreAlert = (count) => (
    {
        type:SHOW_STORE_ALERT,
        payload:count
    }
)

export const setFreeDelivery = (count) => (
    {
        type:SET_FREE_DELIVERY,
        payload:count
    }
)

export const showChangeAddressAlert = (count) => (
    {
        type:SHOW_CHANGE_ADDRESS_ALERT,
        payload:count
    }
)

export const changeSelectedTab = (count) => (
    {
        type:CHANGE_SELECTED_TAB,
        payload:count
    }
)

export const navigateToMyOrders = (count) => (
    {
        type:NAVIGATE_TO_MYORDERS,
        payload:count
    }
)

export const showBackButton = (count) => (
    {
        type:SHOW_BACK_BUTTON,
        payload:count
    }
)

export const navigateToCart = (count) => (
    {
        type:NAVIGATE_TO_CART,
        payload:count
    }
)