import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import challengesData from '../exercises/other.json'; // Adjust the path as needed

// Define the types for the challenges
type Challenge = {
  id: number;
  name: string;
  description: string;
  program: {
    resistance: string;
    cardio: string;
    stretching: string;
  };
};

type ChallengeLevels = 'Beginner' | 'Intermediate' | 'Advanced';

const DailyChallenge = () => {
  const { level } = useLocalSearchParams<{ level: string }>(); // Retrieve the selected level from query params
  const navigation = useNavigation();
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  // State to track if each program has been completed
  const [completed, setCompleted] = useState({
    resistance: false,
    cardio: false,
    stretching: false,
  });

  // Animated checkmarks
  const [resistanceAnim] = useState(new Animated.Value(0));
  const [cardioAnim] = useState(new Animated.Value(0));
  const [stretchingAnim] = useState(new Animated.Value(0));

  // Effect to animate the checkmark when task is marked complete
  const animateCheckMark = (exercise: string) => {
    switch (exercise) {
      case 'resistance':
        Animated.spring(resistanceAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        break;
      case 'cardio':
        Animated.spring(cardioAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        break;
      case 'stretching':
        Animated.spring(stretchingAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        break;
    }
  };

  const getStoredChallenge = async () => {
    try {
      const storedChallenge = await AsyncStorage.getItem(level!);
      const storedTimestamp = await AsyncStorage.getItem(`${level!}_timestamp`);

      if (storedChallenge && storedTimestamp) {
        const timestamp = parseInt(storedTimestamp, 10);
        const currentTime = Date.now();
        const twentyFourHours = 23 * 60 * 60 * 1000; // 24 hours in milliseconds

        // If more than 24 hours have passed, reset the challenge
        if (currentTime - timestamp > twentyFourHours) {
          return null;
        }
        return JSON.parse(storedChallenge);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored challenge:', error);
      return null;
    }
  };

  const setNewChallenge = async (newChallenge: Challenge) => {
    try {
      await AsyncStorage.setItem(level!, JSON.stringify(newChallenge));
      await AsyncStorage.setItem(`${level!}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('Error storing challenge:', error);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `Daily Challenge: ${level}`, // Dynamic header title
    });

    const fetchChallenge = async () => {
      const storedChallenge = await getStoredChallenge();

      if (storedChallenge) {
        setChallenge(storedChallenge);
      } else {
        // Select a random challenge for the day if no stored challenge
        if (typeof level === 'string' && ['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
          const levelChallenges = challengesData.dailyChallenges[level as ChallengeLevels];
          const randomChallenge =
            levelChallenges[Math.floor(Math.random() * levelChallenges.length)];
          setChallenge(randomChallenge);

          // Save the challenge to AsyncStorage
          await setNewChallenge(randomChallenge);
        }
      }
    };

    fetchChallenge();
  }, [level, navigation]);

  // Handle marking an exercise as completed
  const handleMarkComplete = (exercise: string) => {
    setCompleted((prev) => {
      const newCompleted = { ...prev, [exercise]: true };
      animateCheckMark(exercise); // Trigger animation on completion
      return newCompleted;
    });
  };

  // Handle "Mark All Complete" button
  const handleMarkAllComplete = () => {
    setCompleted({
      resistance: true,
      cardio: true,
      stretching: true,
    });

    // Trigger animation for all exercises
    animateCheckMark('resistance');
    animateCheckMark('cardio');
    animateCheckMark('stretching');
  };

  if (!challenge) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading your daily challenge...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{challenge.name}</Text>
      <Text style={styles.description}>{challenge.description}</Text>

      {/* Resistance Training */}
      <View style={styles.programSection}>
        <View style={styles.programHeader}>
          <Text style={styles.programTitle}>Resistance Training</Text>
          {completed.resistance && (
            <Animated.Text style={[styles.checkMark, { opacity: resistanceAnim }]}>✔️</Animated.Text>
          )}
        </View>
        <Text style={styles.programText}>{challenge.program.resistance}</Text>
        <TouchableOpacity
          style={styles.checkButton}
          onPress={() => handleMarkComplete('resistance')}>
          <Text style={styles.buttonText}>Complete?</Text>
        </TouchableOpacity>
      </View>

      {/* Cardio */}
      <View style={styles.programSection}>
        <View style={styles.programHeader}>
          <Text style={styles.programTitle}>Cardio</Text>
          {completed.cardio && (
            <Animated.Text style={[styles.checkMark, { opacity: cardioAnim }]}>✔️</Animated.Text>
          )}
        </View>
        <Text style={styles.programText}>{challenge.program.cardio}</Text>
        <TouchableOpacity
          style={styles.checkButton}
          onPress={() => handleMarkComplete('cardio')}>
          <Text style={styles.buttonText}>Complete?</Text>
        </TouchableOpacity>
      </View>

      {/* Stretching */}
      <View style={styles.programSection}>
        <View style={styles.programHeader}>
          <Text style={styles.programTitle}>Stretching</Text>
          {completed.stretching && (
            <Animated.Text style={[styles.checkMark, { opacity: stretchingAnim }]}>✔️</Animated.Text>
          )}
        </View>
        <Text style={styles.programText}>{challenge.program.stretching}</Text>
        <TouchableOpacity
          style={styles.checkButton}
          onPress={() => handleMarkComplete('stretching')}>
          <Text style={styles.buttonText}>Complete?</Text>
        </TouchableOpacity>
      </View>

      {/* Mark All Complete Button */}
      <TouchableOpacity style={styles.button} onPress={handleMarkAllComplete}>
        <Text style={styles.buttonText}>Mark All as Complete</Text>
      </TouchableOpacity>
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
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
    textAlign: 'center',
  },
  programSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginLeft: 10,
  },
  programText: {
    fontSize: 16,
    color: '#666',
  },
  checkMark: {
    fontSize: 18,
    color: 'green',
    marginLeft: 10,
  },
  checkButton: {
    backgroundColor: '#87CEEB',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#87CEEB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginTop: 50,
  },
});

export default DailyChallenge;



