
import { Image,Text, View,ScrollView, Button} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {images} from "../constants";
import CustomButton from "../components/CustomButton";
import { StatusBar } from "expo-status-bar";
import { Redirect,router } from "expo-router";


export default function Index() {

  return (
    <SafeAreaView className="bg-black h-full ">
      <ScrollView contentContainerStyle = {{height: '100%'}}>
        <View className="w-full justify-center items-center min-h-[85vh] px-4">
          <Image 
            className="w-[230px] h-[200px]"
            source={images.crpas_logo}
            resizeMode="contain"
          />
        
          <View className="relative mt-5">
            <Text className="text-3xl color-white font-bold text-center">
              Predict. Prevent. Protect.
            </Text>
        
          </View>
          <Text className="mt-14 text-gray-100 font-pregular">
            Stay aware,stay safe: Predict and prevent with CRPAS
          </Text>
          <CustomButton 
            title = "Get Started"
            handlePress = {()=>router.push('/model')}
            containerStyles = "w-full mt-10"
          />
        </View>
      </ScrollView>
      <StatusBar backgroundColor="black" style = 'light'/>
    </SafeAreaView>
  );
}
