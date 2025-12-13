import { fetchWrapper, SafeError } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { blockedListAtom, friendsListAtom, FriendsListItem } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { Feather } from "@expo/vector-icons";
import { useAtom, useSetAtom } from "jotai";
import React, { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import ConfirmationModal from "./ConfirmationModal";

interface BlockedItemButtonsProps {
  userId: string
  username: string
}

export default function BlockedItemButtons(props: BlockedItemButtonsProps) {
  const { userId, username } = props;
  
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const [friendsList, setFriendsList] = useAtom(friendsListAtom);
  const [blockedList, setBlockedList] = useAtom(blockedListAtom);

  const [unblockConfirm, setUnblockConfirm] = useState<boolean>(false);

  const unblockUser = async () => {
      try {
        const data = await fetchWrapper({
          route: 'users/friends/unblock',
          method: 'POST',
          body: {
            target_id: userId
          }
        })
        if (!data || !data.status) throw new SafeError(`bad users/friends/unblock response`);
        
        if (data.status === 'success') {
          let tempBlocked = structuredClone(blockedList);
          tempBlocked = tempBlocked.filter(item => item.user_id !== userId);
          setBlockedList(tempBlocked);
        } else {
          throw new SafeError(`bad status for users/friends/unblock '${data.status}'`)
        }
  
      } catch (error) {
        addCaughtErrorLog(error, 'error during unblockUser');
      } finally {
        setUnblockConfirm(false);
      }
    };

  return (
    <>
      <TouchableOpacity
        onPress={() => setUnblockConfirm(true)}
        style={[commonStyles.textButton, {
          borderColor: 'green',
          borderWidth: 2,
        }]}
      >
        <Text style={commonStyles.text}>unblock</Text>
      </TouchableOpacity>
      <ConfirmationModal 
        visible={unblockConfirm}
        onConfirm={unblockUser}
        onCancel={() => {setUnblockConfirm(false)}}
        message={`Unblock ${username}?`}
        confirm_string='unblock'
        cancel_string='cancel'
      />
    </>
  )
} 