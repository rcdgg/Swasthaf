"use client";

import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/navigation';
import { createHash } from 'crypto';

type UserType = 'user' | 'trainer' | 'admin';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('user');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log(userType);
    try {
      if (userType === 'admin') {
        // Admin login with just password
        if (password === '123') {
          sessionStorage.setItem("userType", "admin");
          router.push("/admin-dashboard");
          return;
        } else {
          throw new Error('Invalid admin password');
        }
      }

      if (userType === 'trainer') {
        // Check if trainer exists in trainerandnutritionist table
        const { data: trainerData, error: trainerError } = await supabase
          .from("trainerandnutritionist")
          .select("*")
          .eq("name", name)
          .single();

        if (trainerError || !trainerData) {
          throw new Error('Invalid trainer name');
        }

        // For trainer, password should match the name
        if (password !== name) {
          throw new Error('Invalid password');
        }

        // Store trainer data in session storage
        sessionStorage.setItem("trainerData", JSON.stringify({
          id: trainerData.trainer_id,
          name: trainerData.name,
          specialization: trainerData.specialization
        }));
        sessionStorage.setItem("userType", "trainer");

        // Redirect to trainer dashboard
        router.push("/trainer");
        return;
      }

      // Regular user login
      const normalizedEmail = name.toLowerCase();
      const hashedPassword = createHash('md5').update(password).digest('hex');

      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("*")
        .eq("email", normalizedEmail)
        .eq("password_hash", hashedPassword)
        .single();

      if (userError) {
        throw new Error('Invalid email or password');
      }

      // Store user data in session storage
      sessionStorage.setItem("userData", JSON.stringify(userData));
      sessionStorage.setItem("userType", userType);
      router.push("/user-dashboard");
    } catch (error: any) {
      setError(error.message);
    }
  };

  const isAdminLogin = userType === 'admin';
  const isTrainerLogin = userType === 'trainer';

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-4xl font-bold text-white text-center tracking-tight drop-shadow-glow">
          Sign in to your account
        </h1>
        {error && <p className="text-red-400 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6 mt-8">
          <div className="space-y-2">
            <label htmlFor="userType" className="block text-gray-300 text-base">
              I am a
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value as UserType)}
              className="w-full p-3 bg-[#1E1E1E] text-white rounded-lg border border-gray-600 focus:border-gray-300 focus:ring-1 focus:ring-gray-300 placeholder-gray-500"
              required
            >
              <option value="user" className="bg-[#1E1E1E]">User</option>
              <option value="trainer" className="bg-[#1E1E1E]">Trainer</option>
              <option value="admin" className="bg-[#1E1E1E]">Admin</option>
            </select>
          </div>
          {!isAdminLogin && (
            <div className="space-y-2">
              <label htmlFor="name" className="block text-gray-300 text-base">
                {isTrainerLogin ? 'Trainer Name' : 'Email address'}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-[#1E1E1E] text-white rounded-lg border border-gray-600 focus:border-gray-300 focus:ring-1 focus:ring-gray-300 placeholder-gray-500"
                placeholder={isTrainerLogin ? 'Enter your trainer name' : 'Email address'}
                required={!isAdminLogin}
              />
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-gray-300 text-base">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#1E1E1E] text-white rounded-lg border border-gray-600 focus:border-gray-300 focus:ring-1 focus:ring-gray-300 placeholder-gray-500"
              placeholder={isAdminLogin ? 'Admin password' : 'Password'}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-[#3730a3] text-white rounded-lg hover:bg-[#312e81] transition-colors font-medium text-base"
          >
            Sign in
          </button>
        </form>
        {!isAdminLogin && (
          <p className="text-center">
            <a href="/signup" className="text-[#6366f1] hover:text-[#818cf8] text-base">
              Don't have an account? Sign up
            </a>
          </p>
        )}
      </div>
    </div>
  );
}