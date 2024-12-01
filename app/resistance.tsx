import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from 'expo-router';

const exerciseGroups = [
  'Biceps',
  'Triceps',
  'Chest',
  'Quads',
  'Hamstrings',
  'Calves',
  'Back',
  'Shoulders',
  'Glutes',
];

const ResistanceScreen = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Exercises: Resistance Training', // Custom title for the top bar
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        {exerciseGroups.map((group, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardText}>{group}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ResistanceScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  listContainer: {
    flexDirection: 'row', // Row layout for cards
    flexWrap: 'wrap', // Allow cards to wrap to the next row
    justifyContent: 'space-between', // Space between cards in each row
  },
  card: {
    width: '48%', // Each card takes up 48% of the row width
    height: 150, // Fixed height for all cards
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10, // Spacing between rows
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});



