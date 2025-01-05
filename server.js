const express = require('express');
const axios = require('axios');
const cors = require('cors'); // To allow cross-origin requests
const app = express();
const PORT = 3000;
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.get('/api/nutrition-info', async (req, res) => {
  const {
    measurement_units,
    sex,
    age_value,
    age_type,
    feet,
    inches,
    lbs,
    activity_level,
  } = req.body;

  const options = {
    method: 'GET',
    url: 'https://nutrition-calculator.p.rapidapi.com/api/nutrition-info',
    params: {
      measurement_units,
      sex,
      age_value,
      age_type,
      feet,
      inches,
      lbs,
      activity_level,
    },
    headers: {
      'x-rapidapi-key': 'f2d3bb909amsh6900a426a40eabep10efc1jsn24e7f3d354d7',
      'x-rapidapi-host': 'nutrition-calculator.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition data' });
  }
});

app.get('/api/exercises/:muscleGroup', async (req, res) => {
  const { muscleGroup } = req.params;

  const options = {
    method: 'GET',
    url: `https://exercisedb.p.rapidapi.com/exercises/target/${muscleGroup.toLowerCase()}`,
    params: {
      limit: '200',
      offset: '0',
    },
    headers: {
      'x-rapidapi-key': 'f2d3bb909amsh6900a426a40eabep10efc1jsn24e7f3d354d7',
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching exercises:', error.message);
    res.status(500).json({ error: 'Failed to fetch exercises. Please try again later.' });
  }
});
app.get('/api/challenges', async (req, res) => {
  const options = {
    method: 'GET',
    url: 'https://exercisedb.p.rapidapi.com/exercises/equipment/body weight',
    params: {
      limit: '150',
      offset: '0'
    },
    headers: {
      'x-rapidapi-key': 'f2d3bb909amsh6900a426a40eabep10efc1jsn24e7f3d354d7',
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    res.json(response.data); // Send data to the frontend
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});
app.get('/api/cardiochallenges', async (req, res) => {
  const options = {
    method: 'GET',
    url: 'https://exercisedb.p.rapidapi.com/exercises/bodyPart/cardio',
    params: {
      limit: '150',
      offset: '0'
    },
    headers: {
      'x-rapidapi-key': 'f2d3bb909amsh6900a426a40eabep10efc1jsn24e7f3d354d7',
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    res.json(response.data); // Send data to the frontend
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});
app.get('/recipes', async (req, res) => {
    const {
      protein,
      additionalIngredient,
      intolerance,
      excludeIngredient,
      recipeType,
      dietaryType,
    } = req.query;
  
    // Combine 'protein' and 'additionalIngredient' into a single includeIngredients string
    const includeIngredients = [protein, additionalIngredient]
      .filter(Boolean) // Filter out any falsy values
      .join(',');
  
    // Ensure dietaryType is lowercase for Spoonacular API
    const formattedDietaryType = dietaryType ? dietaryType.toLowerCase() : undefined;
  
    // Spoonacular API request options
    const options = {
      method: 'GET',
      url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch',
      params: {
        query: 'entree', // Fixed value as per your clarification
        includeIngredients: includeIngredients || undefined,
        intolerances: intolerance || undefined,
        excludeIngredients: excludeIngredient || undefined,
        diet: formattedDietaryType || undefined,
        type: recipeType || 'main course',
        addRecipeInformation: 'true',
    addRecipeInstructions: 'true',
    addRecipeNutrition: 'true',
    ignorePantry: 'true',
    sort: 'max-used-ingredients',
        number: '30',
      },
      headers: {
        'x-rapidapi-key': 'f2d3bb909amsh6900a426a40eabep10efc1jsn24e7f3d354d7',
        'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
      },
    };
  
    try {
      // Log the API call for debugging
      // Make the API request
      const response = await axios.request(options);
  
      // Send the data back to the front-end
      res.json(response.data.results || []);
    } catch (error) {
      console.error('Error fetching recipes:', error.message || error);
      res.status(500).json({ error: 'Failed to fetch recipes', details: error.message });
    }
  });

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
