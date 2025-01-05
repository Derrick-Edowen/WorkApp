import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';  // Import the Video component
import { useLocalSearchParams } from 'expo-router';
import muscleGroupsData from '../exercises/resistance.json';
import { useNavigation } from 'expo-router';
import axios from 'axios';



const ExerciseDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const navigation = useNavigation();

  interface Exercise {
    id: string;
    name: string;
    secondaryMuscles: string[];
    equipment: string;
    bodyPart: string;
    gifUrl: string;
    instructions: string[];
  }

  const capitalize = (text: string) => {
    if (!text) return 'N/A';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const shuffleArray = (array: Exercise[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    // Capitalize the muscle group name
    const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

    // Ensure `id` is a string, handle both cases where it could be a string or an array of strings
    const muscleGroup = Array.isArray(id) ? id[0] : id;

    if (muscleGroup) {
      navigation.setOptions({
        headerTitle: `Resistance Training: ${capitalize(muscleGroup)}`,
      });

      const fetchExercises = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/api/exercises/${muscleGroup}`);
          const shuffled = shuffleArray(response.data);
          const limitedExercises = shuffled.slice(0, 50); // Select the first 50 exercises after shuffling
          setExercises(limitedExercises);
        } catch (error) {
          console.error('Error fetching exercises:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchExercises();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!exercises.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No {capitalize(id)} Exercises Found!</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {exercises.map((exercise) => {
        const isExpanded = expandedExercise === exercise.id; // Check if the current card is expanded
        return (
          <View key={exercise.id} style={styles.card}>
            <TouchableOpacity onPress={() => setExpandedExercise(isExpanded ? null : exercise.id)}>
              <Text style={styles.cardTitle}>{capitalize(exercise.name)}</Text>
              <Text style={styles.cardDescription}>
                Secondary Muscle Group: {exercise.secondaryMuscles[0] ? capitalize(exercise.secondaryMuscles[0]) : 'N/A'}
              </Text>
              <Text style={styles.cardDescription}>
                Equipment: {exercise.equipment ? capitalize(exercise.equipment) : 'N/A'}
              </Text>
              <Text style={styles.cardDescription}>
                Body Region: {exercise.bodyPart ? capitalize(exercise.bodyPart) : 'N/A'}
              </Text>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.expandedContent}>
                {/* Exercise GIF */}
                {exercise.gifUrl ? (
                  <Image source={{ uri: exercise.gifUrl }} style={styles.gif} />
                ) : (
                  <Text style={styles.noContentText}>No demo available.</Text>
                )}

                {/* Instructions */}
                <Text style={styles.instructionsHeader}>Instructions:</Text>
                {exercise.instructions && exercise.instructions.length ? (
                  exercise.instructions.map((instruction, index) => (
                    <Text key={index} style={styles.instruction}>
                      {index + 1}. {instruction}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.noContentText}>No instructions available.</Text>
                )}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

export default ExerciseDetailScreen;


const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 22,
    color: '#555',
  },
  expandedContent: {
    marginTop: 16,
  },
  gif: {
    width: '100%',
    height: 350,
    borderRadius: 8,
    marginBottom: 16,
  },
  instructionsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  noContentText: {
    fontSize: 14,
    color: '#888',
  },
});















