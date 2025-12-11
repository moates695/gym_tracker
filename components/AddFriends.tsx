import { commonStyles } from "@/styles/commonStyles";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Modal, StyleSheet, TextInput, ActivityIndicator, FlatList } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSetAtom } from "jotai";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { fetchWrapper, SafeError } from "@/middleware/helpers";
import LoadingScreen from "@/app/loading";
import AddFriendsListItem from "./AddFriendsListItem";

// todo: show if friend
// todo: show if request sent
// todo: allow to cancel request

export default function AddFriends() {
  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const [searchText, setSearchText] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [searchTimeoutId, setSearchTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [beforeInitSearch, setBeforeInitSearch] = useState<boolean>(true);

  const updateSearchText = (text: string) => {
    setSearchText(text);
    if (text.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId);
    }
    setSearchTimeoutId(setTimeout(() => {
      search(text);
    }, 350));
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutId) clearTimeout(searchTimeoutId);
    };
  }, [searchTimeoutId]);

  const search = async (username: string) => {
    if (username.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await fetchWrapper({
        route: 'users/search',
        method: 'GET',
        params: {
          username
        }
      })
      if (!data) throw new SafeError(`bad username search response`);

      setSearchResults(data.matches);

    } catch (error) {
      addCaughtErrorLog(error, 'error during username search');
    } finally {
      if (beforeInitSearch) setBeforeInitSearch(false);
      setSearching(false);
    }
  };

  const listComponent = (): JSX.Element => {
    if (beforeInitSearch) {
      return <View style={{height: 12}}/>
    } else if (searchResults === null) {
      return (
        <Text 
          style={[commonStyles.text, {
            margin: 12,
            paddingTop: 5,
            paddingBottom: 5,
            color: 'red'
          }]}
        >
          could not load user data
        </Text>
      )
    } else if (searchResults.length === 0) {
      return (
        <Text
          style={[commonStyles.text, {
            margin: 12,
            paddingTop: 5,
            paddingBottom: 5,
            color: 'orange',
          }]}
        >
          search returned no username matches
        </Text>
      )
    }
    return (
      <FlatList 
        style={{
          marginTop: (searchResults ?? []).length > 0 ? 20: 0,
          // marginTop: 20,
          marginBottom: 20,
          marginLeft: 10,
          marginRight: 10,
        }}
        data={searchResults ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AddFriendsListItem 
            id={item.id}
            username={item.username}
            is_friend={item.is_friend}
            index={index}
          />
        )}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    )
  };

  return (
    <View 
      style={{
        minHeight: 'auto',
        borderColor: '#ccc',
        borderTopWidth: 1,
        marginBottom: 20
      }}
    >
      {listComponent()}        
      <View>
        <Text style={[commonStyles.text, {marginLeft: 12, marginBottom: 4}]}>
          search for a username:
        </Text>
        <View 
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 10
          }}
        >
          <TextInput
            value={searchText}
            onChangeText={updateSearchText}
            style={[styles.input]}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={{
              height: 50,
              width: 50,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 10,
            }}
            onPress={() => search(searchText)}
            disabled={searching || searchText.trim().length === 0}
          >
            {searching ?
              <ActivityIndicator size="small"/>
            :
              <Ionicons name="search" size={24} color="#ccc" />
            }
            </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'black',
    color: "white"
  },
});