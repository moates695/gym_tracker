import AddFriends, { UserSearchResultItem, UserSearchResultRelation } from "@/components/AddFriends";
import { fetchWrapper, SafeError } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { friendsListAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom, useSetAtom } from "jotai";
import React, { useState } from "react";
import { TouchableOpacity, View, Text, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface AddFriendsListItemProps extends UserSearchResultItem {
  index: number
  updateRelation: (id: string, relation: UserSearchResultRelation) => void
}  

// todo if both users request to add each other, add as being friends

export default function AddFriendsListItem(props: AddFriendsListItemProps) {
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  // const [friendsList, setFriendsList] = useAtom(friendsListAtom);
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);

  const addFriend = async () => {
    setSendingRequest(true);
    try {
      const data = await fetchWrapper({
        route: 'users/request/add',
        method: 'POST',
        body: {
          target_id: props.id 
        }
      });
      if (!data || !data.status) throw new SafeError('bad response');
      if (data.status === "added") {
        props.updateRelation(props.id, "friend");
      } else if (data.status === "existing") {
        props.updateRelation(props.id, "friend");
      } else if (data.status === "requested") {
        props.updateRelation(props.id, "requested");
      } else if (data.status === "blocked") {
        // todo: remove from search results list?
      } else {
        throw new SafeError(`unkown return status '${data.status}'`);
      }
    } catch (error) {
      addCaughtErrorLog(error, 'error during addFriend');
    } finally {
      setSendingRequest(false);
    }
  }

  const cancelRequest = async () => {
    setSendingRequest(true);
    try {
      const data = await fetchWrapper({
        route: 'users/request/cancel',
        method: 'POST',
        body: {
          target_id: props.id 
        }
      });
      if (!data || !data.status) throw new SafeError('bad response');
      if (data.status === "cancelled") {
        props.updateRelation(props.id, "none");
      } else {
        throw new SafeError(`unkown return status '${data.status}'`);
      }

    } catch (error) {
      addCaughtErrorLog(error, 'error during addFriend');
    } finally {
      setSendingRequest(false);
    }
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
      {props.relation === "none" &&
        <TouchableOpacity 
          style={commonStyles.textButton}
          onPress={addFriend}
          disabled={sendingRequest}
        >
          <Text style={commonStyles.text}>add</Text>
        </TouchableOpacity>
      }
      {props.relation === "requested" &&
        <TouchableOpacity 
          style={commonStyles.textButton}
          onPress={cancelRequest}
          disabled={sendingRequest}
        >
          <Text style={commonStyles.text}>cancel</Text>
        </TouchableOpacity>
      }
    </View>
  )
}