import messaging from '@react-native-firebase/messaging'
import { 
  Linking, 
  Platform, 
  ToastAndroid, 
  PermissionsAndroid 
      } from 'react-native'
import Geolocation from 'react-native-geolocation-service';  
import Geocoder from 'react-native-geocoding';

export const EMAIL_EXPRESSION_CHECK = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
export const NUMBER_REG_EX = new RegExp(/^(?=.*[0-9])[\w!@#$%^&*]{6,}$/)
export const SPECIAL_CHAR_REG_EX = new RegExp(/^(?=.*[!@#$%^&*])[\w!@#$%^&*]{6,}$/)
export const SMALL_CHAR_REG_EX = new RegExp(/^(?=.*[a-z])[\w!@#$%^&*]{6,}$/)
export const CAPITAL_CHAR_REG_EX = new RegExp(/^(?=.*[A-Z])[\w!@#$%^&*]{6,}$/)


fetchTokenFromFirebase = async () => {
    let value = '';
  try{
      const registerDevice = await messaging().registerDeviceForRemoteMessages();
      console.log('registerDevice',registerDevice)
      value = await messaging().getToken();
      console.log('fcmToken',value)
    if(value){
        global.fcmToken=value
        return value;
    }else{
        return ''
    }
  }catch(error){
    console.log('>>error',error)
    return '';
  }
  }


  export async function checkPermission(){
    const authStatus = await messaging().hasPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    console.log('hasPermission', enabled)
    if (enabled) {
        return await fetchTokenFromFirebase();
    } else {
      console.log('hasPermission2', enabled)
      try {
        messaging().requestPermission()
          .then( async () => {
            return await fetchTokenFromFirebase();
          })
        .catch((error) => {
          console.log('checkPermissionError', error)
          return ''
        })
      } catch (error) {
        console.log('>>checkPermissionerror', JSON.stringify(error))
        return ''
      }
    }
  }

      
async function hasLocationPermissionIOS(){

  const openSetting = () => {
      Linking.openSettings().catch(() => {
          Alert.alert('Unable to open settings');
      });
  };
  const status = await Geolocation.requestAuthorization('whenInUse');
  console.log('hasLocationPermissionIos', JSON.stringify(status))

  if (status === 'granted') {

      return true;
  }

  if (status === 'denied') {
      Alert.alert('Location permission denied');
  }

  if (status === 'disabled') {
      Alert.alert(
          `Turn on Location Services to allow "${appConfig.displayName}" to determine your location.`,
          '',
          [
              { text: 'Go to Settings', onPress: openSetting },
              { text: "Don't Use Location", onPress: () => { } },
          ],
      );
  }

  return false;
};
      
export async function getLocationPermission(){
  if (Platform.OS === 'ios') {
      const hasPermission = await hasLocationPermissionIOS();
      return hasPermission;
  }

  if (Platform.OS === 'android' && Platform.Version < 23) {
      return true;
  }

  const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (hasPermission) {
      return true;
  }

  const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
  }

  if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
          'Location permission denied by user.',
          ToastAndroid.LONG,
      );
  } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
          'Location permission revoked by user.',
          ToastAndroid.LONG,
      );
  }

  return false;
};

export async function findReverseGeoCode(lat, long){
  Geocoder.init("AIzaSyAYbSbQqDQm2u092NYdX9-CxcYyRDY6YSk");
  Geocoder.from(lat, long)
		.then(json => {
        		var addressComponent = json.results[0].formatted_address
			console.log('addressComponent', JSON.stringify(addressComponent));
      //global.currentAddress = addressComponent
		})
		.catch(error => console.warn(error));

}

export async function findCoordinates(){
  Geolocation.getCurrentPosition(
  (position) => {
      console.log('findCordinates', position);
      // global.latitude = position.coords.latitude.toFixed(4)
      // global.longitude = position.coords.longitude.toFixed(4)
      //global.latitude = 30.6425
      //global.longitude = 76.8173
      //findReverseGeoCode(30.6425, 76.8173)
      //findReverseGeoCode(position.coords.latitude.toFixed(4), position.coords.longitude.toFixed(4))
  },
  (error) => {
      // See error code charts below.
      return null
      console.log(error.code, error.message);
  },
  { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, distanceFilter: 0, 
      forceRequestLocation: true  }
  );
};

