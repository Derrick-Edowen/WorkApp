import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from 'expo-router';

type Exercise = {
  id: string; // API uses string IDs
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  randomValue: number;
  instructions?: string[]; // Array of strings for instructions
};

const DailyChallenge = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [completed, setCompleted] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const navigation = useNavigation();

  const EXERCISES_KEY = 'dailyExercises';
  const COMPLETED_KEY = 'completedExercises';
  const LAST_FETCH_KEY = 'lastFetchTime';
  const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  const calculateTimeUntilNextReset = () => {
    const now = new Date();
    const nextNoon = new Date();
    nextNoon.setHours(12, 0, 0, 0);

    if (now >= nextNoon) {
      nextNoon.setDate(nextNoon.getDate() + 1);
    }

    const diffMs = nextNoon.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
  };

  const fetchExercisesFromBackend = async () => {
    try {
      console.log('Fetching exercises from backend...');
      const response = await axios.get('http://localhost:3000/api/challenges'); // Replace with your IP
      console.log('Fetched Exercises from Backend:', response.data);

      const allExercises: Exercise[] = response.data;

      const updatedExercises = allExercises.map((exercise) => {
        const randomValue = [10, 20, 30][Math.floor(Math.random() * 3)];
        return {
          ...exercise,
          randomValue: randomValue,
        };
      });

      const shuffled = updatedExercises.sort(() => 0.5 - Math.random());
      const selectedExercises = shuffled.slice(0, 10);

      const currentTime = Date.now();
      await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(selectedExercises));
      await AsyncStorage.setItem(LAST_FETCH_KEY, currentTime.toString());

      setExercises(selectedExercises);
    } catch (error) {
      console.error('Error fetching exercises from backend:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedExercises = async () => {
    try {
      const storedLastFetch = await AsyncStorage.getItem(LAST_FETCH_KEY);
      const storedExercises = await AsyncStorage.getItem(EXERCISES_KEY);

      const now = Date.now();
      const timeSinceLastFetch = storedLastFetch ? now - parseInt(storedLastFetch, 10) : RESET_INTERVAL + 1;

      if (timeSinceLastFetch > RESET_INTERVAL || !storedExercises) {
        console.log('24 hours passed or no stored exercises, fetching new data...');
        await fetchExercisesFromBackend();
      } else {
        setExercises(JSON.parse(storedExercises));
      }

      const storedCompleted = await AsyncStorage.getItem(COMPLETED_KEY);
      if (storedCompleted) {
        setCompleted(JSON.parse(storedCompleted));
      }
    } catch (error) {
      console.error('Error loading saved exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetAtNoon = () => {
    const now = new Date();
    const nextNoon = new Date();
    nextNoon.setHours(12, 0, 0, 0);

    if (now >= nextNoon) {
      nextNoon.setDate(nextNoon.getDate() + 1);
    }

    const timeUntilNextNoon = nextNoon.getTime() - now.getTime();

    setTimeout(async () => {
      console.log('Resetting exercises at noon...');
      await fetchExercisesFromBackend();

      // Re-schedule the reset for the next noon
      resetAtNoon();
    }, timeUntilNextNoon);
  };

  useEffect(() => {
    const loadExercises = async () => {
      await loadSavedExercises();
    };
    loadExercises();

    resetAtNoon(); // Initialize the noon reset timer

    // Start the live timer for countdown
    const timer = setInterval(() => {
      calculateTimeUntilNextReset();
    }, 1000);

    navigation.setOptions({
      headerTitle: `Daily Resistance Training Challenge`,
    });

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  const handleMarkComplete = async (exerciseId: string) => {
    const updatedCompleted = { ...completed, [exerciseId]: true };
    setCompleted(updatedCompleted);
    await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(updatedCompleted));
  };

  const capitalize = (text: string) => {
    if (!text) return 'N/A';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading your daily challenge...</Text>
      </View>
    );
  }

  const completedCount = Object.values(completed).filter((val) => val).length;

  return (
    <ScrollView style={styles.container}>
    <Text style={styles.summaryText}>Time until reset: {timeRemaining}</Text>
    <Text style={styles.summaryText}>
      {completedCount}/{exercises.length} Resistance Training Challenges Completed
    </Text>
    {exercises.map((exercise) => (
      <View key={exercise.id} style={styles.exerciseCard}>
        <Text style={styles.exerciseName}>
          {exercise.randomValue} {capitalize(exercise.name)}
        </Text>
        <Text style={styles.exerciseDetails}>Target: {exercise.target}</Text>
        <Text style={styles.exerciseDetails}>Body Part: {exercise.bodyPart}</Text>
        <Text style={styles.exerciseDetails}>Equipment: {exercise.equipment}</Text>
        <Image source={{ uri: exercise.gifUrl }} style={styles.gif} />

        {exercise.instructions && exercise.instructions.length > 0 && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsHeader}>Instructions:</Text>
            {exercise.instructions.map((instruction, index) => (
              <Text key={index} style={styles.instructionText}>
                {index + 1}. {instruction}
              </Text>
            ))}
          </View>
        )}

        {completed[exercise.id] ? (
          <Text style={styles.completedText}>✅ Completed!</Text>
        ) : (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleMarkComplete(exercise.id)}
          >
            <Text style={styles.buttonText}>Mark as Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    ))}
  </ScrollView>
);
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  gif: {
    width: '100%',
    height: 350,
    borderRadius: 10,
    marginVertical: 10,
  },
  instructionsContainer: {
    marginTop: 10,
  },
  instructionsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 14,
    color: '#555',
  },
  completedText: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default DailyChallenge;