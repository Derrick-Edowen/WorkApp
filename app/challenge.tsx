import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const screenHeight = Dimensions.get('window').height;

const OtherScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState<string | null>('User'); // Default user name
  const [timeLeft, setTimeLeft] = useState<number>(86400000); // 24 hours in milliseconds
  const animations = Array(2)
    .fill(null)
    .map(() => useRef(new Animated.Value(screenHeight)).current);

  // Fetch signed-in user's name
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.displayName) {
        setUserName(currentUser.displayName);
      } else {
        setUserName('User');
      }
    });

    return () => unsubscribe();
  }, []);

  // Countdown logic for the timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 1000) {
          clearInterval(interval); // Stop the timer
          return 0;
        }
        return prevTimeLeft - 1000;
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Convert timeLeft to hours, minutes, and seconds


  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${userName}'s Daily Challenges`,
    });
  }, [navigation, userName]);

  useEffect(() => {
    Animated.stagger(
      300,
      animations.map((animation) =>
        Animated.timing(animation, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [animations]);

  // Navigate to the appropriate challenge screen
  const handleChallengePress = (challenge: string) => {
    if (challenge === 'Challenge1') {
      router.push('/dailychallenge');
    } else if (challenge === 'Challenge2') {
      router.push('/cardiochallenge');
    }
  };

  const cardData = [
    {
      challenge: 'Challenge1',
      title: 'Resistance Training Challenge',
      description: 'Start your day with this energizing challenge.',
    },
    {
      challenge: 'Challenge2',
      title: 'Endurance Training Challenge',
      description: 'Take it up a notch with this fun workout.',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Cards */}
      {cardData.map((card, index) => (
        <Animated.View
          key={card.challenge}
          style={[
            styles.card,
            {
              transform: [
                {
                  translateY: animations[index], // Apply the animation to translateY
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={() => handleChallengePress(card.challenge)}>
            <Text style={styles.cardText}>{card.title}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 10,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  card: {
    flex: 1,
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 20,
    marginVertical: 10,
    borderRadius: 12,
    backgroundColor: '#87CEEB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default OtherScreen;




