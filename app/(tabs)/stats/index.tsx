import { commonStyles } from "@/styles/commonStyles";
import { Stack, useRouter } from "expo-router";
import React, { Suspense } from "react";
import { SafeAreaView, View, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function Stats() {
  const router = useRouter();
  
  return (
    <Suspense fallback={<View style={{ flex: 1, backgroundColor: 'black' }} />}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/(tabs)/stats/distribution')}
        >
          <Text style={styles.text}>Distributions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
        >
          <Text style={styles.text}>Leaderboards</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
        >
          <Text style={styles.text}>Favourites</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
        >
          <Text style={styles.text}>History</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Suspense>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  scrollView: {
    width: '100%',
    height: '100%',
  },
  scrollViewContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 100
  },
  workoutContainer: {
    height: '100%',
    width: '100%',
    paddingBottom: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
  },
  textContainer: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center'
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
  text: {
    color: 'white'
  },
  buttonContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  }
});
