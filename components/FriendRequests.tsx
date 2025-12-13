import LoadingScreen from "@/app/loading";
import { fetchWrapper, SafeError } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, FlatList } from "react-native";
import FriendRequestInboundItem from "./FriendRequestInboundItem";
import FriendRequestOutboundItem from "./FriendRequestOutboundItem";
import { friendsListAtom } from "@/store/general";

type RequestType = 'inbound' | 'outbound';

interface FriendRequestsProps {
  onPress: () => void
}

// todo: refactor inbound and outbound components together

export default function FriendRequests(props: FriendRequestsProps) {
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);
    
  const [requestType, setRequestType] = useState<RequestType>('inbound');
  const [inboundRequests, setInboundRequests] = useState<any[]>([]);
  const [outboundRequests, setOutboundRequests] = useState<any[]>([]);
  const [reloading, setReloading] = useState<boolean>(false);

  const requests = useMemo(() => {
    return requestType === 'inbound' ? inboundRequests : outboundRequests;
  }, [requestType, inboundRequests, outboundRequests]);

  const refreshRequests = async () => {
    setReloading(true);
    try {
      const data = await fetchWrapper({
        route: 'users/request/all',
        method: 'GET',
      })
      if (!data) throw new SafeError(`bad username search response`);

      setInboundRequests(data.inbound ?? []);
      setOutboundRequests(data.outbound ?? []);

    } catch (error) {
      addCaughtErrorLog(error, 'error during username search');
    } finally {
      setReloading(false);
    }
  };

  useEffect(() => {
    refreshRequests();
  }, []);

  const removeRequest = (id: string) => {
    let tempList = structuredClone(requests);
    tempList = tempList.filter(item => item.id != id);
    if (requestType === 'inbound') {
      setInboundRequests(tempList);
    } else {
      setOutboundRequests(tempList);
    }
  };

  const updateRequestState = (id: string, new_state: string) => {
    const tempList = structuredClone(requests);
    for (const item of tempList) {
      if (item.id !== id) continue;
      item.request_state = new_state;
    }
    if (requestType === 'inbound') {
      setInboundRequests(tempList);
    } else {
      setOutboundRequests(tempList);
    }
  };

  const requestsComponent = ((): JSX.Element => {
    if (reloading) {
      return <LoadingScreen />
    } else if (requests.length === 0) {
      return (
        <Text style={commonStyles.text}>
          no {requestType} requests were found
        </Text>
      )
    }
    return (
      <FlatList 
        style={{
        }}
        contentContainerStyle={{
          marginTop: 12
        }}
        data={requests ?? []}
        renderItem={({ item, index }) => (
          <>
            {requestType === 'inbound' && 
              <FriendRequestInboundItem 
                id={item.id}
                username={item.username}
                request_state={item.request_state}
                index={index}
                removeRequest={removeRequest}
                updateRequestState={updateRequestState}
              />
            }
            {requestType === 'outbound' && 
              <FriendRequestOutboundItem 
                id={item.id}
                username={item.username}
                request_state={item.request_state}
                index={index}
                removeRequest={removeRequest}
                updateRequestState={updateRequestState}
              />
            }
          </>
        )}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    )
  })();

  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        <View style={styles.headerRow}>
          <Text style={commonStyles.boldText}>Requests</Text>
          <TouchableOpacity
            onPress={refreshRequests}
            style={commonStyles.thinTextButton}
          >
            <Text style={commonStyles.text}>refresh</Text>
          </TouchableOpacity> 
        </View>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 12,
          }}
        >
          <TouchableOpacity 
            style={[
              commonStyles.thinTextButton, 
              {width: 50, alignSelf: 'center', marginRight: 8},
              requestType === 'inbound' && styles.thinTextButtonHighlighted
            ]}
            onPress={() => setRequestType('inbound')}
            disabled={requestType === 'inbound'}
          >
            <Text 
              style={[
                commonStyles.text, 
                requestType === 'inbound' && {color: 'black'}
              ]}
            >
              inbound
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              commonStyles.thinTextButton, 
              {width: 50, alignSelf: 'center', marginRight: 4},
              requestType === 'outbound' && styles.thinTextButtonHighlighted
            ]}
            onPress={() => setRequestType('outbound')}
            disabled={requestType === 'outbound'}
          >
            <Text 
              style={[
                commonStyles.text, 
                requestType === 'outbound' && {color: 'black'}
              ]}
            >
              outbound
              </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {requestsComponent}
        </View>
        <TouchableOpacity 
          style={[commonStyles.thinTextButton, {width: 50, alignSelf: 'center'}]}
          onPress={props.onPress}
        >
          <Text style={commonStyles.text}>hide</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
    width: '100%',
  },
  modalContainer: {
    backgroundColor: 'black',
    padding: 15,
    // alignItems: 'center',
    elevation: 5,
    borderColor: 'red',
    borderTopWidth: 2,
    maxHeight: '95%',
    minHeight: '40%',
    width: '100%',
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thinTextButtonHighlighted: {
    backgroundColor: '#e0e0e0ff',
    borderColor: '#e0e0e0ff',
  }
})