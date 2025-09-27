import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

// get workout stat + muscle stat
// get actual workout set_data
// show muscle distribution on svg and chart

export default function StatsDistribution() {
  const router = useRouter();
  
  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      <TouchableOpacity
        style={commonStyles.button}
        onPress={() => router.replace('/(tabs)/stats')}
      >
        <Text style={commonStyles.text}>back</Text>
      </TouchableOpacity>
      <Text style={commonStyles.text}>history</Text>
    </View>
  )
}