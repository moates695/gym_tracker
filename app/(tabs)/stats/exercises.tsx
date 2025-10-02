import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function StatsExercises() {
  const router = useRouter();
  
  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      <Text style={commonStyles.text}>exercises</Text>
    </View>
  )
}