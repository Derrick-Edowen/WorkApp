import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router'; // Import Tabs from expo-router
import { Colors } from '@/constants/Colors'; // Custom color scheme
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout(): JSX.Element {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        headerShown: false, // Hide the header by default
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute', // iOS style for the tab bar
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="barbell" size={18} color={color} />
          ),
          // You can customize the header for this tab specifically
          headerShown: true,
          headerTitle: 'Exercises', // Custom title for the 'Workouts' tab
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          title: 'Programs',
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="list" size={18} color={color} />
          ),
          headerShown: true,
          headerTitle: 'Workout Programs', // Custom title for the 'Programs' tab
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="calendar" size={18} color={color} />
          ),
          headerShown: true,
          headerTitle: 'Workout Schedule', // Custom title for the 'Schedule' tab
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }: { color: string }) => (
            <Ionicons name="person" size={18} color={color} />
          ),
          headerShown: true,
          headerTitle: '{Name} Profile', // Custom title for the 'Profile' tab
        }}
      />
    </Tabs>
  );
}





