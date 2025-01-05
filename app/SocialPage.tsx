import { useLocalSearchParams } from 'expo-router';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from 'expo-router';
import React, { useState, useEffect } from 'react';

const SocialPage = () => {
  const params = useLocalSearchParams();
  const friendData = params.friend ? JSON.parse(params.friend as string) : null;
        const navigation = useNavigation();

  // Log the received data
  console.log('Received friend data:', friendData);

  if (!friendData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No profile data available.</Text>
      </View>
    );
  }

  const { name, friendId, fitnessGoals, privacySetting, profileImage } = friendData;
      useEffect(() => {
          navigation.setOptions({
            headerTitle: `Work Fitness: ${name}'s Profile`,
          });
        }
      , []);
  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <Image
        source={{
          uri: profileImage || 'https://storage.googleapis.com/realestate-images/headshotfemale.jpg',
        }}
        style={styles.profileImage}
      />

      {/* User Details */}
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.details}>Friend ID: {friendId}</Text>
      <Text style={styles.details}>Fitness Goals: {fitnessGoals || 'N/A'}</Text>
      <Text style={styles.details}>Privacy: {privacySetting || 'N/A'}</Text>
    </View>
  );
};

export default SocialPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  details: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});



