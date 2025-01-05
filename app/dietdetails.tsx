import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
  Button,
} from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { auth, db } from '../firebaseConfig'; // Import Firestore
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface Ingredient {
    name: string;
  }
  
  interface Recipe {
    id: number;
    title: string;
    nutrition: {
      nutrients: any[];
      caloricBreakdown: {
        percentProtein: number;
        percentFat: number;
        percentCarbs: number;
      };
      ingredients: Ingredient[]; // Explicitly typed as an array of `Ingredient`
      weightPerServing: {
        amount: number;
        unit: string;
      };
    };
    analyzedInstructions: {
      steps: { step: string }[];
    }[];
  }
  
export default function DietDetails() {
  const { protein } = useLocalSearchParams(); // Get selected protein from params
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation();
  const [expandedRecipeId, setExpandedRecipeId] = useState<number | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-150)).current; // Start above the screen
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]); // Track saved recipes

  // States for dropdown selections
  const [intolerance, setIntolerance] = useState<string>(''); // Selected intolerance
  const [excludeIngredient, setExcludeIngredient] = useState<string>(''); // Ingredient to exclude
  const [recipeType, setRecipeType] = useState<string>('main course'); // Recipe type
  const [additionalIngredient, setAdditionalIngredient] = useState<string>(''); // Additional included ingredient
  const lightColors = ['#FFFBCC', '#E8F5E9', '#E3F2FD', '#FCE4EC', '#F3E5F5']; // Array of light colors
  // User's dietary type (replace with actual logic to retrieve user profile data)
  const [dietaryType, setDietaryType] = useState<string>(''); // Example dietary type

  useEffect(() => {
    const user = auth.currentUser; // Get the currently logged-in user
    if (user) {
      fetchUserDiet(user.uid); // Pass the 'uid' to fetchUserDiet
    } else {
      Alert.alert('Error', 'User not logged in.');
    }
  }, [protein]);
  
  useEffect(() => {
    // Update the header title when dietaryType is set
    if (dietaryType) {
      navigation.setOptions({
        headerTitle: `Recipes - ${dietaryType} Diet`,
      });
    }
  }, [dietaryType]);
  


  const fetchUserDiet = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid); // Example: Users collection
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const userDiet = userData.dietaryType || 'standard'; // Fallback to 'standard'
        setDietaryType(userDiet);
      } else {
        Alert.alert('Error', 'No user data found!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user diet.');
    }
  };
  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/recipes', {
        params: {
          protein: protein,
          additionalIngredient: additionalIngredient,
          intolerance: intolerance,
          excludeIngredient: excludeIngredient,
          recipeType: recipeType,
          dietaryType: dietaryType, // Pass the user's dietary type
        },
      });
      setRecipes(response.data);
      console.log(recipes);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to fetch recipes.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = () => {
    setNotificationVisible(true);
    Animated.timing(slideAnim, {
      toValue: 4, // Move into view from the top
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => hideNotification(), 8000); // Automatically hide after 6 seconds
    });
  };
  
  const hideNotification = () => {
    Animated.timing(slideAnim, {
      toValue: -150, // Move out of view above the screen
      duration: 500,
      useNativeDriver: true,
    }).start(() => setNotificationVisible(false));
  };
  
  
  const saveRecipe = async (recipe: Recipe) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You need to log in to save recipes.');
        return;
      }

      const displayedRecipe = {
        id: recipe.id,
        title: recipe.title || 'Unknown Title',
        weightPerServing: recipe.nutrition.weightPerServing,
        calories: recipe.nutrition.nutrients[0]?.amount,
        caloriesUnit: recipe.nutrition.nutrients[0]?.unit,
        protein: recipe.nutrition.nutrients[10]?.amount,
        proteinUnit: recipe.nutrition.nutrients[10]?.unit,
        fat: recipe.nutrition.nutrients[1]?.amount,
        fatUnit: recipe.nutrition.nutrients[1]?.unit,
        carbohydrates: recipe.nutrition.nutrients[3]?.amount,
        carbohydratesUnit: recipe.nutrition.nutrients[3]?.unit,
        caloricBreakdown: recipe.nutrition.caloricBreakdown,
        ingredients: recipe.nutrition.ingredients.map((ingredient) => ({
          name: ingredient.name || 'No ingredient name available',
        })),
        instructions: recipe.analyzedInstructions[0]?.steps.map((step) => ({
          step: step.step || 'No instruction available',
        })),
      };

      const recipeRef = doc(db, 'users', user.uid, 'savedRecipes', recipe.id.toString());
      await setDoc(recipeRef, displayedRecipe);

      setSavedRecipes((prev) => [...prev, recipe.id.toString()]);
      showNotification();
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save the recipe. Please try again.');
    }
  };
  
  const toggleRecipeDetails = (id: number) => {
    setExpandedRecipeId((prevId) => (prevId === id ? null : id));
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{protein}</Text>

      {/* Picker for Recipe Type */}
      <Text style={styles.label}>Recipe Type</Text>
      <Picker
        selectedValue={recipeType}
        onValueChange={(value) => setRecipeType(value)}
        style={styles.picker}
      >
        <Picker.Item label="Main Course" value="main course" />
        <Picker.Item label="Appetizer" value="appetizer" />
        <Picker.Item label="Breakfast" value="breakfast" />
      </Picker>

      {/* Picker for Intolerances */}
      <Text style={styles.label}>Intolerances</Text>
      <Picker
        selectedValue={intolerance}
        onValueChange={(value) => setIntolerance(value)}
        style={styles.picker}
      >
        <Picker.Item label="None" value="" />
        <Picker.Item label="Gluten" value="gluten" />
        <Picker.Item label="Dairy" value="dairy" />
        <Picker.Item label="Egg" value="egg" />
        <Picker.Item label="Soy" value="soy" />
        <Picker.Item label="Peanut" value="peanut" />
      </Picker>

      {/* Picker for Included Ingredients */}
      <Text style={styles.label}>Include Ingredients</Text>
      <Picker
        selectedValue={additionalIngredient}
        onValueChange={(value) => setAdditionalIngredient(value)}
        style={styles.picker}
      >
        <Picker.Item label="None" value="" />
        <Picker.Item label="Cheese" value="cheese" />
        <Picker.Item label="Rice" value="rice" />
        <Picker.Item label="Pasta" value="pasta" />
        <Picker.Item label="Potatoes" value="potato" />
        <Picker.Item label="Bread" value="bread" />
        <Picker.Item label="Quinoa" value="quinoa" />
      </Picker>
      <Text style={styles.label}>Exclude Ingredients</Text>

      <Picker
        selectedValue={excludeIngredient}
        onValueChange={(value) => setExcludeIngredient(value)}
        style={styles.picker}
      >
        <Picker.Item label="None" value="" />
        <Picker.Item label="Cheese" value="cheese" />
        <Picker.Item label="Milk" value="milk" />
        <Picker.Item label="Eggs" value="eggs" />
      </Picker>
      {/* Search Button */}
      <Button title="Search Recipes" onPress={fetchRecipes} color="#6200EE" />

      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" />
      ) : (
<FlatList
  data={recipes}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item, index }) => (
    <View
      style={[
        styles.recipeCard,
        { backgroundColor: lightColors[index % lightColors.length] }, // Cycle through colors
      ]}
    >
<Text style={styles.recipeTitle} onPress={() => toggleRecipeDetails(item.id)}>
  {item.title || "Unknown Title"}{" "}
  ({item.nutrition.weightPerServing?.amount ?? "N/A"}
  {item.nutrition.weightPerServing?.unit || "unit"}{" "}
  per serving)
</Text>
      <Text style={styles.recipeInfo}>{"\n"}
        Calories: {item.nutrition.nutrients[0].amount}{' '}
        {item.nutrition.nutrients[0].unit}
      </Text>
      <Text style={styles.recipeInfo}>
        Protein: {item.nutrition.nutrients[10].amount}{' '}
        {item.nutrition.nutrients[10].unit}
      </Text>
      <Text style={styles.recipeInfo}>
        Fat: {item.nutrition.nutrients[1].amount}{' '}
        {item.nutrition.nutrients[1].unit}
      </Text>
      <Text style={styles.recipeInfo}>
        Carbohydrates: {item.nutrition.nutrients[3].amount}{' '}
        {item.nutrition.nutrients[3].unit}
      </Text>
      {expandedRecipeId === item.id && (
<>
      <Text style={styles.recipeInfo}>
      {"\n"}
      
  Caloric Breakdown (per serving):{"\n"}
  Daily Protein Percentage: {item.nutrition.caloricBreakdown.percentProtein}%{"\n"}
  Daily Fat Percentage: {item.nutrition.caloricBreakdown.percentFat}%{"\n"}
  Daily Carbs Percentage: {item.nutrition.caloricBreakdown.percentCarbs}%
</Text>

      <Text style={styles.recipeInfo}>{"\n"}Ingredients:</Text>
{item.nutrition.ingredients.map((ingredient, index) => (
  <Text key={index}>
    • {ingredient.name || "No ingredient name available"}
  </Text>
  
))}

<Text style={styles.recipeInfo}>{"\n"}
  Instructions:
</Text>
{item.analyzedInstructions[0]?.steps.map((step, index) => (
  <Text key={index}>
    {index + 1}. {step.step || "No instruction available"}
  </Text>
  
))}
 
 <Button 
                title={savedRecipes.includes(item.id.toString()) ? 'Recipe Saved' : 'Save Recipe'}
                onPress={() => saveRecipe(item)}
                color={savedRecipes.includes(item.id.toString()) ? 'grey' : '#6200EE'}
                disabled={savedRecipes.includes(item.id.toString())}
              />
      </>)}
    </View>
  )}
/>
      )}
{notificationVisible && (
  <Animated.View
    style={[
      styles.notification,
      { transform: [{ translateY: slideAnim }] }, // Slide down animation
    ]}
  >
    <Text>
      ✅ Recipe saved to collection.{' '}
      <Text onPress={() => router.replace('/profile')} style={styles.link}>
        View Recipes
      </Text>
    </Text>
  </Animated.View>
)}


    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4, color: '#6200EE', textAlign:'center' },
  label: { fontSize: 14, marginTop: 10, color: '#333' },
  picker: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 6,
    padding: 10
  },
  recipeCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 12,
    elevation: 2,
  },
  notification: {
    position: 'absolute',
    top: 0, // Align to the top of the screen
    left: 0,
    right: 0,
    borderRadius:5,
    backgroundColor: 'rgb(94, 94, 94)', // Light background for the notification
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d8ff',
    alignItems: 'center',
    zIndex: 10, // Ensure it's above other UI elements
  },
  link: {
    color: '#6200EE', // Highlight link in primary color
    textDecorationLine: 'underline',
  },
  notificationBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#dcdcdc",
    alignItems: "center",
  },
  notificationText: {
    color: "#333",
    fontSize: 16,
  },
  viewProfileLink: {
    color: "#6200EE",
    textDecorationLine: "underline",
  },
  recipeTitle: { fontSize: 16, fontWeight: 'bold' },
  recipeInfo: { fontSize: 14 },

});


