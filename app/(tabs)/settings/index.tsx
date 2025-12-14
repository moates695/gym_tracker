import { commonStyles } from '@/styles/commonStyles';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import { Text, View, StyleSheet, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import * as SecureStore from "expo-secure-store";
import { useRouter } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai';
import { chosenHeatMap, HeatMapOption, userDataAtom, workoutExercisesAtom } from '@/store/general';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OptionsObject } from '@/components/ChooseExerciseModal';
import { useDropdown } from '@/components/ExerciseData';
import { LinearGradient } from 'expo-linear-gradient';
import { getColorList, heatMaps } from '@/components/MuscleGroupSvg';

interface HeatmapOptionObject {
  label: string
  value: HeatMapOption
}

export default function Settings() {
  const router = useRouter();

  const userData = useAtomValue(userDataAtom);
  const [heatmap, setHeatmap] = useAtom(chosenHeatMap);

  const heatmapOptions: HeatmapOptionObject[] = [
    {label: 'blue red', value: 'bluered'},
    {label: 'ironbow', value: 'ironbow'},
    {label: 'inferno', value: 'inferno'},
    {label: 'viridis', value: 'viridis'},
    {label: 'jet', value: 'jet'},
    {label: 'hot', value: 'hot'},
    {label: 'cool', value: 'cool'},
    {label: 'plasma', value: 'plasma'},
  ];

  const colourRange = useMemo(() => {
    return getColorList(heatMaps[heatmap])
  }, [heatmap]);

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
        <Text style={styles.text}>Choose a heat map:</Text>
        {useDropdown(heatmapOptions, heatmap, setHeatmap)}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 5,
          marginBottom: 20,
        }}
      >
        <Text style={commonStyles.text}>min</Text>
        <LinearGradient
          colors={colourRange}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: 10,
            width: 140,
            borderWidth: 1,
            borderColor: '#000',
            borderRadius: 0,
            marginTop: 2,
            marginLeft: 5,
            marginRight: 5,
          }}
        />
        <Text style={commonStyles.text}>max</Text>
      </View>
      <View style={{alignItems: 'center'}}>
        <TouchableOpacity
          style={[styles.button, {width: 200}]}
          onPress={() => router.replace('/(tabs)/settings/logs')}
        >
          <Text style={styles.text}>error logs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, {width: 200}]}
          onPress={() => router.replace('/(tabs)/settings/permissions')}
        >
          <Text style={styles.text}>permissions</Text>
        </TouchableOpacity>
      </View>
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
