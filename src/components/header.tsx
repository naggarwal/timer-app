import React from 'react';
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Timer App</h1>
      <nav>
        <Button variant="outline" className="mr-2">Load Timers</Button>
        <Button variant="outline">Save Timers</Button>
      </nav>
    </header>
  );
}
