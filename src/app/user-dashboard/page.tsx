"use client";

import { useRouter } from "next/navigation";

export default function UserDashboard() {
    const router = useRouter();

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
            route: "/logs",
        },
    ]

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-10 text-black">Welcome to SwasthAF</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
                {cards.map((card) => (
                <div
                    key={card.title}
                    onClick={() => router.push(card.route)}
                    className="cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300"
                >
                    <img src={card.image} alt={card.title} className="w-full h-60 object-cover" />
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-black mb-2">{card.title}</h2>
                        <p className="text-gray-600">{card.description}</p>
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
}