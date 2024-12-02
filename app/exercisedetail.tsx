import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';  // Import the Video component
import { useLocalSearchParams } from 'expo-router';
import muscleGroupsData from '../exercises/resistance.json';
import { useNavigation } from 'expo-router';

interface Exercise {
  name: string;
  description: string;
  video: string;
  instructions: string[];
  intensity: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface MuscleGroup {
  id: number;
  name: string;
  exercises: Exercise[];
}

const ExerciseDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();

  const muscleGroup = muscleGroupsData.find(group => group.id === Number(id));

  useEffect(() => {
    if (muscleGroup) {
      navigation.setOptions({
        headerTitle: `Resistance Training: ${muscleGroup.name}`,
      });
    }
  }, [muscleGroup, navigation]);

  const [selectedIntensity, setSelectedIntensity] = useState<string>('All');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);  // Track expanded exercise

  const filteredExercises = selectedIntensity === 'All'
    ? muscleGroup?.exercises
    : muscleGroup?.exercises.filter(exercise => exercise.intensity.includes(selectedIntensity));

  if (!muscleGroup) {
    return <Text>Muscle group not found!</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Button row for filtering intensity */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.beginnerButton]}
          onPress={() => setSelectedIntensity('Beginner')}
        >
          <Text style={styles.buttonText}>Beginner</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.intermediateButton]}
          onPress={() => setSelectedIntensity('Intermediate')}
        >
          <Text style={styles.buttonText}>Intermediate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.advancedButton]}
          onPress={() => setSelectedIntensity('Advanced')}
        >
          <Text style={styles.buttonText}>Advanced</Text>
        </TouchableOpacity>
      </View>

      {/* List of exercises */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setExpandedExercise(expandedExercise === item.name ? null : item.name)}  // Toggle expanded state
          >
            <View style={styles.card}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.exerciseDescription}>{item.description}</Text>

              {/* Display video and instructions when the card is expanded */}
              {expandedExercise === item.name && (
                <View style={styles.expandedContent}>
                   <Video
                   resizeMode={ResizeMode.STRETCH}
                    source={{ uri: item.video }}
                    style={styles.video} // Updated styling
                    useNativeControls
                    isLooping
                    shouldPlay
                  />
                  <Text style={styles.instructionsHeader}>Instructions:</Text>
                  {item.instructions.map((instruction, index) => (
                    <Text key={index} style={styles.instruction}>
                      {index + 1}. {instruction}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  beginnerButton: {
    backgroundColor: '#4CAF50',
  },
  intermediateButton: {
    backgroundColor: '#FF9800',
  },
  advancedButton: {
    backgroundColor: '#F44336',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#555',
  },
  expandedContent: {
    marginTop: 10,
    width: '100%',
    height: '100%'
  },
  video: {
    width: '100%',
    height: 200
  },
  instructionsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  instruction: {
    fontSize: 14,
    color: '#555',
  },
});

export default ExerciseDetailScreen;














