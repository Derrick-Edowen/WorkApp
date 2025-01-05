import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import { doc, updateDoc, setDoc, getFirestore } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { router } from 'expo-router';

export default function ProfileSetupScreen() {
  const navigation = useNavigation();
  const db = getFirestore();

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [dietaryType, setDietaryType] = useState('');
  const [experience, setExperience] = useState('');
  const [gymFrequency, setGymFrequency] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState('');
  const [privacySetting, setPrivacySetting] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const generateFriendId = () => {
    const prefix = 'WA';
    const randomId = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit number
    return `${prefix}${randomId}`;
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'You need to grant camera permissions to upload a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.uri);
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }
  
    if (
      !age ||
      !gender ||
      !dietaryType ||
      !experience ||
      !gymFrequency ||
      !fitnessGoals ||
      !privacySetting ||
      !heightFeet ||
      !heightInches ||
      !weight ||
      !activityLevel
    ) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
  
    try {
      const userDocRef = doc(db, 'users', user.uid);
  
      // Generate Friend ID
      const friendId = generateFriendId();
  
      // Retrieve user name and email
      const name = user.displayName || 'Unnamed User';
      const email = user.email || 'No Email Provided';
  
      await setDoc(userDocRef, {
        name,
        email,
        age,
        gender,
        dietaryType,
        experience,
        gymFrequency,
        fitnessGoals,
        privacySetting,
        heightFeet, // Save feet separately
        heightInches, // Save inches separately
        weight: `${weight} lbs`,
        activityLevel,
        profileImage,
        friendId,
        profileComplete: true,
      });
  
      Alert.alert('Success', 'Profile setup complete!');
      router.replace('/profile'); // Navigate to main app (tabs)
    } catch (error) {
      console.error('Error during profile setup:', error);
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

      {/* Height Inputs */}
      <Text style={styles.label}>Height</Text>
      <View style={styles.row}>
        <TextInput
          placeholder="Feet"
          style={[styles.input, styles.halfInput]}
          keyboardType="numeric"
          value={heightFeet}
          onChangeText={setHeightFeet}
        />
        <TextInput
          placeholder="Inches"
          style={[styles.input, styles.halfInput]}
          keyboardType="numeric"
          value={heightInches}
          onChangeText={setHeightInches}
        />
      </View>

      {/* Weight Input */}
      <Text style={styles.label}>Weight (lbs)</Text>
      <TextInput
        placeholder="Enter Weight"
        style={styles.input}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />
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

      
      {/* Activity Level Picker */}
      <Text style={styles.label}>Activity Level</Text>
      <Picker
        selectedValue={activityLevel}
        onValueChange={(itemValue) => setActivityLevel(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Activity Level" value="" />
        <Picker.Item label="Inactive" value="Inactive" />
        <Picker.Item label="Low Active" value="Low Active" />
        <Picker.Item label="Active" value="Active" />
        <Picker.Item label="Very Active" value="Very Active" />
      </Picker>
{/* Privacy Settings Picker */}
<Text style={styles.label}>Privacy Settings</Text>
      <Picker
        selectedValue={privacySetting}
        onValueChange={(itemValue) => setPrivacySetting(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Privacy Setting" value="" />
        <Picker.Item label="Private" value="Private" />
        <Picker.Item label="Friends Only" value="Friends Only" />
        <Picker.Item label="Public" value="Public" />
      </Picker>
      {/* Profile Image Picker */}
      <Text style={styles.label}>Profile Image</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
        <Text style={styles.imagePickerText}>Upload/Tap to Take a Photo</Text>
      </TouchableOpacity>
      {profileImage && <Image source={{ uri: profileImage }} style={styles.profileImage} />}

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
    padding:10,
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

