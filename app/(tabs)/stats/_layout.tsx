import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

export function StatsStack() {
  const colorScheme = useColorScheme();
  
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
        animation: "none"
      }}
    />
  )
}

export default StatsStack;