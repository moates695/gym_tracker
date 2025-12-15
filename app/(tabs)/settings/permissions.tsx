import LoadingScreen from "@/app/loading";
import { OptionsObject } from "@/components/ChooseExerciseModal";
import PermissionsOptions from "@/components/PermissionsOptions";
import { fetchWrapper } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { permissionsAtom, PermissionsKey } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
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
    // if (permissions !== null) return;
    loadPermissions();
  }, []);

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

  const rows = [
    [
      {
        "label": "Profile is searchable:",
        "key": "searchable",
        "initValue": permissions.searchable
      },
      {
        "label": "Workout visibility:",
        "key": "workouts",
        "initValue": permissions.workouts
      }
    ],
    [
      {
        "label": "Name visibility:",
        "key": "name",
        "initValue": permissions.name
      },
      {
        "label": "Gender visibility:",
        "key": "gender",
        "initValue": permissions.gender
      }
    ],
    [
      {
        "label": "Height visibility:",
        "key": "height",
        "initValue": permissions.height
      },
      {
        "label": "Weight visibility:",
        "key": "weight",
        "initValue": permissions.weight
      }
    ],
    [
      {
        "label": "Age visibility:",
        "key": "age",
        "initValue": permissions.age
      },
      {
        "label": "Goal visibility:",
        "key": "goal",
        "initValue": permissions.goal
      }
    ],
    [
      {
        "label": "PED visibility:",
        "key": "ped_status",
        "initValue": permissions.ped_status
      },
    ],
  ]

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
                permissionKey={row[0].key as PermissionsKey} 
                initValue='private' 
                textLabel={row[0].label}
              />
              { row[1] !== undefined &&
                <PermissionsOptions 
                  permissionKey={row[1].key as PermissionsKey} 
                  initValue='private' 
                  textLabel={row[1].label}
                />
              }
            </View>
          )
        })}
      </View>
    </View>
  )
}