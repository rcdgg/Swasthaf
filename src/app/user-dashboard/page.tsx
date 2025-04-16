"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from '../../supabaseClient';

// Initialize Supabase client
const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Trainer {
    trainer_id: string;
    name: string;
    specialization: string;
    experience: string;
}

interface TrainerMapResponse {
    trainer_id: string;
    trainerandnutritionist: Trainer;
}

interface User {
    name: string;
    email: string;
}

export default function UserDashboard() {
    const router = useRouter();
    const [showTrainerModal, setShowTrainerModal] = useState(false);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [assignedTrainer, setAssignedTrainer] = useState<Trainer | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [userName, setUserName] = useState<string>('');

    useEffect(() => {
        checkAuth();
        checkPremiumStatus();
        fetchTrainers();
    }, []);

    const checkAuth = async () => {
        try {
            const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
            if (!userData.user_id) {
                router.push('/login');
                return;
            }
            setUserId(userData.user_id);

            try {
                const { data, error } = await supabase
                    .from('User')
                    .select('name')
                    .eq('user_id', userData.user_id)
                    .single();

                if (error) throw error;
                if (data) {
                    setUserName(data.name);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            router.push('/login');
        }
    };

    const checkPremiumStatus = async () => {
        const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
        if (!userData.user_id) return;

        try {
            const { data, error } = await supabase
                .from('trainerusermap')
                .select('trainer_id')
                .eq('user_id', userData.user_id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            setIsPremium(!!data);
        } catch (error) {
            console.error('Error checking premium status:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrainers = async () => {
        try {
            const { data: trainersData, error } = await supabaseClient
                .from('trainerandnutritionist')
                .select('*');

            if (error) throw error;
            setTrainers(trainersData || []);
        } catch (error) {
            console.error('Error fetching trainers:', error);
        }
    };

    const handleTrainerSelection = async (trainerId: string) => {
        if (!userId) return;
        setLoading(true);
        try {
            // Create trainer-user mapping
            const { error: mapError } = await supabaseClient
                .from('trainerusermap')
                .insert([
                    {
                        user_id: userId,
                        trainer_id: trainerId
                    }
                ]);

            if (mapError) throw mapError;

            // Update user's payment status
            const { error: updateError } = await supabaseClient
                .from('users')
                .update({ payment_status: 'premium' })
                .eq('user_id', userId);

            if (updateError) throw updateError;

            // Create payment record
            const { error: paymentError } = await supabaseClient
                .from('payments')
                .insert([
                    {
                        user_id: userId,
                        trainer_id: trainerId,
                        amount: 2000,
                        status: 'completed',
                        payment_date: new Date().toISOString()
                    }
                ]);

            if (paymentError) throw paymentError;

            // Update assigned trainer state
            const selectedTrainer = trainers.find(t => t.trainer_id === trainerId);
            if (selectedTrainer) {
                setAssignedTrainer(selectedTrainer);
                setIsPremium(true);
            }

            setShowTrainerModal(false);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 5000);
        } catch (error) {
            console.error('Error assigning trainer:', error);
            alert('Failed to process premium subscription. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // Clear session storage
        sessionStorage.clear();
        // Redirect to login page
        router.push('/login');
    };

    const handleGoPremium = () => {
        router.push('/premium-trainers');
    };

    const cards = [
        {
            title: "Food Window",
            description: "Plan your meals, and manage your diet",
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
            route: "/food",
        },
        {
            title: "Workout Window",
            description: "View and log your workouts",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
            route: "/workout",
        },
        {
            title: "Log window",
            description: "Keep track of your progress and mental health",
            image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
            route: "/log-dashboard",
        },
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Welcome, {userName}</h1>
                        <div className="mt-2">
                            <span className={`text-sm px-3 py-1 rounded-full ${
                                isPremium 
                                    ? 'bg-yellow-500 text-black font-semibold' 
                                    : 'bg-gray-400 text-white'
                            }`}>
                                {isPremium ? 'Premium' : 'Standard'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {!isPremium && (
                            <button
                                onClick={handleGoPremium}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
                            >
                                Go Premium
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Trainer Selection Modal */}
                {showTrainerModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Select Your Trainer</h2>
                                <button
                                    onClick={() => setShowTrainerModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {trainers.map((trainer) => (
                                    <div
                                        key={trainer.trainer_id}
                                        className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                                        onClick={() => !loading && handleTrainerSelection(trainer.trainer_id)}
                                    >
                                        <h3 className="text-xl font-semibold text-white mb-2">{trainer.name}</h3>
                                        <p className="text-gray-300 mb-1">Specialization: {trainer.specialization}</p>
                                        <p className="text-gray-300">Experience: {trainer.experience}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {showSuccessMessage && (
                    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Successfully subscribed to premium! Your trainer {assignedTrainer?.name} has been assigned.</span>
                    </div>
                )}

                {/* Assigned Trainer Info */}
                {assignedTrainer && (
                    <div className="bg-gray-800 p-4 rounded-lg mb-6">
                        <h2 className="text-xl font-semibold text-yellow-400 mb-2">Your Assigned Trainer</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <p className="text-white font-medium">{assignedTrainer.name}</p>
                                <p className="text-gray-400">Specialization: {assignedTrainer.specialization}</p>
                                <p className="text-gray-400">Experience: {assignedTrainer.experience}</p>
                            </div>
                            <button
                                onClick={() => setShowTrainerModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Change Trainer
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
                    {cards.map((card) => (
                    <div
                        key={card.title}
                        onClick={() => router.push(card.route)}
                        className="cursor-pointer bg-gray-800 rounded-2xl shadow-sm overflow-hidden hover:shadow-2xl transition duration-300 hover:bg-gray-700"
                    >
                        <img src={card.image} alt={card.title} className="w-full h-60 object-cover" />
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-white mb-2">{card.title}</h2>
                            <p className="text-gray-300">{card.description}</p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    );
}