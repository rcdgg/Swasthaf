"use client";

import { useRouter } from "next/navigation";

export default function WorkoutPage() {
    const router = useRouter();

    const cards = [
        {
            title: "View Workout Plans",
            description: "See workout plans assigned by your trainers",
            image: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba",
            route: "/workout/plans",
        },
        {
            title: "Log Daily Workout",
            description: "Record the exercises you did today",
            image: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
            route: "/workout/log",
        }
    ]

    return (
        <div className="min-h-screen p-6 bg-gray-50 flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-8 text-gray-700">Workout Window</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
            {cards.map((card) => (
              <div
                key={card.title}
                onClick={() => router.push(card.route)}
                className="cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300"
              >
                <img src={card.image} alt={card.title} className="w-full h-60 object-cover" />
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-black mb-2">{card.title}</h2>
                  <p className="text-gray-600">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
    );
}