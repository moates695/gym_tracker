import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TextInput } from "react-native";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { DecodedJWT } from "./_layout";
import { jwtDecode } from "jwt-decode";
import { fetchWrapper, loadInitialNecessary, SafeError } from "@/middleware/helpers";
import { commonStyles } from "@/styles/commonStyles";
import { StatusBar } from "expo-status-bar";
import { useAtom, useSetAtom } from "jotai";
import { fetchMappingsAtom, userDataAtom } from "@/store/general";
import TextInputFeild from "../components/InputField";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { addCaughtErrorLogAtom, addErrorLogAtom } from "@/store/actions";

// todo resend validate email button on timeout
// TODO: fix rest of this file and refactor others

// type PreviousScreen = 'sign-up' | 'sign-in';

// interface ValidateProps {
//   previousScreen: PreviousScreen;
// }

export default function Validate() {
  // const { previousScreen } = props;

  const { previousScreen } = useLocalSearchParams();

  const router = useRouter();
  
  const setUserData = useSetAtom(userDataAtom);
  const fetchMappings = useSetAtom(fetchMappingsAtom);

  const addErrorLog = useSetAtom(addErrorLogAtom);
  const addCaughtErrorLog = useSetAtom(addCaughtErrorLogAtom);

  const [code, setCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const updateCode = (value: string) => {
    const regex = /^\d+$/;
    if ((value.length > 0 && !regex.test(value)) || value.length > 6) return;
    setErrorMessage('');
    setCode(value);
  };

  const isButtonDisabled = (): boolean => {
    if (errorMessage != "" || submitting || code.length != 6) return true;
    return false;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setSubmitting(true);
    try {
      const data = await fetchWrapper({
        route: 'register/validate/receive',
        method: 'GET',
        params: {
          code
        }, 
        token_str: 'temp_token'
      })
      if (!data || !data.status) throw new SafeError('bad validate receive response');

      if (data.status === 'incorrect') {
        setErrorMessage("code is incorrect")
      } else if (data.status === 'verified') {
        const auth_token = data.auth_token;
        if (!auth_token) throw new SafeError("bad auth token");
        await SecureStore.setItemAsync("auth_token", auth_token);
        setUserData(data.user_data);
        await loadInitialNecessary(fetchMappings);
        router.replace('/(tabs)');
      } else {
        throw new Error('unknown status');
      }

    } catch (error) {
      addCaughtErrorLog(error, 'validate receive error');
    } finally {
      setSubmitting(false);
    }
  };

  const prevScreenMap: Record<string, string> = {
    'sign-in': 'sign in',
    'sign-up': 'sign up',
  }

  return (
    <KeyboardAwareScrollView
      style={{flex: 1, backgroundColor: 'black'}}
      contentContainerStyle={{flexGrow: 1}}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      // extraHeight={50}
      enableResetScrollToCoords={false}
      // extraScrollHeight={50}
    >
      {Platform.OS == 'android' &&
        <StatusBar style="light" backgroundColor="black" translucent={false} />
      }
      <TouchableWithoutFeedback 
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"  
        >
          <Text style={commonStyles.boldText}>Validate</Text>
          <View style={{height: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <Text 
              style={[styles.text, {marginBottom: 10, fontSize: 16}]}
            >
              Check your emails for the validation code
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 10,
                width: 200,
              }}
            >
              <TextInput
                value={code}
                onChangeText={updateCode}
                style={[styles.input, {borderColor: errorMessage === '' ? "#ccc": "red"}]}
                keyboardType="decimal-pad"
                returnKeyType="done"
                placeholder="123456"
                placeholderTextColor="gray"
              />
            </View>
            <View
              style={{
                width: 200,
              }}
            >
              <Text 
                style={{
                  color: "red", 
                  opacity: errorMessage === '' ? 0 : 1,
                }}
              >
                {errorMessage}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleSubmit}
              style={{
                backgroundColor: isButtonDisabled() ? "#ccc" : "#0db80d",
                padding: 12,
                borderRadius: 5,
                width: "30%",
                alignItems: "center",
                marginTop: 10,
              }}
              disabled={isButtonDisabled()}
            >
              <Text style={{ color: "white"}}>
                {submitting ? 'submitting' : 'submit'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={async () => {
                await SecureStore.deleteItemAsync("temp_token");
                router.replace(`/${previousScreen}`);
              }}
              style={{marginTop: 20}}
            >
              <Text style={styles.text}>back to {prevScreenMap[previousScreen as string]}?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  text: { 
    color: "white" 
  },
  content: { 
    flex: 1,
    padding: 30,
    paddingTop: 50,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'black',
    color: "white",
    textAlign: 'center',
  },
})