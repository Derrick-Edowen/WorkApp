import React, { useEffect, useState } from 'react';
import { Platform, Alert, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useNavigation } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { Colors } from '@/constants/Colors';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { router } from 'expo-router';

export default function TabLayout(): JSX.Element {
  const colorScheme = useColorScheme();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Fetch the signed-in user's name before rendering
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserName(user.displayName || 'User'); // Directly use displayName from the authenticated user
        if (!user.displayName) {
          setUserName('User'); // Fallback to 'User' if no display name is set
        }

        // Check if the user has a complete profile
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists() && !userSnap.data().profileComplete) {
          router.replace('/ProfileSetup'); // Redirect to profile setup if not complete
        }
      } else {
        router.replace('/SignInScreen'); // Redirect if no user is logged in
      }
      setLoading(false); // Stop loading
    });

    return () => unsubscribe();
  }, []);

  // Show loading spinner while fetching userName
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'dark'].tint} />
      </View>
    );
  }

  return (
<Tabs
  screenOptions={{
    tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
    headerShown: true, // Ensure header is shown
    tabBarBackground: TabBarBackground,
    tabBarStyle: Platform.select({
      ios: {
        position: 'absolute',
      },
      default: {},
    }),
    headerRight: ({ tintColor }: { tintColor?: string }) => (
      <TouchableOpacity
        onPress={() => router.push('/SettingsPage')}
        style={{ marginRight: 15 }}
      >
        <Ionicons name="settings-outline" size={24} color={tintColor ?? '#000'} />
      </TouchableOpacity>
    ),
  }}
>
  <Tabs.Screen
    name="workouts"
    options={{
      title: 'Exercises',
      tabBarIcon: ({ color }: { color: string }) => (
        <Ionicons name="barbell" size={18} color={color} />
      ),
      headerTitle: userName ? `${userName}'s Work App` : "User's Work App", // Set headerTitle based on userName
    }}
  />
  <Tabs.Screen
    name="programs"
    options={{
      title: 'Programs',
      tabBarIcon: ({ color }: { color: string }) => (
        <Ionicons name="list" size={18} color={color} />
      ),
      headerTitle: userName ? `${userName}'s Workout Programs` : "User's Programs", // Set headerTitle based on userName
    }}
  />
  <Tabs.Screen
    name="schedule"
    options={{
      title: 'Schedule',
      tabBarIcon: ({ color }: { color: string }) => (
        <Ionicons name="calendar" size={18} color={color} />
      ),
      headerTitle: userName ? `${userName}'s Workout Schedule` : "User's Workout Schedule", // Set headerTitle based on userName
    }}
  />
  <Tabs.Screen
    name="profile"
    options={{
      title: 'Profile',
      tabBarIcon: ({ color }: { color: string }) => (
        <Ionicons name="person" size={18} color={color} />
      ),
      headerTitle: userName ? `${userName}'s Profile` : "User's Profile", // Set headerTitle based on userName
    }}
  />
</Tabs>
  );
}














