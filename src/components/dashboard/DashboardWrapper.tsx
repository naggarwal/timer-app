"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import AuthGuard with no SSR
const AuthGuard = dynamic(() => import('@/components/auth/AuthGuard'), { ssr: false });
const DashboardContent = dynamic(() => import('@/components/dashboard/DashboardContent'), { ssr: false });

export default function DashboardWrapper() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <DashboardContent />
      </div>
    </AuthGuard>
  );
} 