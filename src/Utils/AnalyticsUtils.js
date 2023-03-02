import analytics from '@react-native-firebase/analytics';


export const logEvent = async(screenName) => {
    console.log('Analytics', screenName)
    analytics().logEvent(screenName, {});
}
