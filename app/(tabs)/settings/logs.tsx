import LoadingScreen from "@/app/loading";
import { useAwaitLoadable } from "@/middleware/helpers";
import { loadableErrorLogsAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import React from "react";
import { FlatList, View, Text } from "react-native";

export default function LogsPage() {
  const { 
    value: errorLogs, 
    isReady: errorLogsReady 
  } = useAwaitLoadable(loadableErrorLogsAtom, []); 

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
      <FlatList 
        style={{
          marginTop: 10,
          marginBottom: 10,
        }}
        data={errorLogs}
        renderItem={({ item }) => (
          <View style={{flexDirection: 'row', marginBottom: 4}}>
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
    </View>
  )
}