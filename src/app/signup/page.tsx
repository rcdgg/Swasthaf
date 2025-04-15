"use client";

import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/navigation';
import { createHash } from 'crypto';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Hash the password using MD5
      const passwordHash = createHash('md5').update(password).digest('hex');

      // First, check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('User')
        .select('email')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw new Error(`Error checking email: ${checkError.message}`);
      }

      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Get the count of existing records to calculate next user_id
      const { count, error: countError } = await supabase
        .from('User')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(`Error getting user count: ${countError.message}`);
      }

      const nextUserId = (count || 0) + 1;

      console.log('Attempting to create user with:', {
        user_id: nextUserId,
        name,
        email,
        passwordHash,
        age,
        weight,
        height,
        goal,
        dietaryPreferences,
      });

      // Create user in the User table with explicit user_id
      const { data, error: dbError } = await supabase
        .from('User')
        .insert({
          user_id: nextUserId,
          name,
          email,
          password_hash: passwordHash,
          age: age ? parseInt(age) : null,
          weight: weight ? parseFloat(weight) : null,
          height: height ? parseFloat(height) : null,
          goal: goal || null,
          dietary_preferences: dietaryPreferences || null,
        })
        .select('user_id, name, email')
        .single();

      if (dbError) {
        console.error('Detailed database error:', {
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
          code: dbError.code,
        });
        throw new Error(`Database error: ${dbError.message}`);
      }

      if (!data) {
        throw new Error('Failed to create user: No data returned');
      }

      console.log('User created successfully:', data);

      // Store user data in session storage
      sessionStorage.setItem('userData', JSON.stringify(data));
      sessionStorage.setItem('userType', 'user');

      // Redirect to user dashboard
      router.push('/user-dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during signup');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Sign Up</h1>
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-gray-300 mb-2 text-sm">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#2D2D2D] text-white border border-[#3D3D3D] focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-300 mb-2 text-sm">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#2D2D2D] text-white border border-[#3D3D3D] focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-300 mb-2 text-sm">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#2D2D2D] text-white border border-[#3D3D3D] focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-gray-300 mb-2 text-sm">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#2D2D2D] text-white border border-[#3D3D3D] focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="age" className="block text-gray-300 mb-2 text-sm">
                Age (optional)
              </label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#2D2D2D] text-white border border-[#3D3D3D] focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="weight" className="block text-gray-300 mb-2 text-sm">
                Weight (kg) (optional)
              </label>
              <input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#2D2D2D] text-white border border-[#3D3D3D] focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-gray-300 mb-2 text-sm">
                Height (cm) (optional)
              </label>
              <input
                id="height"
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#2D2D2D] text-white border border-[#3D3D3D] focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="goal" className="block text-gray-300 mb-2 text-sm">
                Fitness Goal (optional)
              </label>
              <input
                id="goal"
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#2D2D2D] text-white border border-[#3D3D3D] focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="dietary-preferences" className="block text-gray-300 mb-2 text-sm">
                Dietary Preferences (optional)
              </label>
              <textarea
                id="dietary-preferences"
                rows={3}
                value={dietaryPreferences}
                onChange={(e) => setDietaryPreferences(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#2D2D2D] text-white border border-[#3D3D3D] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold mt-6"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:text-blue-400">
            Login
          </a>
        </p>
      </div>
    </div>
  );
} 