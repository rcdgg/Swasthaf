"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/navigation';

interface Trainer {
  trainer_id: number;
  name: string;
  specialization: string;
  certification: string;
  experience: number;
  rating: number;
}

export default function PremiumTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const { data, error } = await supabase
        .from('trainerandnutritionist')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setTrainers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainerSelect = (trainerId: number) => {
    setSelectedTrainer(trainerId);
  };

  const handlePurchase = async () => {
    if (!selectedTrainer) {
      setError('Please select a trainer first');
      return;
    }

    try {
      setLoading(true);
      const userId = sessionStorage.getItem('userId');
      
      if (!userId) {
        router.push('/login');
        return;
      }

      // First check if user already has a payment or trainer
      const { data: existingData, error: checkError } = await supabase
        .from('trainerusermap')
        .select('trainer_id')
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        setError('Error checking subscription status. Please try again.');
        return;
      }
      
      if (existingData) {
        setError('You already have an active premium subscription');
        return;
      }

      // TODO: Integrate with your actual payment gateway here
      // This is a placeholder for the payment processing
      try {
        // Simulate payment processing
        const paymentSuccess = await processPayment(500); // Amount in dollars

        if (!paymentSuccess) {
          setError('Payment processing failed. Please check your payment method and try again.');
          return;
        }

        // If payment successful, add payment record
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment')
          .insert([
            {
              user_id: userId,
              trainer_id: selectedTrainer,
              amount: 500,
              payment_method: 'Online',
              status: 'Completed'
            }
          ])
          .select('payment_id')
          .single();

        if (paymentError) {
          console.error('Payment record error:', paymentError);
          setError('Payment was processed but failed to save. Please contact support.');
          return;
        }

        // Add trainer-user mapping
        const { error: mappingError } = await supabase
          .from('trainerusermap')
          .insert([
            {
              trainer_id: selectedTrainer,
              user_id: userId
            }
          ]);

        if (mappingError) {
          // If mapping fails, attempt to rollback payment
          if (paymentData) {
            await supabase
              .from('payment')
              .delete()
              .eq('payment_id', paymentData.payment_id);
          }
          setError('Failed to assign trainer. Your payment will be refunded.');
          return;
        }

        // Success! Redirect to dashboard
        router.push('/user-dashboard');
      } catch (paymentError) {
        console.error('Payment processing error:', paymentError);
        setError('Payment processing failed. Please try again or use a different payment method.');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mock function to simulate payment processing
  const processPayment = async (amount: number): Promise<boolean> => {
    // This is where you would integrate with a real payment gateway
    // For now, we'll simulate a payment process
    try {
      // Simulate API call to payment gateway
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For testing purposes, you can return true to simulate successful payment
      // or false to simulate failed payment
      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      return false;
    }
  };

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
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Select Your Premium Trainer</h1>
          <button
            onClick={() => router.push('/user-dashboard')}
            className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <div
              key={trainer.trainer_id}
              className={`p-6 rounded-lg border ${
                selectedTrainer === trainer.trainer_id
                  ? 'border-green-500 bg-gray-800'
                  : 'border-gray-700 bg-gray-900'
              } cursor-pointer hover:border-green-500 transition-colors`}
              onClick={() => handleTrainerSelect(trainer.trainer_id)}
            >
              <h2 className="text-xl font-semibold mb-2">{trainer.name}</h2>
              <p className="text-gray-400 mb-2">
                <span className="font-medium">Specialization:</span> {trainer.specialization || 'General Fitness'}
              </p>
              <p className="text-gray-400 mb-2">
                <span className="font-medium">Experience:</span> {trainer.experience || 0} years
              </p>
              <p className="text-gray-400 mb-2">
                <span className="font-medium">Rating:</span> {trainer.rating || 'N/A'}
              </p>
              {trainer.certification && (
                <p className="text-gray-400">
                  <span className="font-medium">Certification:</span> {trainer.certification}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handlePurchase}
            disabled={!selectedTrainer || loading}
            className={`px-8 py-3 rounded-md text-lg font-semibold ${
              !selectedTrainer || loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Processing...' : 'Purchase Premium Plan ($500)'}
          </button>
        </div>
      </div>
    </div>
  );
}