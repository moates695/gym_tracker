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
  removeItem: (id: string) => void
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
        route: 'users/request/send',
        method: 'POST',
        body: {
          target_id: props.id 
        }
      });
      if (!data || !data.status) throw new SafeError('bad response');

      if (["added", "existing", "blocked", "private"].includes(data.status)) {
        props.removeItem(props.id);
      } else if (data.status === 'requested') {
        props.updateRelation(props.id, "requested");
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
      addCaughtErrorLog(error, 'error during cancelRequest');
    } finally {
      setSendingRequest(false);
    }
  }

  const acceptRequest = async () => {
    setSendingRequest(true);
    try {
      const data = await fetchWrapper({
        route: 'users/request/accept',
        method: 'POST',
        body: {
          requestor_id: props.id 
        }
      });
      if (!data || !data.status) throw new SafeError(`bad acceptRequest response`);
      
      props.removeItem(props.id);

      if (data.status === "no-request") {
        throw new SafeError('no friend request found');
      } else if (data.status !== 'accepted') {
        throw new SafeError(`bad users/request/accept status '${data.status}'`);
      }

    } catch (error) {
      addCaughtErrorLog(error, 'error during acceptRequest');
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
          <Text style={commonStyles.text}>send</Text>
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
      {props.relation === "inbound" &&
        <TouchableOpacity 
          style={[commonStyles.textButton, {
            // marginRight: 8,
            borderColor: 'green',
            borderWidth: 2,
          }]}
          onPress={acceptRequest}
          disabled={sendingRequest}
        >
          <Text style={commonStyles.text}>accept</Text>
        </TouchableOpacity>
      }
    </View>
  )
}