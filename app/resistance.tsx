import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { router } from 'expo-router';

// Import the JSON file for exercise data
import resistanceData from '../exercises/resistance.json'; // Update the path accordingly

// Define types for Exercise data
type Exercise = {
  name: string;
  description: string;
  video: string;
  instructions: string[];
};

type MuscleGroup = {
  id: number;
  name: string;
  exercises: Exercise[];
};

type RootStackParamList = {
  resistance: undefined;
  exercisedetail: { group: string; data: Exercise[] }; // Ensure correct typing of params
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'resistance'>;

const { height: screenHeight } = Dimensions.get('window');

const ResistanceScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  
  // Directly use resistanceData as an array of muscle groups
  const exerciseGroups: MuscleGroup[] = resistanceData; // Assuming resistanceData is an array of muscle groups
  
  const animationValues = useRef(
    exerciseGroups.map(() => new Animated.Value(screenHeight)) // Start off-screen
  ).current;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Resistance Training',
    });

    // Animate the cards sequentially
    Animated.stagger(
      100,
      animationValues.map((value) =>
        Animated.timing(value, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        {exerciseGroups.map((group, index) => (
          <Animated.View
            key={group.id} // Use 'id' for unique key
            style={[styles.card, { transform: [{ translateY: animationValues[index] }] }]}
          >
<TouchableOpacity
  style={[styles.touchable, { backgroundColor: cardColors[index % cardColors.length] }]}
  onPress={() => 
    router.push(`/exercisedetail?id=${group.id}`)  // Pass the ID in the query string
  }
>
  <Text style={styles.cardText}>{group.name}</Text>
</TouchableOpacity>



          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default ResistanceScreen;

const cardColors = [
  '#FFC1C1', '#FFD8A8', '#FFF8C1', '#C1FFD7', '#C1E4FF', '#E1C1FF', '#FFB6C1', '#D9E1FF', '#FFE1E1',
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});












