import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import cardioExercises from '../exercises/cardio.json'; // Import the cardio exercises
import { useLocalSearchParams } from 'expo-router';
import { navigate } from 'expo-router/build/global-state/routing';
import { useNavigation } from 'expo-router';
import { Video } from 'expo-av'; // Import the Video component

const CardioDetail = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [expandedCard, setExpandedCard] = useState<number | null>(null); // Track which card is expanded

  const { enduranceLevel } = useLocalSearchParams(); // Get the enduranceLevel from the query string
  const [exercises, setExercises] = useState<any[]>([]); // Type the state as an array of exercises

  useEffect(() => {
    if (enduranceLevel) {
      // Filter exercises based on the endurance level
      const filteredExercises = cardioExercises.filter(
        (exercise) => exercise.enduranceLevel === enduranceLevel
      );
      setExercises(filteredExercises);
    }
    if (enduranceLevel) {
        navigation.setOptions({
          headerTitle: `Endurance Training: ${enduranceLevel}`, // Set the title based on the query parameter
        });
      }
    }, [enduranceLevel, navigation]);
    const handleCardPress = (id: number) => {
        setExpandedCard(expandedCard === id ? null : id); // Toggle the expanded state
      };
    
  return (
    <ScrollView style={styles.container}>
    <Text style={styles.header}>{enduranceLevel} Exercises</Text>
    {/* Render the filtered exercises */}
    {exercises.map((exercise) => (
      <TouchableOpacity
        key={exercise.id}
        style={styles.card}
        onPress={() => handleCardPress(exercise.id)}
      >
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.description}>{exercise.description}</Text>
        <Text style={styles.duration}>Recommended Duration: {exercise.duration}</Text>
        <Text style={styles.calories}>Approx. Calories Burned: {exercise.calorieBurn}</Text>
        {/* Render the video only if the card is clicked */}
        {expandedCard === exercise.id && (
          <Video
            source={{ uri: exercise.video }}
            style={styles.video}
            useNativeControls // Adds play, pause, and other controls
            isLooping
          />
        )}
      </TouchableOpacity>
    ))}
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4', // Light background for better contrast
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // Dark color for header text
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
  },
  duration: {
    fontSize: 14,
    color: '#444',
  },
  calories: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default CardioDetail;

