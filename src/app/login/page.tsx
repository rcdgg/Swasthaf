"use client";

import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/navigation';
import { createHash } from 'crypto';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'user' | 'trainer'>('user');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (userType === 'user') {
        // Hash the password using MD5
        const passwordHash = createHash('md5').update(password).digest('hex');

        // Check user credentials
        const { data: user, error: userError } = await supabase
          .from('User')
          .select('user_id, name, email')
          .eq('email', email)
          .eq('password_hash', passwordHash)
          .single();

        if (userError) {
          throw new Error('Invalid email or password');
        }

        if (!user) {
          throw new Error('User not found');
        }

        // Store user data in session storage
        sessionStorage.setItem('userData', JSON.stringify(user));
        sessionStorage.setItem('userType', 'user');

        // Redirect to user dashboard
        router.push('/user-dashboard');
      } else {
        console.log('Attempting trainer login with name:', password);

        // First, let's check what trainers exist in the database
        const { data: allTrainers, error: listError } = await supabase
          .from('trainerandnutritionist')
          .select('name');

        if (listError) {
          console.error('Error listing trainers:', listError);
        } else {
          console.log('Available trainers:', allTrainers);
        }

        // For trainer login, check if the name exists in TrainerAndNutritionist table
        const { data: trainer, error: trainerError } = await supabase
          .from('trainerandnutritionist')
          .select('trainer_id, name')
          .ilike('name', `%${password}%`) // Using wildcards for more flexible matching
          .single();

        console.log('Trainer query result:', { trainer, trainerError });

        if (trainerError) {
          console.error('Trainer login error:', trainerError);
          throw new Error(`Invalid trainer name: ${trainerError.message}`);
        }

        if (!trainer) {
          throw new Error('Trainer not found. Please check the name and try again.');
        }

        // Store trainer data in session storage
        sessionStorage.setItem('userData', JSON.stringify({
          user_id: trainer.trainer_id,
          name: trainer.name,
          email: 'trainer@example.com' // Placeholder email for trainers
        }));
        sessionStorage.setItem('userType', 'trainer');

        // Redirect to trainer dashboard
        router.push('/trainer-dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="user-type" className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <select
                id="user-type"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={userType}
                onChange={(e) => setUserType(e.target.value as 'user' | 'trainer')}
              >
                <option value="user">User</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>

            {userType === 'user' ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="trainer-name" className="block text-sm font-medium text-gray-700">
                  Trainer Name
                </label>
                <input
                  id="trainer-name"
                  name="trainer-name"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your trainer name"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>

          <div className="text-center">
            <a
              href="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Don't have an account? Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
} 