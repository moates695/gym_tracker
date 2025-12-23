import { fetchWrapper } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { homeMuscleHistoryAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtom, useSetAtom } from "jotai";
import React, { Suspense, useEffect, useState } from "react";
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";

// if have a schedule, see todays workout(s)
// button to start workout
// see previous workouts and their target muscles
// see previous <day number> workouts and muscles worked
// other stats and info
// switch to see friends workouts?

export default function Home() {
  const router = useRouter();

  const [homeMuscleHistory, setHomeMuscleHistory] = useAtom(homeMuscleHistoryAtom);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom)

  const loadData = async () => {
    try {
      setLoadingData(true);
      const data = await fetchWrapper({
        route: 'home/muscles-history',
        method: 'GET'
      })
      if (!data || !data.data) throw new Error('loadData bad response');

      setHomeMuscleHistory(data.data);

    } catch (error) {
      addCaughtErrorLog(error, 'fetching home/muscles-history');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (homeMuscleHistory !== null) return;
    loadData();
  }, []);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: 'black'
      }}
    >        
      {/* <TouchableOpacity
        style={[styles.button, {width: 200}]}
        onPress={() => router.replace('/(tabs)/home/friends')}
      >
        <Text style={commonStyles.text}>friends</Text>
      </TouchableOpacity> */}
      <Text style={{color: "white", marginTop: 20}}>home coming soon...</Text>
      <StatusBar style='dark' />
    </ScrollView>        
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