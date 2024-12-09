import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { router } from 'expo-router';

export default function ProfileSetupScreen() {
  const navigation = useNavigation();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [dietaryType, setDietaryType] = useState('');
  const [experience, setExperience] = useState('');
  const [gymFrequency, setGymFrequency] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState('');

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!age || !gender || !dietaryType || !experience || !gymFrequency || !fitnessGoals) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        age,
        gender,
        dietaryType,
        experience,
        gymFrequency,
        fitnessGoals,
        profileComplete: true, // Mark profile setup as complete
      });

      Alert.alert('Success', 'Profile setup complete!');
      router.replace('/profile'); // Navigate to main app (tabs)
    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile Setup</Text>

      {/* Age Input */}
      <Text style={styles.label}>Age</Text>
      <TextInput
        placeholder="Enter Age"
        style={styles.input}
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      {/* Gender Picker */}
      <Text style={styles.label}>Gender</Text>
      <Picker
        selectedValue={gender}
        onValueChange={(itemValue) => setGender(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Gender" value="" />
        <Picker.Item label="Female" value="Female" />
        <Picker.Item label="Male" value="Male" />
        <Picker.Item label="Other" value="Other" />
      </Picker>

      {/* Dietary Type Picker */}
      <Text style={styles.label}>Dietary Type</Text>
      <Picker
        selectedValue={dietaryType}
        onValueChange={(itemValue) => setDietaryType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Dietary Type" value="" />
        <Picker.Item label="Vegan" value="Vegan" />
        <Picker.Item label="Vegetarian" value="Vegetarian" />
        <Picker.Item label="Pescatarian" value="Pescatarian" />
        <Picker.Item label="Omnivore" value="Omnivore" />
        <Picker.Item label="Other" value="Other" />
      </Picker>

      {/* Workout Experience Picker */}
      <Text style={styles.label}>Workout Experience</Text>
      <Picker
        selectedValue={experience}
        onValueChange={(itemValue) => setExperience(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Experience" value="" />
        <Picker.Item label="Beginner" value="Beginner" />
        <Picker.Item label="Intermediate" value="Intermediate" />
        <Picker.Item label="Advanced" value="Advanced" />
      </Picker>

      {/* Gym Frequency Picker */}
      <Text style={styles.label}>Gym Frequency</Text>
      <Picker
        selectedValue={gymFrequency}
        onValueChange={(itemValue) => setGymFrequency(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Gym Frequency" value="" />
        <Picker.Item label="1-2 times per week" value="1-2 times per week" />
        <Picker.Item label="3-4 times per week" value="3-4 times per week" />
        <Picker.Item label="5+ times per week" value="5+ times per week" />
      </Picker>

      {/* Fitness Goals Picker */}
      <Text style={styles.label}>Fitness Goals</Text>
      <Picker
        selectedValue={fitnessGoals}
        onValueChange={(itemValue) => setFitnessGoals(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Fitness Goal" value="" />
        <Picker.Item label="Weight Loss" value="Weight Loss" />
        <Picker.Item label="Muscle Gain" value="Muscle Gain" />
        <Picker.Item label="Endurance" value="Endurance" />
        <Picker.Item label="General Fitness" value="General Fitness" />
      </Picker>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Complete Setup</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 8,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#6200EE',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

