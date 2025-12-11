import AddFriends from "@/components/AddFriends";
import { friendsListAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom } from "jotai";
import React, { useState } from "react";
import { TouchableOpacity, View, Text, Modal } from "react-native";

export default function Friends() {
  const [friendsList, setFriendsList] = useAtom(friendsListAtom);
  
  const [showAddFriends, setShowAddFriends] = useState<boolean>(false)

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      <TouchableOpacity
        style={[commonStyles.thinTextButton, {
          width: 50, 
          marginBottom: 4,
          marginLeft: 12,
        }]}
        onPress={() => {setShowAddFriends(!showAddFriends)}}
        // disabled={}
      >
        <Text style={commonStyles.text}>search</Text>
      </TouchableOpacity>
      {friendsList.length === 0 ?
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text style={commonStyles.text}>you haven't added any friends yet</Text>
        </View>
      :
        <></>
      }
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