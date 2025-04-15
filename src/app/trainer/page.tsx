"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

interface Client {
  id: number;
  name: string;
  email: string;
}

interface MealPlan {
  id: number;
  name: string;
  calories: number;
  duration: number;
}

interface WorkoutPlan {
  id: number;
  name: string;
  description: string;
}

export default function TrainerPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainerData = async () => {
      setLoading(true);
      try {
        const trainerData = JSON.parse(sessionStorage.getItem("trainerData") || "{}");
        const trainerId = trainerData.id;

        // Fetch clients
        const { data: clientsData } = await supabase
          .from("trainerusermap")
          .select("user_id, User(name, email)")
          .eq("trainer_id", trainerId);

        setClients(clientsData?.map((item: any) => ({
          id: item.user_id,
          name: item.User.name,
          email: item.User.email,
        })) || []);

        // Fetch meal plans
        const { data: mealPlansData } = await supabase
          .from("mealplan")
          .select("id, plan_name, calories_per_day, duration")
          .eq("trainer_id", trainerId);

        setMealPlans(mealPlansData?.map((item: any) => ({
          id: item.id,
          name: item.plan_name,
          calories: item.calories_per_day,
          duration: item.duration,
        })) || []);

        // Fetch workout plans
        const { data: workoutPlansData } = await supabase
          .from("workoutplan")
          .select("id, plan_name, description")
          .eq("trainer_id", trainerId);

        setWorkoutPlans(workoutPlansData?.map((item: any) => ({
          id: item.id,
          name: item.plan_name,
          description: item.description,
        })) || []);
      } catch (error) {
        console.error("Error fetching trainer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerData();
  }, []);

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 text-white">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-400">Trainer Dashboard</h1>

      {/* Clients Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-yellow-400">Your Clients</h2>
        {clients.length === 0 ? (
          <p className="text-gray-300">No clients assigned yet.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <li key={client.id} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <p className="font-bold text-lg text-white">{client.name}</p>
                <p className="text-gray-400">{client.email}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Meal Plans Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-green-400">Meal Plans</h2>
        {mealPlans.length === 0 ? (
          <p className="text-gray-300">No meal plans created yet.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans.map((plan) => (
              <li key={plan.id} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <p className="font-bold text-lg text-white">{plan.name}</p>
                <p className="text-gray-400">Calories: {plan.calories} kcal</p>
                <p className="text-gray-400">Duration: {plan.duration} days</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add Meal Plan Form */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-blue-400">Create Meal Plan</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const planName = formData.get("planName");
            const calories = parseInt(formData.get("calories"), 10);
            const duration = parseInt(formData.get("duration"), 10);

            try {
              const trainerData = JSON.parse(sessionStorage.getItem("trainerData") || "{}");
              const trainerId = trainerData.id;

              const { error } = await supabase.from("mealplan").insert({
                plan_name: planName,
                calories_per_day: calories,
                duration,
                trainer_id: trainerId,
              });

              if (error) throw error;
              alert("Meal plan created successfully!");
            } catch (error) {
              console.error("Error creating meal plan:", error);
              alert("Failed to create meal plan.");
            }
          }}
          className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <input
            type="text"
            name="planName"
            placeholder="Plan Name"
            className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="number"
            name="calories"
            placeholder="Calories per Day"
            className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="number"
            name="duration"
            placeholder="Duration (days)"
            className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Meal Plan
          </button>
        </form>
      </section>

      {/* Workout Plans Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-red-400">Workout Plans</h2>
        {workoutPlans.length === 0 ? (
          <p className="text-gray-300">No workout plans created yet.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workoutPlans.map((plan) => (
              <li key={plan.id} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <p className="font-bold text-lg text-white">{plan.name}</p>
                <p className="text-gray-400">{plan.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add Workout Plan Form */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-purple-400">Create Workout Plan</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const planName = formData.get("planName");
            const description = formData.get("description");

            try {
              const trainerData = JSON.parse(sessionStorage.getItem("trainerData") || "{}");
              const trainerId = trainerData.id;

              const { error } = await supabase.from("workoutplan").insert({
                plan_name: planName,
                description,
                trainer_id: trainerId,
              });

              if (error) throw error;
              alert("Workout plan created successfully!");
            } catch (error) {
              console.error("Error creating workout plan:", error);
              alert("Failed to create workout plan.");
            }
          }}
          className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <input
            type="text"
            name="planName"
            placeholder="Plan Name"
            className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-400"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-400"
            required
          ></textarea>
          <button
            type="submit"
            className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Workout Plan
          </button>
        </form>
      </section>
    </div>
  );
}