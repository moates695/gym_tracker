import AddFriends from "@/components/AddFriends";
import { fetchWrapper, SafeError } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { friendsListAtom } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Modal, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Feather from '@expo/vector-icons/Feather';
import LoadingScreen from "@/app/loading";
import FriendRequests from "@/components/FriendRequests";
import ManageFriends from "@/components/ManageFriends";

export default function Friends() {
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);
  
  const [friendsList, setFriendsList] = useAtom(friendsListAtom);
  const [reloading, setReloading] = useState<boolean>(false);

  const [showRequests, setShowRequests] = useState<boolean>(false);
  const [showManage, setShowManage] = useState<boolean>(false);

  const refreshFriendsList = async () => {
    setReloading(true);
    try {
      const data = await fetchWrapper({
        route: 'users/friends/all',
        method: 'GET',
      })
      if (!data) throw new SafeError(`bad friends/all response`);

      setFriendsList(data.friends ?? []);

    } catch (error) {
      addCaughtErrorLog(error, 'error during username search');
    } finally {
      setReloading(false);
    }
  };

  useEffect(() => {
    refreshFriendsList();
  }, []);

  const friendsComponent = ((): JSX.Element => {
    if (reloading) {
      return (
        <LoadingScreen />
      )
    } else if (friendsList.length === 0) {
      return (
        <View 
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text style={commonStyles.text}>you haven't added any friends yet</Text>
        </View>
      )
    }
    return (
      <FlatList 
        style={{
          width: '100%',
          marginBottom: 12,
        }}
        data={friendsList}
        // keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View
            // key={item.id}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 8,
              padding: 10,
              backgroundColor: index % 2 ? '#000000': '#222328ff',
              marginLeft: 10,
              marginRight: 10,
            }}
          >
            <Text style={commonStyles.text}>
              {item.username}
            </Text>
            <TouchableOpacity
              style={{}}
              onPress={() => {}}
            >
              <Feather name="arrow-right" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    )
  })();

  return (
    <KeyboardAvoidingView 
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={110}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            paddingLeft: 12,
            paddingRight: 12,
            marginBottom: 4,
          }}
        >
          <TouchableOpacity
            style={[commonStyles.thinTextButton, {
              width: 50, 
              marginBottom: 8,
              borderColor: reloading ? 'red': 'gray'
            }]}
            onPress={refreshFriendsList}
            disabled={reloading}
          >
            <Text style={commonStyles.text}>refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[commonStyles.thinTextButton, {
              width: 50, 
              marginBottom: 4,
              marginLeft: 12,
              borderColor: showRequests ? 'red': 'gray'
            }]}
            onPress={() => setShowRequests(!showRequests)}
            disabled={reloading}
          >
            <Text style={commonStyles.text}>requests</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[commonStyles.thinTextButton, {
              width: 50, 
              marginBottom: 4,
              marginLeft: 12,
              borderColor: showManage ? 'red': 'gray'
            }]}
            onPress={() => setShowManage(!showManage)}
            disabled={reloading}
          >
            <Text style={commonStyles.text}>manage</Text>
          </TouchableOpacity>
        </View>
        {friendsComponent}
      </View>
      <AddFriends />
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRequests}
        onRequestClose={() => setShowRequests(false)}
      >
        <FriendRequests onPress={() => setShowRequests(false)}/>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showManage}
        onRequestClose={() => setShowManage(false)}
      >
        <ManageFriends onPress={() => setShowManage(false)}/>
      </Modal>
    </KeyboardAvoidingView>
  )
}