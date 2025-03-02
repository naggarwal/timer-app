"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm';

// Dynamically import AuthGuard with no SSR
const AuthGuard = dynamic(() => import('@/components/auth/AuthGuard'), { ssr: false });

export default function ChangePasswordWrapper() {
  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <ChangePasswordForm />
      </div>
    </AuthGuard>
  );
} 