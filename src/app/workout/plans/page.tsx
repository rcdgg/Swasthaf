"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

interface WorkoutPlan {
  plan_name: string;
  description: string;
  trainerandnutritionist: {
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
          trainerandnutritionist!inner (
            name,
            specialization
          )
        `)
        .eq("user_id", user_id);

      if (error) {
        console.error("Error fetching plans:", error);
      } else {
        setPlans(data.map((item: any) => ({
          plan_name: item.plan_name,
          description: item.description ?? "No description provided for this workout",
          trainerandnutritionist: {
            name: item.trainerandnutritionist.name,
            specialization: item.trainerandnutritionist.specialization
          }
        })));
      }
      setLoading(false);
    };

    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Workout Plans</h1>
        </div>

        {loading ? (
          <div className="bg-zinc-800 p-6 rounded-lg shadow-xl">
            <p className="text-gray-300">Loading...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-zinc-800 p-6 rounded-lg shadow-xl">
            <p className="text-gray-300">No workout plans assigned yet.</p>
          </div>
        ) : (
          <div className="bg-zinc-800 p-6 rounded-lg shadow-xl">
            <ul className="space-y-4">
              {plans.map((plan, idx) => (
                <li key={idx} className="bg-zinc-700 p-4 rounded-lg border border-zinc-600">
                  <h2 className="text-xl font-semibold text-white mb-2">{plan.plan_name}</h2>
                  <p className="text-gray-300 mb-3">{plan.description}</p>
                  <p className="text-gray-300">
                    Assigned by <span className="text-blue-400">{plan.trainerandnutritionist.name}</span>{" "}
                    <span className="text-gray-400">({plan.trainerandnutritionist.specialization})</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
