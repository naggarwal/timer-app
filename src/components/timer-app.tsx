'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Play, Pause, Trash2 } from 'lucide-react'

interface Timer {
  id: number;
  name: string;
  duration: number;
  remaining: number;
}

export function TimerAppComponent() {
  const [timers, setTimers] = useState<Timer[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0)
  const [newTimerMinutes, setNewTimerMinutes] = useState('')
  const [newTimerSeconds, setNewTimerSeconds] = useState('')
  const [newTimerName, setNewTimerName] = useState('')
  const [totalTime, setTotalTime] = useState(0)
  const [remainingTotalTime, setRemainingTotalTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // New ref to store current time
  const timeRef = useRef({ timers, remainingTotalTime });

  // Update ref when state changes
  useEffect(() => {
    timeRef.current = { timers, remainingTotalTime };
  }, [timers, remainingTotalTime]);

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=')
  }, [])

  useEffect(() => {
    const total = timers.reduce((sum, timer) => sum + timer.duration, 0)
    setTotalTime(total)
    setRemainingTotalTime(timers.reduce((sum, timer) => sum + timer.remaining, 0))
  }, [timers])

  const updateTimers = useCallback(() => {
    console.log('updateTimers called');

    const { timers, remainingTotalTime } = timeRef.current;
    const updatedTimers = [...timers];
    const currentTimer = updatedTimers[currentTimerIndex];
    
    if (currentTimer && currentTimer.remaining > 0) {
      console.log(`Current remaining time: ${currentTimer.remaining}`);
      currentTimer.remaining -= 1;
      const newRemainingTotalTime = remainingTotalTime - 1;
      
      setTimers(updatedTimers);
      setRemainingTotalTime(newRemainingTotalTime);
      
      console.log(`Updating total time from ${remainingTotalTime} to ${newRemainingTotalTime}`);
    } else if (currentTimer && currentTimer.remaining === 0) {
      const playBeep = () => {
        if (audioRef.current) {
          audioRef.current.play().catch(error => console.error('Error playing audio:', error));
        }
      };
      playBeep();
      setTimeout(playBeep, 1000);
      setTimeout(playBeep, 2000);
      
      if (currentTimerIndex < updatedTimers.length - 1) {
        setCurrentTimerIndex(prevIndex => prevIndex + 1);
      } else {
        setIsRunning(false);
      }
    }
  }, [currentTimerIndex]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isRunning && timers.length > 0) {
      console.log('Setting up interval');
      intervalId = setInterval(updateTimers, 1000);
    }

    return () => {
      if (intervalId !== undefined) {
        console.log('Clearing interval');
        clearInterval(intervalId);
      }
    };
  }, [isRunning, timers.length, updateTimers]);

  const addTimer =   useCallback(() => {
    const minutes = parseInt(newTimerMinutes) || 0
    const seconds = parseInt(newTimerSeconds) || 0
    const duration = minutes * 60 + seconds
    if (duration > 0) {
      setTimers(prevTimers => [...prevTimers, {
        id: Date.now(),
        name: newTimerName,
        duration: duration,
        remaining: duration
      }])
      setNewTimerMinutes('')
      setNewTimerSeconds('')
      setNewTimerName('')
    }
  }, [newTimerMinutes, newTimerSeconds, newTimerName])

  const deleteTimer = useCallback((id: number) => {
    setTimers(prevTimers => prevTimers.filter(timer => timer.id !== id))
    setCurrentTimerIndex(prevIndex => 
      prevIndex >= timers.length - 1 ? timers.length - 2 : prevIndex
    )
  }, [timers.length])

  const toggleTimer = useCallback(() => {
    setIsRunning(prevState => !prevState)
  }, [])

  const resetTimers = useCallback(() => {
    setTimers(prevTimers => prevTimers.map(timer => ({...timer, remaining: timer.duration})))
    setCurrentTimerIndex(0)
    setIsRunning(false)
  }, [])

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Add this new useEffect hook
  useEffect(() => {
    console.log('Timers state updated:', timers);
  }, [timers]);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Timer App</h1>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Total Time: {formatTime(remainingTotalTime)} / {formatTime(totalTime)}</span>
          <Button onClick={resetTimers} variant="outline">Reset All</Button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{width: `${totalTime > 0 ? (remainingTotalTime / totalTime) * 100 : 0}%`}}
          ></div>
        </div>
      </div>
      <div className="space-y-4">
        {timers.map((timer, index) => (
          <div key={timer.id} className="flex items-center justify-between p-2 border rounded">
            <div className="flex-1">
              <div className="font-semibold">{timer.name || `Timer ${index + 1}`}</div>
              <div className="text-sm">{formatTime(timer.remaining)}</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 ml-2 mr-2">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${(timer.remaining / timer.duration) * 100}%`}}></div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the timer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteTimer(timer.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <Button onClick={toggleTimer}>
          {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Timer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Timer</DialogTitle>
              <DialogDescription>
                Enter the details for your new timer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Minutes"
                  value={newTimerMinutes}
                  onChange={(e) => setNewTimerMinutes(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Seconds"
                  value={newTimerSeconds}
                  onChange={(e) => setNewTimerSeconds(e.target.value)}
                />
              </div>
              <Input
                placeholder="Timer Name (optional)"
                value={newTimerName}
                onChange={(e) => setNewTimerName(e.target.value)}
              />
              <Button onClick={addTimer}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
