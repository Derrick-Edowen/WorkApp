import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { router } from 'expo-router';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const StretchScreen = () => {
  const navigation = useNavigation();

  // Animated values for each card
  const animations = [
    useRef(new Animated.Value(screenHeight)).current, // Start off-screen
    useRef(new Animated.Value(screenHeight)).current,
    useRef(new Animated.Value(screenHeight)).current,
  ];

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Stretching', // Custom title for the top bar
    });

    // Staggered animation for the cards
    Animated.stagger(
      300, // Delay between each card animation
      animations.map((animation) =>
        Animated.timing(animation, {
          toValue: 0, // Final position
          duration: 600, // Animation duration
          useNativeDriver: true, // Optimize animation
        })
      )
    ).start();
  }, [navigation, animations]);

  const handleCardPress = (category: string) => {
    router.push(`/stretchdetail?category=${category}`);
  };
  
  

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          styles.dynamicStretch,
          { transform: [{ translateY: animations[0] }] },
        ]}
      >
        <TouchableOpacity onPress={() => handleCardPress('Dynamic')}>
          <Text style={styles.cardText}>Dynamic Stretching</Text>
          <Text style={styles.miniText}>Prepare the body for movement by increasing blood flow and range of motion. Ideal for pre-workout</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.card,
          styles.staticStretch,
          { transform: [{ translateY: animations[1] }] },
        ]}
      >
        <TouchableOpacity onPress={() => handleCardPress('Static')}>
          <Text style={styles.cardText}>Static Stretching</Text>
          <Text style={styles.miniText}>Improve flexibility and relieve muscle tension, typically performed post-workout</Text>

        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.card,
          styles.yogaInspired,
          { transform: [{ translateY: animations[2] }] },
        ]}
      >
        <TouchableOpacity onPress={() => handleCardPress('Yoga-Inspired')}>
          <Text style={styles.cardText}>Yoga-Inspired</Text>
          <Text style={styles.miniText}>Blend mindfulness, flexibility, and strength; can be used for recovery or relaxation</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f8ff', // Light background color for better contrast
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff', // White text for contrast
  },
  miniText: {
    fontSize: 12,
    color: '#fff', // White text for contrast
    fontWeight: 'bold',

    textAlign: 'center'
  },
  dynamicStretch: {
    backgroundColor: '#ADD8E6', // Light blue
  },
  staticStretch: {
    backgroundColor: '#87CEEB', // Sky blue
  },
  yogaInspired: {
    backgroundColor: '#4682B4', // Steel blue
  },
});

export default StretchScreen;