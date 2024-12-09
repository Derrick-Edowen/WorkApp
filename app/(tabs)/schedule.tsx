import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Alert, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/Colors';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Define types for scheduled programs
type ScheduledProgram = {
  programName: string;
  time: string; // Time in string format for display
};

const ScheduleScreen = () => {
  const { programName } = useLocalSearchParams<{ programName: string }>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [scheduledPrograms, setScheduledPrograms] = useState<{ [date: string]: ScheduledProgram[] }>({});

  const today = new Date().toISOString().split('T')[0];
  const currentUser = getAuth().currentUser;
  const db = getFirestore();

  useEffect(() => {
    if (selectedDate) {
      fetchScheduledPrograms(selectedDate);
    }
  }, [selectedDate]);

  // Fetch scheduled programs from Firestore for the selected date
  const fetchScheduledPrograms = async (date: string) => {
    if (!currentUser) return;
  
    // Create a timestamp for the start and end of the selected day
    const startOfDay = new Date(date + 'T00:00:00.000Z'); // 2024-12-10T00:00:00.000Z
    const endOfDay = new Date(date + 'T23:59:59.999Z'); // 2024-12-10T23:59:59.999Z
    console.log('Start of day:', startOfDay);
    console.log('End of day:', endOfDay);
    try {
      const q = query(
        collection(db, 'scheduledPrograms'),
        where('userId', '==', currentUser.uid),
        where('date', '>=', startOfDay),  // Get programs starting from the beginning of the day
        where('date', '<=', endOfDay)     // Get programs before the end of the day
      );
      const querySnapshot = await getDocs(q);
      const programs: ScheduledProgram[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        programs.push({
          programName: data.programName,
          time: data.time,
        });
      });
  
      setScheduledPrograms((prev) => ({
        ...prev,
        [date]: programs,
      }));
    } catch (error) {
      console.error('Error fetching programs: ', error);
      Alert.alert('Error', 'There was an issue fetching the scheduled programs.');
    }
  };
  

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setShowTimePicker(true); // Show time picker after date selection
  };

  const confirmSchedule = async () => {
    if (!selectedDate || !time) {
      Alert.alert('Error', 'Please select a date and time.');
      return;
    }
  
    const formattedTime = time.toISOString();  // Converts Date to ISO format (e.g., 2024-12-10T21:00:00.000Z)
  
    try {
      const user = currentUser;
      if (!user) throw new Error('No user logged in');
  
      const scheduledProgramsRef = collection(db, 'scheduledPrograms');
      await addDoc(scheduledProgramsRef, {
        userId: user.uid,
        date: selectedDate + 'T00:00:00.000Z',  // Saving date in ISO format (start of day)
        programName: programName || 'Unnamed Program',
        time: formattedTime,
      });
  
      // Update the scheduled programs state
      setScheduledPrograms((prev) => ({
        ...prev,
        [selectedDate]: [
          ...(prev[selectedDate] || []),
          { programName: programName || 'Unnamed Program', time: formattedTime },
        ],
      }));
  
      Alert.alert('Success', `${programName} has been scheduled for ${selectedDate} at ${formattedTime}.`);
      setTime(null);
      setShowTimePicker(false);
    } catch (error) {
      console.error('Error confirming schedule: ', error);
      Alert.alert('Error', 'There was an issue scheduling the program.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule {programName}</Text>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate || '']: { selected: true, selectedColor: Colors.light.tint },
          [today]: { selected: !selectedDate, selectedColor: '#d3d3d3' },
        }}
        theme={{
          todayTextColor: Colors.light.tint,
          arrowColor: Colors.light.tint,
        }}
      />

      {showTimePicker && (
        <DateTimePicker
          value={time || new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(_event: unknown, selectedTime: Date | undefined) => {
            setShowTimePicker(false);
            if (selectedTime) setTime(selectedTime);
          }}
        />
      )}

      {selectedDate && time && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Selected Date: {selectedDate}</Text>
          <Text style={styles.infoText}>
            Selected Time: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Button title="Confirm Schedule" onPress={confirmSchedule} color={Colors.light.tint} />
        </View>
      )}

      {selectedDate && (
        <View style={styles.programContainer}>
          <Text style={styles.scheduledTitle}>Scheduled Programs for {selectedDate}</Text>
          {scheduledPrograms[selectedDate] && scheduledPrograms[selectedDate].length > 0 ? (
            <FlatList
              data={scheduledPrograms[selectedDate]}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.programCard}>
                  <Text style={styles.programName}>{item.programName}</Text>
                  <Text style={styles.programTime}>Time: {item.time}</Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noProgramsText}>No Programs Scheduled for this date</Text>
          )}
        </View>
      )}
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
  programContainer: {
    marginTop: 20,
  },
  scheduledTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.light.tint,
  },
  programCard: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  programName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  programTime: {
    fontSize: 14,
    color: '#555',
  },
  noProgramsText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
});





