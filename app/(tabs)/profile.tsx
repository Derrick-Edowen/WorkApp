import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { ThemedView } from '@/components/ThemedView';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null); // State to track the authenticated user
  const [loading, setLoading] = useState(true); // Loading state while checking authentication
  const [activeTab, setActiveTab] = useState<'profile' | 'diet' | 'settings'>('profile'); // State for active tab

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the authenticated user
      } else {
        router.replace('/SignInScreen'); // If no user is signed in, redirect
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up on unmount
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert('Success', 'Signed out successfully!');
      router.replace('/SignInScreen');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <Text style={styles.sectionTitle}>Profile</Text>
            <Text style={styles.infoText}>Welcome, {user.displayName || 'User'}!</Text>
            <Text style={styles.infoText}>Email: {user.email}</Text>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        );
      case 'diet':
        return (
          <>
            <Text style={styles.sectionTitle}>Diet Plan</Text>
            <Text style={styles.infoText}>Your personalized diet plan will appear here.</Text>
          </>
        );
      case 'settings':
        return (
          <>
            <Text style={styles.sectionTitle}>Settings</Text>
            <Text style={styles.infoText}>Adjust your app preferences and settings here.</Text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Top Navigation Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'diet' && styles.activeTab]}
          onPress={() => setActiveTab('diet')}
        >
          <Text style={styles.tabText}>Diet Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={styles.tabText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Active Tab Content */}
      <View style={styles.contentContainer}>{renderActiveTabContent()}</View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 6,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6200EE',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#6200EE',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  signOutButton: {
    backgroundColor: '#E53935',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});




