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
import { useRouter } from "expo-router";

// todo: add friends landing page that shows their latest workouts (paginate and go in order of started_at?)
// todo: if not friends pass through to add friends screen

export default function Friends() {
  const router = useRouter();
  
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);
  
  const [friendsList, setFriendsList] = useAtom(friendsListAtom);
  // const [blockedList, setBlockedList] = useAtom(blockedListAtom);

  useEffect(() => {
    if (friendsList.length > 0) return;
    router.replace('/(tabs)/friends/manage')
  }, []);

  if (friendsList.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'black',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Text>no friends :(</Text>
      </View>
    )
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
    </View>
  )
}