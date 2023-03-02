import { Dimensions } from 'react-native';

// Grab the window object from that native screen size.
const window = Dimensions.get('window');

// The vertical resolution of the screen.
const screenHeight = window.height;

// The horizontal resolution of the screen.
const screenWidth = window.width;

//alert(screenHeight)
// The average resolution of common devices, based on a ~5" mobile screen.
const baselineHeight = screenHeight < 750 ? 680 : 800;

// Scales the item based on the screen height and baselineHeight
const scale = value => Math.floor((screenHeight / baselineHeight) * value);

const { width, height } = Dimensions.get('window');

//let screenHeight = width < height ? height : width
//let screenWidth = width < height ? width : height
let DeviceWidth = Dimensions.get('window').width

const Metrics = {
    DeviceWidth: DeviceWidth,
    screenHeight: screenHeight,
    screenWidth: screenWidth,
    CountScale: (val) => {
        return scale(val);
    }
};

export default Metrics;
