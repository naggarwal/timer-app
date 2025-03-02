import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Register',
  description: 'Create a new account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  );
} 