
export interface Ingredient {
  name: string;
  spoilageTime: string;
  category: string;
}

export interface Recipe {
  title: string;
  description: string;
  ingredientsUsed: string[];
  instructions: string;
}

export interface Meal {
    name: string;
    calories: number;
    protein: number; // in grams
    carbs: number; // in grams
    fat: number; // in grams
    micronutrients: string; // A descriptive string
    imagePrompt: string; // A prompt for the image generation model
    instructions: string; // Detailed preparation instructions
    imageUrl?: string; // The base64 URL of the generated image
    isImageLoading?: boolean; // To track on-demand image generation
}

export interface DailyMeal {
  breakfast: Meal;
  morningSnack: Meal;
  lunch: Meal;
  afternoonSnack: Meal;
  dinner: Meal;
  waterIntakeLiters: number;
}

export interface WeeklyMealPlan {
    sunday: DailyMeal;
    monday: DailyMeal;
    tuesday: DailyMeal;
    wednesday: DailyMeal;
    thursday: DailyMeal;
    friday: DailyMeal;
    saturday: DailyMeal;
}

export interface AnalysisResult {
  identifiedIngredients: Ingredient[];
  recipeSuggestions: Recipe[];
}

export interface PurchaseRecord {
    id: string;
    date: string;
    ingredients: Ingredient[];
}

export interface DailyRequirements {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface FamilyMember {
    id: string;
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
    goal: 'lose_weight' | 'maintain_weight' | 'gain_muscle' | 'healthy_growth';
    dailyRequirements: DailyRequirements;
}

export interface ComplementarySuggestion {
    productName: string;
    reason: string;
}

export interface ExpiringItem {
    name: string;
    daysLeft: number;
}

export interface SuggestionItem {
    item: string;
    category: string;
    reason: string;
}

export interface NutritionalAssessment {
    score: number; // 1 to 10
    summary: string;
    missingGroups: string[];
    suggestions: SuggestionItem[];
}

export interface ShoppingListItem {
    id: string;
    name: string;
    category: string;
    checked: boolean;
}

export interface ExtraFoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}
