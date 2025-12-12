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

export default function Friends() {
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);
  
  const [friendsList, setFriendsList] = useAtom(friendsListAtom);
  const [reloading, setReloading] = useState<boolean>(false);

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
      setReloading(true);
    }
  };

  useEffect(() => {
    refreshFriendsList();
  }, []);

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
        {friendsList.length === 0 ?
          <Text style={commonStyles.text}>you haven't added any friends yet</Text>
        :
          <FlatList 
            style={{
              width: '100%',
            }}
            data={friendsList}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View
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
        }
      </View>
      <AddFriends />
    </KeyboardAvoidingView>
  )
}