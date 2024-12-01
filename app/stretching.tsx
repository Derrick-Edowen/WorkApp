import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from 'expo-router';

const StretchingScreen = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Exercises: Stretches', // Custom title for the top bar
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stretching Training</Text>
      {/* Additional content for the Resistance screen */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default StretchingScreen;