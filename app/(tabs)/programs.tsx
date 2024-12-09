import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  TextInput,
} from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { router } from 'expo-router';
import programsData from '../../exercises/programs.json';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker'; // For web
import 'react-datepicker/dist/react-datepicker.css';

type Exercise = { name: string; muscleGroup: string; sets: number; reps: any };
type Program = { name: string; exercises: Exercise[] };

export default function ProgramsScreen() {
  const [recommendedPrograms, setRecommendedPrograms] = useState<Program[]>([]);
  const [savedPrograms, setSavedPrograms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        generateRecommendedPrograms();
      } else {
        router.replace('/SignInScreen');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateRecommendedPrograms = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const experience = userData?.experience || 'Beginner';

        const adjustSets = (sets: number): number => {
          if (experience === 'Beginner') return Math.ceil(sets / 3);
          if (experience === 'Intermediate') return Math.ceil(sets / 2);
          return sets;
        };

        const shuffled = programsData
          .sort(() => Math.random() - 0.5)
          .slice(0, 7)
          .map((program) => ({
            ...program,
            exercises: program.exercises.map((exercise) => ({
              ...exercise,
              sets: adjustSets(exercise.sets),
            })),
          }));

        setRecommendedPrograms(shuffled);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const saveToSchedule = async () => {
    if (!selectedProgram) return;

    const currentUser = auth.currentUser;

    if (currentUser) {
      const userScheduleRef = doc(db, 'schedules', currentUser.uid);
      const formattedDate = selectedDate.toISOString();

      try {
        await setDoc(
          userScheduleRef,
          {
            [formattedDate]: {
              programName: selectedProgram.name,
              exercises: selectedProgram.exercises,
            },
          },
          { merge: true }
        );

        Alert.alert('Success', `${selectedProgram.name} has been scheduled!`);
        setSavedPrograms([...savedPrograms, selectedProgram.name]);
        setModalVisible(false);
      } catch (error) {
        console.error('Error saving to schedule:', error);
        Alert.alert('Error', 'Failed to save program to schedule.');
      }
    }
  };

  const openScheduleModal = (program: Program) => {
    setSelectedProgram(program);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended Programs</Text>
      {loading ? (
        <Text>Loading programs...</Text>
      ) : (
        <FlatList
          data={recommendedPrograms}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <View style={styles.programCard}>
              <Text style={styles.programName}>{item.name}</Text>
              {item.exercises.map((exercise, index) => (
                <Text key={index} style={styles.exerciseText}>
                  {exercise.name} - {exercise.muscleGroup} ({exercise.sets} sets,{' '}
                  {exercise.reps} reps)
                </Text>
              ))}
              {!savedPrograms.includes(item.name) && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => openScheduleModal(item)}
                >
                  <Text style={styles.addButtonText}>Add to Schedule</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      {/* Schedule Modal */}
      {modalVisible && (
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Schedule Program</Text>
              <Text style={styles.modalProgramName}>
                {selectedProgram?.name}
              </Text>

              {Platform.OS === 'web' ? (
                // Web: Use react-datepicker
                <DatePicker
  selected={selectedDate}
  onChange={(date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  }}
  showTimeSelect
  dateFormat="Pp"
/>

              ) : (
                // Mobile: Use native DateTimePicker
                <>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => date && setSelectedDate(date)}
                  />
                  <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    display="spinner"
                    onChange={(event, date) => date && setSelectedDate(date)}
                  />
                </>
              )}

              <TouchableOpacity style={styles.saveButton} onPress={saveToSchedule}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F5F5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  programCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 3,
  },
  programName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  exerciseText: { fontSize: 14, color: '#555' },
  addButton: {
    marginTop: 12,
    backgroundColor: '#6200EE',
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  addButtonText: { color: '#FFF', fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  modalProgramName: {
    fontSize: 16,
    marginBottom: 15,
    color: '#6200EE',
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: '#6200EE',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFF', fontWeight: 'bold' },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#d3d3d3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#333', fontWeight: 'bold' },
});




