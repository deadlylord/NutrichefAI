
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult, WeeklyMealPlan, FamilyMember, DailyRequirements, ComplementarySuggestion, NutritionalAssessment } from '../types';

if (!process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT') {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    identifiedIngredients: {
      type: Type.ARRAY,
      description: 'Lista de todos los ingredientes alimenticios identificados en las imÃ¡genes, sin duplicados. ESTRICTAMENTE EN ESPAÃOL.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Nombre comÃºn del ingrediente en ESPAÃOL (ej. "Tomate", "Leche", "Pollo").' },
          spoilageTime: { type: Type.STRING, description: 'EstimaciÃ³n REALISTA y CONSERVADORA del tiempo de vida Ãºtil. Para frutas y verduras frescas, asume madurez media (ej. "3-5 dÃ­as"). Usa formato "X dÃ­as" o "X semanas".' },
          category: { type: Type.STRING, description: 'CategorÃ­a del ingrediente en ESPAÃOL (ej. "Frutas y Verduras", "Carnes", "LÃ¡cteos", "Despensa").' }
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
          title: { type: Type.STRING, description: 'TÃ­tulo de la receta en EspaÃ±ol.' },
          description: { type: Type.STRING, description: 'Breve descripciÃ³n apetitosa.' },
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
        calories: { type: Type.NUMBER, description: 'EstimaciÃ³n de calorÃ­as totales.' },
        protein: { type: Type.NUMBER, description: 'Gramos de proteÃ­na.' },
        carbs: { type: Type.NUMBER, description: 'Gramos de carbohidratos.' },
        fat: { type: Type.NUMBER, description: 'Gramos de grasa.' },
        micronutrients: { type: Type.STRING, description: 'Breve lista de micronutrientes clave (ej. "Rico en Vitamina C, Hierro y Potasio").' },
        imagePrompt: { type: Type.STRING, description: 'Un prompt detallado y vÃ­vido en inglÃ©s para un modelo de generaciÃ³n de imÃ¡genes AI, estilo fotografÃ­a de alimentos editorial. Ejemplo: "Professional food photography of a traditional Colombian bandeja paisa, soft lighting, 4k resolution".' },
        instructions: { type: Type.STRING, description: 'Instrucciones de preparaciÃ³n paso a paso.' }
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
        score: { type: Type.NUMBER, description: 'Puntaje de 1 a 10 indicando quÃ© tan balanceada es la compra.' },
        summary: { type: Type.STRING, description: 'Resumen corto de 1 frase sobre el balance de la compra.' },
        missingGroups: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: 'Grupos alimenticios faltantes o bajos (ej: "ProteÃ­nas", "Fibra").' 
        },
        suggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    item: { type: Type.STRING, description: 'Producto especÃ­fico sugerido para comprar.' },
                    category: { type: Type.STRING, description: 'CategorÃ­a del producto.' },
                    reason: { type: Type.STRING, description: 'Por quÃ© ayuda al balance.' }
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
        - GÃ©nero: ${gender}
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
    Eres NutriChef AI, un experto culinario. Analiza las imÃ¡genes de compras.
    
    IMPORTANTE:
    1.  **IDIOMA**: Devuelve TODO el contenido (nombres de ingredientes, recetas, descripciones) estricta y exclusivamente en **ESPAÃOL**.
    2.  **PRECISIÃN DE VENCIMIENTO**: Para frutas y verduras frescas, sÃ© **conservador**. Asume que ya han pasado tiempo en el estante. 
        - Ejemplo: Fresas (2-3 dÃ­as), Bananos (3-5 dÃ­as), Aguacate maduro (1-2 dÃ­as). 
        - No des rangos amplios como "1-2 semanas" para productos delicados.
    
    Genera un JSON con:
    1.  **identifiedIngredients**: Lista de alimentos en ESPAÃOL. CategorÃ­a en espaÃ±ol.
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
    throw new Error("No se pudo realizar el anÃ¡lisis. Intenta con una imagen mÃ¡s clara.");
  }
};

export const evaluateNutritionalBalance = async (
    ingredients: string[]
): Promise<NutritionalAssessment> => {
    const prompt = `
        ActÃºa como un Nutricionista Experto.
        Analiza esta lista de compras actual: [${ingredients.join(', ')}].
        
        EvalÃºa el balance nutricional de la compra (ProteÃ­nas, Carbohidratos, Grasas, Frutas/Verduras).
        Identifica quÃ© grupos faltan o estÃ¡n bajos para una dieta saludable completa.
        Sugiere 5 alimentos especÃ­ficos para AGREGAR a la lista de compras para balancear la despensa.
        
        Responde en ESPAÃOL JSON.
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
                description: 'Array de 7 dÃ­as (sunday a saturday).',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.STRING, description: 'Nombre del dÃ­a en inglÃ©s minÃºsculas (ej. "monday").' },
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

    const familyDescription = familyProfile.map(p => `${p.name} (${p.age} aÃ±os, objetivo: ${p.goal})`).join('; ');

    const prompt = `
        Crea un menÃº semanal saludable estilo COLOMBIANO.
        Ingredientes disponibles: [${ingredients.join(', ')}]
        Historial previo: [${purchaseHistory.join(', ')}]
        Familia: [${familyDescription}]

        REGLAS:
        1. Idioma: TODO EN ESPAÃOL.
        2. Prioriza usar los ingredientes disponibles.
        3. Si faltan ingredientes esenciales, asume que se comprarÃ¡n (sugeridos previamente).
        4. AdaptaciÃ³n infantil para menores de 2 aÃ±os.
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
        Sugiere 5 ingredientes de supermercado (comida) en ESPAÃOL que comiencen con "${query}".
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
        Genera 7 consejos cortos y motivadores sobre nutriciÃ³n y salud en ESPAÃOL para una familia colombiana.
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
        return ["Bebe mÃ¡s agua hoy.", "Come frutas y verduras."];
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
                        productName: { type: Type.STRING, description: 'Nombre del producto en ESPAÃOL.' },
                        reason: { type: Type.STRING, description: 'RazÃ³n en EspaÃ±ol.' },
                    },
                    required: ['productName', 'reason'],
                }
            }
        },
        required: ['suggestions'],
    };

    const prompt = `
        Analiza el plan de comidas y sugiere 5 productos complementarios en ESPAÃOL para comprar.
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
