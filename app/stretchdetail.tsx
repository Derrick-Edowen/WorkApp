import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Video } from 'expo-av'; // Import Video from expo-av
import stretchExercises from '../exercises/stretch.json'; // Assuming JSON data is stored here

const StretchDetail = () => {
  const { category } = useLocalSearchParams(); // Get category from query params
  const navigation = useNavigation();
  const [exercises, setExercises] = useState<any[]>([]); // Array to hold filtered exercises
  const [expandedCard, setExpandedCard] = useState<string | null>(null); // Tracks which card is expanded

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `Stretching: ${category}`, // Dynamic header title
    });

    // Filter exercises based on the selected category
    const filteredExercises = stretchExercises.filter(
      (exercise) => exercise.category === category
    );
    setExercises(filteredExercises);
  }, [category, navigation]);

  const handleExpandCard = (id: string) => {
    // Toggle card expansion
    setExpandedCard((prev) => (prev === id ? null : id));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{category} Exercises</Text>
      {exercises.map((exercise) => (
        <View key={exercise.id} style={styles.card}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.description}>{exercise.description}</Text>
          <Text style={styles.duration}>Duration/Reps: {exercise.durationRepetition}</Text>
          {expandedCard === exercise.id && (
            <Video
              source={{ uri: exercise.video }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              shouldPlay
              useNativeControls
              style={styles.videoPlayer}
            />
          )}
          <TouchableOpacity
            style={styles.videoButton}
            onPress={() => handleExpandCard(exercise.id)}
          >
            <Text style={styles.videoButtonText}>
              {expandedCard === exercise.id ? 'Hide Video' : 'Watch Video'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  duration: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
  },
  videoPlayer: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  videoButton: {
    backgroundColor: '#87CEEB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  videoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default StretchDetail;


