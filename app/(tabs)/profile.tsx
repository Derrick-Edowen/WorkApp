import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Button,
  Image,
  ActivityIndicator,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig'; // Import Firestore
import { doc, getDoc, getDocs, updateDoc, arrayUnion, collection, query, where } from 'firebase/firestore';
import AppleHealthKit, { HealthKitPermissions } from 'react-native-health';
import GoogleFit, { Scopes } from 'react-native-google-fit';
import { ThemedView } from '@/components/ThemedView';
import { getAuth } from 'firebase/auth';
import axios from 'axios';


export default function ProfileScreen() {
  type Recipe = {
    id: string;
    title: string;
    calories: number;
    carbohydrates: number;
    protein: number;
    fat: number;
    ingredients: string[]; // Array of strings
    instructions: string[]; // Array of strings
    weightPerServing:any;
    
  };

  type FriendProfile = {
    id: string;
    name: string;
    friendId: string;
    fitnessGoals?: string;
    privacySetting?: string;
    profileImage?: string;
  };
  interface UserInfo {
    gender: string;
    age: string; // or number, depending on your logic
    heightFeet: string; // or number
    heightInches: string; // or number
    weight: string;
    activityLevel: string;
  }
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<UserInfo | null>(null); // If data might be null initially
  const [friendId, setFriendId] = useState('');
  const [friendsList, setFriendsList] = useState<FriendProfile[]>([]);
  const [friendData, setFriendData] = useState<{ id: string; name: string } | null>(null);  const [activeTab, setActiveTab] = useState<'profile' | 'nutrition' | 'social'>('profile');
  const [steps, setSteps] = useState<number>(0);
  const [lastFetchedDate, setLastFetchedDate] = useState<string | null>(null);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const [mealName, setMealName] = useState<string>('');
const [calories, setCalories] = useState<number | null>(null);
const [carbs, setCarbs] = useState<number | null>(null);
const [protein, setProtein] = useState<number | null>(null);
const [fat, setFat] = useState<number | null>(null);
const [mealTime, setMealTime] = useState<string>('');
const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
const [nutritionData, setNutritionData] = useState(null);
const [loadingNutrition, setLoadingNutrition] = useState(true);  const [dietType, setDietType] = useState<string>(''); // User's diet type
  const [proteinOptions, setProteinOptions] = useState<string[]>([]); // Available proteins
  const [loadingProteins, setLoadingProteins] = useState(true); // For fetching proteins
  const [proteinAnimation] = useState(new Animated.Value(0));
  const colors = ['#FFB6C1', '#FFA07A', '#FFD700', '#90EE90', '#87CEFA', '#D8BFD8', '#FF69B4', '#FFA500'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserDiet(currentUser.uid);
        await fetchSavedRecipes(currentUser.uid);
        if (Platform.OS === 'ios') {
          requestHealthPermissions();
        } else if (Platform.OS === 'android') {
          requestGoogleFitPermissions();
        }
            } else {
        router.replace('/SignInScreen');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const friends = userData.friends || [];
          // Fetch profile data for each friendId in the list
          const friendsProfiles = await Promise.all(
            friends.map(async (friendId: string) => {
              const friendQuery = query(
                collection(db, "users"),
                where("friendId", "==", friendId)
              );
              const friendSnapshot = await getDocs(friendQuery);
              if (!friendSnapshot.empty) {
                // Assume friendId is unique, so take the first document
                const friendDoc = friendSnapshot.docs[0];
                return { id: friendDoc.id, ...(friendDoc.data() as FriendProfile) };
              } else {
                console.warn(`No user found with friendId: ${friendId}`);
                return null;
              }
            })
          );

          // Filter out any null entries (in case of unmatched friendIds)
          const validProfiles = friendsProfiles.filter(
            (profile): profile is FriendProfile => profile !== null
          );
          setFriendsList(validProfiles); // Update the state with the profiles
        } else {
          console.log("No user document found for this UID.");
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, []);
  
  
  useEffect(() => {
    // Check and reset steps if it's a new day
    if (lastFetchedDate !== currentDate) {
      setSteps(0);
      setLastFetchedDate(currentDate);

      // Fetch the steps automatically
      if (Platform.OS === 'ios') {
        fetchAppleSteps();
      } else {
        fetchGoogleFitSteps();
      }
    }
  }, [currentDate, lastFetchedDate]);

  const requestHealthPermissions = () => {
    const permissions: HealthKitPermissions = {
      permissions: {
        read: [AppleHealthKit.Constants.Permissions.StepCount],
        write: [], // Add write permissions if needed
      },
    };

    AppleHealthKit.initHealthKit(permissions, (error: string, results: any) => {
      if (error) {
        console.error('Error initializing HealthKit:', error);
        return;
      }
      fetchAppleSteps();
    });
  };

  // Fetch Steps from Apple HealthKit
  const fetchAppleSteps = () => {
    const options = {
      startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      endDate: new Date().toISOString(),
    };

    AppleHealthKit.getStepCount(options, (error: string, results: { value: number }) => {
      if (error) {
        console.error('Error fetching steps:', error);
        return;
      }
      setSteps(results.value);
    });
  };

  // Google Fit Permissions
  const requestGoogleFitPermissions = () => {
    const options = {
      scopes: [
        Scopes.FITNESS_ACTIVITY_READ,
        Scopes.FITNESS_ACTIVITY_WRITE,
      ],
    };
  
    // Check if already authorized
    if (!GoogleFit.isAuthorized) {
      // Request authorization
      GoogleFit.authorize(options)
        .then((authResult) => {
          if (authResult.success) {
            console.log('Google Fit authorized successfully!');
            fetchGoogleFitSteps();
          } else {
            console.error('Google Fit Authorization failed:', authResult.message);
          }
        })
        .catch((error) => {
          console.error('Error during Google Fit Authorization:', error);
        });
    } else {
      console.log('Google Fit already authorized!');
      fetchGoogleFitSteps();
    }
  };
  
  const fetchGoogleFitSteps = () => {
    const options = {
      startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      endDate: new Date().toISOString(),
    };
  
    GoogleFit.getDailyStepCountSamples(options)
      .then((res) => {
        const stepsData = res.find((data) => data.source === 'com.google.android.gms:estimated_steps');
        if (stepsData && stepsData.steps.length > 0) {
          const todaySteps = stepsData.steps.reduce((total, step) => total + step.value, 0);
          console.log('Total steps today:', todaySteps);
          setSteps(todaySteps); // Assuming setSteps is available in the scope
        }
      })
      .catch((error) => {
        console.error('Error fetching steps:', error);
      });
  };
  // Fetch user's diet type from Firestore
  const fetchUserDiet = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid); // Example: Users collection
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const userData1 = userSnap.data() as UserInfo;
        setInfo(userData1);
        const userDiet = userData.dietaryType || 'standard'; // Fallback to 'standard'
        setDietType(userDiet);
        console.log(userData1)
        determineProteins(userDiet);
      } else {
        Alert.alert('Error', 'No user data found!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user diet.');
    }
  };
  {/*
  useEffect(() => {
    const fetchNutritionData = async () => {
      if (!info) return; // Ensure info is loaded
      const {
        gender,
        age,
        heightFeet,
        heightInches,
        weight,
        activityLevel,
      } = info;
      
      // Convert the extracted values to numbers
      const sex = gender.toLowerCase(); // Convert to lowercase
      const age_value = Number(age); // Convert age to a number
      const feet = Number(heightFeet); // Convert heightFeet to a number
      const inches = Number(heightInches); // Convert heightInches to a number
      const lbs = Number(weight.replace(/\D/g, '')); // Extract numeric part from weight and convert to number
      
      // Debugging: Log the values to ensure they are correct
      
      try {
        const response = await axios.get('http://localhost:3000/api/nutrition-info', {
          params: {
            measurement_units: 'std',
            sex,
            age_value,
            age_type: 'yrs',
            feet,
            inches,
            lbs,
            activity_level: activityLevel,
          },
        });

        setNutritionData(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching nutrition data:', error);
      } finally {
        setLoadingNutrition(false);
      }
    };

    fetchNutritionData();
  }, [info]);*/}
  const fetchSavedRecipes = async (uid: string) => {
    try {
      // Reference the savedRecipes subcollection
      const savedRecipesRef = collection(db, 'users', uid, 'savedRecipes');
  
      // Fetch all documents in the subcollection
      const querySnapshot = await getDocs(savedRecipesRef);
  
      // Map documents into an array of recipe objects
      const recipes: Recipe[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "Untitled", // Fallback for missing title
          calories: data.calories || 0, // Fallback for missing calories
          carbohydrates: data.carbohydrates || 0, // Fallback for missing carbohydrates
          protein: data.protein || 0, // Fallback for missing protein
          fat: data.fat || 0, // Fallback for missing fat
          ingredients: data.ingredients || [],
          instructions: data.instructions || "",
          weightPerServing:data.weightPerServing || []
        };
      });
  
      // Update state with the array of recipes
      setSavedRecipes(recipes);
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
      Alert.alert('Error', 'Failed to fetch saved recipes.');
    }
  };
  const handleAddMeal = () => {
    if (!mealName || !calories || !carbs || !protein || !fat || !mealTime) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
  
    const meal = {
      name: mealName,
      calories,
      carbs,
      protein,
      fat,
      time: mealTime,
    };
  
    // Replace this with logic to save to a calorie tracker or database
    Alert.alert('Success', 'Meal added to your calorie tracker!');
    
    // Reset fields
    setMealName('');
    setCalories(null);
    setCarbs(null);
    setProtein(null);
    setFat(null);
    setMealTime('');
  };

  
  // Determine available proteins based on diet type
  const determineProteins = (diet: string) => {
    let proteins: string[] = [];
    switch (diet) {
      case 'Vegetarian':
        proteins = ['Tofu', 'Tempeh', 'Lentils', 'Chickpeas'];
        break;
      case 'Vegan':
        proteins = ['Tofu', 'Seitan', 'Beans', 'Peas'];
        break;
      case 'Pescatarian':
        proteins = ['Salmon','Tilipia','Shrimp','Tuna','Sardines','Cod'];
        break;
      case 'Keto':
        proteins = ['Chicken', 'Beef', 'Pork', 'Eggs', 'Fish'];
        break;
      default:
        proteins = ['Chicken', 'Beef', 'Fish', 'Pork', 'Tofu']; // Default/Standard
        break;
    }

    setProteinOptions(proteins);
    setLoadingProteins(false);

    // Animate the protein cards
    Animated.timing(proteinAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleProteinPress = (protein: string) => {
    router.push({
      pathname: '/dietdetails',
      params: { protein },
    });
  };
  const handleViewRecipe = (recipeId: string) => {
    setExpandedRecipe((prev) => (prev === recipeId ? null : recipeId));
  };
  
  const handleAddFriend = async (inputFriendId: string) => {
    if (!inputFriendId.trim()) {
      Alert.alert('Error', 'Please enter a valid Friend ID.');
      return;
    }
  
    try {
      // Reference the `users` collection
      const usersCollection = collection(db, 'users');
  
      // Get all user documents
      const querySnapshot = await getDocs(usersCollection);
  
      // Search for the user with the matching friendId
      let matchedUser = null;
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.friendId === inputFriendId) {
          matchedUser = { id: doc.id, name: userData.name, friendId: userData.friendId, privacySetting: userData.privacySetting, fitnessGoals: userData.fitnessGoals || 'Unnamed User' };
        }
      });
  
      if (!matchedUser) {
        Alert.alert('Error', 'No user found with the entered Friend ID.');
        return;
      }
  
      console.log('Matched User Data:', matchedUser);
  
      // Update state to display the matched friend's information
      setFriendData(matchedUser);
  
      Alert.alert('Success', `Found Friend: ${matchedUser.name}`);
      setFriendId(''); // Clear the input field
    } catch (error) {
      console.error('Error finding friend:', error);
      Alert.alert('Error', 'An error occurred while searching for the Friend ID.');
    }
  };
  const handleAddToFriendsList = async (friendId: string) => {
    if (!friendId) return;
  
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to add friends.');
        return;
      }
  
      const userDocRef = doc(db, 'users', user.uid);
  
      // Fetch current user's data
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        Alert.alert('Error', 'User data not found.');
        return;
      }
  
      const userData = userDocSnap.data();
      const currentFriends = userData?.friends || [];
  
      // Check for duplicates
      if (currentFriends.includes(friendId)) {
        Alert.alert('Error', 'This friend is already in your friends list.');
        return;
      }
  
      // Add the friendId to the 'friends' array
      await updateDoc(userDocRef, {
        friends: arrayUnion(friendId), // Add the friendId
      });
  
      Alert.alert('Success', 'Friend added successfully!');
    } catch (error) {
      console.error('Error adding friend to list:', error);
      Alert.alert('Error', 'Failed to add friend.');
    }
  };
  const handleViewProfile = async (friendId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
  
      // Fetch the friend's profile data based on the friendId field
      const friendQuery = query(
        collection(db, 'users'),
        where('friendId', '==', friendId) // Searching for friendId field, not the doc ID
      );
      const friendSnapshot = await getDocs(friendQuery);
  
      if (!friendSnapshot.empty) {
        const friendData = friendSnapshot.docs[0].data(); // Get data of the first matching document
        router.push({
          pathname: '/SocialPage',
          params: {
            friend: JSON.stringify(friendData), // Send the full friend's data
          },
        });
      } else {
        console.warn(`No friend found with ID: ${friendId}`);
      }
    } catch (error) {
      console.error('Error fetching friend profile:', error);
    }
  };
  
  
  
  

  
  const renderDietTab = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.dietContainer}>
<>
        <View style={styles.dietContainer}>
        {/* Existing Daily Calorie Tracker Section */}
        <View>
          <Text style={styles.cardTitle}>Nutritional Data</Text>
          {loadingNutrition ? (
            <View style={styles.loadingContainer}>
              <Text>Loading nutritional data...</Text>
              <ActivityIndicator size="large" color="#6200EE" />
            </View>
          ) : nutritionData ? (
            <View style={styles.nutritionCard}>
    <Text style={styles.nutritionText}>
      Estimated Calories: {nutritionData.calories || 'Unknown'} kcal
    </Text>
    <Text style={styles.nutritionText}>
      Protein: {nutritionData.protein || 'Unknown'}g
    </Text>
    <Text style={styles.nutritionText}>
      Carbs: {nutritionData.carbohydrates || 'Unknown'}g
    </Text>
    <Text style={styles.nutritionText}>
      Fat: {nutritionData.fat || 'Unknown'}g
    </Text>
  </View>
          ) : (
            <Text>Unable to fetch nutritional data. Please try again later.</Text>
          )}
        </View>
        </View>
            <View style={styles.mealInputCard}>
          <Text style={styles.cardTitle}>Daily Calorie Tracker</Text>

          <TextInput
            placeholder="Name"
            style={styles.input}
            onChangeText={(text) => setMealName(text)}
          />

          <View style={styles.inputRow}>
            <TextInput
              placeholder="Est. Calories"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
              onChangeText={(text) => setCalories(Number(text))}
            />
            <TextInput
              placeholder="Carbs (g)"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
              onChangeText={(text) => setCarbs(Number(text))}
            />
          </View>

          <View style={styles.inputRow}>
            <TextInput
              placeholder="Protein (g)"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
              onChangeText={(text) => setProtein(Number(text))}
            />
            <TextInput
              placeholder="Fat (g)"
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
              onChangeText={(text) => setFat(Number(text))}
            />
          </View>

          <TextInput
            placeholder="Time (e.g., Breakfast, Lunch, Dinner)"
            style={styles.input}
            onChangeText={(text) => setMealTime(text)}
          />

          <Button
            title="Add to Calorie Tracker"
            onPress={handleAddMeal}
            color="#6200EE"
          />
        </View>
        <Text style={styles.sectionTitle}>Find Recipes</Text>
        <Animated.View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          transform: [{ translateY: proteinAnimation.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) }],
          opacity: proteinAnimation,
        }}
      >
        {proteinOptions.map((protein, index) => (
          <TouchableOpacity
            key={protein}
            style={[
              styles.proteinCard,
              { backgroundColor: colors[index % colors.length] }, // Cycle through colors
            ]}
            onPress={() => handleProteinPress(protein)}
          >
            <Text style={styles.proteinText}>{protein}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
      <Text style={styles.sectionTitle}>Saved Recipes</Text>
      <View style={styles.savedRecipesContainer}>
        {savedRecipes.length > 0 ? (
          savedRecipes.map((recipe, index) => (
            <View key={index} style={styles.recipeCard}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <Text style={styles.recipeDetails}>
                {recipe.calories} kcal | {recipe.carbohydrates}g carbs |{' '}
                {recipe.protein}g protein | {recipe.fat}g fat
              </Text>
              
              <Button
                title={
                  expandedRecipe === recipe.id ? 'Hide Recipe' : 'View Recipe'
                }
                onPress={() => handleViewRecipe(recipe.id)}
                color="#6200EE"
              />
              {expandedRecipe === recipe.id && (
                <View style={styles.recipeDetailsContainer}>
                  <Text style={styles.recipeDetailText}>
                    Serving Size: {recipe.weightPerServing.amount}{recipe.weightPerServing.unit} per serving
                  </Text>
                  <Text style={styles.recipeDetailText}>Ingredients:</Text>
  {recipe.ingredients.map((ingredient, index) => (
    <Text key={index} style={styles.recipeDetailText}>
      • {typeof ingredient === "object" ? ingredient.name || "Unknown" : ingredient}
    </Text>
  ))}

<Text style={styles.recipeDetailText}>
  Instructions:{"\n"}
  {recipe.instructions
    .map((step, index) => 
      typeof step === "object" 
        ? `${index + 1}. ${step.step || "No instruction provided"}`
        : `${index + 1}. ${step}`
    )
    .join("\n")}
</Text>


                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noRecipesText}>No saved recipes yet!</Text>
        )}
      </View>
      </>
      
    </View>
    </ScrollView>

  );

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
             <ThemedView style={styles.container}>
            <Text style={styles.dateText}>Fitness Data</Text>
            <Text style={styles.dateMini}>{currentDate}</Text>
            <View style={styles.statsContainer}>
              <Text style={styles.statText}>Steps Taken: {steps}</Text>
            </View>
          </ThemedView>
          </>
        );
      case 'nutrition':
        return renderDietTab();
        case 'social':
          return (
            <>
              <ScrollView style={styles.container}>


                                {/* Connect with Friends Section */}
                                <Text style={styles.infoText}>
                  Connect with other users, view completed challenges, and share your goals.
                </Text>
                                <View style={styles.socialSection}>
                  <Text style={styles.subSectionTitle}>Connect with Friends</Text>
        
                  {/* Input for Friend ID */}
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Friend ID"
                    value={friendId}
                    onChangeText={(text) => setFriendId(text)}
                  />
        
                  {/* Connect Button */}
                  <TouchableOpacity
                    style={styles.addFriendButton}
                    onPress={() => handleAddFriend(friendId)}
                    disabled={!friendId}
                  >
                    <Text style={styles.addFriendText}>Connect</Text>
                  </TouchableOpacity>
                  {/* Display Friend Card */}
                {friendData ? (
                  <View style={styles.friendCard}>
                    {/* Left Section: Image and Name */}
                    <View style={styles.friendLeftSection}>
                      <Image
                        source={{
                          uri: friendData.profileImage || 'https://storage.googleapis.com/realestate-images/headshotfemale.jpg',
                        }}
                        style={styles.friendImage}
                      />
                      <Text style={styles.friendName}>{friendData.name}</Text>
                    </View>
        
                    {/* Middle Section: Fitness Goals, Friend ID, and Privacy Setting */}
                    <View style={styles.friendMiddleSection}>
                      <Text style={styles.friendGoals}>
                        Fitness Goals: {friendData.fitnessGoals || 'N/A'}
                      </Text>
                      <Text style={styles.friendId}>Friend ID: {friendData.friendId}</Text>
                      <Text style={styles.friendPrivacy}>
                        Privacy: {friendData.privacySetting || 'N/A'}
                      </Text>
                    </View>
        
                    {/* Right Section: Add Friend Button */}
                    <View style={styles.friendRightSection}>
                      <TouchableOpacity
                        style={styles.addFriendToListButton}
                        onPress={() => handleAddToFriendsList(friendData.friendId)}
                      >
                        <Text style={styles.addFriendText}>Add Friend</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.noFriendText}>
                    No friend data available. Try searching for a Friend ID!
                  </Text>
                )}
                </View>
                {/* Friends Section */}
                <View style={styles.friendsSection}>
                  <Text style={styles.subSectionTitle}>Your Friends</Text>
        
                  {friendsList.length > 0 ? (
                    friendsList.map((friend) => (
                      <View key={friend.friendId} style={styles.friendCard}>
                        {/* Left Section: Image and Name */}
                        <View style={styles.friendLeftSection}>
                          <Image
                            source={{
                              uri: friend.profileImage || 'https://storage.googleapis.com/realestate-images/headshotfemale.jpg',
                            }}
                            style={styles.friendImage}
                          />
                          <Text style={styles.friendName}>{friend.name}</Text>
                        </View>
        
                        {/* Middle Section: Fitness Goals, Friend ID, and Privacy Setting */}
                        <View style={styles.friendMiddleSection}>
                          <Text style={styles.friendGoals}>
                            Fitness Goals: {friend.fitnessGoals || 'N/A'}
                          </Text>
                          <Text style={styles.friendId}>Friend ID: {friend.friendId}</Text>
                          <Text style={styles.friendPrivacy}>
                            Privacy: {friend.privacySetting || 'N/A'}
                          </Text>
                        </View>
        
                        {/* Right Section: View Profile Button */}
                        <View style={styles.friendRightSection}>
                        <TouchableOpacity
  style={styles.viewProfileButton}
  onPress={() => handleViewProfile(friend.friendId)}
>
  <Text style={styles.viewProfileText}>View Profile</Text>
</TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noFriendText}>
                      You haven’t added any friends yet. Connect with others!
                    </Text>
                  )}
                </View>
        

        

        
                
              </ScrollView>
            </>
          );
        
        
      default:
        return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.tabContainer}>
        {['profile', 'nutrition', 'social'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as typeof activeTab)}
          >
            <Text style={styles.tabText}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Content */}
      <View style={styles.contentContainer}>{renderActiveTabContent()}</View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  tabButton: { paddingVertical: 12 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#6200EE' },
  tabText: { fontSize: 16, fontWeight: 'bold' },
  contentContainer: { flex: 1, padding: 16 },
  dietContainer: { flex: 1, alignItems: 'center' },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, marginBottom: 16 },
  proteinCard: {
    backgroundColor: '#6200EE',
    width: '48.5%', // Adjust width to fit two columns with spacing
    height: 150,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8, // Vertical spacing between rows
    elevation: 3,
    alignItems: 'center', // Center text horizontally
  },
  refreshButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  nutritionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
    borderWidth: 1,
    borderColor: '#ddd',
  },
  nutritionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  mealInputCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  savedRecipesContainer: {
    marginTop: 20,
  },
  recipeCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign:'center',
    marginBottom: 5,
  },
  recipeDetailsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  recipeDetailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  recipeDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  noRecipesText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
    color: '#6200EE',
  },
  friendsSection: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  friendLeftSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  friendName: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  friendMiddleSection: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  friendGoals: {
    fontSize: 12,
    marginBottom: 5,
  },
  friendId: {
    fontSize: 12,
    color: '#555',
  },
  friendPrivacy: {
    fontSize: 12,
    color: '#555',
  },
  friendRightSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileButton: {
    backgroundColor: '#28a745',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  viewProfileText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noFriendText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  addFriendToListButton: {
    backgroundColor: '#6200EE',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addFriendText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  dateMini: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
    color: '#6200EE',
  },
  scrollContainer: {
    paddingBottom: 20, // Extra space at the bottom for smoother scrolling
  },
  statsContainer: { alignItems: 'center', marginVertical: 16 },
  statText: { fontSize: 18, marginBottom: 12, color: '#444' },
  proteinText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign:'center',
    color: '#6200EE',
  },
  sectionMini: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign:'center',
    color: '#6200EE',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  signOutButton: {
    backgroundColor: '#E53935',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign:'center',
    marginBottom: 10,
  },
  addFriendButton: {
    backgroundColor: '#6200EE',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  challengeCard: {
    padding: 10,
    backgroundColor: '#f4f4f4',
    borderRadius: 5,
    marginBottom: 10,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  challengeDate: {
    fontSize: 14,
    color: '#777',
  },
  goalsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  goalDetails: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  
});





