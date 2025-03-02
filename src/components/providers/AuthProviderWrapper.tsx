"use client";

import dynamic from 'next/dynamic';

// Dynamically import AuthProvider with no SSR
const AuthProviderClient = dynamic(
  () => import("@/lib/auth-context").then((mod) => ({ default: mod.AuthProvider })),
  { ssr: false }
);

interface AuthProviderWrapperProps {
  children: React.ReactNode;
}

export default function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  return <AuthProviderClient>{children}</AuthProviderClient>;
} 