import LoadingScreen from "@/app/loading";
import { OptionsObject } from "@/components/ChooseExerciseModal";
import { useDropdown } from "@/components/ExerciseData";
import LineGraph from "@/components/LineGraph";
import { fetchWrapper } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { commonStyles } from "@/styles/commonStyles";
import { useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

type FieldValue = 'weight' | 'height' | 'goal_status' | 'ped_status' | 'bodyfat';
interface FieldOption {
  label: string,
  value: FieldValue
}

export default function SettingsUserData() {
  
  const [dataHistory, setDataHistory] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const fieldOptions: FieldOption[] = [
    { label: 'weight', value: 'weight' },
    { label: 'height', value: 'height' },
    { label: 'phase', value: 'goal_status' },
    { label: 'natty status', value: 'ped_status' },
    { label: 'bodyfat %', value: 'bodyfat' },
  ]
  const [fieldValue, setFieldValue] = useState<FieldValue>('weight');
  
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await fetchWrapper({
        route: 'users/data/get/history',
        method: 'GET'
      })
      if (!data || !data.data_history) throw new Error('permissions bad response');
      setDataHistory(data.data_history);
    } catch (error) {
      addCaughtErrorLog(error, 'fetching users/data/get/history');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (dataHistory !== null) return;
    fetchHistory();
  }, []);

  console.log(dataHistory)

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
        // paddingLeft: 10,
        // paddingRight: 10,
        marginHorizontal: 12
      }}
    >
      <TouchableOpacity
        style={[commonStyles.thinTextButton, {width: 50, marginBottom: 8}]}
        onPress={() => fetchHistory()}
        disabled={loadingHistory}
      >
        <Text style={commonStyles.text}>refresh</Text>
      </TouchableOpacity>
      {loadingHistory ?
        <LoadingScreen />
      :
        <>
          {dataHistory === null &&
            <View>
              <Text>could not load user data</Text>
            </View>
          }
          <View>
            <Text style={commonStyles.text}>Choose a data field:</Text>
            {useDropdown(fieldOptions, fieldValue, setFieldValue)}
          </View>
          <LineGraph 
            points={dataHistory.weight.graph}
            scale_type="time"
          />
        </>
      }
    </View>
  )
}