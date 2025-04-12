"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

interface WorkoutPlan {
  plan_name: string;
  description: string;
  trainer: {
    name: string;
    specialization: string;
  };
}

export default function WorkoutPlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      const userData = sessionStorage.getItem("userData");
      if (!userData) return;

      const { user_id } = JSON.parse(userData);

      const { data, error } = await supabase
        .from("workoutplan")
        .select(`
          plan_name,
          description,
          trainerandnutritionist (
            name,
            specialization
          )
        `)
        .eq("user_id", user_id);

      if (error) {
        console.error("Error fetching plans:", error);
      } else {
        // Changing TrainerAndNutritionist object to Trainer object
        const transformed_data = data.map((item: any) => ({
            plan_name: item.plan_name,
            description: item.description,
            trainer: item.trainerandnutritionist?.[0] ?? {
              name: "Unknown",
              specialization: "Unknown"
            }
          }));
        setPlans(transformed_data);
      }
      setLoading(false);
    };

    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-black-700 mb-6">Your Workout Plans</h1>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : plans.length === 0 ? (
        <p className="text-gray-600">No workout plans assigned yet.</p>
      ) : (
        <ul className="space-y-4">
          {plans.map((plan, idx) => (
            <li key={idx} className="bg-white p-5 rounded-xl shadow border border-gray-200">
              <h2 className="text-xl font-semibold text-black">{plan.plan_name}</h2>
              <p className="text-gray-700">
                Assigned by <strong>{plan.trainer.name}</strong> ({plan.trainer.specialization})
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
