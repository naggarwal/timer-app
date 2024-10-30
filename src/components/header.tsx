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
import { Trash2 } from 'lucide-react';
import { ImportExportDialog } from "@/components/import-export-dialog";

interface Timer {
  id: number;
  name: string;
  duration: number;
  remaining: number;
}

interface HeaderProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  onClearTimers: () => void;
  remainingTotalTime: number;
  totalTime: number;
  onResetTimers: () => void;
  formatTime: (seconds: number) => string;
}

export function Header({ 
  timers, 
  setTimers, 
  onClearTimers,
  remainingTotalTime,
  totalTime,
  onResetTimers,
  formatTime
}: HeaderProps) {
  const { toast } = useToast();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [timerSetName, setTimerSetName] = useState('');
  const [activeTimerSetName, setActiveTimerSetName] = useState('');
  const [savedTimerSets, setSavedTimerSets] = useState<Record<string, { name: string; timers: Timer[] }>>({});
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

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
    setActiveTimerSetName(timerSetName);

    setIsSaveDialogOpen(false);
    setTimerSetName('');
    toast({
      title: "Success",
      description: "Timer set saved successfully!",
    });
  };

  const handleLoadTimers = (selectedTimerSet: { name: string; timers: Timer[] }) => {
    setTimers(selectedTimerSet.timers);
    setActiveTimerSetName(selectedTimerSet.name);
    setIsLoadDialogOpen(false);
    toast({
      title: "Success",
      description: `Timer set "${selectedTimerSet.name}" loaded successfully!`,
    });
  };

  const handleDeleteTimerSet = (timerSetName: string) => {
    const updatedTimerSets = { ...savedTimerSets };
    delete updatedTimerSets[timerSetName];
    localStorage.setItem('savedTimerSets', JSON.stringify(updatedTimerSets));
    setSavedTimerSets(updatedTimerSets);
    toast({
      title: "Success",
      description: `Timer set "${timerSetName}" deleted successfully!`,
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b">
      <div className="max-w-md mx-auto p-4">
        <header className="flex justify-between items-center">
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="mr-4">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setIsLoadDialogOpen(true)}>Manage Timers</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsSaveDialogOpen(true)}>Save Timers</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsImportExportOpen(true)}>Import/Export</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  setActiveTimerSetName('');
                  onClearTimers();
                }}>Clear All Timers</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <h1 className="text-2xl font-bold">Timer App</h1>
          </div>
        </header>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                {activeTimerSetName || "Untitled"}
              </span>
              <span className="font-semibold">
                Total Time: {formatTime(remainingTotalTime)} / {formatTime(totalTime)}
              </span>
            </div>
            <Button onClick={onResetTimers} variant="outline">Reset All</Button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{width: `${totalTime > 0 ? (remainingTotalTime / totalTime) * 100 : 0}%`}}
            ></div>
          </div>
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
                <div key={key} className="flex items-center justify-between">
                  <Button
                    onClick={() => handleLoadTimers(timerSet)}
                    className="w-full justify-start mr-2"
                  >
                    {timerSet.name}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTimerSet(key);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <ImportExportDialog
          isOpen={isImportExportOpen}
          onClose={() => setIsImportExportOpen(false)}
          timers={timers}
          setTimers={setTimers}
          onImportSuccess={() => {
            toast({
              title: "Success",
              description: "Timers imported successfully!",
            });
          }}
        />
      </div>
    </div>
  );
}
