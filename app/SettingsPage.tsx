import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Adjust based on your Firebase setup
import { useNavigation } from '@react-navigation/native';

const SettingsPage = () => {
      const navigation = useNavigation();
    
      useEffect(() => {
          navigation.setOptions({
            headerTitle: `Settings`,
          });
        }
      , []);

  return (
    <View style={styles.container}>
      <Text style={styles.infoText}>Adjust your app preferences and settings here.</Text>
      <TouchableOpacity style={styles.signOutButton} onPress={() => signOut(auth)}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign:'center'
  },
  signOutButton: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsPage;
