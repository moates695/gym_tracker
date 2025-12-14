import React, { useState } from "react";
import { View } from "react-native";
import { OptionsObject } from "./ChooseExerciseModal";
import { useDropdown } from "./ExerciseData";
import { fetchWrapper, SafeError } from "@/middleware/helpers";
import { useSetAtom } from "jotai";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { PermissionsKey } from "@/store/general";

interface PermissionsOptionsProps {
  permissionKey: PermissionsKey
  initValue: string
}

export default function PermissionsOptions(props: PermissionsOptionsProps) {
  const { permissionKey, initValue } = props;

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
      
      if (data.status === 'success') {
        setChosenValue(value);
      } else {
        throw new SafeError(`bad status '${data.status}' from users/permissions/update`)
      }

    } catch (error) {
      addCaughtErrorLog(error, 'error during updatePermissions');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View>
      {useDropdown(options, chosenValue, updatePermissions)}
    </View>
  )
}

const getPermissionValues = (key: PermissionsKey): string[] => {
  if (key === 'searchable') {
    return ["public", "private"];
  }
  return ["public", "friends", "private"];
};