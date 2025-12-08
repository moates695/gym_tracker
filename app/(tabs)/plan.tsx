import { StatusBar } from "expo-status-bar";
import React from "react";
import { View, Text, SafeAreaView, StyleSheet, Platform } from "react-native";

export default function Plan() {
  return (
    <SafeAreaView style={styles.container}> 
      {Platform.OS == 'android' &&
        <StatusBar style="light" backgroundColor="black" translucent={false} />
      }
      <View>
        <Text style={{color: "white"}}>Plan</Text>
        <Text style={{color: "white"}}>coming soon...</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});