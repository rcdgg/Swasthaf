"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFoodItems();
      fetchMealPlans();
    }
  }, [userId]);

  const checkUser = async () => {
    try {
      const storedUserId = sessionStorage.getItem('userId');
      if (!storedUserId) {
        router.push('/login');
        return;
      }
      setUserId(Number(storedUserId));
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

  const filteredFoodItems = foodItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFood = (food: FoodItem) => {
    const existingFood = selectedFoods.find(f => f.food_id === food.food_id);
    if (existingFood) {
      setSelectedFoods(prev => prev.map(f => 
        f.food_id === food.food_id 
          ? { ...f, quantity: f.quantity + selectedQuantity }
          : f
      ));
    } else {
      setSelectedFoods(prev => [...prev, { ...food, quantity: selectedQuantity }]);
    }
    setSelectedQuantity(1);
  };

  const handleRemoveFood = (foodId: number) => {
    setSelectedFoods(prev => prev.filter(food => food.food_id !== foodId));
  };

  const handleQuantityChange = (foodId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setSelectedFoods(prev => prev.map(food => 
      food.food_id === foodId 
        ? { ...food, quantity: newQuantity }
        : food
    ));
  };

  const calculateTotalNutrition = (food: SelectedFoodItem) => {
    return {
      calories: Math.round(food.calories * food.quantity),
      protein: Math.round(food.protein * food.quantity * 10) / 10,
      carbs: Math.round(food.carbs * food.quantity * 10) / 10,
      fats: Math.round(food.fats * food.quantity * 10) / 10
    };
  };

  const calculateTotalMacros = () => {
    return selectedFoods.reduce((totals, food) => {
      const nutrition = calculateTotalNutrition(food);
      return {
        calories: totals.calories + nutrition.calories,
        protein: totals.protein + nutrition.protein,
        carbs: totals.carbs + nutrition.carbs,
        fats: totals.fats + nutrition.fats
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Food & Nutrition</h1>
          <button
            onClick={() => setShowFoodList(!showFoodList)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            {showFoodList ? 'Hide Food List' : 'Add Food'}
          </button>
        </div>

        {showFoodList && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <input
              type="text"
              placeholder="Search food items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Quantity
              </label>
              <input
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                className="w-24 p-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFoodItems.map((food) => (
                <div
                  key={food.food_id}
                  className="border p-4 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleAddFood(food)}
                >
                  <h3 className="font-semibold">{food.name}</h3>
                  <div className="text-sm text-gray-600">
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

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Food List</h2>
          {selectedFoods.length === 0 ? (
            <p className="text-gray-500">No foods added yet</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedFoods.map((food) => {
                  const totalNutrition = calculateTotalNutrition(food);
                  return (
                    <div
                      key={food.food_id}
                      className="border p-4 rounded-lg relative"
                    >
                      <button
                        onClick={() => handleRemoveFood(food.food_id)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                      <h3 className="font-semibold">{food.name}</h3>
                      <div className="flex items-center gap-2 my-2">
                        <label className="text-sm text-gray-600">Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          value={food.quantity}
                          onChange={(e) => handleQuantityChange(food.food_id, Number(e.target.value))}
                          className="w-16 p-1 border rounded text-sm"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Total Calories: {totalNutrition.calories} kcal</p>
                        <p>Total Protein: {totalNutrition.protein}g</p>
                        <p>Total Carbs: {totalNutrition.carbs}g</p>
                        <p>Total Fats: {totalNutrition.fats}g</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Macros Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Total Daily Macros</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Total Calories</p>
                    <p className="text-xl font-bold text-blue-600">{calculateTotalMacros().calories} kcal</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Total Protein</p>
                    <p className="text-xl font-bold text-green-600">{calculateTotalMacros().protein}g</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Total Carbs</p>
                    <p className="text-xl font-bold text-yellow-600">{calculateTotalMacros().carbs}g</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Total Fats</p>
                    <p className="text-xl font-bold text-red-600">{calculateTotalMacros().fats}g</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Your Meal Plans</h2>
        {loading ? (
          <p>Loading meal plans...</p>
        ) : mealPlans.length === 0 ? (
          <p className="text-gray-500">No meal plans assigned yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mealPlans.map((plan) => (
              <div key={plan.meal_plan_id} className="border p-4 rounded-lg">
                <h3 className="font-semibold">{plan.plan_name}</h3>
                <p className="text-gray-600 mb-2">{plan.description}</p>
                <div className="text-sm">
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
