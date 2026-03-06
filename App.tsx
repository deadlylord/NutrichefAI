
import React, { useState, useEffect, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { SparklesIcon, CalendarIcon, TrashIcon } from './components/IconComponents';
import { analyzeGroceryImages, generateWeeklyMealPlan, generateMealImage, findMealImage, generateHealthTips, generateComplementarySuggestions, calculateDailyRequirements, evaluateNutritionalBalance } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { calculateSpoilageInfo } from './utils/dateUtils';
import type { AnalysisResult, WeeklyMealPlan, PurchaseRecord, DailyMeal, FamilyMember, ComplementarySuggestion, ExpiringItem, NutritionalAssessment, ShoppingListItem, SuggestionItem, ExtraFoodItem, Tab } from './types';
import WeeklyMenuDisplay from './components/WeeklyMenuDisplay';
import PurchaseHistoryDisplay from './components/PurchaseHistoryDisplay';
import ManualIngredientInput from './components/ManualIngredientInput';
import FamilyManager from './components/FamilyManager';
import TipsAndReminders from './components/TipsAndReminders';
import ComplementarySuggestionsDisplay from './components/ComplementarySuggestionsDisplay';
import SpoilageAlerts from './components/SpoilageAlerts';
import NutritionalAssessmentDisplay from './components/NutritionalAssessment';
import ShoppingList from './components/ShoppingList';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import { db } from './services/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, limit, setDoc, getDoc, updateDoc } from "firebase/firestore";


const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

function App() {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [manualIngredients, setManualIngredients] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMealPlan | null>(null);
  const [complementarySuggestions, setComplementarySuggestions] = useState<ComplementarySuggestion[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [purchaseDate, setPurchaseDate] = useState<string>(getTodayDateString());
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('foods');
  const [healthTips, setHealthTips] = useState<string[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState<boolean>(false);
  const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([]);
  const [nutritionalAssessment, setNutritionalAssessment] = useState<NutritionalAssessment | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [familyName, setFamilyName] = useState<string>('Familia Gutiérrez');
  const [cloudError, setCloudError] = useState<boolean>(false);
  
  // State for tracking meal consumption
  const [consumedMeals, setConsumedMeals] = useState<Set<string>>(new Set());
  const [extraFoods, setExtraFoods] = useState<Record<string, ExtraFoodItem[]>>({});

  // --- Persistence Logic ---

  // Load Family Name
  useEffect(() => {
    const savedName = localStorage.getItem('familyName');
    if (savedName) {
        setFamilyName(savedName);
    }
  }, []);

  const handleFamilyNameChange = (newName: string) => {
    setFamilyName(newName);
    localStorage.setItem('familyName', newName);
  }

  // Load Active Menu from Firestore
  useEffect(() => {
    const loadActiveMenu = async () => {
        try {
            const docRef = doc(db, "activeMenu", "current");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.weeklyMenu) setWeeklyMenu(data.weeklyMenu);
                if (data.analysisResult) setAnalysisResult(data.analysisResult);
                if (data.complementarySuggestions) setComplementarySuggestions(data.complementarySuggestions);
                if (data.consumedMeals) setConsumedMeals(new Set(data.consumedMeals));
                if (data.extraFoods) setExtraFoods(data.extraFoods);
                
                // If we have a menu loaded, set the tab to mealPlan
                if (data.weeklyMenu) setActiveTab('mealPlan');
                setCloudError(false);
            } else {
                // Try localStorage fallback
                const savedMenu = localStorage.getItem('activeMenu');
                if (savedMenu) {
                    const data = JSON.parse(savedMenu);
                    if (data.weeklyMenu) setWeeklyMenu(data.weeklyMenu);
                    if (data.analysisResult) setAnalysisResult(data.analysisResult);
                    if (data.complementarySuggestions) setComplementarySuggestions(data.complementarySuggestions);
                    if (data.consumedMeals) setConsumedMeals(new Set(data.consumedMeals));
                    if (data.extraFoods) setExtraFoods(data.extraFoods);
                    if (data.weeklyMenu) setActiveTab('mealPlan');
                }
            }
        } catch (e) {
            console.warn("Cloud sync unavailable, working in local mode:", e);
            setCloudError(true);
            const savedMenu = localStorage.getItem('activeMenu');
            if (savedMenu) {
                const data = JSON.parse(savedMenu);
                if (data.weeklyMenu) setWeeklyMenu(data.weeklyMenu);
                if (data.analysisResult) setAnalysisResult(data.analysisResult);
                if (data.complementarySuggestions) setComplementarySuggestions(data.complementarySuggestions);
                if (data.consumedMeals) setConsumedMeals(new Set(data.consumedMeals));
                if (data.extraFoods) setExtraFoods(data.extraFoods);
                if (data.weeklyMenu) setActiveTab('mealPlan');
            }
        }
    };
    loadActiveMenu();
  }, []);

  // Save Active Menu to Firestore (Debounced or on change)
  useEffect(() => {
    if (weeklyMenu) {
        const saveMenu = async () => {
            const menuData = {
                weeklyMenu,
                analysisResult, // Keep analysis result so we can regenerate next week
                complementarySuggestions,
                consumedMeals: Array.from(consumedMeals),
                extraFoods,
                lastUpdated: new Date().toISOString()
            };
            
            // Always save to localStorage
            localStorage.setItem('activeMenu', JSON.stringify(menuData));

            try {
                await setDoc(doc(db, "activeMenu", "current"), menuData);
                setCloudError(false);
            } catch (e) {
                console.warn("Error syncing menu to cloud:", e);
                setCloudError(true);
            }
        };
        // Simple debounce
        const timeoutId = setTimeout(saveMenu, 1000);
        return () => clearTimeout(timeoutId);
    }
  }, [weeklyMenu, consumedMeals, extraFoods, analysisResult, complementarySuggestions]);


  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const q = query(collection(db, "purchaseHistory"), orderBy("date", "desc"), limit(10));
            const querySnapshot = await getDocs(q);
            const history = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as PurchaseRecord);
            setPurchaseHistory(history);
            localStorage.setItem('purchaseHistory', JSON.stringify(history));
            setCloudError(false);
        } catch (e) {
            console.warn("Cloud history sync unavailable:", e);
            setCloudError(true);
            const savedHistory = localStorage.getItem('purchaseHistory');
            if (savedHistory) {
                setPurchaseHistory(JSON.parse(savedHistory));
            }
        }
    };
    fetchHistory();
  }, []);
  
  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "familyMembers"));
        const members = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as FamilyMember);
        setFamilyMembers(members);
        localStorage.setItem('familyMembers', JSON.stringify(members));
        setCloudError(false);
      } catch (e) {
        console.warn("Cloud family sync unavailable:", e);
        setCloudError(true);
        const savedFamily = localStorage.getItem('familyMembers');
        if (savedFamily) {
            setFamilyMembers(JSON.parse(savedFamily));
        }
      }
    };
    fetchFamily();
  }, []);

  useEffect(() => {
    if (purchaseHistory.length > 0) {
      const latestPurchase = purchaseHistory[0];
      const alerts: ExpiringItem[] = [];
      for (const ingredient of latestPurchase.ingredients) {
          const isFruitOrVeg = ingredient.category?.toLowerCase() === 'fruta' || ingredient.category?.toLowerCase() === 'verdura';
          const spoilage = calculateSpoilageInfo(latestPurchase.date, ingredient.spoilageTime);
          if (isFruitOrVeg && spoilage && spoilage.isUrgent) {
              alerts.push({ name: ingredient.name, daysLeft: spoilage.daysLeft });
          }
      }
      setExpiringItems(alerts.sort((a, b) => a.daysLeft - b.daysLeft));
    } else {
      setExpiringItems([]);
    }
  }, [purchaseHistory]);

  const handleGenerateTips = useCallback(async () => {
    setIsLoadingTips(true);
    setError(null);
    try {
      const tips = await generateHealthTips();
      setHealthTips(tips);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron generar los consejos.");
    } finally {
      setIsLoadingTips(false);
    }
  }, []);

  useEffect(() => {
    handleGenerateTips();
  }, [handleGenerateTips]);


  const handleFilesChange = (files: File[]) => {
    setImageFiles(files);
  };
  
  const handleAnalysis = useCallback(async () => {
    if (imageFiles.length === 0 && manualIngredients.length === 0) {
      setError("Por favor, sube una imagen o añade un ingrediente manualmente.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Analizando tus compras...');
    setError(null);
    // Do not clear weeklyMenu here, only when explicitly regenerating or resetting
    
    try {
      let result: AnalysisResult = { identifiedIngredients: [], recipeSuggestions: [] };

      if (imageFiles.length > 0) {
        const base64Images = await Promise.all(imageFiles.map(file => fileToBase64(file)));
        result = await analyzeGroceryImages(base64Images);
      }
      
      const allIngredients = [
        ...result.identifiedIngredients,
        ...manualIngredients.map(name => ({ name, spoilageTime: 'N/A', category: 'otro' }))
      ];
      
      const uniqueIngredients = allIngredients.filter((ing, index, self) =>
        index === self.findIndex((t) => (t.name.toLowerCase() === ing.name.toLowerCase()))
      );

      const finalResult = { ...result, identifiedIngredients: uniqueIngredients };
      setAnalysisResult(finalResult);

      // After ingredients are found, evaluate nutritional balance immediately
      setLoadingMessage('Evaluando el balance nutricional...');
      const assessment = await evaluateNutritionalBalance(uniqueIngredients.map(i => i.name));
      setNutritionalAssessment(assessment);

      if (uniqueIngredients.length > 0) {
          const newRecordData: Omit<PurchaseRecord, 'id'> = {
            date: purchaseDate,
            ingredients: uniqueIngredients
          };
          
          let newRecord: PurchaseRecord;
          try {
            const docRef = await addDoc(collection(db, "purchaseHistory"), newRecordData);
            newRecord = { ...newRecordData, id: docRef.id };
          } catch (e) {
            console.error("Error saving purchase to Firestore, saving locally:", e);
            newRecord = { ...newRecordData, id: `local-${Date.now()}` };
          }
        
          setPurchaseHistory(prev => {
            const filtered = prev.filter(p => p.date !== newRecord.date);
            const updated = [newRecord, ...filtered].slice(0, 10);
            localStorage.setItem('purchaseHistory', JSON.stringify(updated));
            return updated;
          });
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Ocurrió un error desconocido durante el análisis.");
    } finally {
      setIsLoading(false);
    }
  }, [imageFiles, manualIngredients, purchaseDate]);

  const handleGenerateMenu = useCallback(async (isNextWeek: boolean = false) => {
    if (!analysisResult && !isNextWeek) return;

    setIsLoading(true);
    setLoadingMessage(isNextWeek ? 'Generando plan para la siguiente semana...' : 'Creando tu menú semanal...');
    setError(null);
    setComplementarySuggestions(null);
    
    // Reset tracking when regenerating menu
    setConsumedMeals(new Set());
    setExtraFoods({});

    try {
        let ingredients: string[] = [];

        if (isNextWeek && expiringItems.length > 0 && analysisResult) {
            // Priority logic for Next Week
            const urgentNames = expiringItems.map(e => e.name);
            const otherIngredients = analysisResult.identifiedIngredients
                .map(i => i.name)
                .filter(n => !urgentNames.includes(n));
            
            // Put urgent items first to hint the AI
            ingredients = [...urgentNames, ...otherIngredients];
        } else if (analysisResult) {
            ingredients = analysisResult.identifiedIngredients.map(i => i.name);
        }
        
        const purchaseHistoryItems = purchaseHistory.flatMap(p => p.ingredients.map(i => i.name));
        const uniqueHistoryItems = purchaseHistoryItems.filter((item, index, self) => self.indexOf(item) === index);
        
        const menu = await generateWeeklyMealPlan(ingredients, uniqueHistoryItems, familyMembers);
        setWeeklyMenu(menu);

        setLoadingMessage('Buscando sugerencias para complementar tu plan...');
        const suggestions = await generateComplementarySuggestions(menu, familyMembers, ingredients);
        setComplementarySuggestions(suggestions);
        setActiveTab('mealPlan');
        
        // Scroll to top
        window.scrollTo(0,0);

    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Ocurrió un error desconocido al generar el menú.");
    } finally {
        setIsLoading(false);
    }
  }, [analysisResult, purchaseHistory, familyMembers, expiringItems]);
  
  const handleAddMember = async (memberData: Omit<FamilyMember, 'id' | 'dailyRequirements'>) => {
    try {
        const requirements = await calculateDailyRequirements(memberData);
        const newMemberData = { ...memberData, dailyRequirements: requirements };
        
        let newMember: FamilyMember;
        try {
            const docRef = await addDoc(collection(db, "familyMembers"), newMemberData);
            newMember = { ...newMemberData, id: docRef.id };
        } catch (e) {
            console.error("Error adding family member to Firestore, saving locally:", e);
            newMember = { ...newMemberData, id: `local-${Date.now()}` };
        }
        
        setFamilyMembers(prev => {
            const updated = [...prev, newMember];
            localStorage.setItem('familyMembers', JSON.stringify(updated));
            return updated;
        });
    } catch (e) {
        console.error("Error adding family member:", e);
        setError("No se pudo añadir el miembro de la familia. Inténtalo de nuevo.");
        throw e;
    }
  };

  const handleUpdateMember = async (id: string, memberData: Omit<FamilyMember, 'id' | 'dailyRequirements'>) => {
    try {
        // Recalculate requirements based on new data (age, goal, etc might have changed)
        const requirements = await calculateDailyRequirements(memberData);
        const updatedMemberData = { ...memberData, dailyRequirements: requirements };
        
        try {
            const memberRef = doc(db, "familyMembers", id);
            await updateDoc(memberRef, updatedMemberData);
        } catch (e) {
            console.error("Error updating family member in Firestore, updating locally:", e);
        }

        setFamilyMembers(prev => {
            const updated = prev.map(m => m.id === id ? { ...updatedMemberData, id } : m);
            localStorage.setItem('familyMembers', JSON.stringify(updated));
            return updated;
        });
    } catch (e) {
        console.error("Error updating family member:", e);
        setError("No se pudo actualizar el miembro de la familia.");
        throw e;
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
        try {
            await deleteDoc(doc(db, "familyMembers", id));
        } catch (e) {
            console.error("Error removing family member from Firestore, removing locally:", e);
        }
        
        setFamilyMembers(prev => {
            const updated = prev.filter(member => member.id !== id);
            localStorage.setItem('familyMembers', JSON.stringify(updated));
            return updated;
        });
    } catch (e) {
        console.error("Error removing family member:", e);
        setError("No se pudo eliminar el miembro de la familia. Inténtalo de nuevo.");
    }
  };


  const handleGenerateSingleImage = useCallback(async (dayKey: keyof WeeklyMealPlan, mealKey: keyof Omit<DailyMeal, 'waterIntakeLiters'>) => {
    if (!weeklyMenu) return;

    const mealToUpdate = weeklyMenu[dayKey][mealKey];
    if (!mealToUpdate || typeof mealToUpdate === 'number') return;
    
    const newMenu = JSON.parse(JSON.stringify(weeklyMenu));
    newMenu[dayKey][mealKey].isImageLoading = true;
    setWeeklyMenu(newMenu);
    
    try {
        const imageUrl = await generateMealImage(mealToUpdate.imagePrompt);
        const finalMenu = JSON.parse(JSON.stringify(newMenu));
        finalMenu[dayKey][mealKey].isImageLoading = false;
        if (imageUrl) {
            finalMenu[dayKey][mealKey].imageUrl = imageUrl;
        }
        setWeeklyMenu(finalMenu);
    } catch (err) {
        console.error("Error generating single image:", err);
        const finalMenu = JSON.parse(JSON.stringify(newMenu));
        finalMenu[dayKey][mealKey].isImageLoading = false;
        setWeeklyMenu(finalMenu);
    }
  }, [weeklyMenu]);

  const handleSearchSingleImage = useCallback(async (dayKey: keyof WeeklyMealPlan, mealKey: keyof Omit<DailyMeal, 'waterIntakeLiters'>) => {
    if (!weeklyMenu) return;

    const mealToUpdate = weeklyMenu[dayKey][mealKey];
    if (!mealToUpdate || typeof mealToUpdate === 'number') return;
    
    const newMenu = JSON.parse(JSON.stringify(weeklyMenu));
    newMenu[dayKey][mealKey].isImageLoading = true;
    setWeeklyMenu(newMenu);
    
    try {
        // Use Google Search to find a real image URL
        const imageUrl = await findMealImage(mealToUpdate.name);
        
        const finalMenu = JSON.parse(JSON.stringify(newMenu));
        finalMenu[dayKey][mealKey].isImageLoading = false;
        
        if (imageUrl) {
            finalMenu[dayKey][mealKey].imageUrl = imageUrl;
        } else {
            // Fallback: If no real image found, maybe trigger a toast or just stop loading
            console.log("No image found via search");
        }
        setWeeklyMenu(finalMenu);
    } catch (err) {
        console.error("Error searching single image:", err);
        const finalMenu = JSON.parse(JSON.stringify(newMenu));
        finalMenu[dayKey][mealKey].isImageLoading = false;
        setWeeklyMenu(finalMenu);
    }
  }, [weeklyMenu]);


  const handleClearPlan = async () => {
      if (window.confirm("¿Estás seguro de que quieres borrar el plan actual? Esto no se puede deshacer.")) {
        setImageFiles([]);
        setManualIngredients([]);
        setAnalysisResult(null);
        setWeeklyMenu(null);
        setComplementarySuggestions(null);
        setNutritionalAssessment(null);
        setError(null);
        setIsLoading(false);
        setActiveTab('foods');
        setConsumedMeals(new Set());
        setExtraFoods({});
        
        // Clear from localStorage
        localStorage.removeItem('activeMenu');

        // Clear from Firestore
        try {
            await deleteDoc(doc(db, "activeMenu", "current"));
        } catch(e) {
            console.error("Error clearing menu from db", e);
        }
      }
  };

  const handleResetInventory = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar el inventario actual y escanear de nuevo?")) {
        setAnalysisResult(null);
        setNutritionalAssessment(null);
        setImageFiles([]);
        setManualIngredients([]);
        setError(null);
        window.scrollTo(0,0);
    }
  };

  const handleDeleteHistory = async (recordId: string) => {
    if (window.confirm("¿Eliminar este registro del historial?")) {
        try {
            try {
                await deleteDoc(doc(db, "purchaseHistory", recordId));
            } catch (e) {
                console.error("Error deleting history from Firestore, deleting locally:", e);
            }
            
            setPurchaseHistory(prev => {
                const updated = prev.filter(p => p.id !== recordId);
                localStorage.setItem('purchaseHistory', JSON.stringify(updated));
                return updated;
            });
        } catch (e) {
            console.error("Error deleting history:", e);
            setError("No se pudo eliminar el registro del historial.");
        }
    }
  };

  const handleReusePurchase = useCallback((record: PurchaseRecord) => {
    const reusedResult: AnalysisResult = {
      identifiedIngredients: record.ingredients,
      recipeSuggestions: [], 
    };
    setAnalysisResult(reusedResult);
    // Do not clear weekly menu immediately, let user decide to generate
    setNutritionalAssessment(null); 
    setImageFiles([]); 
    setManualIngredients([]); 
    setActiveTab('foods'); 
    window.scrollTo(0, 0);
  }, []);

  const handleAddToList = (suggestion: SuggestionItem) => {
      if (!shoppingList.some(item => item.name === suggestion.item)) {
          const newItem: ShoppingListItem = {
              id: Date.now().toString() + Math.random(),
              name: suggestion.item,
              category: suggestion.category,
              checked: false
          };
          setShoppingList(prev => [...prev, newItem]);
      }
  };

  const toggleShoppingItem = (id: string) => {
      setShoppingList(prev => prev.map(item => 
          item.id === id ? { ...item, checked: !item.checked } : item
      ));
  };

  const deleteShoppingItem = (id: string) => {
      setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  // --- Meal Tracking Handlers ---

  const handleToggleMealConsumption = (day: string, mealType: string) => {
      const key = `${day}-${mealType}`;
      setConsumedMeals(prev => {
          const newSet = new Set(prev);
          if (newSet.has(key)) {
              newSet.delete(key);
          } else {
              newSet.add(key);
          }
          return newSet;
      });
  };

  const handleAddExtraFood = (day: string, food: ExtraFoodItem) => {
      setExtraFoods(prev => {
          const currentDayExtras = prev[day] || [];
          return {
              ...prev,
              [day]: [...currentDayExtras, food]
          };
      });
  };

  const handleRemoveExtraFood = (day: string, foodId: string) => {
      setExtraFoods(prev => {
          const currentDayExtras = prev[day] || [];
          return {
              ...prev,
              [day]: currentDayExtras.filter(item => item.id !== foodId)
          };
      });
  };

  const canAnalyze = imageFiles.length > 0 || manualIngredients.length > 0;
  
  return (
    <div className="min-h-screen font-sans flex flex-col bg-slate-50/50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} familyName={familyName} onFamilyNameChange={handleFamilyNameChange} />
      
      {cloudError && (
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-1 text-center">
              <p className="text-[10px] text-amber-600 font-medium flex items-center justify-center">
                  <span className="mr-1.5">☁️</span> 
                  Modo Local: Sincronización en la nube no disponible. Tus datos se guardan en este navegador.
              </p>
          </div>
      )}

      <main className="flex-grow pt-24 pb-28 md:pb-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
              {error && (
                  <div className="my-4 bg-red-100 text-red-700 p-4 rounded-3xl animate-fade-in" role="alert">
                      <p className="font-bold flex items-center"><span className="mr-2">⚠️</span> Error</p>
                      <p>{error}</p>
                  </div>
              )}

              {isLoading && (
                  <div className="text-center my-12 animate-fade-in">
                      <p className="text-lg text-gray-600 font-medium">{loadingMessage}</p>
                      <LoadingSpinner />
                  </div>
              )}

              <div className={isLoading ? 'hidden' : ''}>
                  {activeTab === 'foods' && (
                      <div className="animate-fade-in">
                          {!analysisResult ? (
                            // INITIAL STATE (No analysis)
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* LEFT COLUMN: INPUTS */}
                                <div className="lg:col-span-7 space-y-6">
                                     <SpoilageAlerts items={expiringItems} />
                                     <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 space-y-6">
                                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                            <span className="bg-green-100 p-2 rounded-lg mr-3 text-green-700">1</span>
                                            Añade tus Ingredientes
                                        </h2>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="purchase-date" className="block text-sm font-bold text-gray-700 mb-2">Fecha de Compra</label>
                                                <input 
                                                    type="date" 
                                                    id="purchase-date"
                                                    value={purchaseDate}
                                                    onChange={(e) => setPurchaseDate(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-slate-50"
                                                />
                                            </div>
                                            <div>
                                                <ManualIngredientInput manualIngredients={manualIngredients} onIngredientsChange={setManualIngredients} />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100">
                                            <p className="text-center text-gray-500 font-medium mb-4 text-sm">Sube fotos de tus recibos o productos</p>
                                            <ImageUploader 
                                                onFilesChange={handleFilesChange}
                                                files={imageFiles}
                                                isLoading={isLoading}
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <button
                                            onClick={handleAnalysis}
                                            disabled={!canAnalyze || isLoading}
                                            className="w-full py-4 bg-[#1E4620] text-white font-bold rounded-2xl hover:bg-green-900 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] shadow-xl shadow-green-900/20 flex items-center justify-center gap-2 text-lg"
                                            >
                                            <SparklesIcon />
                                            <span>{isLoading ? 'Analizando...' : `Analizar Compra`}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* RIGHT COLUMN: HISTORY */}
                                <div className="lg:col-span-5">
                                    {purchaseHistory.length > 0 && (
                                        <PurchaseHistoryDisplay 
                                            history={purchaseHistory} 
                                            onReuse={handleReusePurchase} 
                                            onDelete={handleDeleteHistory}
                                        />
                                    )}
                                </div>
                            </div>
                          ) : (
                             // RESULTS STATE
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                 {/* LEFT COLUMN: SUMMARY & LIST */}
                                 <div className="lg:col-span-4 space-y-6 h-fit lg:sticky lg:top-24">
                                    <div className="bg-green-900 text-white p-6 rounded-3xl shadow-lg">
                                        <h2 className="text-xl font-bold mb-2">Todo listo!</h2>
                                        <p className="text-green-100 text-sm mb-6">Hemos analizado tus productos. Ahora puedes generar un plan personalizado.</p>
                                        <button
                                            onClick={() => handleGenerateMenu(false)}
                                            disabled={isLoading}
                                            className="w-full py-3 bg-white text-green-900 font-bold rounded-xl hover:bg-green-50 transition-colors shadow-md flex items-center justify-center gap-2"
                                        >
                                            <CalendarIcon />
                                            <span>Crear Menú Semanal</span>
                                        </button>
                                        <button
                                            onClick={handleResetInventory}
                                            className="w-full mt-3 py-2 border border-green-700 text-green-200 text-sm font-semibold rounded-xl hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <TrashIcon />
                                            <span>Eliminar Inventario</span>
                                        </button>
                                    </div>
                                    <ShoppingList 
                                        items={shoppingList} 
                                        onToggleItem={toggleShoppingItem} 
                                        onDeleteItem={deleteShoppingItem} 
                                     />
                                    <div className="hidden lg:block">
                                         <SpoilageAlerts items={expiringItems} />
                                    </div>
                                 </div>
                                 
                                 {/* RIGHT COLUMN: DETAILS */}
                                 <div className="lg:col-span-8 space-y-6">
                                    <div className="lg:hidden">
                                         <SpoilageAlerts items={expiringItems} />
                                    </div>

                                    {nutritionalAssessment && (
                                        <NutritionalAssessmentDisplay 
                                            assessment={nutritionalAssessment} 
                                            onAddToList={handleAddToList}
                                            shoppingList={shoppingList}
                                        />
                                    )}
                                    <AnalysisDisplay result={analysisResult} />
                                 </div>
                              </div>
                          )}
                      </div>
                  )}
                  
                  {activeTab === 'mealPlan' && (
                       <div className="animate-fade-in max-w-6xl mx-auto">
                          {!weeklyMenu ? (
                              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
                                      <CalendarIcon className="w-10 h-10" />
                                  </div>
                                  <h2 className="text-2xl font-bold text-gray-700 mb-2">Aún no hay un plan activo</h2>
                                  <p className="text-gray-500 max-w-md">Por favor, ve a la pestaña "Alimentos" para añadir productos y generar tu primer menú.</p>
                                  <button onClick={() => setActiveTab('foods')} className="mt-6 px-6 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors">
                                      Ir a Alimentos
                                  </button>
                              </div>
                          ) : (
                              <>
                                  <WeeklyMenuDisplay 
                                    menu={weeklyMenu} 
                                    family={familyMembers} 
                                    onGenerateImage={handleGenerateSingleImage} 
                                    onSearchImage={handleSearchSingleImage}
                                    consumedMeals={consumedMeals}
                                    onToggleMeal={handleToggleMealConsumption}
                                    extraFoods={extraFoods}
                                    onAddExtra={handleAddExtraFood}
                                    onRemoveExtra={handleRemoveExtraFood}
                                  />
                                  {complementarySuggestions && complementarySuggestions.length > 0 && (
                                      <ComplementarySuggestionsDisplay 
                                        suggestions={complementarySuggestions} 
                                        onAddToList={handleAddToList}
                                        shoppingList={shoppingList}
                                      />
                                  )}

                                  {/* Menu Actions */}
                                  <div className="mt-10 flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
                                        <div className="text-left">
                                            <h3 className="font-bold text-gray-800">¿Terminaste esta semana?</h3>
                                            <p className="text-sm text-gray-500">Genera el plan de la siguiente semana priorizando lo que está por vencer.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={handleClearPlan}
                                                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm flex items-center gap-2"
                                            >
                                                <TrashIcon /> Borrar Plan Actual
                                            </button>
                                            <button 
                                                onClick={() => handleGenerateMenu(true)}
                                                className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold shadow-md shadow-green-200"
                                            >
                                                Generar Siguiente Semana →
                                            </button>
                                        </div>
                                  </div>
                              </>
                          )}
                       </div>
                  )}

                  {activeTab === 'family' && (
                      <div className="animate-fade-in max-w-4xl mx-auto">
                          <FamilyManager 
                            family={familyMembers} 
                            onAddMember={handleAddMember} 
                            onRemoveMember={handleRemoveMember} 
                            onUpdateMember={handleUpdateMember}
                          />
                      </div>
                  )}
                  
                  {activeTab === 'tips' && (
                      <div className="animate-fade-in max-w-3xl mx-auto pt-4">
                          <TipsAndReminders 
                              tips={healthTips}
                              isLoading={isLoadingTips}
                              onGenerate={handleGenerateTips}
                          />
                      </div>
                  )}
              </div>
          </div>
      </main>
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
