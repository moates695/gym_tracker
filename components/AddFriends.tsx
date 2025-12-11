import { commonStyles } from "@/styles/commonStyles";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Modal, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSetAtom } from "jotai";
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";
import { fetchWrapper, SafeError } from "@/middleware/helpers";
import LoadingScreen from "@/app/loading";

interface AddFriendsProps {
  onPress: () => void
}

export default function AddFriends(props: AddFriendsProps) {
  const { onPress } = props;

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const [searchText, setSearchText] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [searchTimeoutId, setSearchTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const updateSearchText = (text: string) => {
    setSearchText(text);
    if (text.trim().length === 0) return;
    if (searchTimeoutId) {
      clearTimeout(searchTimeoutId);
    }
    setSearchTimeoutId(setTimeout(() => {
      search();
    }, 350));
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutId) clearTimeout(searchTimeoutId);
    };
  }, [searchTimeoutId]);

  const search = async () => {
    setSearching(true);
    try {
      const data = await fetchWrapper({
        route: 'users/search',
        method: 'GET',
        params: {
          "username": searchText
        }
      })
      if (!data || !data.status) throw new SafeError(`bad username search response`);
    } catch (error) {
      addCaughtErrorLog(error, 'error during username search');
    } finally {
      setSearching(false);
    }
  };

  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
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
            // style={[styles.input, {borderColor: error_message === '' ? "#ccc": "red"}]}
            style={[styles.input]}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={{
              // padding: 12,
              height: 50,
              width: 50,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 10,
            }}
            onPress={search}
            disabled={searching}
          >
            <Ionicons name="search" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>
        {searching ?
          <View style={{height: 200, marginTop: 10}}>
            {/* <LoadingScreen /> */}
          </View>
        :
          <></>
        }
        <TouchableOpacity 
          style={[commonStyles.thinTextButton, {width: 50, alignSelf: 'center', marginTop: 20}]}
          onPress={onPress}
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
    height: '90%',
    width: '100%',
    paddingBottom: 20,
  },
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