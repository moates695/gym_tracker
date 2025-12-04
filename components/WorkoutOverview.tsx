import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Modal, Switch, Button } from "react-native";
import { commonStyles } from "@/styles/commonStyles";
import WorkoutFinishOptions from "./WorkoutFinishOptions";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { exercisesHistoricalDataAtom, loadingPreviousWorkoutStatsAtom, muscleGroupToTargetsAtom, muscleTargetoGroupAtom, previousWorkoutStatsAtom, WorkoutExercise, workoutExercisesAtom, workoutStartTimeAtom } from "@/store/general";
import { fetchWrapper, getValidSets } from "@/middleware/helpers";
import MuscleGroupSvg from "./MuscleGroupSvg";
import { filterTimeSeries, timeSpanToMs, useDropdown } from "./ExerciseData";
import { TimeSpanOption, TimeSpanOptionObject } from "./ExerciseData";
import { Dropdown } from "react-native-element-dropdown";
import DataTable from "./DataTable";
import LineGraph, { LineGraphPoint } from "./LineGraph";
import { OptionsObject } from "./ChooseExerciseModal";
import WorkoutOverviewCurrent from "./WorkoutOverviewCurrent";
import WorkoutOverviewHistorical from "./WorkoutOverviewHistorical";
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";

interface WorkoutOverviewProps {
  onPress: () => void
}

type DisplayedDataType = 'current' | 'history';
interface DisplayedDataOption {
  label: string
  value: DisplayedDataType
}

const Fallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <View style={{ padding: 20, backgroundColor: '#fdd', margin: 10 }}>
      <Text style={{ color: 'red', fontWeight: 'bold' }}>
        Error: {error.message}
      </Text>
      <Button onPress={resetErrorBoundary} title="Try again" />
    </View>
  );
};

export default function WorkoutOverview(props: WorkoutOverviewProps) {
  const { onPress } = props;
  
  const [, setPreviousWorkoutStats] = useAtom(previousWorkoutStatsAtom);
  const [, setLoadingPreviousWorkoutStats] = useAtom(loadingPreviousWorkoutStatsAtom);

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);
  
  const displayedDataOptions: DisplayedDataOption[] = [
    { label: 'current workout', value: 'current' },
    { label: 'workout history', value: 'history' },
  ]
  const [displayedDataValue, setDisplayedDataValue] = useState<DisplayedDataType>('current');

  const getOverviewStats = async () => {
    setLoadingPreviousWorkoutStats(true);
    try {
      const data = await fetchWrapper({
        route: 'workout/overview/stats',
        method: 'GET'
      });
      if (data === null) return;
      setPreviousWorkoutStats(data.workouts);
    } catch (error) {
      addCaughtErrorLog(error, 'error getOverviewStats');
    }
    setLoadingPreviousWorkoutStats(false);
  };

  const displayDataMap: Record<DisplayedDataType, JSX.Element> = {
    'current': <WorkoutOverviewCurrent />,
    'history': (
      <ErrorBoundary
        FallbackComponent={Fallback}
        onReset={() => {
          console.log('Attempting to reset the component...');
        }}
      >
        <WorkoutOverviewHistorical />
      </ErrorBoundary>
    )
  }

  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        <View style={styles.headerRow}>
          <Text style={commonStyles.boldText}>Overview</Text>
          {displayedDataValue === 'history' &&
            <TouchableOpacity
              onPress={getOverviewStats}
              style={commonStyles.thinTextButton}
            >
              <Text style={styles.text}>refresh data</Text>
            </TouchableOpacity> 
          }
        </View>
        <View style={styles.dataContainer}>
          <Text style={styles.text}>Choose display data:</Text>
          {useDropdown(displayedDataOptions, displayedDataValue, setDisplayedDataValue)}
          {displayDataMap[displayedDataValue]}
        </View>
        <TouchableOpacity 
          style={[commonStyles.thinTextButton, {width: 50, alignSelf: 'center'}]}
          onPress={onPress}
        >
          <Text style={styles.text}>hide</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
    width: '100%',
  },
  modalContainer: {
    backgroundColor: 'black',
    padding: 15,
    // alignItems: 'center',
    elevation: 5,
    borderColor: 'red',
    borderTopWidth: 2,
    maxHeight: '95%',
    width: '100%',
    paddingBottom: 20,
  },
  dataContainer: {
    minHeight: 300,
    padding: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    justifyContent: 'center',
    width: 50,
    alignSelf: 'center',
    textAlign: 'center',
    alignItems: 'center'
  },
  switchContainer: {
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownButton: {
    backgroundColor: 'black',
    width: 200,
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  dropdownContainerStyle: {
    backgroundColor: 'black',
    maxHeight: 250,
  },
  dropdownText: {
    color: 'white',
    fontSize: 14
  },
  dataTableContainer: {
    height: 50,
    padding: 5,
  }
})