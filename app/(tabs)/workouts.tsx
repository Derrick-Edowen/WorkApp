import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

type RootStackParamList = {
  'resistance-training': undefined;
  cardio: undefined;
  stretching: undefined;
  other: undefined;
};


type Category = {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode; // Updated to use React.ReactNode for Ionicons
};

const workoutCategories: Category[] = [
  { id: '1', name: 'Resistance Training', color: '#e6550b', icon: <Ionicons name="barbell" size={60} color="white" /> },
  { id: '2', name: 'Cardio', color: '#0b80e6', icon: <Ionicons name="walk" size={60} color="white" /> },
  { id: '3', name: 'Stretching', color: '#1f911f', icon: <Ionicons name="heart-outline" size={60} color="white" /> },
  { id: '4', name: 'Other', color: '#920be6', icon: <Ionicons name="pulse" size={60} color="white" /> },

];

const WorkoutsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const animations = workoutCategories.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    Animated.stagger(300, animations.map((animation) =>
      Animated.timing(animation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    )).start();
  }, []);

  const handleCardPress = (category: Category) => {
    switch (category.name) {
      case 'Resistance Training':
        navigation.navigate('resistance'); // Navigate to Resistance screen
        break;
      case 'Cardio':
        navigation.navigate('cardio'); // Navigate to Cardio screen
        break;
      case 'Stretching':
        navigation.navigate('stretching'); // Navigate to Stretching screen
        break;
      case 'Other':
        navigation.navigate('other'); // Navigate to Other screen
        break;
      default:
        break;
    }
  };
  
  
  

  return (
    <View style={styles.container}>
      <View style={styles.cardsContainer}>
        {workoutCategories.map((category, index) => (
          <Animated.View
            key={category.id}
            style={[
              styles.card,
              {
                opacity: animations[index],
                transform: [
                  {
                    translateY: animations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity onPress={() => handleCardPress(category)}>
              <View style={[styles.cardBackground, { backgroundColor: category.color }]}>
                <View style={styles.iconContainer}>
                  {category.icon}
                </View>
                <Text style={styles.cardTitle}>{category.name}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  card: {
    width: '90%',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  cardBackground: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center', // Ensure the contents are vertically centered
    alignItems: 'center', // Center the content horizontally
    padding: 16, // Padding around the content
  },
  iconContainer: {
    marginBottom: 8, // Space between icon and text
  },
  cardTitle: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default WorkoutsScreen;








