"use client";

import dynamic from 'next/dynamic';

// Dynamically import Navbar with no SSR
const NavbarClient = dynamic(() => import("@/components/ui/navbar"), { ssr: false });

export default function NavbarWrapper() {
  return <NavbarClient />;
} 