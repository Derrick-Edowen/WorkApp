import React, { useEffect, useRef } from 'react';
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

// Get the height of the screen
const screenHeight = Dimensions.get('window').height;

const OtherScreen = () => {
  const navigation = useNavigation();

  // Animated values for the cards
  const animations = Array(3)
    .fill(null)
    .map(() => useRef(new Animated.Value(screenHeight)).current);

  useEffect(() => {
    // Run the animations when the component mounts
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

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `{Name's} Daily Challenges`, // Updated title for the top bar
    });
  }, [navigation]);

  const handleChallengePress = (level: string) => {
    // Navigate to the challenge details page with the level as a parameter
    router.push(`/dailychallenge?level=${level}`);
  };

  const cardData = [
    {
      level: 'Beginner',
      title: 'Beginner',
      description: 'Short and simple exercises for beginners.',
    },
    {
      level: 'Intermediate',
      title: 'Intermediate',
      description:
        'A bit more challenging, great for intermediate fitness levels.',
    },
    {
      level: 'Advanced',
      title: 'Advanced',
      description: 'Challenging exercises for seasoned athletes.',
    },
  ];

  return (
    <View style={styles.container}>
      {cardData.map((card, index) => (
        <Animated.View
          key={card.level}
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
          <TouchableOpacity onPress={() => handleChallengePress(card.level)}>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  card: {
    width: '100%',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default OtherScreen;

