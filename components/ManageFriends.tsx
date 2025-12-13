import { commonStyles } from "@/styles/commonStyles";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

interface ManageFriendsProps {
  onPress: () => void
}

export default function ManageFriends(props: ManageFriendsProps) {
  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        <View style={styles.headerRow}>
          <Text style={commonStyles.boldText}>Manage</Text>
          <TouchableOpacity
            onPress={() => {}}
            style={commonStyles.thinTextButton}
          >
            <Text style={commonStyles.text}>refresh</Text>
          </TouchableOpacity> 
        </View>
        <TouchableOpacity 
          style={[commonStyles.thinTextButton, {width: 50, alignSelf: 'center'}]}
          onPress={props.onPress}
        >
          <Text style={commonStyles.text}>hide</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
    minHeight: '30%',
    width: '100%',
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})