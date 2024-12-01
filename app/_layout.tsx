import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useRootNavigationState } from 'expo-router'; // Correct import
import { useColorScheme } from '@/hooks/useColorScheme'; // Custom hook for color scheme

SplashScreen.preventAutoHideAsync();

const RootLayout: React.FC = () => {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Use useRootNavigationState to get the current navigation state
  const state = useRootNavigationState();

  // Function to get the title based on the current route
  const getTitle = (): string => {
    const routeName = state?.index !== undefined && state.routes[state.index]?.name;

    // Default to 'Workouts' if no route is found
    if (!routeName) {
      return 'Workouts';
    }

    // Switch case to handle specific titles for different screens
    switch (routeName) {
      case 'workouts':
        return 'Workouts';
      case 'programs':
        return 'Your Workout Programs';
      case 'schedule':
        return 'Your Schedule';
      case 'profile':
        return 'Your Profile';
      default:
        return 'Work Fitness'; // Default title for other routes
    }
  };

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync(); // Hide splash screen after fonts are loaded
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Return null while fonts are loading
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
};

export default RootLayout;










