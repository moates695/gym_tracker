import LoadingScreen from "@/app/loading";
import { OptionsObject } from "@/components/ChooseExerciseModal";
import DataTable from "@/components/DataTable";
import { filterTimeSeries, TimeSpanOption, TimeSpanOptionObject, useDropdown } from "@/components/ExerciseData";
import LineGraph from "@/components/LineGraph";
import { fetchWrapper } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { commonStyles } from "@/styles/commonStyles";
import { useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, Keyboard } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import ConfirmationModal from "@/components/ConfirmationModal";

type FieldValue = 'weight' | 'height' | 'goal_status' | 'ped_status' | 'bodyfat';
interface FieldOption {
  label: string,
  value: FieldValue
}

type GoalStatusValue = 'bulking' | 'cutting' | 'maintaining';
interface GoalStatusOption {
  label: string,
  value: GoalStatusValue
}

type PedStatusValue = 'natural' | 'juicing' | 'silent';
interface PedStatusOption {
  label: string,
  value: PedStatusValue
}

// todo select first timespan with data on mount (same for ExerciseData)

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
  
  const timeSpanOptions: TimeSpanOptionObject[] = [
    { label: 'week', value: 'week' },
    { label: 'month', value: 'month' },
    { label: '3 months', value: '3_months' },
    { label: '6 months', value: '6_months' },
    { label: 'year', value: 'year' },
    { label: 'all', value: 'all' },
  ]
  const [timeSpanOptionValue, setTimeSpanOptionValue] = useState<TimeSpanOption>('month');

  const [newEntry, setNewEntry] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const goalStatusOptions: GoalStatusOption[] = [
    { label: 'bulking', value: 'bulking' },
    { label: 'cutting', value: 'cutting' },
    { label: 'maintaining', value: 'maintaining' },
  ]
  const [goalStatusValue, setGoalStatusValue] = useState<GoalStatusValue>('bulking');

  const pedStatusOptions: PedStatusOption[] = [
    { label: 'natural', value: 'natural' },
    { label: 'juicing', value: 'juicing' },
    { label: 'silent', value: 'silent' },
  ]
  const [pedStatusValue, setPedStatusValue] = useState<PedStatusValue>('natural');

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

  useEffect(() => {
    if (dataHistory === null) return;
    let tempPoints = filterTimeSeries(dataHistory[fieldValue].graph, timeSpanOptionValue);
    if (tempPoints.length > 0) return;
    for (const option of timeSpanOptions) {
      tempPoints = filterTimeSeries(dataHistory[fieldValue].graph, option.value);
      if (tempPoints.length === 0) continue;
      setTimeSpanOptionValue(option.value);
      break
    }
  }, [fieldValue, dataHistory]);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setIsSubmitting(true);
    try {
      let value = newEntry;
      if (fieldValue === 'goal_status') {
        value = goalStatusValue;
      } else if (fieldValue === 'ped_status') {
        value = pedStatusValue;
      }
      
      const data = await fetchWrapper({
        route: 'users/data/update',
        method: 'POST',
        body: {
          [fieldValue]: value
        }
      })
      if (!data || !data.status) throw new Error('bad response users/data/update');

      if (data.status === 'error') {
        Alert.alert(data.message);
      } else {
        setDataHistory(data.data_history);
      }

    } catch (error) {
      addCaughtErrorLog(error, 'fetching users/data/get/history');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  const isSubmitDisabled = (): boolean => {
    if (newEntry.trim() === '' || isSubmitting) return true;
    const num = Number(newEntry);
    if (Number.isNaN(num) || num <= 0) return true;
    if (fieldValue === 'bodyfat' && num > 100) return true;
    return false;
  };

  const inputElement = ((): JSX.Element => {
    if (fieldValue === 'goal_status') {
      return (
        <View>
          {useDropdown(goalStatusOptions, goalStatusValue, setGoalStatusValue)}
        </View>
      )
    } else if (fieldValue === 'ped_status') {
      return (
        <View>
          {useDropdown(pedStatusOptions, pedStatusValue, setPedStatusValue)}
        </View>
      )
    }
    return (
      <TextInput 
        value={newEntry}
        onChangeText={setNewEntry}
        keyboardType={'decimal-pad'}
        style={[commonStyles.input, {'width': 200}]}
      />
    )
  })();

  const component = ((): JSX.Element => {
    if (loadingHistory) {
      return <LoadingScreen />
    } else if (dataHistory === null) {
      return (
        <View>
          <Text>could not load user data</Text>
        </View>
      )
    }
    return (
      <>
        <View 
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text style={commonStyles.text}>Choose a data field:</Text>
            {useDropdown(fieldOptions, fieldValue, setFieldValue)}
          </View>
          <View>
            <Text style={commonStyles.text}>Choose a lookback period:</Text>
            {useDropdown(timeSpanOptions, timeSpanOptionValue, setTimeSpanOptionValue)}
          </View>
        </View>
        <View style={{marginTop: 8}}>
          <Text style={commonStyles.text}>
            Add a new entry:
          </Text>
          <View style={{flexDirection: 'row'}}>
            {inputElement}
            <TouchableOpacity
              onPress={() => setShowConfirm(true)}
                style={{
                  justifyContent: 'center', 
                  alignItems: 'center',
                }}
              disabled={isSubmitDisabled()}
            >
              <Ionicons 
                name="add-circle-outline" 
                size={30} 
                color={isSubmitDisabled() ? 'red' : "#ccc"}
                style={{
                  marginLeft: 8
                }} 
              />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            // justifyContent: 'center',
            // alignItems: 'center',
          }}
        >
          {['weight','height','bodyfat'].includes(fieldValue) &&
            <LineGraph 
              points={filterTimeSeries(dataHistory[fieldValue].graph, timeSpanOptionValue)}
              scale_type="time"
            />
          }
          <View
            style={{
              width: '100%',
              marginTop: 10,
            }}
          >
            <DataTable
              tableData={dataHistory[fieldValue].table} 
            />
          </View>
        </View>
      </>
    )
  })();

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
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
      {component}
      <ConfirmationModal 
        visible={showConfirm}
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirm(false)}
        message={'Add new entry?'}
        confirm_string={'yep'}
        cancel_string={'nope'}
      />
    </View>
  )
}