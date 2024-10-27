import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Timer {
  id: number;
  name: string;
  duration: number;
  remaining: number;
}

interface HeaderProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
}

export function Header({ timers, setTimers }: HeaderProps) {
  const { toast } = useToast();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [timerSetName, setTimerSetName] = useState('');
  const [savedTimerSets, setSavedTimerSets] = useState<Record<string, { name: string; timers: Timer[] }>>({});

  useEffect(() => {
    const savedSets = JSON.parse(localStorage.getItem('savedTimerSets') || '{}');
    setSavedTimerSets(savedSets);
  }, []);

  const handleSaveTimers = () => {
    if (timerSetName.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter a name for your timer set.",
        variant: "destructive",
      });
      return;
    }

    const timerSet = {
      name: timerSetName,
      timers: timers.map(timer => ({
        ...timer,
        remaining: timer.duration
      }))
    };

    const updatedTimerSets = { ...savedTimerSets, [timerSetName]: timerSet };
    localStorage.setItem('savedTimerSets', JSON.stringify(updatedTimerSets));
    setSavedTimerSets(updatedTimerSets);

    setIsSaveDialogOpen(false);
    setTimerSetName('');
    toast({
      title: "Success",
      description: "Timer set saved successfully!",
    });
  };

  const handleLoadTimers = (selectedTimerSet: { name: string; timers: Timer[] }) => {
    setTimers(selectedTimerSet.timers);
    setIsLoadDialogOpen(false);
    toast({
      title: "Success",
      description: `Timer set "${selectedTimerSet.name}" loaded successfully!`,
    });
  };

  return (
    <header className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="mr-4">
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setIsLoadDialogOpen(true)}>Load Timers</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setIsSaveDialogOpen(true)}>Save Timers</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <h1 className="text-2xl font-bold">Timer App</h1>
      </div>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Timer Set</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter a name for your timer set"
            value={timerSetName}
            onChange={(e) => setTimerSetName(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={handleSaveTimers}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Timer Set</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {Object.entries(savedTimerSets).map(([key, timerSet]) => (
              <Button
                key={key}
                onClick={() => handleLoadTimers(timerSet)}
                className="w-full justify-start"
              >
                {timerSet.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
