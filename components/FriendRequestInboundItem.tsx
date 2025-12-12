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
  index: number
  removeRequest: (id: string) => void
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
      if (!data) throw new SafeError(`bad username search response`);
      
      if (data.status !== 'accepted') {
        throw new SafeError(`bad users/request/accept status '${data.status}'`);
      }

      props.removeRequest(props.id);

    } catch (error) {
      addCaughtErrorLog(error, 'error during username search');
    } finally {
      setSendingAccept(false);
    }
  };

  const cancelRequest = async () => {
    
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
          }
          ]}
          onPress={acceptRequest}
          disabled={false}
        >
          <Text style={commonStyles.text}>deny</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
})