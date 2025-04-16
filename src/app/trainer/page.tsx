"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

interface User {
  name: string;
  email: string;
}

interface ClientMapping {
  user_id: string;
  user: User;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface MealPlan {
  id: number;
  name: string;
  calories: number;
  duration: number;
  user_id: string;
}

interface WorkoutPlan {
  id: number;
  name: string;
  description: string;
  user_id: string;
}

export default function TrainerPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        const trainerData = JSON.parse(sessionStorage.getItem("trainerData") || "{}");
        if (!trainerData.id) {
          console.error("No trainer ID found in session");
          return;
        }

        // Fetch clients using trainerusermap table
        const { data: clientMappings, error: clientError } = await supabase
          .from("trainerusermap")
          .select(`
            user_id,
            user:user_id (
              name,
              email
            )
          `)
          .eq("trainer_id", trainerData.id);

        if (clientError) {
          console.error("Error fetching clients:", clientError);
          return;
        }

        // Transform the data to match the expected format
        const clients = (clientMappings as unknown as ClientMapping[])?.map(mapping => ({
          id: mapping.user_id,
          name: mapping.user.name,
          email: mapping.user.email
        })) || [];

        setClients(clients);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trainer data:", error);
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
            const formData = new FormData(e.target as HTMLFormElement);
            const planName = formData.get("planName")?.toString() || "";
            const calories = parseInt(formData.get("calories")?.toString() || "0", 10);
            const duration = parseInt(formData.get("duration")?.toString() || "0", 10);
            const clientId = formData.get("clientId")?.toString() || "";

            if (!clientId) {
              alert("Please select a client");
              return;
            }

            try {
              const trainerData = JSON.parse(sessionStorage.getItem("trainerData") || "{}");
              const trainerId = trainerData.id;

              console.log("Creating meal plan with data:", {
                plan_name: planName,
                calories_per_day: calories,
                duration,
                trainer_id: trainerId,
                user_id: clientId
              });

              const { error } = await supabase.from("mealplan").insert([{
                plan_name: planName,
                calories_per_day: calories,
                duration,
                trainer_id: trainerId,
                user_id: clientId
              }]);

              if (error) {
                console.error("Detailed error:", error);
                throw error;
              }
              
              alert("Meal plan created successfully!");
              // Reset form
              (e.target as HTMLFormElement).reset();
              setSelectedClientId("");
            } catch (error) {
              console.error("Error creating meal plan:", error);
              alert(`Failed to create meal plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }}
          className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <select
            name="clientId"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.email})
              </option>
            ))}
          </select>
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
            const formData = new FormData(e.target as HTMLFormElement);
            const planName = formData.get("planName")?.toString() || "";
            const description = formData.get("description")?.toString() || "";
            const clientId = formData.get("clientId")?.toString() || "";

            if (!clientId) {
              alert("Please select a client");
              return;
            }

            try {
              const trainerData = JSON.parse(sessionStorage.getItem("trainerData") || "{}");
              const trainerId = trainerData.id;

              console.log("Creating workout plan with data:", {
                plan_name: planName,
                description,
                trainer_id: trainerId,
                user_id: clientId
              });

              const { error } = await supabase.from("workoutplan").insert([{
                plan_name: planName,
                description,
                trainer_id: trainerId,
                user_id: clientId
              }]);

              if (error) {
                console.error("Detailed error:", error);
                throw error;
              }

              alert("Workout plan created successfully!");
              // Reset form
              (e.target as HTMLFormElement).reset();
              setSelectedClientId("");
            } catch (error) {
              console.error("Error creating workout plan:", error);
              alert(`Failed to create workout plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }}
          className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <select
            name="clientId"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-400"
            required
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.email})
              </option>
            ))}
          </select>
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