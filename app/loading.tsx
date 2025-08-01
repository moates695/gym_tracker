import React, { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

interface LoadingScreenProps {
  delay?: number
}

export default function LoadingScreen(props: LoadingScreenProps) {
  const { delay } = props;

  const [show, setShow] = useState<boolean>(delay === undefined);

  if (delay) {
    setTimeout(() => {
      setShow(true);
    }, delay)
  }
  
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'black' }}>
      {show &&
        <>
          <ActivityIndicator size="large" />
          <Text style={{color: 'white'}}>Loading...</Text>
        </>
      }  
    </View>
  );
}
