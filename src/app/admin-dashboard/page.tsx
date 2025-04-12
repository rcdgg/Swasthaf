"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/navigation';

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
}

type SortableAttribute = 'age' | 'weight' | 'height' | 'avg_calories_burned' | 'stress_level' | 'sleep_quality' | 'created_at' | 'mental_health_created_at' | 'payment_due_date';

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
  payment_due_date: { label: 'Payment Status', sortable: true }
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortableAttribute>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();

  const handleSort = (attribute: string) => {
    if (!SORTABLE_COLUMNS[attribute].sortable) return;

    if (sortBy === attribute) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(attribute as SortableAttribute);
      setSortOrder('asc');
    }

    const sortedUsers = [...users].sort((a, b) => {
      const aValue = a[attribute as keyof User];
      const bValue = b[attribute as keyof User];

      // Always keep null values at the bottom
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // Compare values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime();
      }

      return sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    setUsers(sortedUsers);
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
          .select('user_id, calories_burned')
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

          return {
            ...user,
            avg_calories_burned: avgCalories,
            mood: latestMentalHealth?.mood || null,
            stress_level: latestMentalHealth?.stress_level || null,
            sleep_quality: latestMentalHealth?.sleep_quality || null,
            mental_health_created_at: latestMentalHealth?.created_at || null,
            payment_status,
            payment_due_date
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
    const isSorted = sortBy === key;

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
              {isSorted ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 