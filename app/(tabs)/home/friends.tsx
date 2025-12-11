import AddFriends from "@/components/AddFriends";
import { commonStyles } from "@/styles/commonStyles";
import React, { useState } from "react";
import { TouchableOpacity, View, Text, Modal } from "react-native";

export default function Friends() {
  const [showAddFriends, setShowAddFriends] = useState<boolean>(false)

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      <TouchableOpacity
        style={[commonStyles.thinTextButton, {width: 50, marginBottom: 4}]}
        onPress={() => {setShowAddFriends(!showAddFriends)}}
        // disabled={}
      >
        <Text style={commonStyles.text}>add</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddFriends}
        onRequestClose={() => setShowAddFriends(false)}
      >
        <AddFriends onPress={() => setShowAddFriends(false)}/>
      </Modal>
    </View>
  )
}