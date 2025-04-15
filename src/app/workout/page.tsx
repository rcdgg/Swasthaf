"use client";

import { useRouter } from "next/navigation";

export default function WorkoutPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-white">Workout Plans</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        onClick={() => router.push("/workout/plans")}
                        className="cursor-pointer bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 hover:bg-gray-700"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b"
                            alt="Workout Plans"
                            className="w-full h-60 object-cover"
                        />
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-white mb-2">View Workout Plans</h2>
                            <p className="text-gray-300">Browse and select from our curated workout plans</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}