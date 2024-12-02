import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

const CardioScreen = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Endurance Training', // Custom title for the top bar
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Card for Low Endurance */}
      <View style={[styles.card, styles.lowEndurance]}>
        <Text style={styles.cardText}>Low Endurance</Text>
      </View>

      {/* Card for Medium Endurance */}
      <View style={[styles.card, styles.mediumEndurance]}>
        <Text style={styles.cardText}>Medium Endurance</Text>
      </View>

      {/* Card for High Endurance */}
      <View style={[styles.card, styles.highEndurance]}>
        <Text style={styles.cardText}>High Endurance</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    width: screenWidth - 40, // Full width with padding
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
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

