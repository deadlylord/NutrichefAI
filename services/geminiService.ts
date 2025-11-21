
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult, WeeklyMealPlan, FamilyMember, DailyRequirements, ComplementarySuggestion, NutritionalAssessment } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    identifiedIngredients: {
      type: Type.ARRAY,
      description: 'Lista de todos los ingredientes alimenticios identificados en las imágenes, sin duplicados. ESTRICTAMENTE EN ESPAÑOL.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Nombre común del ingrediente en ESPAÑOL (ej. "Tomate", "Leche", "Pollo").' },
          spoilageTime: { type: Type.STRING, description: 'Estimación REALISTA y CONSERVADORA del tiempo de vida útil. Para frutas y verduras frescas, asume madurez media (ej. "3-5 días"). Usa formato "X días" o "X semanas".' },
          category: { type: Type.STRING, description: 'Categoría del ingrediente en ESPAÑOL (ej. "Frutas y Verduras", "Carnes", "Lácteos", "Despensa").' }
        },
        required: ['name', 'spoilageTime', 'category']
      }
    },
    recipeSuggestions: {
      type: Type.ARRAY,
      description: 'Sugerencias de 3 recetas que usan los ingredientes identificados.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Título de la receta en Español.' },
          description: { type: Type.STRING, description: 'Breve descripción apetitosa.' },
          ingredientsUsed: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Lista de ingredientes usados.'
          },
          instructions: { type: Type.STRING, description: 'Pasos detallados.' }
        },
        required: ['title', 'description', 'ingredientsUsed', 'instructions']
      }
    }
  },
  required: ['identifiedIngredients', 'recipeSuggestions']
};

const mealSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'Nombre del plato.' },
        calories: { type: Type.NUMBER, description: 'Estimación de calorías totales.' },
        protein: { type: Type.NUMBER, description: 'Gramos de proteína.' },
        carbs: { type: Type.NUMBER, description: 'Gramos de carbohidratos.' },
        fat: { type: Type.NUMBER, description: 'Gramos de grasa.' },
        micronutrients: { type: Type.STRING, description: 'Breve lista de micronutrientes clave (ej. "Rico en Vitamina C, Hierro y Potasio").' },
        imagePrompt: { type: Type.STRING, description: 'Un prompt detallado y vívido en inglés para un modelo de generación de imágenes AI, estilo fotografía de alimentos editorial. Ejemplo: "Professional food photography of a traditional Colombian bandeja paisa, soft lighting, 4k resolution".' },
        instructions: { type: Type.STRING, description: 'Instrucciones de preparación paso a paso.' }
    },
    required: ['name', 'calories', 'protein', 'carbs', 'fat', 'micronutrients', 'imagePrompt', 'instructions']
};

const dailyRequirementsSchema = {
    type: Type.OBJECT,
    properties: {
        calories: { type: Type.NUMBER, description: 'Total daily calories.' },
        protein: { type: Type.NUMBER, description: 'Grams of protein per day.' },
        carbs: { type: Type.NUMBER, description: 'Grams of carbohydrates per day.' },
        fat: { type: Type.NUMBER, description: 'Grams of fat per day.' },
    },
    required: ['calories', 'protein', 'carbs', 'fat'],
};

const assessmentSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER, description: 'Puntaje de 1 a 10 indicando qué tan balanceada es la compra.' },
        summary: { type: Type.STRING, description: 'Resumen corto de 1 frase sobre el balance de la compra.' },
        missingGroups: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: 'Grupos alimenticios faltantes o bajos (ej: "Proteínas", "Fibra").' 
        },
        suggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    item: { type: Type.STRING, description: 'Producto específico sugerido para comprar.' },
                    category: { type: Type.STRING, description: 'Categoría del producto.' },
                    reason: { type: Type.STRING, description: 'Por qué ayuda al balance.' }
                },
                required: ['item', 'category', 'reason']
            }
        }
    },
    required: ['score', 'summary', 'missingGroups', 'suggestions']
};

export const calculateDailyRequirements = async (
    memberInfo: Omit<FamilyMember, 'id' | 'dailyRequirements'>
): Promise<DailyRequirements> => {
    const { age, gender, activityLevel, goal } = memberInfo;

    const prompt = `
        Calcula necesidades nutricionales para:
        - Edad: ${age}
        - Género: ${gender}
        - Actividad: ${activityLevel}
        - Objetivo: ${goal}
        
        Responde JSON.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: dailyRequirementsSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as DailyRequirements;
    } catch (error) {
        console.error("Error calculating daily requirements:", error);
        throw new Error("Failed to calculate daily requirements.");
    }
};


export const analyzeGroceryImages = async (
  imagesBase64: string[]
): Promise<AnalysisResult> => {
  const prompt = `
    Eres NutriChef AI, un experto culinario. Analiza las imágenes de compras.
    
    IMPORTANTE:
    1.  **IDIOMA**: Devuelve TODO el contenido (nombres de ingredientes, recetas, descripciones) estricta y exclusivamente en **ESPAÑOL**.
    2.  **PRECISIÓN DE VENCIMIENTO**: Para frutas y verduras frescas, sé **conservador**. Asume que ya han pasado tiempo en el estante. 
        - Ejemplo: Fresas (2-3 días), Bananos (3-5 días), Aguacate maduro (1-2 días). 
        - No des rangos amplios como "1-2 semanas" para productos delicados.
    
    Genera un JSON con:
    1.  **identifiedIngredients**: Lista de alimentos en ESPAÑOL. Categoría en español.
    2.  **recipeSuggestions**: 3 recetas usando estos ingredientes.
  `;

  const imageParts = imagesBase64.map(imgBase64 => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: imgBase64,
    },
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [...imageParts, { text: prompt }],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("No se pudo realizar el análisis. Intenta con una imagen más clara.");
  }
};

export const evaluateNutritionalBalance = async (
    ingredients: string[]
): Promise<NutritionalAssessment> => {
    const prompt = `
        Actúa como un Nutricionista Experto.
        Analiza esta lista de compras actual: [${ingredients.join(', ')}].
        
        Evalúa el balance nutricional de la compra (Proteínas, Carbohidratos, Grasas, Frutas/Verduras).
        Identifica qué grupos faltan o están bajos para una dieta saludable completa.
        Sugiere 5 alimentos específicos para AGREGAR a la lista de compras para balancear la despensa.
        
        Responde en ESPAÑOL JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: assessmentSchema,
            },
        });
        return JSON.parse(response.text.trim()) as NutritionalAssessment;
    } catch (error) {
        console.error("Error evaluating balance:", error);
        throw new Error("Error evaluando el balance nutricional.");
    }
};

export const generateWeeklyMealPlan = async (
    ingredients: string[],
    purchaseHistory: string[],
    familyProfile: FamilyMember[]
): Promise<WeeklyMealPlan> => {

    const weeklyMealPlanGenerationSchema = {
        type: Type.OBJECT,
        properties: {
            dailyPlans: {
                type: Type.ARRAY,
                description: 'Array de 7 días (sunday a saturday).',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.STRING, description: 'Nombre del día en inglés minúsculas (ej. "monday").' },
                        breakfast: mealSchema,
                        morningSnack: mealSchema,
                        lunch: mealSchema,
                        afternoonSnack: mealSchema,
                        dinner: mealSchema,
                        waterIntakeLiters: { type: Type.NUMBER },
                    },
                    required: ['day', 'breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner', 'waterIntakeLiters']
                }
            }
        },
        required: ['dailyPlans']
    };

    const familyDescription = familyProfile.map(p => `${p.name} (${p.age} años, objetivo: ${p.goal})`).join('; ');

    const prompt = `
        Crea un menú semanal saludable estilo COLOMBIANO.
        Ingredientes disponibles: [${ingredients.join(', ')}]
        Historial previo: [${purchaseHistory.join(', ')}]
        Familia: [${familyDescription}]

        REGLAS:
        1. Idioma: TODO EN ESPAÑOL.
        2. Prioriza usar los ingredientes disponibles.
        3. Si faltan ingredientes esenciales, asume que se comprarán (sugeridos previamente).
        4. Adaptación infantil para menores de 2 años.
        5. JSON estricto.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: weeklyMealPlanGenerationSchema,
            },
        });
        const jsonText = response.text.trim();
        const apiResponse = JSON.parse(jsonText);

        if (!apiResponse.dailyPlans || !Array.isArray(apiResponse.dailyPlans)) {
            throw new Error("Invalid meal plan structure.");
        }

        const plan = apiResponse.dailyPlans.reduce((acc, dayPlan) => {
            if (dayPlan && dayPlan.day) {
                acc[dayPlan.day.toLowerCase()] = {
                    breakfast: dayPlan.breakfast,
                    morningSnack: dayPlan.morningSnack,
                    lunch: dayPlan.lunch,
                    afternoonSnack: dayPlan.afternoonSnack,
                    dinner: dayPlan.dinner,
                    waterIntakeLiters: dayPlan.waterIntakeLiters,
                };
            }
            return acc;
        }, {});

        return plan as WeeklyMealPlan;

    } catch (error) {
        console.error("Error generating meal plan:", error);
        throw new Error("Error al generar el plan de comidas.");
    }
};

export const generateMealImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        return "";

    } catch (error) {
        console.error(`Error generating image:`, error);
        return "";
    }
};

export const getIngredientSuggestions = async (query: string, existingIngredients: string[]): Promise<string[]> => {
    if (!query) return [];

    const schema = {
        type: Type.OBJECT,
        properties: {
            suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        },
        required: ['suggestions']
    };

    const prompt = `
        Sugiere 5 ingredientes de supermercado (comida) en ESPAÑOL que comiencen con "${query}".
        No incluyas: [${existingIngredients.join(', ')}].
        Contexto: Cocina colombiana/latina.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const json = JSON.parse(response.text.trim());
        return json.suggestions || [];
    } catch (error) {
        console.error("Error getting ingredient suggestions:", error);
        return [];
    }
};

export const generateHealthTips = async (): Promise<string[]> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            }
        },
        required: ['tips']
    };

    const prompt = `
        Genera 7 consejos cortos y motivadores sobre nutrición y salud en ESPAÑOL para una familia colombiana.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const json = JSON.parse(response.text.trim());
        return json.tips || [];
    } catch (error) {
        console.error("Error generating health tips:", error);
        return ["Bebe más agua hoy.", "Come frutas y verduras."];
    }
};

export const generateComplementarySuggestions = async (
    weeklyMealPlan: WeeklyMealPlan,
    familyMembers: FamilyMember[],
    existingIngredients: string[]
): Promise<ComplementarySuggestion[]> => {

    const suggestionsSchema = {
        type: Type.OBJECT,
        properties: {
            suggestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        productName: { type: Type.STRING, description: 'Nombre del producto en ESPAÑOL.' },
                        reason: { type: Type.STRING, description: 'Razón en Español.' },
                    },
                    required: ['productName', 'reason'],
                }
            }
        },
        required: ['suggestions'],
    };

    const prompt = `
        Analiza el plan de comidas y sugiere 5 productos complementarios en ESPAÑOL para comprar.
        NO sugieras: [${existingIngredients.join(', ')}].
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: suggestionsSchema,
            },
        });
        const json = JSON.parse(response.text.trim());
        return json.suggestions || [];
    } catch (error) {
        console.error("Error generating complementary suggestions:", error);
        return [];
    }
};
