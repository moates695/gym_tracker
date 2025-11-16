import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import TextInputFeild from "../components/InputField";
import RadioButtons from "../components/RadioButtons";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { commonStyles } from "@/styles/commonStyles";
import { OptionsObject } from "@/components/ChooseExerciseModal";
import { useDropdown } from "@/components/ExerciseData";
import { fetchWrapper } from "@/middleware/helpers";
import Constants from 'expo-constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import DatePicker from 'react-native-date-picker'
import DateTimePickerModal from "react-native-modal-datetime-picker";

export type Gender = "male" | "female" | "other";
export type GoalStatus = "bulking" | "cutting" | "maintaining";
export type PedStatus = "natural" | "juicing" | "silent";

interface FormData {
  email: string,
  password: string,
  username: string,
  first_name: string,
  last_name: string,
  gender: Gender,
  height: string,
  weight: string,
  goal_status: GoalStatus
  ped_status: PedStatus
  date_of_birth: string
}

interface GenderOption {
  label: string
  value: Gender
}

interface PhaseOption {
  label: string
  value: GoalStatus
}

interface PedOption {
  label: string
  value: PedStatus
}

type SignUpScreen = 'details' | 'stats';
type UsernameState = null | 'checking' | 'good' | 'error';
// todo: add body fat percentage
// todo: show mandatory fields with red asterix

export default function SignUpScreen() {
  const router = useRouter();

  const [signUpScreen, setSignUpScreen] = useState<SignUpScreen>('details');

  const [formData, setFormData] = useState<FormData>({
    email: "moates695@gmail.com",
    username: "username2",
    password: "Password1!",
    first_name: "first",
    last_name: "last",
    height: "55",
    weight: "60",
    gender: "female",
    goal_status: "bulking",
    ped_status: "natural",
    date_of_birth: ""
  })

  const [inError, setInError] = useState<Record<string, string>>({
    email: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    height: "",
    weight: "",
    gender: "",
    goal_status: ""
  });

  const usernameTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [usernameState, setUsernameState] = useState<UsernameState>(null);
  const [isTimeoutActive, setIsTimeoutActive] = useState<boolean>(false);
  const [submitting, SetSubmitting] = useState<boolean>(false);

  const genderOptions: GenderOption[] = [
    { label: 'male', value: 'male' },
    { label: 'female', value: 'female' },
    { label: 'other', value: 'other' },
  ]
  const [genderValue, setGenderValue] = useState<Gender>('male');

  const phaseOptions: PhaseOption[] = [
    { label: 'bulking', value: 'bulking' },
    { label: 'cutting', value: 'cutting' },
    { label: 'maintaining', value: 'maintaining' },
  ]
  const [phaseValue, setPhaseValue] = useState<GoalStatus>('bulking');

  const pedOptions: PedOption[] = [
    { label: 'natural', value: 'natural' },
    { label: 'juicing', value: 'juicing' },
    { label: 'silent', value: 'silent' },
  ]
  const [pedValue, setPedValue] = useState<PedStatus>('natural');

  const [dateOpen, setDateOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const showDatePicker = () => {
    setDateOpen(true);
  };

  const hideDatePicker = () => {
    setDateOpen(false);
  };

  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      date_of_birth: date.toISOString().split("T")[0]
    })
    hideDatePicker();
  };

  const formatSelectedDate = (date: Date): string => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const handleTextChange = (field: string, value: string): void => {
    if (isRequiredMap[field as keyof FormData]) {
      setInError({
        ...inError,
        [field]: value !== '' ? '' : 'cannot be empty'
      }); 
    } else {
      setInError({
        ...inError,
        [field]: value !== '' ? '' : ''
      });
    }
    
    setFormData({
      ...formData,
      [field]: value,
    });

    switch (field) {
      case 'email':
        validateEmail(value);
        break;
      case 'password':
        validatePassword(value);
        break;
      case 'username':
        validateUsername(value);
        break;
      case 'first_name':
        validateName(value, 'first_name');
        break;
      case 'last_name':
        validateName(value, 'last_name');
        break;
      case 'height':
        validateHeight(value);
        break;
      case 'weight':
        validateWeight(value);
        break;
    }

  };

  // const handleSelectChange = (field: string, value: string): void => {
  //   setFormData({
  //     ...formData,
  //     [field]: value
  //   })
  // };

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailPattern.test(email)) {
      setInError({
        ...inError,
        'email': 'invalid email'
      })
    }
  };

  const validatePassword = (password: string) => {
    let error_message = ''
    
    if (password.length < 8 || password.length > 36) {
      error_message = 'password must be between 8 and 36 characters'
    } else if (!/[A-Z]/.test(password)) {
      error_message = "password must have at least 1 uppercase letter"
    } else if (!/[1-9]/.test(password)) {
      error_message = "password must have at least 1 number"
    } else if (!/[^A-Za-z0-9]/ .test(password)) {
      error_message = "password must have at least 1 special character"
    }

    setInError({
      ...inError,
      'password': error_message
    })
  } 

  const validateUsername = (username: string) => {
    if (usernameTimeoutRef.current) {
      clearTimeout(usernameTimeoutRef.current);
    }
    if (username.trim() === '') {
      setUsernameState(null);
      return
    }
    setUsernameState('checking');
    setIsTimeoutActive(true);
    usernameTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `${Constants.expoConfig?.extra?.apiUrl}/register/check/username?` + 
          new URLSearchParams({ username }).toString()
        );
        if (!response.ok) throw new Error('response not ok');

        const data = await response.json();
  
        if (data.taken === false) {
          setUsernameState('good');
          return;
        }

        setInError({
          ...inError,
          'username': "username is taken"
        })
        setUsernameState('error');
      
      } catch (error) {
        setInError({
          ...inError,
          'username': "error checking username"
        })
        setUsernameState('error');
      } finally {
        setIsTimeoutActive(false);
      }
    }, 750);
  };

  const validateName = (name: string, field: string) => {
    // if (name.length > 0 && name.trim().length > 0) return;
    // setInError({
    //   ...inError,
    //   [field]: "name is empty"
    // })
  };

  const validateHeight = (height_str: string) => {
    const height = Number(height_str);
    if (!Number.isNaN(height) && height >= 20 && height <= 300) return;
    setInError({
      ...inError,
      height: "invalid height"
    })
  };

  const validateWeight = (weight_str: string) => {
    const weight = Number(weight_str);
    if (!Number.isNaN(weight) && weight >= 20 && weight <= 300) return;
    setInError({
      ...inError,
      weight: "invalid weight"
    })
  };

  const areFormDataFieldsEmpty = (): boolean => {
    for (const key in formData) {
      if (key === 'date_of_birth') continue;
      if (!isRequiredMap[key as keyof FormData]) continue;
      if (formData[key as keyof FormData].trim().length !== 0) continue;
      return true;
    }
    return false;
  };

  const isFormInError = (): boolean => {
    for (const value of Object.values(inError)) {
      if (value.length === 0) continue;
      return true;
    }
    return false;
  };

  const isButtonDisabled = (): boolean => {
    return areFormDataFieldsEmpty() || isFormInError() || isTimeoutActive || submitting;
  };

  const handleSubmit = async (): Promise<void> => {
    SetSubmitting(true);
    
    try {
      let form_copy: Record<any, any> = { ...formData};
      form_copy.height = parseFloat(formData.height);
      form_copy.weight = parseFloat(formData.weight);

      const response = await fetch(`${Constants.expoConfig?.extra?.apiUrl}/register/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form_copy)
      });
      
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();

      if (data.status === "success") { 
        await SecureStore.setItemAsync("temp_token", data.temp_token);
        router.replace("/validate");
        return;
      }

      const tempInError = {...inError};
      for (const field of data.fields) {
        tempInError[field] = `${field} already in use`
      }
      setInError(tempInError);

    } catch (error) {
      console.log(error);
      Alert.alert("error during registration")
    } finally {
      SetSubmitting(false);
    }
  };

  const formDataLabels: Record<keyof FormData, string> = {
    email: "Email",
    password: "Password",
    username: "Username",
    first_name: "First name",
    last_name: "Last name",
    gender: "Gender",
    height: "Height (cm)",
    weight: "Weight (kg)",
    goal_status: "Current phase",
    ped_status: "PED use",
    date_of_birth: "Date of birth"
  }

  // const formDataOptions: Record<string, string[]> = {
  //   gender: ["male", "female", "other"] as Gender[],
  //   goal_status: ["bulking", "cutting", "maintaining"] as GoalStatus[],
  //   ped_status: ["natural", "juicing", "silent"] as PedStatus[]
  // }

  const isRequiredMap: Record<keyof FormData, boolean> = {
    email: true,
    password: true,
    username: true,
    first_name: false,
    last_name: false,
    gender: true,
    height: true,
    weight: true,
    goal_status: true,
    ped_status: true,
    date_of_birth: true
  }

  return (
    <KeyboardAwareScrollView
      style={{flex: 1, backgroundColor: 'black'}}
      contentContainerStyle={{flexGrow: 1}}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraHeight={50}
      enableResetScrollToCoords={false}
      extraScrollHeight={50}
    >
      {Platform.OS == 'android' &&
        <StatusBar style="light" backgroundColor="black" translucent={false} />
      }
      <TouchableWithoutFeedback 
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <View style={styles.content}>
          <Text style={[commonStyles.boldText, {marginRight: 10}]}>
            Sign Up
          </Text>
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {signUpScreen === 'details' &&
              <>
                {(['email', 'password', 'username'] as (keyof FormData)[]).map((key, index) => (
                  <View key={index} style={styles.singleItemRow}>
                    <TextInputFeild 
                      field={key} 
                      label={formDataLabels[key]} 
                      value={formData[key as keyof FormData]} 
                      is_number={false} 
                      is_secure={key==='password'} 
                      error_message={inError[key]} 
                      onChangeText={handleTextChange} 
                      required={isRequiredMap[key]}
                    />
                  </View>
                ))}
                <Text 
                  style={[commonStyles.text, {
                    marginTop: -28,
                    marginLeft: 10,
                    marginBottom: 10,
                  }]}
                >
                  {usernameState === 'checking' && <Text>checking username...</Text>}
                  {usernameState === 'good' && <Text style={{color: '#48ff00ff'}}>valid</Text>}
                </Text>
                {([['first_name', 'last_name']] as (keyof FormData)[][]).map((tuple, tupleIdx) => (
                  <View key={tupleIdx} style={styles.doubleItemRow}>
                    {tuple.map((item, itemIdx) => (
                      <View key={itemIdx} style={styles.doubleItem}>
                        <TextInputFeild 
                          field={item} 
                          label={formDataLabels[item]} 
                          value={formData[item]} 
                          is_number={false} 
                          error_message={inError[item]} 
                          onChangeText={handleTextChange}
                        />
                      </View>
                    ))}
                  </View>
                ))}
                <View style={[styles.buttonContainer, {paddingTop: 20}]}>
                  <TouchableOpacity 
                    onPress={() => setSignUpScreen('stats')}
                    style={{
                      // backgroundColor: isButtonDisabled() ? "#ccc" : "#0db80d",
                      backgroundColor: "#0db80d",
                      padding: 12,
                      borderRadius: 5,
                      width: "30%",
                      alignItems: "center"
                    }}
                    // disabled={isButtonDisabled()}
                  >
                    <Text style={{ color: "white"}}>next</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    onPress={() => router.replace("/sign-in")}
                    disabled={submitting}
                  >
                    <Text style={{ color: "white"}}>already have an account?</Text>
                  </TouchableOpacity>
                </View>
              </>
            }
            {signUpScreen === 'stats' &&
              <>
                {([['height', 'weight']] as (keyof FormData)[][]).map((tuple, tupleIdx) => (
                  <View key={tupleIdx} style={styles.doubleItemRow}>
                    {tuple.map((item, itemIdx) => (
                      <View key={itemIdx} style={styles.doubleItem}>
                        <TextInputFeild 
                          field={item} 
                          label={formDataLabels[item]} 
                          value={formData[item]} 
                          is_number={true} 
                          error_message={inError[item]} 
                          onChangeText={handleTextChange}
                          required={isRequiredMap[item as keyof FormData]}
                        />
                      </View>
                    ))}
                  </View>
                ))}
                <View
                  style={styles.doubleItemRow}
                >
                  <View style={styles.doubleItem}>
                    <Text style={styles.formHeader}>Gender</Text>
                    <View style={{marginLeft: 10}}>
                      {useDropdown(genderOptions, genderValue, setGenderValue, undefined, styles.dropDown)}
                    </View>
                  </View>
                  <View style={styles.doubleItem}>
                    <Text style={styles.formHeader}>Phase</Text>
                    <View style={{marginLeft: 10}}>
                      {useDropdown(phaseOptions, phaseValue, setPhaseValue, undefined, styles.dropDown)}
                    </View>
                  </View>
                </View>
                <View
                  style={[styles.doubleItemRow, {
                    marginTop: 16,
                  }]}
                >
                  <View style={styles.doubleItem}>
                    <Text style={styles.formHeader}>Natty status</Text>
                    <View style={{marginLeft: 10}}>
                      {useDropdown(pedOptions, pedValue, setPedValue, undefined, styles.dropDown)}
                    </View>
                  </View>
                  <View style={styles.doubleItem}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text style={styles.formHeader}>Date of birth:</Text>
                        <Text style={styles.formHeader}>{formatSelectedDate(selectedDate)}</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={showDatePicker}
                        disabled={submitting}
                        style={[commonStyles.textButton, 
                          {
                            width: 100, 
                            alignItems: 'center', 
                            alignSelf: 'center',
                            marginTop: 4
                          }
                        ]}
                      >
                        <Text style={{ color: "white"}}>choose date</Text>
                      </TouchableOpacity>
                    </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 10,
                    paddingTop: 20,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setSignUpScreen('details')}
                    style={[commonStyles.thinTextButton, {
                      width: 80,
                      position: 'absolute',
                      left: 0,
                      top: 30,
                    }]}
                  >
                    <Text style={{color: 'white'}}>back</Text>
                  </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={handleSubmit}
                      style={{
                        backgroundColor: isButtonDisabled() ? "#ccc" : "#0db80d",
                        padding: 12,
                        borderRadius: 5,
                        width: "30%",
                        alignItems: "center"
                      }}
                      disabled={isButtonDisabled()}
                    >
                      <Text style={{ color: "white"}}>{submitting ? 'submitting' : 'sign up'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    onPress={() => router.replace("/sign-in")}
                    disabled={submitting}
                  >
                    <Text style={{ color: "white"}}>already have an account?</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePickerModal
                  date={selectedDate}
                  isVisible={dateOpen}
                  mode="date"
                  onConfirm={handleConfirmDate}
                  onCancel={hideDatePicker}
                  isDarkModeEnabled={true}
                />
              </>
            } 
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  text: { 
    color: "white" 
  },
  content: { 
    flex: 1,
    padding: 30, 
    paddingTop: 50,
    // backgroundColor: 'blue'
  },
  container: {
    padding: 10,
    color: "white",
  },
  singleItemRow: {
    // flex: 1,
    marginBottom: 10,
  },
  singleItem: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    padding: 15,
  },
  doubleItemRow: {
    // flex: 1,
    flexDirection: 'row',
    marginBottom: 10,
  },
  doubleItem: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonContainer: {
    // flex: 1,
    padding: 10,
    alignItems: "center",
  },
  formHeader: {
    fontSize: 16,
    marginBottom: 5,
    color: "white"
  },
  dropDown: {
    width: '80%'
  }
});