import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Alert, FlatList, ScrollView} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/Colors';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Define types for scheduled programs
type ScheduledProgram = {
  programName: string;
  time: string; // Time in string format for display
  exercises: any;
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
  const formatDate = (isoDate: string) => {
    // Extract year, month, and day from the ISO string
    const [year, month, day] = isoDate.split('T')[0].split('-');
    
    // Construct the date manually to avoid time zone shifts
    const localDate = new Date(Number(year), Number(month) - 1, Number(day));
    
    // Format the date to "December 16, 2024"
    return localDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  const formatTimeFromISO = (isoString: string) => {
    if (!isoString) return 'All Day';
  
    // Extract the time portion
    const timePart = isoString.split('T')[1]; // e.g., "17:00:00.000Z"
    const [hours, minutes] = timePart.split(':');
  
    // Create a Date object with UTC time
    const date = new Date();
    date.setUTCHours(Number(hours), Number(minutes), 0);
  
    // Format the time to a readable format (12-hour clock)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  // Fetch scheduled programs from Firestore for the selected date
  const fetchScheduledPrograms = async (date: string) => {
    if (!currentUser) return;
  
    try {
      const userScheduleRef = doc(db, 'schedules', currentUser.uid);
      const userScheduleSnap = await getDoc(userScheduleRef);
  
      if (userScheduleSnap.exists()) {
        const userScheduleData = userScheduleSnap.data();  
        // Format the selected date to match the date format in Firestore (yyyy-mm-dd)
        const formattedSelectedDate = date.split('T')[0]; // Get just the yyyy-mm-dd part
  
        // Find a key that matches the selected date, ignoring the time component
        const matchingKey = Object.keys(userScheduleData).find((key) => key.startsWith(formattedSelectedDate));
  
        const programsForDate = matchingKey ? userScheduleData[matchingKey] : null;
        const formattedTime = formatTimeFromISO(matchingKey || 'T00:00:00.000Z');

        setScheduledPrograms((prev) => ({
          ...prev,
          [formattedSelectedDate]: programsForDate
            ? [
                {
                  programName: programsForDate.programName,
                  time: formattedTime,
                  exercises: programsForDate.exercises || [],
                },
              ]
            : [],
        }));
      } else {
        setScheduledPrograms((prev) => ({
          ...prev,
          [date]: [], // Use the raw `date` value here if no program is found
        }));
      }
    } catch (error) {
      console.error('Error fetching programs: ', error);
      Alert.alert('Error', 'There was an issue fetching the scheduled programs.');
    }
  };
  
  
  
  
  
  

  const handleDayPress = (day: any) => {
    const isoDate = new Date(day.dateString).toISOString().split('T')[0]; // Remove the time part
    setSelectedDate(isoDate);
    fetchScheduledPrograms(isoDate);
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
          { 
            programName: programName || 'Unnamed Program', 
            time: formattedTime, 
            exercises: [] // Provide an empty array as the default for exercises
          },
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
    
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
<Text style={styles.scheduledTitle}>
  Scheduled Programs for {formatDate(selectedDate)}
</Text>

          {scheduledPrograms[selectedDate] && scheduledPrograms[selectedDate].length > 0 ? (
           <FlatList
           data={scheduledPrograms[selectedDate]}
           keyExtractor={(item, index) => index.toString()}
           renderItem={({ item }) => (
             <View style={styles.programCard}>
               <Text style={styles.programName}>{item.programName}</Text>
               <Text style={styles.programTime}>Time: {item.time}</Text>
               {item.exercises && item.exercises.length > 0 && (
                <View>
    <Text style={styles.exerciseHeader}>Exercises:</Text>
    {item.exercises.map((exercise: any, index: number) => (
      <View key={index} style={styles.exerciseItem}>
        <Text>Name: {exercise.name}</Text>
        <Text>Muscle Group: {exercise.muscleGroup}</Text>
        <Text>Sets: {exercise.sets}</Text>
        <Text>Reps: {exercise.reps}</Text>
      </View>
    ))}
  </View>

)}

             </View>
           )}
         />
         
          ) : (
            <Text style={styles.noProgramsText}>No Programs Scheduled for this date</Text>
          )}
        </View>
      )}
    </View>
        </ScrollView>
    
  );
};

export default ScheduleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  scrollContainer: {
    paddingBottom: 20, // Extra space at the bottom for smoother scrolling
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign:'center',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.light.tint,
  },
  exerciseHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    color: Colors.light.tint,
  },
  exerciseItem: {
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    marginBottom: 4,
    elevation: 1,
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





