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
  const router = useRouter();

  useEffect(() => {
    const fetchExercises = async () => {
      const { data, error } = await supabase.from("exercisedatabase").select("*");
      if (error) {
        console.error("Error fetching exercises:", error);
      } else {
        setExercises(data);
      }
    };

    const fetchLoggedExercises = async () => {
      const userData = sessionStorage.getItem("userData");
      if (!userData) return;
      const { user_id } = JSON.parse(userData);
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("user_daily_workouts")
        .select(`exercise_id, quantity, exercisedatabase(name, calories_burned_per_minute, muscle_group)`)
        .eq("user_id", user_id)
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

    fetchExercises();
    fetchLoggedExercises();
  }, []);

  const handleAddExercise = (exercise: Exercise) => {
    const calories = exercise.calories_burned_per_minute * quantity;
    setLoggedExercises((prev) => [
      ...prev,
      {
        exercise_id: exercise.exercise_id,
        name: exercise.name,
        quantity,
        calories,
        muscle_group: exercise.muscle_group,
      },
    ]);
  };

  const handleRemoveExercise = (index: number) => {
    setLoggedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const userData = sessionStorage.getItem("userData");
    if (!userData) return;
    const { user_id } = JSON.parse(userData);
    const today = new Date().toISOString().split("T")[0];

    let totalCaloriesBurned = 0;

    for (const log of loggedExercises) {
      totalCaloriesBurned += log.calories;
      await supabase.from("user_daily_workouts").insert({
        user_id,
        exercise_id: log.exercise_id,
        quantity: log.quantity,
        log_date: today,
      });
    }

    const { data: existing } = await supabase
      .from("progresslog")
      .select("*")
      .eq("user_id", user_id)
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
    } else {
      await supabase.from("progresslog").insert({
        user_id,
        log_date: today,
        calories_burned: totalCaloriesBurned,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    alert("Workout logged successfully!");
    setShowAddExercise(false);

    const { data, error } = await supabase
      .from("user_daily_workouts")
      .select(`exercise_id, quantity, exercisedatabase(name, calories_burned_per_minute, muscle_group)`)
      .eq("user_id", user_id)
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

  const caloriesByGroup = loggedExercises.reduce((acc, ex) => {
    acc[ex.muscle_group] = (acc[ex.muscle_group] || 0) + ex.calories;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: Object.keys(caloriesByGroup),
    datasets: [
      {
        label: "Calories Burned",
        data: Object.values(caloriesByGroup),
        backgroundColor: [
          "#f87171",
          "#facc15",
          "#34d399",
          "#60a5fa",
          "#a78bfa",
          "#fb923c",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Workout & Activity</h1>

      {/* BACK BUTTON SECTION */}
      <button
        onClick={() => router.push("/workout")}
        className="mb-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
      >
        ← Back to Workout Menu
      </button>

      {!showAddExercise && (
        <>
          {loggedExercises.length > 0 && (
            <div className="bg-zinc-800 p-4 rounded-xl mb-6">
              <h2 className="text-xl font-semibold mb-4">Your Exercise List</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {loggedExercises.map((log, idx) => (
                  <div key={idx} className="bg-zinc-700 p-4 rounded-md relative">
                    <h3 className="text-lg font-bold">{log.name}</h3>
                    <p>Quantity: {log.quantity}</p>
                    <p>Total Calories: {log.calories} kcal</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(caloriesByGroup).length > 0 && (
          <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* Pie Chart Section */}
              <div className="bg-zinc-800 p-4 rounded-xl w-full md:w-1/2">
              <h2 className="text-xl font-semibold mb-4">Calories by Muscle Group</h2>
              <div className="w-full max-w-xs mx-auto">
                  <Pie data={pieData} />
              </div>
              </div>

              {/* Total Calories Section */}
              <div className="bg-zinc-800 p-4 rounded-xl w-full md:w-1/2 flex flex-col justify-center items-center">
              <h2 className="text-xl font-semibold mb-4">Total Calories Burned Today</h2>
              <p className="text-7xl font-bold text-green-400">
                  {loggedExercises.reduce((sum, ex) => sum + ex.calories, 0)} kcal
              </p>
              </div>
          </div>
          )}

          <button
            onClick={() => setShowAddExercise(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md"
          >
            Add Exercise
          </button>
        </>
      )}

      {showAddExercise && (
        <div className="bg-zinc-800 p-4 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-2">Select Exercise</h2>
          <div className="mb-2">
            <label className="block mb-1">Default Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="bg-zinc-700 text-white px-3 py-2 rounded-md w-24"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {exercises.map((exercise, idx) => (
              <div
                key={exercise.exercise_id}
                className="bg-zinc-700 p-4 rounded-md cursor-pointer hover:bg-zinc-600"
                onClick={() => handleAddExercise(exercise)}
              >
                <h3 className="text-lg font-bold">{exercise.name}</h3>
                <p>Calories/min: {exercise.calories_burned_per_minute}</p>
                <p>Muscle Group: {exercise.muscle_group}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSubmit}
              disabled={loggedExercises.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
            >
              Submit Workout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
