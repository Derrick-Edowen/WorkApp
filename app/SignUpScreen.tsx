import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Firestore setup

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
        const navigation = useNavigation();
  
      useEffect(() => {
          navigation.setOptions({
            headerTitle: `Work - Sign Up`,
          });
        }
      , []);
  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
  
      // Initialize empty user profile in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, { name, email, profileComplete: false });
  
      // Navigate to Profile Setup
      router.push('/ProfileSetup');
    } catch (error) {
      Alert.alert('Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('/SignInScreen')}>
        <Text style={styles.signInText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  input: { width: '100%', padding: 16, marginVertical: 8, backgroundColor: '#FFF', borderRadius: 8 },
  button: { backgroundColor: '#6200EE', padding: 16, borderRadius: 8, marginTop: 16 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  signInText: { color: '#6200EE', marginTop: 16, fontSize: 14 },
});

