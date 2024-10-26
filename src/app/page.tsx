import Image from "next/image";
import { TimerAppComponent } from '@/components/timer-app';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main>
        <h1>Welcome to My App</h1>
        <TimerAppComponent />
      </main>
    </div>
  );
}
