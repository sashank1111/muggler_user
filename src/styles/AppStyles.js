const _colorSet = {
    mainThemeBackgroundColor: "black",
    mainThemeForegroundColor: "#CC9249",
    mainTextColor: "#CC9249",
    mainSubtextColor: "#7c7c7c",
    hairlineColor: "#d6d6d6",
    grayBgColor: "#f5f5f5",
    onlineMarkColor: "#41C61B",
    inputBgColor: "rgba(0.9, 0.9, 0.9, 0.1)",
    primary: "#6dd8ff",
    secondary: "#f8ad9d",
    tertiary: "#6843ee",
    facebook: "#384c8d",
    warning: '#ff9100',
    error: '#ef5350',
    greyColor: "rgba(0,0,0,0.54)",
    lightGrey: "#efeff4",
    greyBackground: "rgb(244,246,251)",
    iconColor: "rgba(0, 0, 0, 0.7)",
  };
  
  const _fontSet = {
    xxlarge: 40,
    xlarge: 30,
    large: 25,
    middle: 20,
    normal: 16,
    small: 13,
    xsmall: 11
  };

  const _fontFamily = {
    M_SEMIBOLD:'Montserrat-SemiBold',
    M_REGULAR:'Montserrat-Regular',
    M_MEDIUM:'Montserrat-Medium',
    M_BOLD:'Montserrat-Bold'

  }

  const _styleSet = {
    screenContainer:{
      flex:1,
      backgroundColor:_colorSet.mainThemeBackgroundColor
    },
    viewWithYelloBorder:{
      height:55, 
      width:'100%', 
      borderRadius:30, 
      borderColor:_colorSet.mainThemeForegroundColor,
      borderWidth:2, 
      justifyContent:'center', 
      alignItems:'center',
      backgroundColor:_colorSet.mainThemeBackgroundColor
    },
    textWithYellowColor:{
      color:_colorSet.mainTextColor,
      fontSize:18, 
      fontFamily:_fontFamily.M_SEMIBOLD
    },
    viewWithYelloBackground:{
      height:55, 
      width:'100%', 
      borderRadius:30, 
      justifyContent:'center', 
      alignItems:'center',
      backgroundColor:_colorSet.mainThemeForegroundColor
    },
    textWithWhiteColor:{
      color:'white',
      fontSize:18, 
      fontFamily:_fontFamily.M_SEMIBOLD
    },
    textInputView:{
      height:55, 
      width:'100%', 
      borderRadius:30, 
      borderColor:_colorSet.mainThemeForegroundColor,
      borderWidth:2, 
      justifyContent:'center', 
      paddingHorizontal:20,
     // backgroundColor:_colorSet.mainThemeBackgroundColor
     backgroundColor:'transparent'
    },
    textInputStyle:{
      color:'white', 
      fontSize:17, 
      fontFamily:_fontFamily.M_SEMIBOLD,
    },
    headerText:{
      color:_colorSet.mainTextColor, 
      alignSelf:'center', 
      fontFamily:_fontFamily.M_SEMIBOLD, 
      marginTop:15, 
      fontSize:22}
  }

  
  const StyleDict = {
    colorSet: _colorSet,
    fontSet: _fontSet,
    styleSet: _styleSet,
    fontFamily: _fontFamily
  };

  export default StyleDict;