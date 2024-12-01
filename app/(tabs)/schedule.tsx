import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Calendar } from 'react-native-calendars'; // Removed DateObject import
import { Colors } from '@/constants/Colors';

const ScheduleScreen = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

  const generateMarkedDates = () => {
    const pastDays: { [key: string]: { disabled: boolean; disableTouchEvent: boolean; color: string } } = {}; // Explicit type for pastDays
    const todayDate = new Date(today);

    // Grey out past days
    for (let d = new Date(2023, 0, 1); d < todayDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      pastDays[dateString] = { disabled: true, disableTouchEvent: true, color: '#d3d3d3' };
    }

    return {
      ...pastDays,
      [today]: { selected: true, selectedColor: Colors.light.tint },
      ...(selectedDate
        ? { [selectedDate]: { selected: true, selectedColor: Colors.dark.tint } }
        : {}),
    };
  };

  const handleDayPress = (day: any) => {  // Use any here for simplicity, or define your own type if you want
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={generateMarkedDates()}
        theme={{
          todayTextColor: Colors.light.tint,
          selectedDayBackgroundColor: Colors.light.tint,
          arrowColor: Colors.light.tint,
        }}
      />
      <View style={styles.infoContainer}>
        {selectedDate && (
          <Text style={styles.infoText}>{selectedDate}</Text>
        )}
      </View>
    </View>
  );
};

export default ScheduleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.light.text,
  },
  infoContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: Colors.light.text,
  },
});

