import LoadingScreen from "@/app/loading";
import { OptionsObject } from "@/components/ChooseExerciseModal";
import PermissionsOptions, { PermissionsOptionsProps } from "@/components/PermissionsOptions";
import { fetchWrapper } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { permissionsAtom, PermissionsKey } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import { View, Text } from "react-native";



export default function PermissionSettings() {
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const [permissions, setPermissions] = useAtom(permissionsAtom);
  const [loading, setLoading] = useState<boolean>(false);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const data = await fetchWrapper({
        route: 'users/permissions/get',
        method: 'GET'
      })
      if (!data || !data.permissions) throw new Error('permissions bad response');
      setPermissions(data.permissions);
    } catch (error) {
      addCaughtErrorLog(error, 'fetching muscle maps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const rows = useMemo((): PermissionsOptionsProps[][] => {
    if (permissions === null) return [];
    return [
      [
        {
          "textLabel": "Profile is searchable:",
          "permissionKey": "searchable",
          "initValue": permissions.searchable
        },
        {
          "textLabel": "Workout visibility:",
          "permissionKey": "workouts",
          "initValue": permissions.workouts
        }
      ],
      [
        {
          "textLabel": "Name visibility:",
          "permissionKey": "name",
          "initValue": permissions.name
        },
        {
          "textLabel": "Gender visibility:",
          "permissionKey": "gender",
          "initValue": permissions.gender
        }
      ],
      [
        {
          "textLabel": "Height visibility:",
          "permissionKey": "height",
          "initValue": permissions.height
        },
        {
          "textLabel": "Weight visibility:",
          "permissionKey": "weight",
          "initValue": permissions.weight
        }
      ],
      [
        {
          "textLabel": "Age visibility:",
          "permissionKey": "age",
          "initValue": permissions.age
        },
        {
          "textLabel": "Goal visibility:",
          "permissionKey": "goal",
          "initValue": permissions.goal
        }
      ],
      [
        {
          "textLabel": "PED visibility:",
          "permissionKey": "ped_status",
          "initValue": permissions.ped_status
        },
      ],
    ]
  }, [permissions]);

  if (loading) {
    return <LoadingScreen />
  } else if (permissions === null) {
    return (
      <View>
        <Text style={commonStyles.text}>
          could not load permissions
        </Text>
      </View>
    )
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'black',
        paddingLeft: 10,
        paddingRight: 10,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <View
        style={{
          gap: 20
        }}
      >
        {rows.map((row, index) => {
          return (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                width: '100%'
              }}
            >
              <PermissionsOptions 
                permissionKey={row[0].permissionKey as PermissionsKey} 
                initValue={row[0].initValue}
                textLabel={row[0].textLabel}
              />
              {row[1] !== undefined &&
                <PermissionsOptions 
                  permissionKey={row[1].permissionKey as PermissionsKey} 
                  initValue={row[1].initValue}
                  textLabel={row[1].textLabel}
                />
              }
            </View>
          )
        })}
      </View>
    </View>
  )
}