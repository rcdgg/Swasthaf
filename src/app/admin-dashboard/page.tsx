"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/navigation';

interface Trainer {
  trainer_name: string;
  specialization: string;
}

interface MealPlan {
  plan_name: string;
  calories_per_day: number;
  duration: number;
  trainer_name: string;
}

interface User {
  user_id: number;
  name: string;
  email: string;
  age: number | null;
  weight: number | null;
  height: number | null;
  goal: string | null;
  dietary_preferences: string | null;
  created_at: string;
  avg_calories_burned: number | null;
  mood: string | null;
  stress_level: number | null;
  sleep_quality: number | null;
  mental_health_created_at: string | null;
  payment_status: string | null;
  payment_due_date: string | null;
  status: 'Active' | 'Inactive';
  trainers?: Trainer[];
  mealplans?: MealPlan[];
}

type SortableAttribute = 'age' | 'weight' | 'height' | 'avg_calories_burned' | 'stress_level' | 'sleep_quality' | 'created_at' | 'mental_health_created_at' | 'payment_due_date' | 'status';

interface SortConfig {
  attribute: SortableAttribute;
  order: 'asc' | 'desc';
}

const SORTABLE_COLUMNS: Record<string, { label: string; sortable: boolean }> = {
  name: { label: 'Name', sortable: false },
  email: { label: 'Email', sortable: false },
  age: { label: 'Age', sortable: true },
  weight: { label: 'Weight (kg)', sortable: true },
  height: { label: 'Height (cm)', sortable: true },
  goal: { label: 'Goal', sortable: false },
  dietary_preferences: { label: 'Dietary Preferences', sortable: false },
  avg_calories_burned: { label: 'Avg Calories Burned', sortable: true },
  mood: { label: 'Mood', sortable: false },
  stress_level: { label: 'Stress Level', sortable: true },
  sleep_quality: { label: 'Sleep Quality', sortable: true },
  created_at: { label: 'Created At', sortable: true },
  mental_health_created_at: { label: 'Last Mental Health Update', sortable: true },
  payment_due_date: { label: 'Payment Status', sortable: true },
  status: { label: 'Status', sortable: true }
};

interface UserModalProps {
  user: User;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{user.name}'s Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Trainers Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Associated Trainers</h3>
          {user.trainers && user.trainers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {user.trainers.map((trainer, index) => (
                <div key={index} className="border rounded p-3">
                  <p className="font-medium">{trainer.trainer_name}</p>
                  <p className="text-gray-600">Specialization: {trainer.specialization}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No trainers associated</p>
          )}
        </div>

        {/* Meal Plans Section */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Meal Plans</h3>
          {user.mealplans && user.mealplans.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {user.mealplans.map((plan, index) => (
                <div key={index} className="border rounded p-3">
                  <p className="font-medium">{plan.plan_name}</p>
                  <p className="text-gray-600">Calories per day: {plan.calories_per_day}</p>
                  <p className="text-gray-600">Duration: {plan.duration} days</p>
                  <p className="text-gray-600">Created by: {plan.trainer_name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No meal plans available</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface TrainerMapResponse {
  user_id: number;
  trainerandnutritionist: {
    name: string;
    specialization: string;
  };
}

interface MealPlanResponse {
  user_id: number;
  plan_name: string;
  calories_per_day: number;
  duration: number;
  trainerandnutritionist: {
    name: string;
  };
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const router = useRouter();

  const handleSort = (attribute: string) => {
    if (!SORTABLE_COLUMNS[attribute].sortable) return;

    setSortConfigs(prevConfigs => {
      const existingIndex = prevConfigs.findIndex(config => config.attribute === attribute);
      let newConfigs = [...prevConfigs];

      if (existingIndex === -1) {
        // First click - Add new sort attribute with ascending order
        if (newConfigs.length >= 2) return newConfigs; // Limit to 2 sorts
        newConfigs.push({ attribute: attribute as SortableAttribute, order: 'asc' });
      } else {
        const currentConfig = newConfigs[existingIndex];
        if (currentConfig.order === 'asc') {
          // Second click - Change to descending
          newConfigs[existingIndex] = { ...currentConfig, order: 'desc' };
        } else {
          // Third click - Remove this sort
          newConfigs.splice(existingIndex, 1);
        }
      }

      // Apply sorting
      const sortedUsers = [...users].sort((a, b) => {
        for (const config of newConfigs) {
          const aValue = a[config.attribute as keyof User];
          const bValue = b[config.attribute as keyof User];

          // Handle null values - always at bottom
          if (aValue === null && bValue === null) return 0;
          if (aValue === null) return 1;
          if (bValue === null) return -1;

          let comparison = 0;
          
          // Compare date strings
          if (typeof aValue === 'string' && typeof bValue === 'string' && 
              (aValue.includes('-') || aValue.includes('/'))) {
            const aTime = new Date(aValue).getTime();
            const bTime = new Date(bValue).getTime();
            comparison = aTime > bTime ? 1 : aTime < bTime ? -1 : 0;
          } 
          // Compare numbers
          else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          }
          // Compare strings
          else {
            comparison = String(aValue).localeCompare(String(bValue));
          }

          // Apply sort order and return if there's a difference
          if (comparison !== 0) {
            return config.order === 'asc' ? comparison : -comparison;
          }
        }
        return 0;
      });

      setUsers(sortedUsers);
      return newConfigs;
    });
  };

  useEffect(() => {
    // Check if user is admin
    const userType = sessionStorage.getItem('userType');
    if (userType !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        // First, get the base user data
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('*')
          .order('created_at', { ascending: false });

        if (userError) throw userError;

        // Get average calories burned for each user
        const { data: caloriesData, error: caloriesError } = await supabase
          .from('progresslog')
          .select('user_id, calories_burned, log_date')
          .order('created_at', { ascending: false });

        if (caloriesError) throw caloriesError;

        // Get mental health data for each user
        const { data: mentalHealthData, error: mentalHealthError } = await supabase
          .from('mentalhealthlog')
          .select('user_id, mood, stress_level, sleep_quality, created_at')
          .order('created_at', { ascending: false });

        if (mentalHealthError) throw mentalHealthError;

        // Get payment data for each user
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment')
          .select('user_id, status, created_at')
          .neq('status', 'Completed')
          .order('created_at', { ascending: false });

        if (paymentError) throw paymentError;

        // Get trainer data for each user
        const { data: trainerData, error: trainerError } = await supabase
          .from('trainerusermap')
          .select(`
            user_id,
            trainerandnutritionist:trainer_id (
              name,
              specialization
            )
          `) as { data: TrainerMapResponse[] | null; error: any };

        if (trainerError) throw trainerError;

        // Get meal plan data for each user
        const { data: mealPlanData, error: mealPlanError } = await supabase
          .from('mealplan')
          .select(`
            user_id,
            plan_name,
            calories_per_day,
            duration,
            trainerandnutritionist:trainer_id (
              name
            )
          `) as { data: MealPlanResponse[] | null; error: any };

        if (mealPlanError) throw mealPlanError;

        // Process and combine the data
        const processedUsers = userData.map(user => {
          // Calculate average calories burned
          const userCalories = caloriesData?.filter(c => c.user_id === user.user_id);
          const avgCalories = userCalories?.length 
            ? userCalories.reduce((sum, c) => sum + c.calories_burned, 0) / userCalories.length 
            : null;

          // Get latest mental health data
          const latestMentalHealth = mentalHealthData?.find(m => m.user_id === user.user_id);

          // Get payment status
          const pendingPayment = paymentData?.find(p => p.user_id === user.user_id);
          const payment_status = pendingPayment ? 'Due' : 'Completed';
          const payment_due_date = pendingPayment ? pendingPayment.created_at : null;

          // Get user's trainers
          const userTrainers = trainerData
            ?.filter(t => t.user_id === user.user_id)
            .map(t => ({
              trainer_name: t.trainerandnutritionist.name,
              specialization: t.trainerandnutritionist.specialization
            }));

          // Get user's meal plans
          const userMealPlans = mealPlanData
            ?.filter(m => m.user_id === user.user_id)
            .map(m => ({
              plan_name: m.plan_name,
              calories_per_day: m.calories_per_day,
              duration: m.duration,
              trainer_name: m.trainerandnutritionist.name
            }));

          // Check if user is active
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          
          const hasRecentActivity = (
            mentalHealthData?.some(m => m.user_id === user.user_id && new Date(m.created_at) > oneMonthAgo) ||
            caloriesData?.some(c => c.user_id === user.user_id && new Date(c.log_date) > oneMonthAgo) ||
            paymentData?.some(p => p.user_id === user.user_id && new Date(p.created_at) > oneMonthAgo)
          );

          return {
            ...user,
            avg_calories_burned: avgCalories,
            mood: latestMentalHealth?.mood || null,
            stress_level: latestMentalHealth?.stress_level || null,
            sleep_quality: latestMentalHealth?.sleep_quality || null,
            mental_health_created_at: latestMentalHealth?.created_at || null,
            payment_status,
            payment_due_date,
            status: hasRecentActivity ? 'Active' : 'Inactive',
            trainers: userTrainers || [],
            mealplans: userMealPlans || []
          };
        });

        setUsers(processedUsers);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  const renderColumnHeader = (key: string) => {
    const { label, sortable } = SORTABLE_COLUMNS[key];
    const sortConfig = sortConfigs.find(config => config.attribute === key);
    const sortIndex = sortConfigs.findIndex(config => config.attribute === key);
    const isSorted = sortIndex !== -1;

    return (
      <th 
        key={key}
        onClick={() => sortable && handleSort(key)}
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
          sortable ? 'cursor-pointer hover:bg-gray-100' : ''
        }`}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          {sortable && (
            <span className="text-gray-400">
              {isSorted ? (
                <>
                  {sortConfig?.order === 'asc' ? ' ↑' : ' ↓'}
                  {sortConfigs.length > 1 && <sup className="ml-0.5">{sortIndex + 1}</sup>}
                </>
              ) : ' ↕'}
            </span>
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => {
              sessionStorage.clear();
              router.push('/login');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(SORTABLE_COLUMNS).map(key => renderColumnHeader(key))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.age || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.weight || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.height || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.goal || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.dietary_preferences || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.avg_calories_burned ? Math.round(user.avg_calories_burned) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.mood || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.stress_level || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.sleep_quality || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.mental_health_created_at ? new Date(user.mental_health_created_at).toLocaleString() : '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      user.payment_status === 'Completed' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {user.payment_status === 'Completed' 
                        ? 'Completed' 
                        : user.payment_due_date 
                          ? new Date(user.payment_due_date).toLocaleString()
                          : '-'
                      }
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      user.status === 'Active' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {user.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
} 