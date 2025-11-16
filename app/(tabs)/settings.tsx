import { commonStyles } from '@/styles/commonStyles';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text, View, StyleSheet, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import * as SecureStore from "expo-secure-store";
import { useRouter } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai';
import { userDataAtom, workoutExercisesAtom } from '@/store/general';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const router = useRouter();

  const userData = useAtomValue(userDataAtom);

  const logOut = async () => {
    await SecureStore.deleteItemAsync('temp_token');
    await SecureStore.deleteItemAsync('auth_token');
    await AsyncStorage.clear();
    router.replace("/sign-in")
  };

  return (
    <SafeAreaView style={styles.container}> 
      {Platform.OS == 'android' &&
        <StatusBar style="light" backgroundColor="black" translucent={false} />
      }
      <View>
        <Text style={commonStyles.text}>{userData?.username}</Text>
        <Text style={commonStyles.text}>{userData?.email}</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={logOut}
        >
          <Text style={{ color: "white"}}>log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
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
  }
});
