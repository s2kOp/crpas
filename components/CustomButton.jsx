import { View, Text } from 'react-native'
import React from 'react'
import { TouchableOpacity} from 'react-native';
const CustomButton = ({title,handlePress,containerStyles,textStyles,isLoading}) => {
  return (
    <TouchableOpacity 
    className={`bg-secondary rounded-xl justify-center items-center ${containerStyles} 
    h-[64px] ${isLoading ? 'opacity-50': ''}`}
        disabled={isLoading}
        onPress={handlePress}
        activeOpacity={0.7}>
        
        <Text className={`text-lg font-psemibold ${textStyles}`}>{title}</Text>
        
    </TouchableOpacity>
    
  ) 
}

export default CustomButton;