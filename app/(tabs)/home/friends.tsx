import AddFriends from "@/components/AddFriends";
import { friendsListAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom } from "jotai";
import React, { useState } from "react";
import { TouchableOpacity, View, Text, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Friends() {
  const [friendsList, setFriendsList] = useAtom(friendsListAtom);
  
  return (
    <KeyboardAvoidingView 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={110}
    >
      {friendsList.length === 0 ?
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={commonStyles.text}>you haven't added any friends yet</Text>
        </View>
      :
        <></>
      }
      <AddFriends />
    </KeyboardAvoidingView>
  )
}