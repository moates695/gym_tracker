import LoadingScreen from "@/app/loading";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useAwaitLoadable } from "@/middleware/helpers";
import { errorLogsAtom, loadableErrorLogsAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useSetAtom } from "jotai";
import React, { useState } from "react";
import { FlatList, View, Text, TouchableOpacity } from "react-native";

// todo clear logs button with confirmation

export default function LogsPage() {
  const { 
    value: errorLogs, 
    isReady: errorLogsReady 
  } = useAwaitLoadable(loadableErrorLogsAtom, []); 

  const setErrorLogs = useSetAtom(errorLogsAtom);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const handleDeleteLogs = () => {
    setErrorLogs([]);
    setShowConfirmation(false);
  };

  if (!errorLogsReady) {
    return <LoadingScreen />
  }

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
        paddingLeft: 10,
        paddingRight: 10,
      }}
    >
      {errorLogs.length === 0 ?
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text style={commonStyles.text}>no logs yet</Text>
        </View>
      :
        <>
          <TouchableOpacity
            style={[commonStyles.thinTextButton, {width: 50, marginLeft: 12}]}
            onPress={() => setShowConfirmation(true)}
            disabled={errorLogs.length === 0}
          >
            <Text style={commonStyles.text}>delete</Text>
          </TouchableOpacity>
          <FlatList 
            style={{
              marginTop: 10,
              marginBottom: 10,
            }}
            data={errorLogs}
            renderItem={({ item, index }) => (
              <View 
                style={{
                  flexDirection: 'row', 
                  marginBottom: 4,
                  backgroundColor: index % 2 ? '#000000' : '#222328ff',
                  borderRadius: 5,
                  padding: 5,
                }}>
                <View style={{width: 155}}>
                  <Text style={[
                    commonStyles.text,
                    item.level === 'error' ? {
                      color: 'red'
                    } : {
                      color: 'orange'
                    }]}>
                    {item.date_str}
                  </Text>
                </View>
                <Text style={[commonStyles.text, {flex: 1}]}>
                  {item.message}
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={true}
          />
          <ConfirmationModal 
            visible={showConfirmation}
            onConfirm={handleDeleteLogs}
            onCancel={() => setShowConfirmation(false)}
            message='Delete all logs?'
            confirm_string="yep"
            cancel_string="nah"
          />
        </>
      }
    </View>
  )
}