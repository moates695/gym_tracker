import AddFriends from "@/components/AddFriends";
import { fetchWrapper, SafeError } from "@/middleware/helpers";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { blockedListAtom, friendsListAtom, FriendsListItem } from "@/store/general";
import { commonStyles } from "@/styles/commonStyles";
import { useAtom, useSetAtom } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View, Text, Modal, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Feather from '@expo/vector-icons/Feather';
import LoadingScreen from "@/app/loading";
import FriendRequests from "@/components/FriendRequests";
import ManageFriends from "@/components/ManageFriends";
import FriendItemButtons from "@/components/FriendItemButtons";
import BlockedItemButtons from "@/components/BlockedItemButtons";

interface UserListItem extends FriendsListItem {
  type: 'friend' | 'blocked'
}

// todo: add friends landing page that shows their latest workouts (paginate and go in order of started_at?)
// todo: if not friends pass through to add friends screen

export default function FriendsManage() {
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);
  
  const [friendsList, setFriendsList] = useAtom(friendsListAtom);
  const [blockedList, setBlockedList] = useAtom(blockedListAtom);

  const [reloading, setReloading] = useState<boolean>(false);

  const [showRequests, setShowRequests] = useState<boolean>(false);
  const [showManage, setShowManage] = useState<boolean>(false);

  const userList: UserListItem[] = useMemo(() => {
    const tempFriends: UserListItem[] = friendsList.map((item) => {
      return {
        ...item,
        type: 'friend'
      }
    });

    if (!showManage) return tempFriends;

    const tempBlocked: UserListItem[] = blockedList.map((item) => {
      return {
        ...item,
        type: 'blocked'
      }
    });
    
    return tempFriends.concat(tempBlocked);
  }, [showManage, friendsList, blockedList]);

  const refreshFriendsList = async () => {
    setReloading(true);
    try {
      const data1 = await fetchWrapper({
        route: 'users/friends/all',
        method: 'GET',
      })
      if (!data1) throw new SafeError(`bad users/friends/all response`);

      setFriendsList(data1.friends ?? []);

      const data2 = await fetchWrapper({
        route: 'users/blocked/all',
        method: 'GET',
      })
      if (!data2) throw new SafeError(`bad users/blocked/all response`);

      setBlockedList(data2.blocked ?? []);

    } catch (error) {
      addCaughtErrorLog(error, 'error during refreshFriendsList search');
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
    } else if (userList.length === 0) {
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
        data={userList}
        renderItem={({ item, index }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 8,
              padding: 10,
              backgroundColor: index % 2 ? '#000000': '#222328ff',
              minHeight: 48
            }}
          >
            <Text 
              style={[commonStyles.text, 
                {color: item.type === 'friend' ? 'white' : 'red'
              }]}
            >
              {item.username}
            </Text>
            {item.type === 'friend' ?
              <FriendItemButtons 
                userId={item.user_id}
                username={item.username}
                showManage={showManage}
              />
            :
              <BlockedItemButtons 
                userId={item.user_id}
                username={item.username}
              />
            }
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
            disabled={reloading || userList.length === 0}
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
    </KeyboardAvoidingView>
  )
}