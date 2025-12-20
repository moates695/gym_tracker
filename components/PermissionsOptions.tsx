import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { OptionsObject } from "./ChooseExerciseModal";
import { useDropdown } from "./ExerciseData";
import { fetchWrapper, SafeError } from "@/middleware/helpers";
import { useSetAtom } from "jotai";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { PermissionsKey } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";

export interface PermissionsOptionsProps {
  permissionKey: PermissionsKey
  initValue: string
  textLabel: string
}

export default function PermissionsOptions(props: PermissionsOptionsProps) {
  const { permissionKey, initValue, textLabel } = props;

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const options: OptionsObject[] = getPermissionValues(permissionKey).map((value) => {
    return {
      label: value,
      value
    }
  })
  const [chosenValue, setChosenValue] = useState<string>(initValue);

  const [updating, setUpdating] = useState<boolean>(false);

  const updatePermissions = async (value: string) => {
    setUpdating(true);
    const oldValue = chosenValue;
    setChosenValue(value);
    const start = performance.now();
    try {
      const data = await fetchWrapper({
        route: 'users/permissions/update',
        method: 'POST',
        body: {
          key: permissionKey,
          value: value
        }
        
      })
      if (!data || !data.status) throw new SafeError(`bad updatePermissions response`);
      
      if (data.status !== 'success') {
        throw new SafeError(`bad status '${data.status}' from users/permissions/update`)
      }

    } catch (error) {
      addCaughtErrorLog(error, 'error during updatePermissions');
      setChosenValue(oldValue);
    }

    const ms = performance.now() - start;
    const minWait = 500;
    if (ms < minWait) {
      setTimeout(() => {
        setUpdating(false)
      }, minWait - ms)
    } else {
      setUpdating(false)
    }
  };

  return (
    <View
      style={{
      }}
    >
      <Text style={[commonStyles.text, {marginBottom: 4}]}>
        {textLabel}
      </Text>
      <View 
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <View>
          {useDropdown(options, chosenValue, updatePermissions, updating, {width: 150})}
        </View>
          <ActivityIndicator 
            size="small" 
            style={{
              marginLeft: 8,
              opacity: updating ? 100: 0
            }}
          />
        {/* } */}
      </View>
    </View>
  )
}

const getPermissionValues = (key: PermissionsKey): string[] => {
  if (key === 'searchable') {
    return ["public", "private"];
  }
  return ["friends", "private"];
};