import LoadingScreen from "@/app/loading";
import { OptionsObject } from "@/components/ChooseExerciseModal";
import PermissionsOptions from "@/components/PermissionsOptions";
import { fetchWrapper } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { permissionsAtom } from "@/store/general";
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
    if (permissions !== null) return;
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
        "label": "Appear in searches",
        "key": "searchable"
      }
    ]
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
      <PermissionsOptions 
        permissionKey='searchable' 
        initValue='private' 
      />
    </View>
  )
}