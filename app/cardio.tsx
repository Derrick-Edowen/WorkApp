import React, { useEffect, useState } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const CardioScreen = () => {
  const navigation = useNavigation();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  interface Exercise {
    id: string;
    name: string;
    secondaryMuscles: string[];
    equipment: string;
    bodyPart: string;
    gifUrl: string;
    instructions: string[];
  }
  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Endurance Training',
    });

    const fetchExercises = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/exercises/cardiovascular system');
        setExercises(response.data);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [navigation]);

  const toggleExpand = (id: string) => {
    setExpandedExerciseId((prev) => (prev === id ? null : id));
  };

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
      <Text style={styles.loadingText}>No Cardio Exercises Found!</Text>
    </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {exercises.map((exercise) => (
        <TouchableOpacity
          key={exercise.id}
          onPress={() => toggleExpand(exercise.id)}
          style={styles.card}
        >
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

          {expandedExerciseId === exercise.id && (
            <View style={styles.expandedContent}>
              {exercise.gifUrl ? (
                              <Image source={{ uri: exercise.gifUrl }} style={styles.gif} />
                            ) : (
                              <Text style={styles.noContentText}>No demo available.</Text>
                            )}
              <Text style={styles.instructionsHeader}>Instructions:</Text>
              {exercise.instructions.length > 0 ? (
                exercise.instructions.map((instruction: string, index: number) => (
                  <Text key={index} style={styles.instruction}>
                    {index + 1}. {instruction}
                  </Text>
                ))
              ) : (
                <Text style={styles.instruction}>No instructions available.</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f8ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  card: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#4682B4',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  expandedContent: {
    marginTop: 15,
  },
  gif: {
    width: '100%',
    height: 350,
    marginBottom: 10,
  },
  instructionsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#fff',
  },
  instruction: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 2,
  },
  noContentText: {
    fontSize: 14,
    color: '#888',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#555',
  },
});

export default CardioScreen;




