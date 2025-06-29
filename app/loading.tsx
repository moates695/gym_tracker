import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

export default function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'black' }}>
      <ActivityIndicator size="large" />
      <Text style={{color: 'white'}}>Loading...</Text>
    </View>
  );
}
