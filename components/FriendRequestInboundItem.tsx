import { fetchWrapper, SafeError } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { friendsListAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom, useSetAtom } from "jotai";
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

interface FriendRequestInboundItemProps {
  id: string
  username: string
  request_state: string
  index: number
  removeRequest: (id: string) => void
  updateRequestState: (id: string, new_state: string) => void
}

export default function FriendRequestInboundItem(props: FriendRequestInboundItemProps) {
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);
  
  const [friendsList, setFriendsList] = useAtom(friendsListAtom);

  const [sendingAccept, setSendingAccept] = useState<boolean>(false);
  const [sendingDeny, setSendingDeny] = useState<boolean>(false);

  const acceptRequest = async () => {
    setSendingAccept(true);
    try {
      const data = await fetchWrapper({
        route: 'users/request/accept',
        method: 'POST',
        body: {
          "requestor_id": props.id
        }
      })
      if (!data || !data.status) throw new SafeError(`bad acceptRequest response`);

      if (data.status === "no-request") {
        props.removeRequest(props.id);
        throw new SafeError('no friend request found');
      } else if (data.status !== 'accepted') {
        throw new SafeError(`bad users/request/accept status '${data.status}'`);
      }



    } catch (error) {
      addCaughtErrorLog(error, 'error during acceptRequest');
    } finally {
      setSendingAccept(false);
    }
  };

  const denyRequest = async () => {
    setSendingDeny(true);
    try {
      const data = await fetchWrapper({
        route: 'users/request/deny',
        method: 'POST',
        body: {
          "requestor_id": props.id
        }
      })
      if (!data || !data.status) throw new SafeError(`bad denyRequest response`);

      if (data.status !== 'denied') {
        throw new SafeError(`bad users/request/deny status '${data.status}'`);
      } else {
        // props.removeRequest(props.id);
      }

    } catch (error) {
      addCaughtErrorLog(error, 'error during denyRequest');
    } finally {
      setSendingDeny(false);
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 12,
        padding: 10,
        backgroundColor: props.index % 2 ? '#000000': '#222328ff',
        borderRadius: 8,
      }}
    >
      <Text style={commonStyles.text}>{props.username}</Text>
      <View
        style={{
          flexDirection: 'row'
        }}
      >
        {props.request_state === 'requested' &&
          <>
            <TouchableOpacity 
              style={[commonStyles.textButton, {
                marginRight: 8,
                borderColor: 'green',
                borderWidth: 2,
              }]}
              onPress={acceptRequest}
              disabled={sendingAccept}
            >
              <Text style={commonStyles.text}>accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[commonStyles.textButton, {
                borderColor: 'red',
                borderWidth: 2,
              }]}
              onPress={denyRequest}
              disabled={sendingDeny}
            >
              <Text style={commonStyles.text}>deny</Text>
            </TouchableOpacity>
          </>
        }
        {props.request_state === 'accepted' &&
          <>
            <Text style={[commonStyles.text, {color: 'green'}]}>
              accepted
            </Text>
          </>
        }
        {props.request_state === 'denied' &&
          <>
            <Text style={[commonStyles.text, {color: 'red'}]}>
              denied
            </Text>
          </>
        }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
})