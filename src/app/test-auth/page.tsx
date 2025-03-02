"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function TestAuthPage() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Log authentication status
    if (loading) {
      setAuthStatus('Loading authentication state...');
    } else if (user) {
      setAuthStatus(`Authenticated as: ${user.email}`);
      console.log('User object:', user);
    } else {
      setAuthStatus('Not authenticated');
    }
  }, [user, loading]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError.message);
        console.error('Sign in error:', signInError);
        return;
      }
      
      // Redirect on successful login
      router.push('/');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Sign in exception:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      
      // Call the API route for sign out
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Sign out failed');
      }
      
      console.log('Signed out successfully');
      // Force a refresh
      router.push('/test-auth');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred during sign out');
      console.error('Sign out exception:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h2 className="font-medium mb-2">Auth Status:</h2>
          <p>{authStatus}</p>
          {user && (
            <div className="mt-2">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {!user ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Sign In
            </button>
          </form>
        ) : (
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
        )}
        
        <div className="mt-6">
          <button
            onClick={() => {
              console.log('Current auth state:', { user, loading });
              console.log('Window location:', window.location.href);
            }}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Log Auth State to Console
          </button>
        </div>
      </div>
    </div>
  );
} 