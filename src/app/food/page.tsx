"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface FoodItem {
  food_id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface SelectedFoodItem extends FoodItem {
  quantity: number;
}

interface MealPlan {
  meal_plan_id: number;
  trainer_id: number;
  plan_name: string;
  description: string;
  calories_per_day: number;
  duration: number;
  trainer_name: string;
}

export default function FoodPage() {
  const router = useRouter();
  const [showFoodList, setShowFoodList] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('');

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFoodItems();
      fetchMealPlans();
      loadTodaysFoodSelections();
    }
  }, [userId]);

  const checkUser = async () => {
    try {
      const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
      if (!userData.user_id) {
        router.push('/login');
        return;
      }
      setUserId(userData.user_id);
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    }
  };

  const fetchFoodItems = async () => {
    try {
      const { data, error } = await supabase
        .from('fooddatabase')
        .select('*')
        .order('name');

      if (error) throw error;
      setFoodItems(data || []);
    } catch (error) {
      console.error('Error fetching food items:', error);
    }
  };

  const fetchMealPlans = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('mealplan')
        .select(`
          *,
          trainerandnutritionist:trainer_id (
            name
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const processedPlans = data?.map(plan => ({
        ...plan,
        trainer_name: plan.trainerandnutritionist?.name || 'Unknown Trainer'
      })) || [];

      setMealPlans(processedPlans);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      setLoading(false);
    }
  };

  const loadTodaysFoodSelections = async () => {
    if (!userId) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Get both the daily foods record and all food items in parallel
      const [dailyFoodsResult, allFoodsResult] = await Promise.all([
        supabase
          .from('user_daily_foods')
          .select('*')
          .eq('user_id', userId)
          .eq('log_date', today)
          .single(),
        supabase
          .from('fooddatabase')
          .select('*')
      ]);

      if (dailyFoodsResult.error) {
        if (dailyFoodsResult.error.code === 'PGRST116') { // No rows returned
          return;
        }
        throw dailyFoodsResult.error;
      }

      if (allFoodsResult.error) {
        throw allFoodsResult.error;
      }

      if (dailyFoodsResult.data?.selected_foods) {
        const foodsMap = new Map(
          allFoodsResult.data.map(food => [food.food_id, food])
        );

        const selectedFoodsWithDetails = dailyFoodsResult.data.selected_foods
          .map((item: any) => {
            const foodData = foodsMap.get(item.food_id);
            if (!foodData) return null;
            return {
              ...foodData,
              quantity: item.quantity
            };
          })
          .filter(Boolean);

        setSelectedFoods(selectedFoodsWithDetails);
      }
    } catch (error) {
      console.error('Error loading today\'s food selections:', error);
    }
  };

  // Debounce save function to prevent too frequent updates
  const debouncedSave = debounce(async (foods: SelectedFoodItem[]) => {
    if (!userId) return;
    
    try {
      setSaveStatus('Saving...');
      
      if (foods.length === 0) {
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase
          .from('user_daily_foods')
          .delete()
          .eq('user_id', userId)
          .eq('log_date', today);

        if (error) throw error;
        setSaveStatus('Cleared food list');
        setTimeout(() => setSaveStatus(''), 2000);
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const totals = calculateTotalMacros(foods);
      
      const foodSelectionsData = {
        user_id: userId,
        log_date: today,
        selected_foods: foods.map(food => ({
          food_id: food.food_id,
          quantity: food.quantity
        })),
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fats: totals.fats
      };

      const { error } = await supabase
        .from('user_daily_foods')
        .upsert(foodSelectionsData, {
          onConflict: 'user_id,log_date'
        });

      if (error) throw error;
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving food selections:', error);
      setSaveStatus('Error saving');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  }, 1000);

  // Memoize the calculation functions
  const calculateTotalNutrition = React.useCallback((food: SelectedFoodItem) => {
    return {
      calories: Math.round(food.calories * food.quantity),
      protein: Math.round(food.protein * food.quantity * 10) / 10,
      carbs: Math.round(food.carbs * food.quantity * 10) / 10,
      fats: Math.round(food.fats * food.quantity * 10) / 10
    };
  }, []);

  const calculateTotalMacros = React.useCallback((foods: SelectedFoodItem[] = selectedFoods) => {
    const totals = foods.reduce((acc, food) => {
      const nutrition = calculateTotalNutrition(food);
      return {
        calories: acc.calories + nutrition.calories,
        protein: acc.protein + nutrition.protein,
        carbs: acc.carbs + nutrition.carbs,
        fats: acc.fats + nutrition.fats
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    // Store the total calories in sessionStorage
    sessionStorage.setItem('foodPageCalories', JSON.stringify({
      calories: totals.calories,
      timestamp: new Date().toISOString(),
      foods: foods.map(food => ({
        name: food.name,
        quantity: food.quantity,
        calories: calculateTotalNutrition(food).calories
      }))
    }));

    return totals;
  }, [calculateTotalNutrition, selectedFoods]);

  const filteredFoodItems = foodItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update handlers to use debounced save
  const handleAddFood = (food: FoodItem) => {
    const existingFood = selectedFoods.find(f => f.food_id === food.food_id);
    const newFoods = existingFood
      ? selectedFoods.map(f => 
          f.food_id === food.food_id 
            ? { ...f, quantity: f.quantity + selectedQuantity }
            : f
        )
      : [...selectedFoods, { ...food, quantity: selectedQuantity }];
    
    setSelectedFoods(newFoods);
    setSelectedQuantity(1);
    debouncedSave(newFoods);
  };

  const handleRemoveFood = (foodId: number) => {
    const newFoods = selectedFoods.filter(food => food.food_id !== foodId);
    setSelectedFoods(newFoods);
    debouncedSave(newFoods);
  };

  const handleQuantityChange = (foodId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const newFoods = selectedFoods.map(food => 
      food.food_id === foodId 
        ? { ...food, quantity: newQuantity }
        : food
    );
    setSelectedFoods(newFoods);
    debouncedSave(newFoods);
  };

  // Add debounce utility function at the top of the file
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const macrosChartData = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [
      {
        data: [
          calculateTotalMacros(selectedFoods).protein,
          calculateTotalMacros(selectedFoods).carbs,
          calculateTotalMacros(selectedFoods).fats,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(1)}g`;
          }
        }
      }
    },
  };

  return (
    <div className="min-h-screen bg-[#121212] p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Food & Nutrition</h1>
          <div className="flex items-center gap-4">
            {saveStatus && (
              <span className={`text-sm ${
                saveStatus === 'Error saving' 
                  ? 'text-red-400' 
                  : saveStatus === 'Saving...' 
                    ? 'text-yellow-400'
                    : 'text-green-400'
              }`}>
                {saveStatus}
              </span>
            )}
            <button
              onClick={() => setShowFoodList(!showFoodList)}
              className="bg-[#3730a3] text-white px-6 py-2 rounded-md hover:bg-[#312e81] transition-colors"
            >
              {showFoodList ? 'Hide Food List' : 'Add Food'}
            </button>
          </div>
        </div>

        {showFoodList && (
          <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-xl mb-6">
            <input
              type="text"
              placeholder="Search food items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-[#2D2D2D] text-white border border-[#3D3D3D] rounded-lg mb-4 focus:outline-none focus:border-gray-300"
            />
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">
                Default Quantity
              </label>
              <input
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                className="w-24 p-3 bg-[#2D2D2D] text-white border border-[#3D3D3D] rounded-lg focus:outline-none focus:border-gray-300"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFoodItems.map((food) => (
                <div
                  key={food.food_id}
                  className="bg-[#2D2D2D] p-4 rounded-lg hover:bg-[#363636] cursor-pointer border border-[#3D3D3D]"
                  onClick={() => handleAddFood(food)}
                >
                  <h3 className="font-semibold text-white mb-2">{food.name}</h3>
                  <div className="text-gray-300 space-y-1">
                    <p>Calories: {food.calories} kcal</p>
                    <p>Protein: {food.protein}g</p>
                    <p>Carbs: {food.carbs}g</p>
                    <p>Fats: {food.fats}g</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Your Food List</h2>
          {selectedFoods.length === 0 ? (
            <p className="text-gray-400">No foods added yet</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {selectedFoods.map((food) => {
                  const totalNutrition = calculateTotalNutrition(food);
                  return (
                    <div
                      key={food.food_id}
                      className="bg-[#2D2D2D] p-4 rounded-lg relative border border-[#3D3D3D]"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFood(food.food_id);
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
                      >
                        ×
                      </button>
                      <h3 className="font-semibold text-white mb-2">{food.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <label className="text-gray-300">Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          value={food.quantity}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(food.food_id, Number(e.target.value));
                          }}
                          className="w-20 p-2 bg-[#363636] text-white border border-[#3D3D3D] rounded-md focus:outline-none focus:border-gray-300"
                        />
                      </div>
                      <div className="text-gray-300 space-y-1">
                        <p>Total Calories: {totalNutrition.calories} kcal</p>
                        <p>Total Protein: {totalNutrition.protein}g</p>
                        <p>Total Carbs: {totalNutrition.carbs}g</p>
                        <p>Total Fats: {totalNutrition.fats}g</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Display total macros and pie chart */}
              <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-white">Total Macros</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-2">
                    <p className="text-white">
                      Calories: {calculateTotalMacros(selectedFoods).calories.toFixed(1)} kcal
                    </p>
                    <p className="text-white">
                      Protein: {calculateTotalMacros(selectedFoods).protein.toFixed(1)}g
                    </p>
                    <p className="text-white">
                      Carbs: {calculateTotalMacros(selectedFoods).carbs.toFixed(1)}g
                    </p>
                    <p className="text-white">
                      Fats: {calculateTotalMacros(selectedFoods).fats.toFixed(1)}g
                    </p>
                  </div>
                  <div className="w-full max-w-xs mx-auto">
                    <Pie data={macrosChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4">Your Meal Plans</h2>
        {loading ? (
          <p className="text-gray-300">Loading meal plans...</p>
        ) : mealPlans.length === 0 ? (
          <p className="text-gray-400">No meal plans assigned yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mealPlans.map((plan) => (
              <div key={plan.meal_plan_id} className="bg-[#2D2D2D] p-4 rounded-lg border border-[#3D3D3D]">
                <h3 className="font-semibold text-white mb-2">{plan.plan_name}</h3>
                <p className="text-gray-300 mb-3">{plan.description}</p>
                <div className="text-gray-300 space-y-1">
                  <p>Calories per day: {plan.calories_per_day} kcal</p>
                  <p>Duration: {plan.duration} days</p>
                  <p>Assigned by: {plan.trainer_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
