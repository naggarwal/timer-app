import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from 'lucide-react';
import { ImportExportDialog } from "@/components/import-export-dialog";
import { SettingsDialog } from "@/components/settings-dialog";
import { AITimerDialog } from "@/components/timer/ai-timer-dialog";
import { Wand2 } from "lucide-react";
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { createTimeset, deleteTimeset, getTimesets } from '@/lib/supabase/timesets';

interface Timer {
  id: number;
  name: string;
  duration: number;
  remaining: number;
}

interface TimerSet {
  id: string;
  name: string;
  timers: Timer[];
}

interface HeaderProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  onClearTimers: () => void;
  remainingTotalTime: number;
  totalTime: number;
  onResetTimers: () => void;
  formatTime: (seconds: number) => string;
  isSpeechEnabled: boolean;
  onToggleSpeech: () => void;
}

export function Header({ 
  timers, 
  setTimers, 
  onClearTimers,
  remainingTotalTime,
  totalTime,
  onResetTimers,
  formatTime,
  isSpeechEnabled,
  onToggleSpeech
}: HeaderProps) {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [timerSetName, setTimerSetName] = useState('');
  const [activeTimerSetName, setActiveTimerSetName] = useState('');
  const [savedTimerSets, setSavedTimerSets] = useState<TimerSet[]>([]);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadTimerSets();
    } else {
      // Fallback to local storage if not logged in
      const savedSets = JSON.parse(localStorage.getItem('savedTimerSets') || '{}');
      const formattedSets = Object.entries(savedSets).map(([key, value]: [string, any]) => ({
        id: key,
        name: value.name,
        timers: value.timers
      }));
      setSavedTimerSets(formattedSets);
    }
  }, [user]);

  const loadTimerSets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const timesets = await getTimesets();
      const formattedSets = timesets.map(set => ({
        id: set.id,
        name: set.name,
        timers: set.times as unknown as Timer[]
      }));
      setSavedTimerSets(formattedSets);
    } catch (error) {
      console.error('Error loading timer sets:', error);
      toast({
        title: "Error",
        description: "Failed to load your saved timer sets.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTimers = async () => {
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

    setIsLoading(true);
    try {
      if (user) {
        try {
          // Save to Supabase
          const savedSet = await createTimeset({
            name: timerSetName,
            times: timerSet.timers
          });
          
          setSavedTimerSets(prev => [
            ...prev, 
            { 
              id: savedSet.id, 
              name: savedSet.name, 
              timers: savedSet.times as unknown as Timer[] 
            }
          ]);
          setActiveTimerSetName(timerSetName);
        } catch (error) {
          console.error('Error saving to Supabase:', error);
          // If Supabase save fails, fallback to localStorage
          toast({
            title: "Warning",
            description: "Could not save to cloud. Saving locally instead.",
            variant: "destructive",
          });
          
          // Fallback to localStorage
          const updatedTimerSets = { ...JSON.parse(localStorage.getItem('savedTimerSets') || '{}'), [timerSetName]: timerSet };
          localStorage.setItem('savedTimerSets', JSON.stringify(updatedTimerSets));
          
          const formattedSets = Object.entries(updatedTimerSets).map(([key, value]: [string, any]) => ({
            id: key,
            name: value.name,
            timers: value.timers
          }));
          setSavedTimerSets(formattedSets);
          setActiveTimerSetName(timerSetName);
        }
      } else {
        // Fallback to localStorage if not logged in
        const updatedTimerSets = { ...JSON.parse(localStorage.getItem('savedTimerSets') || '{}'), [timerSetName]: timerSet };
        localStorage.setItem('savedTimerSets', JSON.stringify(updatedTimerSets));
        
        const formattedSets = Object.entries(updatedTimerSets).map(([key, value]: [string, any]) => ({
          id: key,
          name: value.name,
          timers: value.timers
        }));
        setSavedTimerSets(formattedSets);
        setActiveTimerSetName(timerSetName);
      }

      setIsSaveDialogOpen(false);
      setTimerSetName('');
      toast({
        title: "Success",
        description: "Timer set saved successfully!",
      });
    } catch (error) {
      console.error('Error saving timer set:', error);
      toast({
        title: "Error",
        description: "Failed to save your timer set.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadTimers = (selectedTimerSet: TimerSet) => {
    setTimers(selectedTimerSet.timers);
    setActiveTimerSetName(selectedTimerSet.name);
    setIsLoadDialogOpen(false);
    toast({
      title: "Success",
      description: `Timer set "${selectedTimerSet.name}" loaded successfully!`,
    });
  };

  const handleDeleteTimerSet = async (timerSetId: string) => {
    setIsLoading(true);
    try {
      if (user) {
        // Delete from Supabase
        await deleteTimeset(timerSetId);
        setSavedTimerSets(prev => prev.filter(set => set.id !== timerSetId));
      } else {
        // Fallback to localStorage if not logged in
        const savedSets = JSON.parse(localStorage.getItem('savedTimerSets') || '{}');
        delete savedSets[timerSetId];
        localStorage.setItem('savedTimerSets', JSON.stringify(savedSets));
        
        const formattedSets = Object.entries(savedSets).map(([key, value]: [string, any]) => ({
          id: key,
          name: value.name,
          timers: value.timers
        }));
        setSavedTimerSets(formattedSets);
      }

      toast({
        title: "Success",
        description: "Timer set deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting timer set:', error);
      toast({
        title: "Error",
        description: "Failed to delete the timer set.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAITimers = (newTimers: Timer[]) => {
    setTimers(prevTimers => [...prevTimers, ...newTimers]);
  };

  const handleSignOut = async () => {
    try {
      // First call the API route to clear server-side session
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Sign out failed on server');
      }
      
      // Then call the client-side signOut to clear local state
      await signOut();
      
      // Force a hard refresh to ensure all state is cleared
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
                <DropdownMenuItem onSelect={() => setIsAIDialogOpen(true)}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate with AI
                </DropdownMenuItem>
                
                {user && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/change-password">Change Password</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleSignOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <h1 className="text-2xl font-bold">Timer App</h1>
          </div>
          <SettingsDialog 
            isSpeechEnabled={isSpeechEnabled}
            onToggleSpeech={onToggleSpeech}
          />
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
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
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
              <Button onClick={handleSaveTimers} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Load Timer Set</DialogTitle>
            </DialogHeader>
            {isLoading ? (
              <div className="py-4 text-center">Loading your timer sets...</div>
            ) : savedTimerSets.length === 0 ? (
              <div className="py-4 text-center">No saved timer sets found.</div>
            ) : (
              <div className="space-y-2">
                {savedTimerSets.map((timerSet) => (
                  <div key={timerSet.id} className="flex items-center justify-between">
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
                        handleDeleteTimerSet(timerSet.id);
                      }}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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

        <AITimerDialog
          open={isAIDialogOpen}
          onOpenChange={setIsAIDialogOpen}
          onAcceptTimers={handleAcceptAITimers}
        />
      </div>
    </div>
  );
}
