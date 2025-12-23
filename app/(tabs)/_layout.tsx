import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import WorkoutHeader from '@/components/WorkoutHeader';
import TabStackHeader from '@/components/TabStackHeader';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'red',
        headerStyle: {
          backgroundColor: 'black',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: 'black',
        },
        sceneStyle: { backgroundColor: 'black' }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerTitle: () => <TabStackHeader tab={'home'} />,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          headerTitle: () => <TabStackHeader tab={'friends'} />,
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name={focused ? 'user' : 'user-o'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          headerTitle: () => <WorkoutHeader />,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'accessibility' : 'accessibility-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          headerTitle: () => <TabStackHeader tab={'stats'} />,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: () => <TabStackHeader tab={'settings'} />,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} color={color} size={24}/>
          ),
        }}
      />
    </Tabs>
  );
}
