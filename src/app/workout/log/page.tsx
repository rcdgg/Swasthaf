"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useRouter } from "next/navigation";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Exercise {
  exercise_id: number;
  name: string;
  muscle_group: string;
  calories_burned_per_minute: number;
}

interface LoggedExercise {
  exercise_id: number;
  name: string;
  quantity: number;
  calories: number;
  muscle_group: string;
}

export default function LogWorkoutPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchExercises();
      fetchLoggedExercises();
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

  const fetchExercises = async () => {
    const { data, error } = await supabase.from("exercisedatabase").select("*");
    if (error) {
      console.error("Error fetching exercises:", error);
    } else {
      setExercises(data);
    }
  };

  const fetchLoggedExercises = async () => {
    if (!userId) return;
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("user_daily_workouts")
      .select(`exercise_id, quantity, exercisedatabase(name, calories_burned_per_minute, muscle_group)`)
      .eq("user_id", userId)
      .eq("log_date", today);

    if (!error && data) {
      const logs = data.map((entry: any) => ({
        exercise_id: entry.exercise_id,
        name: entry.exercisedatabase.name,
        quantity: entry.quantity,
        muscle_group: entry.exercisedatabase.muscle_group,
        calories: entry.quantity * entry.exercisedatabase.calories_burned_per_minute,
      }));
      setLoggedExercises(logs);
    }
  };

  const saveWorkouts = async (updatedExercises: LoggedExercise[]) => {
    if (!userId) return;
    
    try {
      setSaveStatus('Saving...');
      const today = new Date().toISOString().split("T")[0];

      // First, delete all existing workouts for today
      await supabase
        .from("user_daily_workouts")
        .delete()
        .eq("user_id", userId)
        .eq("log_date", today);

      if (updatedExercises.length === 0) {
        setSaveStatus('Cleared workout list');
        setTimeout(() => setSaveStatus(''), 2000);
        return;
      }

      // Insert new workouts
      const workoutsToInsert = updatedExercises.map(exercise => ({
        user_id: userId,
        exercise_id: exercise.exercise_id,
        quantity: exercise.quantity,
        log_date: today
      }));

      const { error } = await supabase
        .from("user_daily_workouts")
        .insert(workoutsToInsert);

      if (error) throw error;

      // Update progress log with total calories
      const totalCaloriesBurned = updatedExercises.reduce((sum, ex) => sum + ex.calories, 0);

      const { data: existing } = await supabase
        .from("progresslog")
        .select("*")
        .eq("user_id", userId)
        .eq("log_date", today)
        .single();

      if (existing) {
        await supabase
          .from("progresslog")
          .update({
            calories_burned: totalCaloriesBurned,
            updated_at: new Date().toISOString(),
          })
          .eq("progress_id", existing.progress_id);
      }

      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving workouts:', error);
      setSaveStatus('Error saving');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    const calories = exercise.calories_burned_per_minute * quantity;
    const newExercises = [
      ...loggedExercises,
      {
        exercise_id: exercise.exercise_id,
        name: exercise.name,
        quantity,
        calories,
        muscle_group: exercise.muscle_group,
      }
    ];
    setLoggedExercises(newExercises);
    setQuantity(1);
    saveWorkouts(newExercises);
  };

  const handleRemoveExercise = (exerciseId: number) => {
    const newExercises = loggedExercises.filter(ex => ex.exercise_id !== exerciseId);
    setLoggedExercises(newExercises);
    saveWorkouts(newExercises);
  };

  const handleQuantityChange = (exerciseId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const newExercises = loggedExercises.map(exercise => {
      if (exercise.exercise_id === exerciseId) {
        const exercise_data = exercises.find(e => e.exercise_id === exerciseId);
        return {
          ...exercise,
          quantity: newQuantity,
          calories: newQuantity * (exercise_data?.calories_burned_per_minute || 0),
        };
      }
      return exercise;
    });
    
    setLoggedExercises(newExercises);
    saveWorkouts(newExercises);
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.muscle_group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const muscleGroupColors = {
    'Chest': '#f87171',
    'Back': '#facc15',
    'Legs': '#34d399',
    'Arms': '#60a5fa',
    'Shoulders': '#a78bfa',
    'Core': '#fb923c',
    'Full Body': '#e879f9',
    'Cardio': '#2dd4bf',
    'Other': '#94a3b8'
  };

  const caloriesByGroup = loggedExercises.reduce((acc, ex) => {
    const group = ex.muscle_group || 'Other';
    acc[group] = (acc[group] || 0) + ex.calories;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: Object.keys(caloriesByGroup),
    datasets: [
      {
        label: "Calories Burned",
        data: Object.values(caloriesByGroup),
        backgroundColor: Object.keys(caloriesByGroup).map(group => muscleGroupColors[group as keyof typeof muscleGroupColors] || '#94a3b8'),
        borderColor: Object.keys(caloriesByGroup).map(group => muscleGroupColors[group as keyof typeof muscleGroupColors] || '#64748b'),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'white',
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(0)} calories`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Workout & Activity</h1>
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
              onClick={() => setShowAddExercise(!showAddExercise)}
              className="bg-[#3730a3] text-white px-6 py-2 rounded-md hover:bg-[#312e81] transition-colors"
            >
              {showAddExercise ? 'Hide Exercise List' : 'Add Exercise'}
            </button>
          </div>
        </div>

        {showAddExercise && (
          <div className="bg-zinc-800 p-6 rounded-lg shadow-xl mb-6">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-zinc-700 text-white border border-zinc-600 rounded-lg mb-4 focus:outline-none focus:border-gray-300"
            />
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-24 p-3 bg-zinc-700 text-white border border-zinc-600 rounded-lg focus:outline-none focus:border-gray-300"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.exercise_id}
                  className="bg-zinc-700 p-4 rounded-lg hover:bg-zinc-600 cursor-pointer border border-zinc-600"
                  onClick={() => handleAddExercise(exercise)}
                >
                  <h3 className="font-semibold text-white mb-2">{exercise.name}</h3>
                  <div className="text-gray-300 space-y-1">
                    <p>Muscle Group: {exercise.muscle_group}</p>
                    <p>Calories/min: {exercise.calories_burned_per_minute}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-zinc-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Your Exercise List</h2>
          {loggedExercises.length === 0 ? (
            <p className="text-gray-400">No exercises added yet</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {loggedExercises.map((exercise) => (
                  <div
                    key={exercise.exercise_id}
                    className="bg-zinc-700 p-4 rounded-lg relative border border-zinc-600"
                  >
                    <button
                      onClick={() => handleRemoveExercise(exercise.exercise_id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
                    >
                      ×
                    </button>
                    <h3 className="font-semibold text-white mb-2">{exercise.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-gray-300">Minutes:</label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.quantity}
                        onChange={(e) => handleQuantityChange(exercise.exercise_id, Number(e.target.value))}
                        className="w-20 p-2 bg-zinc-600 text-white border border-zinc-500 rounded-md focus:outline-none focus:border-gray-300"
                      />
                    </div>
                    <div className="text-gray-300 space-y-1">
                      <p>Muscle Group: {exercise.muscle_group}</p>
                      <p>Total Calories: {exercise.calories}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-700 p-4 rounded-lg border border-zinc-600">
                  <h3 className="text-xl font-semibold mb-4">Workout Summary</h3>
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      Total Exercises: {loggedExercises.length}
                    </p>
                    <p className="text-gray-300">
                      Total Minutes: {loggedExercises.reduce((sum, ex) => sum + ex.quantity, 0)}
                    </p>
                    <p className="text-gray-300">
                      Total Calories Burned: {loggedExercises.reduce((sum, ex) => sum + ex.calories, 0)}
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-700 p-4 rounded-lg border border-zinc-600">
                  <h3 className="text-xl font-semibold mb-4">Calories by Muscle Group</h3>
                  {Object.keys(caloriesByGroup).length > 0 ? (
                    <div className="w-full h-64">
                      <Pie data={pieData} options={chartOptions} />
                    </div>
                  ) : (
                    <p className="text-gray-400">No workout data to display</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
