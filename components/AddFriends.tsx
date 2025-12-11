import { commonStyles } from "@/styles/commonStyles";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Modal, StyleSheet, TextInput, ActivityIndicator, FlatList } from "react-native";
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
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [beforeInitSearch, setBeforeInitSearch] = useState<boolean>(true);

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
    if (searchText.trim().length === 0) return;
    setSearching(true);
    if (beforeInitSearch) setBeforeInitSearch(false);
    try {
      const data = await fetchWrapper({
        route: 'users/search',
        method: 'GET',
        params: {
          "username": searchText
        }
      })
      if (!data) throw new SafeError(`bad username search response`);

      setSearchResults(data.matches);

    } catch (error) {
      addCaughtErrorLog(error, 'error during username search');
    } finally {
      setSearching(false);
    }
  };

  const listComponent = (): JSX.Element => {
    // if () {

    // }
    return <></>
  };

  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        {(searchResults === null && !beforeInitSearch) &&
          <View>
            <Text 
              style={[commonStyles.text, {
                marginLeft: 12, 
                marginTop: 4, 
                color: 'red'
              }]}
            >
              could not load user data
            </Text>
          </View>
        }
        {searchResults !== null && searchResults.length === 0 &&
          <View>
            <Text
              style={[commonStyles.text, {
                marginLeft: 12, 
                marginTop: 4, 
                color: 'red'
              }]}
            >
              search returned no username matches
            </Text>
          </View>
        }
        <FlatList 
          style={{
            marginTop: 10,
            marginBottom: 10,
            width: '100%',
          }}
          data={searchResults ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 4,
                borderRadius: 8,
                padding: 10,
                backgroundColor: index % 2 ? '#000000': '#222328ff'
              }}
            >
              <Text style={commonStyles.text}>
                {item.username}
              </Text>
              {item.is_friend ?
                <TouchableOpacity 
                  style={commonStyles.textButton}
                >
                  <Text style={commonStyles.text}>friend</Text>
                </TouchableOpacity>
              :
                <TouchableOpacity 
                  style={commonStyles.textButton}
                >
                  <Text style={commonStyles.text}>add</Text>
                </TouchableOpacity>
              }
              
            </View>
          )}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
        <View>
          <Text style={[commonStyles.text, {marginLeft: 12, marginBottom: 4}]}>
            Search for a username:
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
    maxHeight: '90%',
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