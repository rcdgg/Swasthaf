"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/navigation';

interface Trainer {
  trainer_id: number;
  name: string;
  trainer_name: string;
  specialization: string;
  certification: string;
  experience: number;
  rating: number;
  earnings: number;
  bookings: number;
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

type TabType = 'users' | 'trainers';

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
      <div className="bg-[#121212] text-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
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
                <div key={index} className="border border-gray-700 rounded p-3">
                  <p className="font-medium">Name: {trainer.trainer_name}</p>
                  <p className="text-gray-400">Specialization: {trainer.specialization}</p>
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
                <div key={index} className="border border-gray-700 rounded p-3">
                  <p className="font-medium">{plan.plan_name}</p>
                  <p className="text-gray-400">Calories per day: {plan.calories_per_day}</p>
                  <p className="text-gray-400">Duration: {plan.duration} days</p>
                  <p className="text-gray-400">Created by: {plan.trainer_name}</p>
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

interface UserResponse {
  name: string;
  email: string;
}

interface MealPlanResponse {
  plan_name: string;
  calories_per_day: number;
  duration: number;
  user_id: number;
  User: {
    name: string;
  };
}

interface WorkoutPlanResponse {
  plan_name: string;
  description: string;
  user_id: number;
  User: {
    name: string;
  };
}

type SortableTrainerAttribute = 'name' | 'specialization' | 'experience' | 'rating' | 'earnings' | 'bookings';

interface TrainerSortConfig {
  attribute: SortableTrainerAttribute;
  order: 'asc' | 'desc';
}

const TRAINER_SORTABLE_COLUMNS: Record<string, { label: string; sortable: boolean }> = {
  name: { label: 'Name', sortable: false },
  specialization: { label: 'Specialization', sortable: false },
  certification: { label: 'Certification', sortable: false },
  experience: { label: 'Experience', sortable: true },
  rating: { label: 'Rating', sortable: true },
  earnings: { label: 'Earnings', sortable: true },
  bookings: { label: 'Bookings', sortable: true }
};

interface AssociatedUser {
  user_id: number;
  name: string;
  email: string;
}

interface TrainerMealPlan {
  plan_name: string;
  calories_per_day: number;
  duration: number;
  user_id: number;
  user_name: string;
}

interface TrainerWorkoutPlan {
  plan_name: string;
  description: string;
  user_id: number;
  user_name: string;
}

interface TrainerModalProps {
  trainer: Trainer;
  onClose: () => void;
}

const TrainerModal: React.FC<TrainerModalProps> = ({ trainer, onClose }) => {
  const [associatedUsers, setAssociatedUsers] = useState<AssociatedUser[]>([]);
  const [mealPlans, setMealPlans] = useState<TrainerMealPlan[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<TrainerWorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainerDetails = async () => {
      try {
        // Fetch associated users
        const { data: userData, error: userError } = await supabase
          .from('trainerusermap')
          .select(`
            user_id,
            User (
              name,
              email
            )
          `)
          .eq('trainer_id', trainer.trainer_id) as { data: { user_id: number; User: UserResponse }[] | null; error: any };

        if (userError) throw userError;

        const processedUsers = userData?.map(item => ({
          user_id: item.user_id,
          name: item.User.name,
          email: item.User.email
        })) || [];

        // Fetch meal plans
        const { data: mealPlanData, error: mealPlanError } = await supabase
          .from('mealplan')
          .select(`
            plan_name,
            calories_per_day,
            duration,
            user_id,
            User (
              name
            )
          `)
          .eq('trainer_id', trainer.trainer_id) as { data: MealPlanResponse[] | null; error: any };

        if (mealPlanError) throw mealPlanError;

        const processedMealPlans = mealPlanData?.map(item => ({
          plan_name: item.plan_name,
          calories_per_day: item.calories_per_day,
          duration: item.duration,
          user_id: item.user_id,
          user_name: item.User.name
        })) || [];

        // Fetch workout plans
        const { data: workoutPlanData, error: workoutPlanError } = await supabase
          .from('workoutplan')
          .select(`
            plan_name,
            description,
            user_id,
            User (
              name
            )
          `)
          .eq('trainer_id', trainer.trainer_id) as { data: WorkoutPlanResponse[] | null; error: any };

        if (workoutPlanError) throw workoutPlanError;

        const processedWorkoutPlans = workoutPlanData?.map(item => ({
          plan_name: item.plan_name,
          description: item.description,
          user_id: item.user_id,
          user_name: item.User.name
        })) || [];

        setAssociatedUsers(processedUsers);
        setMealPlans(processedMealPlans);
        setWorkoutPlans(processedWorkoutPlans);
      } catch (err) {
        console.error('Error fetching trainer details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerDetails();
  }, [trainer.trainer_id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#121212] text-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{trainer.name}'s Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <>
            {/* Associated Users Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Associated Users</h3>
              {associatedUsers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {associatedUsers.map((user) => (
                    <div key={user.user_id} className="border border-gray-700 rounded p-3">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-gray-400">Email: {user.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No users associated</p>
              )}
            </div>

            {/* Meal Plans Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Meal Plans</h3>
              {mealPlans.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {mealPlans.map((plan, index) => (
                    <div key={index} className="border border-gray-700 rounded p-3">
                      <p className="font-medium">{plan.plan_name}</p>
                      <p className="text-gray-400">Calories per day: {plan.calories_per_day}</p>
                      <p className="text-gray-400">Duration: {plan.duration} days</p>
                      <p className="text-gray-400">Assigned to: {plan.user_name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No meal plans created</p>
              )}
            </div>

            {/* Workout Plans Section */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Workout Plans</h3>
              {workoutPlans.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {workoutPlans.map((plan, index) => (
                    <div key={index} className="border border-gray-700 rounded p-3">
                      <p className="font-medium">{plan.plan_name}</p>
                      <p className="text-gray-400">Description: {plan.description}</p>
                      <p className="text-gray-400">Assigned to: {plan.user_name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No workout plans created</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [trainerSortConfigs, setTrainerSortConfigs] = useState<TrainerSortConfig[]>([]);
  const [mostExperiencedTrainers, setMostExperiencedTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const router = useRouter();

  const handleSort = (attribute: string) => {
    if (!SORTABLE_COLUMNS[attribute].sortable) return;

    setSortConfigs(prevConfigs => {
      const existingConfig = prevConfigs[0];
      let newConfigs: SortConfig[] = [];

      if (!existingConfig || existingConfig.attribute !== attribute) {
        // First click on a new attribute - Add new sort attribute with ascending order
        newConfigs = [{ attribute: attribute as SortableAttribute, order: 'asc' }];
      } else if (existingConfig.order === 'asc') {
        // Second click - Change to descending
        newConfigs = [{ ...existingConfig, order: 'desc' }];
      }
      // Third click - Remove sort (newConfigs remains empty)

      // Apply sorting
      const sortedUsers = [...users].sort((a, b) => {
        if (newConfigs.length === 0) return 0;

        const config = newConfigs[0];
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

        return config.order === 'asc' ? comparison : -comparison;
      });

      setUsers(sortedUsers);
      return newConfigs;
    });
  };

  const handleTrainerSort = (attribute: string) => {
    if (!TRAINER_SORTABLE_COLUMNS[attribute].sortable) return;

    setTrainerSortConfigs(prevConfigs => {
      const existingConfig = prevConfigs[0];
      let newConfigs: TrainerSortConfig[] = [];

      if (!existingConfig || existingConfig.attribute !== attribute) {
        // First click on a new attribute - Add new sort attribute with ascending order
        newConfigs = [{ attribute: attribute as SortableTrainerAttribute, order: 'asc' }];
      } else if (existingConfig.order === 'asc') {
        // Second click - Change to descending
        newConfigs = [{ ...existingConfig, order: 'desc' }];
      }
      // Third click - Remove sort (newConfigs remains empty)

      // Apply sorting
      const sortedTrainers = [...trainers].sort((a, b) => {
        if (newConfigs.length === 0) return 0;

        const config = newConfigs[0];
        const aValue = a[config.attribute];
        const bValue = b[config.attribute];

        // Handle null values - always at bottom
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        let comparison = 0;
        
        // Compare numbers
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
        // Compare strings
        else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return config.order === 'asc' ? comparison : -comparison;
      });

      setTrainers(sortedTrainers);
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

    const fetchData = async () => {
      try {
        if (activeTab === 'users') {
          await fetchUsers();
        } else {
          await fetchTrainers();
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, activeTab]);

  const fetchUsers = async () => {
    try {
      // First, get the base user data
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) throw userError;

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

      // Get average calories burned for each user
      const { data: caloriesData, error: caloriesError } = await supabase
        .from('progresslog')
        .select('user_id, calories_burned, log_date')
        .order('created_at', { ascending: false });

      if (caloriesError) throw caloriesError;

      // Get latest mental health data
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

      // Get user's meal plans
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
        `) as { data: { user_id: number; plan_name: string; calories_per_day: number; duration: number; trainerandnutritionist: { name: string } }[] | null; error: any };

      if (mealPlanError) throw mealPlanError;

      // Process and combine the data
      const processedUsers = userData.map(user => {
        // Get user's trainers
        const userTrainers = trainerData
          ?.filter(t => t.user_id === user.user_id)
          .map(t => ({
            trainer_name: t.trainerandnutritionist.name,
            specialization: t.trainerandnutritionist.specialization
          })) || [];

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

        // Get user's meal plans
        const userMealPlans = mealPlanData
          ?.filter(m => m.user_id === user.user_id)
          .map(m => ({
            plan_name: m.plan_name,
            calories_per_day: m.calories_per_day,
            duration: m.duration,
            trainer_name: m.trainerandnutritionist.name
          })) || [];

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
          trainers: userTrainers,
          mealplans: userMealPlans
        };
      });

      setUsers(processedUsers);
    } catch (err: any) {
      throw err;
    }
  };

  const fetchTrainers = async () => {
    try {
      const { data, error } = await supabase
        .from("trainerandnutritionist")
        .select("trainer_id, name, specialization, certification, experience, rating");

      if (error) throw error;

      // Calculate earnings and bookings for each trainer
      const trainersWithStats = await Promise.all(
        data.map(async (trainer) => {
          const { data: bookings } = await supabase
            .from("bookings")
            .select("amount")
            .eq("trainer_id", trainer.trainer_id);

          const totalEarnings = bookings?.reduce((sum, booking) => sum + booking.amount, 0) || 0;
          const totalBookings = bookings?.length || 0;

          return {
            ...trainer,
            trainer_name: trainer.name,
            earnings: totalEarnings,
            bookings: totalBookings,
          };
        })
      );

      setTrainers(trainersWithStats);
      setLoading(false);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchMostExperiencedTrainers = async () => {
    try {
      const { data, error } = await supabase
        .from('trainerandnutritionist')
        .select('specialization, name, experience')
        .order('experience', { ascending: false });

      if (error) throw error;

      // Group by specialization and get the most experienced trainer for each
      const groupedBySpecialization = data.reduce((acc, trainer) => {
        if (!acc[trainer.specialization] || acc[trainer.specialization].experience < trainer.experience) {
          acc[trainer.specialization] = trainer;
        }
        return acc;
      }, {} as Record<string, any>);

      setMostExperiencedTrainers(Object.values(groupedBySpecialization));
    } catch (err: any) {
      console.error('Error fetching most experienced trainers:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'trainers') {
      fetchMostExperiencedTrainers();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-red-400">{error}</div>
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

  const renderTrainerColumnHeader = (key: string) => {
    const { label, sortable } = TRAINER_SORTABLE_COLUMNS[key];
    const sortConfig = trainerSortConfigs.find(config => config.attribute === key);
    const sortIndex = trainerSortConfigs.findIndex(config => config.attribute === key);
    const isSorted = sortIndex !== -1;

    return (
      <th 
        key={key}
        onClick={() => sortable && handleTrainerSort(key)}
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
                  {trainerSortConfigs.length > 1 && <sup className="ml-0.5">{sortIndex + 1}</sup>}
                </>
              ) : ' ↕'}
            </span>
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('trainers')}
                className={`${
                  activeTab === 'trainers'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Trainers
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'users' ? (
          <div className="bg-[#1E1E1E] shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    {Object.keys(SORTABLE_COLUMNS).map(key => renderColumnHeader(key))}
                  </tr>
                </thead>
                <tbody className="bg-[#1E1E1E] divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-800">
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 hover:text-blue-600 cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.age || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.weight || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.height || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.goal || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.dietary_preferences || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.avg_calories_burned ? Math.round(user.avg_calories_burned) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.mood || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.stress_level || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.sleep_quality || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(user.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
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
        ) : (
          <>
            {/* All Trainers Table */}
            <div className="bg-[#1E1E1E] shadow-md rounded-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      {Object.keys(TRAINER_SORTABLE_COLUMNS).map(key => renderTrainerColumnHeader(key))}
                    </tr>
                  </thead>
                  <tbody className="bg-[#1E1E1E] divide-y divide-gray-700">
                    {trainers.map((trainer) => (
                      <tr key={trainer.trainer_id} className="hover:bg-gray-800">
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 hover:text-blue-600 cursor-pointer"
                          onClick={() => setSelectedTrainer(trainer)}
                        >
                          {trainer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {trainer.specialization}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {trainer.certification}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {trainer.experience}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {trainer.rating}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          ${trainer.earnings.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {trainer.bookings}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Most Experienced Trainers Section */}
            <div className="bg-[#1E1E1E] shadow-md rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-gray-300">Most Experienced Trainers by Specialization</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Specialization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Trainer Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Experience (years)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1E1E1E] divide-y divide-gray-700">
                    {mostExperiencedTrainers.map((trainer, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {trainer.specialization}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {trainer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {trainer.experience}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {selectedUser && (
          <UserModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}

        {selectedTrainer && (
          <TrainerModal
            trainer={selectedTrainer}
            onClose={() => setSelectedTrainer(null)}
          />
        )}
      </div>
    </div>
  );
}