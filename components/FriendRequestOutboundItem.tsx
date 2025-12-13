import { fetchWrapper, SafeError } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { commonStyles } from "@/styles/commonStyles";
import { useSetAtom } from "jotai";
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

interface FriendRequestOutboundItemProps {
  id: string
  username: string
  request_state: string
  index: number
  removeRequest: (id: string) => void
  updateRequestState: (id: string, new_state: string) => void
}

export default function FriendRequestOutboundItem(props: FriendRequestOutboundItemProps) {
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);
  
  const [sendingCancel, setSendingCancel] = useState<boolean>(false);

  const cancelRequest = async () => {
      setSendingCancel(true);
      try {
        const data = await fetchWrapper({
          route: 'users/request/cancel',
          method: 'POST',
          body: {
            "target_id": props.id
          }
        })
        if (!data || !data.status) throw new SafeError(`bad cancelRequest response`);

        props.removeRequest(props.id);

        if (data.status !== "cancelled") {
          throw new SafeError(`bad users/request/cancel status '${data.status}'`);
        }

      } catch (error) {
        addCaughtErrorLog(error, 'error during cancelRequest');
      } finally {
        setSendingCancel(false);
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
                    borderColor: 'orange',
                    borderWidth: 2,
                  }]}
                  onPress={cancelRequest}
                  disabled={sendingCancel}
                >
                  <Text style={commonStyles.text}>cancel</Text>
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