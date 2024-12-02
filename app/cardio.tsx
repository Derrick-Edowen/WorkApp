import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { router } from 'expo-router';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const CardioScreen = () => {
  const navigation = useNavigation();

  // Animated values for each card
  const animations = [
    useRef(new Animated.Value(screenHeight)).current, // Start off-screen
    useRef(new Animated.Value(screenHeight)).current,
    useRef(new Animated.Value(screenHeight)).current,
  ];

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Endurance Training', // Custom title for the top bar
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

  const handleCardPress = (enduranceLevel: string) => {
    router.push(`/cardiodetail?enduranceLevel=${enduranceLevel}`);
  };
  

  return (
    <View style={styles.container}>
      {/* Card for Low Endurance */}
      <Animated.View
        style={[
          styles.card,
          styles.lowEndurance,
          { transform: [{ translateY: animations[0] }] },
        ]}
      >
        <TouchableOpacity onPress={() => handleCardPress('Low Endurance')}>
          <Text style={styles.cardText}>Low Endurance</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Card for Medium Endurance */}
      <Animated.View
        style={[
          styles.card,
          styles.mediumEndurance,
          { transform: [{ translateY: animations[1] }] },
        ]}
      >
        <TouchableOpacity onPress={() => handleCardPress('Medium Endurance')}>
          <Text style={styles.cardText}>Medium Endurance</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Card for High Endurance */}
      <Animated.View
        style={[
          styles.card,
          styles.highEndurance,
          { transform: [{ translateY: animations[2] }] },
        ]}
      >
        <TouchableOpacity onPress={() => handleCardPress('High Endurance')}>
          <Text style={styles.cardText}>High Endurance</Text>
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
    color: '#fff', // White text for contrast
  },
  lowEndurance: {
    backgroundColor: '#ADD8E6', // Light blue
  },
  mediumEndurance: {
    backgroundColor: '#87CEEB', // Sky blue
  },
  highEndurance: {
    backgroundColor: '#4682B4', // Steel blue
  },
});

export default CardioScreen;



