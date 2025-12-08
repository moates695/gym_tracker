import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";

// if have a schedule, see todays workout(s)
// button to start workout
// see previous workouts and their target muscles
// see previous <day number> workouts and muscles worked
// other stats and info
// switch to see friends workouts?

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={{color: "white"}}>Home</Text>
        <Text style={{color: "white"}}>coming soon...</Text>
      </View>
      <StatusBar style='dark' />
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
});