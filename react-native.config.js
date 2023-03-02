module.exports = {
    dependencies: {
      "@invertase/react-native-apple-authentication": {
        platforms: {
          android: null // disable Android platform, other platforms will still autolink if provided
        },
      },
      "react-native-apple-authentication": {
          platforms: {
            android: null // disable Android platform, other platforms will still autolink if provided
          },
        }
    },
      
    project: {
        ios: {},
        android: {},
    },
    assets: ['./assets/fonts']
};