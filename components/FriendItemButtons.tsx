import { blockedListAtom, friendsListAtom, FriendsListItem } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import ConfirmationModal from "./ConfirmationModal";
import { fetchWrapper, SafeError } from "@/middleware/helpers";
import { useAtom, useSetAtom } from "jotai";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";

interface FriendItemButtonsProps {
  userId: string
  username: string
  showManage: boolean
}

export default function FriendItemButtons(props: FriendItemButtonsProps) {
  const { userId, username, showManage } = props;

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const [friendsList, setFriendsList] = useAtom(friendsListAtom);
  const [blockedList, setBlockedList] = useAtom(blockedListAtom);

  const [unfriendConfirm, setUnfriendConfirm] = useState<boolean>(false);
  const [blockConfirm, setBlockConfirm] = useState<boolean>(false);

  const unfriendUser = async () => {
    try {
      const data = await fetchWrapper({
        route: 'users/friends/unfriend',
        method: 'POST',
        body: {
          target_id: userId
        }
      })
      if (!data || !data.status) throw new SafeError(`bad users/friends/unfriend response`);
      
      if (data.status === 'success') {
        removeFromFriends();
      } else {
        throw new SafeError(`bad status for users/friends/unfriend '${data.status}'`)
      }

    } catch (error) {
      addCaughtErrorLog(error, 'error during unfriendUser');
    } finally {
      setUnfriendConfirm(false);
    }
  };

  const blockUser = async () => {
    try {
      const data = await fetchWrapper({
        route: 'users/friends/block',
        method: 'POST',
        body: {
          target_id: userId
        }
      })
      if (!data || !data.status) throw new SafeError(`bad users/friends/block response`);
      
      if (data.status === 'success') {
        removeFromFriends();
        const tempBlocked = structuredClone(blockedList);
        tempBlocked.push({
          user_id: userId,
          username: username
        })
      } else {
        throw new SafeError(`bad status for users/friends/block '${data.status}'`)
      }

    } catch (error) {
      addCaughtErrorLog(error, 'error during blockUser');
    } finally {
      setBlockConfirm(false);
    }
  };

  const removeFromFriends = () => {
    let tempList = structuredClone(friendsList);
    tempList = tempList.filter(item => item.user_id !== userId);
    setFriendsList(tempList);
  };

  if (showManage) {
    return (
      <View
        style={{
          flexDirection: 'row'
        }}
      >
        <TouchableOpacity
          onPress={() => setUnfriendConfirm(true)}
          style={[commonStyles.textButton, {
            marginRight: 8,
            borderColor: 'orange',
            borderWidth: 2,
          }]}
        >
          <Text style={commonStyles.text}>unfriend</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setBlockConfirm(true)}
          style={[commonStyles.textButton, {
            borderColor: 'red',
            borderWidth: 2,
          }]}
        >
          <Text style={commonStyles.text}>block</Text>
        </TouchableOpacity>
        <ConfirmationModal 
          visible={unfriendConfirm}
          onConfirm={unfriendUser}
          onCancel={() => {setUnfriendConfirm(false)}}
          message={`Unfriend ${username}?`}
          confirm_string='unfriend'
          cancel_string='cancel'
        />
        <ConfirmationModal 
          visible={blockConfirm}
          onConfirm={blockUser}
          onCancel={() => setBlockConfirm(false)}
          message={`Block ${username}?`}
          confirm_string='block'
          cancel_string='cancel'
        />
      </View>
    )
  }

  return (
    <TouchableOpacity
      onPress={() => {}}
    >
      <Feather name="arrow-right" size={24} color="#ccc" />
    </TouchableOpacity>
  )
} 