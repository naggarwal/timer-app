"use client";

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DashboardContent = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // First call the API route to clear server-side session
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Sign out failed on server');
      }
      
      // Then call the client-side signOut to clear local state
      await signOut();
      
      // Force a hard refresh to ensure all state is cleared
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex space-x-3">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Return to App
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded mb-6">
          <h2 className="text-lg font-medium mb-2">Account Information</h2>
          <p className="text-gray-700">
            <span className="font-medium">Email:</span> {user?.email}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">User ID:</span> {user?.id}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Last Sign In:</span>{' '}
            {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
          </p>
        </div>

        <div className="mt-4">
          <Link
            href="/profile/change-password"
            className="text-blue-600 hover:underline"
          >
            Change Password
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent; 