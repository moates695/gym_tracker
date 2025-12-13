import { fetchWrapper, SafeError } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { FriendRequest, FriendRequestState, friendsListAtom, inboundFriendRequestsAtom, outboundFriendRequestsAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom, useSetAtom } from "jotai";
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { FriendRequestType } from "./FriendRequests";

interface FriendRequestItemProps {
  request: FriendRequest
  index: number
  requestType: FriendRequestType
}

export default function FriendRequestItem(props: FriendRequestItemProps) {
  const { request, index, requestType } = props; 

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);
  
  const [friendsList, setFriendsList] = useAtom(friendsListAtom);
  const [inboundRequests, setInboundRequests] = useAtom(inboundFriendRequestsAtom);
  const [outboundRequests, setOutboundRequests] = useAtom(outboundFriendRequestsAtom);

  const [sending, setSending] = useState<boolean>(false);

  const acceptRequest = async () => {
    setSending(true);
    try {
      const data = await fetchWrapper({
        route: 'users/request/accept',
        method: 'POST',
        body: {
          "requestor_id": request.id
        }
      })
      if (!data || !data.status) throw new SafeError(`bad acceptRequest response`);

      if (data.status === "accepted") {
        updateRequestState('accepted');
        const tempList = structuredClone(friendsList);
        tempList.unshift({
          user_id: request.id,
          username: request.username
        });
        setFriendsList(tempList);
      } else if (data.status === "existing") {
        updateRequestState('accepted');
      } else if (data.status === "no-request" || data.status === "blocked") {
        removeRequest();
        throw new SafeError('no friend request found');
      } else {
        throw new SafeError(`bad users/request/accept status '${data.status}'`);
      }

    } catch (error) {
      addCaughtErrorLog(error, 'error during acceptRequest');
    } finally {
      setSending(false);
    }
  };

  const denyRequest = async () => {
    setSending(true);
    try {
      const data = await fetchWrapper({
        route: 'users/request/deny',
        method: 'POST',
        body: {
          "requestor_id": request.id
        }
      })
      if (!data || !data.status) throw new SafeError(`bad denyRequest response`);

      if (data.status === 'denied') {
        updateRequestState('denied');
      } else if (data.status === 'no-request') {
        removeRequest();
      } else {
        throw new SafeError(`bad users/request/deny status '${data.status}'`);
      }

    } catch (error) {
      addCaughtErrorLog(error, 'error during denyRequest');
    } finally {
      setSending(false);
    }
  };

  const cancelRequest = async () => {
    setSending(true);
    try {
      const data = await fetchWrapper({
        route: 'users/request/cancel',
        method: 'POST',
        body: {
          "target_id": request.id
        }
      })
      if (!data || !data.status) throw new SafeError(`bad cancelRequest response`);

      if (data.status === "cancelled") {
        removeRequest();
      } else {
        throw new SafeError(`bad users/request/cancel status '${data.status}'`);
      }

    } catch (error) {
      addCaughtErrorLog(error, 'error during cancelRequest');
    } finally {
      setSending(false);
    }
  };

  const removeRequest = () => {
    let tempList = structuredClone(requestType === 'inbound' ? inboundRequests : outboundRequests);
    tempList = tempList.filter(item => item.id != request.id);
    if (requestType === 'inbound') {
      setInboundRequests(tempList);
    } else {
      setOutboundRequests(tempList);
    }
  };

  const updateRequestState = (new_state: FriendRequestState) => {
    const tempList = structuredClone(requestType === 'inbound' ? inboundRequests : outboundRequests);
    for (const item of tempList) {
      if (item.id !== request.id) continue;
      item.request_state = new_state;
    }
    if (requestType === 'inbound') {
      setInboundRequests(tempList);
    } else {
      setOutboundRequests(tempList);
    }
  }; 

  const interactElement = (() => {
    if (request.request_state === 'accepted') {
      return (
        <Text style={[commonStyles.text, {color: 'green', marginVertical: 2}]}>
          accepted
        </Text>
      )
    } else if (request.request_state === 'denied') {
      return (
        <Text style={[commonStyles.text, {color: 'red', marginVertical: 2}]}>
          denied
        </Text>
      )
    } else if (requestType === 'inbound') {
      return (
        <View
          style={{
            flexDirection: 'row'
          }}
        >
          <TouchableOpacity 
            style={[commonStyles.textButton, {
              marginRight: 8,
              borderColor: 'green',
              borderWidth: 2,
            }]}
            onPress={acceptRequest}
            disabled={sending}
          >
            <Text style={commonStyles.text}>accept</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[commonStyles.textButton, {
              borderColor: 'red',
              borderWidth: 2,
            }]}
            onPress={denyRequest}
            disabled={sending}
          >
            <Text style={commonStyles.text}>deny</Text>
          </TouchableOpacity>
        </View>
      )
    } else {
      <TouchableOpacity 
        style={[commonStyles.textButton, {
          borderColor: 'orange',
          borderWidth: 2,
        }]}
        onPress={cancelRequest}
        disabled={sending}
      >
        <Text style={commonStyles.text}>cancel</Text>
      </TouchableOpacity>
    }
  })();

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
        backgroundColor: index % 2 ? '#000000': '#222328ff',
        borderRadius: 8,
      }}
    >
      <Text style={commonStyles.text}>{request.username}</Text>
      {interactElement}
    </View>
  )
}

const styles = StyleSheet.create({
})