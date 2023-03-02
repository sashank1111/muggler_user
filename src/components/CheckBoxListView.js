import React from 'react'
import {
    View,
    Text,
    Image,
    FlatList,
} from 'react-native'
import CheckBox from '@react-native-community/checkbox';
import AppStyles from '../styles/AppStyles'
import { TouchableOpacity } from 'react-native-gesture-handler';


const CheckBoxListView = ({data, onCheckBoxValueChange, visibility, mainIndex, selectedData}) => {
    const _array = []
    data.map((item, index)=>{
        
        const obj = {}
        //console.log(item+' '+index)
        obj.name = item.title
        obj.value = true
        obj.data = item.data
        _array.push(obj)
        

    })
    // onValueChange = (newValue, index) =>{
    //     let oldArray = _array
    //     oldArray[index].value = newValue
    //     console.log(newValue+'    '+index+ '   '+JSON.stringify(oldArray))

    // }
   

    dropdownView = (item, i) => {
        let visible = false
        //console.log('item',mainIndex+' '+ JSON.stringify(selectedData)+' '+JSON.stringify(item))
        if(mainIndex === 0 || mainIndex === 4){
            if(selectedData.includes(item.title)){
                visible = true
            }
        }else if(selectedData.includes(item._id)){
            visible = true
        }
       
        return(
            <View style={{width:'100%',  padding:5, marginTop:10,
             flexDirection:'row', alignItems:'center'}}>
                {/* <CheckBox
                    disabled={false}
                    value={visible}
                    style={{height:16, width:16}}
                    boxType={item.hasOwnProperty('_id')?'square':'circle'}
                    tintColors={AppStyles.colorSet.mainTextColor}
                    onCheckColor={AppStyles.colorSet.mainTextColor}
                    onTintColor={AppStyles.colorSet.mainTextColor}
                    onValueChange={(newValue) => onCheckBoxValueChange(newValue, i, mainIndex)}
                /> */}
                <TouchableOpacity onPress={()=>onCheckBoxValueChange(!visible, i, mainIndex)}>
                   {mainIndex===0 || mainIndex===4 ? 
                   <Image 
                        resizeMode={'contain'}
                        source={visible?require('../../assets/check-active.png'):
                        require('../../assets/check-inactive.png')}
                        style={{height:20, width:20}}/>:
                    <Image 
                        resizeMode={'contain'}
                        source={visible?require('../../assets/check-square-active.png'):
                        require('../../assets/check-squareintive.png')}
                        style={{height:20, width:20}}/>}
                </TouchableOpacity>
                <Text style={[AppStyles.styleSet.textWithYellowColor, {marginLeft:15, fontSize:16}]}>
                    {item.title}
                </Text>
            </View>
        )
    }
    if(visibility){
        return(
            <FlatList
                data={data[mainIndex].data}
                showsVerticalScrollIndicator
                indicatorStyle={'white'}
                style={{maxHeight:130, marginTop:10, paddingHorizontal:20,}}
                renderItem={({ item, index }) => (
                    dropdownView(item, index)
                )}
                keyExtractor={item => item._id}
            />
        )
    }else{
        return(
            null
        )
    }
}
export default CheckBoxListView