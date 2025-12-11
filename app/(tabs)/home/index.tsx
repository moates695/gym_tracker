import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { Suspense } from "react";
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";

// if have a schedule, see todays workout(s)
// button to start workout
// see previous workouts and their target muscles
// see previous <day number> workouts and muscles worked
// other stats and info
// switch to see friends workouts?

export default function Home() {
  const router = useRouter();

  return (
    <Suspense fallback={<View style={{ flex: 1, backgroundColor: 'black' }} />}>
      <SafeAreaView style={styles.container}>
        <View style={{padding: 20}}>
          <Text style={{color: "white"}}>Home</Text>
          <Text style={{color: "white"}}>coming soon...</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, {width: 200}]}
          onPress={() => router.replace('/(tabs)/home/friends')}
        >
          <Text style={commonStyles.text}>Friends</Text>
        </TouchableOpacity>
        <StatusBar style='dark' />
      </SafeAreaView >
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center'
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
  button: {
    borderWidth: 2,
    borderRadius: 5,
    borderColor: 'gray',
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});