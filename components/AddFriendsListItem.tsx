import AddFriends from "@/components/AddFriends";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { friendsListAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom, useSetAtom } from "jotai";
import React, { useState } from "react";
import { TouchableOpacity, View, Text, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface AddFriendsListItemProps {
  id: string,
  username: string,
  is_friend: boolean,
  index: number
}  

// todo if both users request to add each other, add as being friends

export default function AddFriendsListItem(props: AddFriendsListItemProps) {
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  // const [friendsList, setFriendsList] = useAtom(friendsListAtom);
  const [requestingAdd, setRequestingAdd] = useState<boolean>(false);

  const addFriend = async () => {

  }

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 4,
        borderRadius: 8,
        padding: 10,
        backgroundColor: props.index % 2 ? '#000000': '#222328ff',
      }}
    >
      <Text style={commonStyles.text}>
        {props.username}
      </Text>
      {props.is_friend ?
        <TouchableOpacity 
          style={commonStyles.textButton}
        >
          <Text style={commonStyles.text}>friend</Text>
        </TouchableOpacity>
      :
        <TouchableOpacity 
          style={commonStyles.textButton}
        >
          <Text style={commonStyles.text}>add</Text>
        </TouchableOpacity>
      }
    </View>
  )
}