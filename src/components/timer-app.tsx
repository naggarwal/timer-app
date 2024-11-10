'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Play, Pause, Trash2, Edit2, MoveUp, MoveDown } from 'lucide-react'
import { Header } from "@/components/header"
import { TimerFooter } from "@/components/timer/timer-footer"
import { TimerList } from "@/components/timer/timer-list"

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
  const buzzerRef = useRef<HTMLAudioElement | null>(null)
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [editingTimer, setEditingTimer] = useState<Timer | null>(null)
  const [editMinutes, setEditMinutes] = useState('')
  const [editSeconds, setEditSeconds] = useState('')
  const [editName, setEditName] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false);

  // New ref to store current time
  const timeRef = useRef({ timers, remainingTotalTime });

  // Update ref when state changes
  useEffect(() => {
    timeRef.current = { timers, remainingTotalTime };
  }, [timers, remainingTotalTime]);

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=')
    buzzerRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU2jdXzzn0vBSF1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEoODlOq5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diJOQcZaLvt559NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaRw0PVqzl77BeGQc9ltvyxnUoBSh+zPDaizsIGGS56+mjTxELTKXh8bllHgU1jdT0z3wvBSJ0xe/glEILElyx6OyrWRUIRJve8sFuJAUug8/y1oU2Bhxqvu3mnEoPDlOq5O+zYRsGPJLZ88p3KgUme8rx3I4+CRVht+rqpVMSC0mh4fK8aiAFM4nU8tGAMQYfccPu45ZFDBFYr+ftrVwWCECY3PLEcSYGK4DN8tiIOQcZZ7zs56BODwxPpuPxtmQcBjiP1/PMeywGI3fH8N+RQAoUXrTp66hWEwlGnt/yv2wiBDCG0fPTgzQHHG/A7eSaSQ0PVqvm77BeGQc9ltrzxnUoBSh9y/HajDsIF2W56+mjUREKTKPi8blnHgU1jdTy0HwvBSF0xPDglEQKElux6eyrWRUJQ5vd88FwJAQug8/y1oY2Bhxqvu3mnEwODVKp5e+zYRsGOpPX88p3KgUmecnw3Y4/CBVhtuvqpVMSC0mh4PG9aiAFM4nS89GAMQYfccLv45dGCxFYrufur1sYB0CY3PLEcycFKoDN8tiIOQcZZ7rs56BODwxPpuPxtmQdBTiP1/PMey4FI3bH8d+RQQkUXbPq66hWFQlGnt/yv2wiBDCG0PPTgzUGHG3A7uSaSQ0PVKzm7rJfGQc9lNn0yHUpBCh9y/HajDwJFmS46+mjUhEKTKLh8btmHwU1i9Xyz34wBiFzxfDglUMMEVux5+2sWhYIQprd88NvJAUsgs/y1oY3Bxpqve3mnUsODlKp5PC1YhsGOpHY88p5KwUlecnw3Y8+ChVgtunqp1QTCkig4PG9ayEEMojT89GBMgUfccLv45dGDRBXr+fur1wXB0CX2/PEcycFKn/M8diKOQgZZrvs56BPEAxOpePxt2UcBzaP1vLOfC0FJHbH79+RQQsUXbTo7KlXFAlFnd7zv2wiBDCF0fLUgzUGHG3A7uSbSg0PVKrl7rJfGQc9lNn0yHUpBCh8yvLajTsJFmS46umkUREMSqPh8btoHgY0i9Tz0H4wBiFzw+/hlUULEVqw6O2sWhYIQprc88NxJQUsgs/y1oY3BxpqvO7mnUwPDVKo5PC1YhsGOpHY8sp5KwUleMjx3Y9ACRVgterqp1QTCkig3/K+aiEGMYjS89GBMgYeb8Lv4pdGDRBXrebvr1wXB0CW2vTEcygEKn/M8dqJOwgZZrrs6KFOEAxOpd/js2coGUCLydq6e0MlP3uwybiNWDhEa5yztJRrS0lnjKOkk3leWGeAlZePfHRpbH2JhoJ+fXl9TElTVEQAAABJTkZPSUNSRAsAAAAyMDAxLTAxLTIzAABJRU5HCwAAAFRlZCBCcm9va3MAAElTRlQQAAAAU291bmQgRm9yZ2UgNC41AA==')
  }, [])

  useEffect(() => {
    const total = timers.reduce((sum, timer) => sum + timer.duration, 0)
    setTotalTime(total)
    setRemainingTotalTime(timers.reduce((sum, timer) => sum + timer.remaining, 0))
  }, [timers])

  const updateTimers = useCallback(() => {
    const { timers, remainingTotalTime } = timeRef.current;
    const updatedTimers = [...timers];
    const currentTimer = updatedTimers[currentTimerIndex];
    
    if (currentTimer && currentTimer.remaining > 0) {
      if (currentTimer.remaining <= 5 && audioRef.current) {
        audioRef.current.play().catch(error => console.error('Error playing audio:', error));
      }
      
      currentTimer.remaining -= 1;
      const newRemainingTotalTime = remainingTotalTime - 1;
      
      setTimers(updatedTimers);
      setRemainingTotalTime(newRemainingTotalTime);
    } else if (currentTimer && currentTimer.remaining === 0) {
      if (buzzerRef.current) {
        if (isSpeechEnabled) {
          if (currentTimerIndex === timers.length - 1) {
            speakMessage(`Your final timer is done`);
          }
        } else {
          buzzerRef.current.play().catch(error => console.error('Error playing buzzer audio:', error));
        }
      }
      
      if (currentTimerIndex < timers.length - 1) {
        setCurrentTimerIndex(prevIndex => prevIndex + 1);
        if (isSpeechEnabled) {
          speakMessage(`Starting ${timers[currentTimerIndex + 1].name} Timer.`);
        }
      } else {
        setIsRunning(false);
      }
    }
  }, [currentTimerIndex, isSpeechEnabled]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isRunning && timers.length > 0) {
      intervalId = setInterval(updateTimers, 1000);
    }

    return () => {
      if (intervalId !== undefined) {
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

  useEffect(() => {
    //console.log('Timers state updated:', timers);
  }, [timers]);

  const speakMessage = useCallback((message: string) => {
    if (!isSpeechEnabled) {
      console.log('Speech is disabled');
      return;
    }
    
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return;
    }
    
    console.log('Speaking:', message);
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(message);
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
    };
    
    utterance.onstart = () => {
      console.log('Started speaking');
    };
    
    utterance.onend = () => {
      console.log('Finished speaking');
    };
    
    window.speechSynthesis.speak(utterance);
  }, [isSpeechEnabled]);

  const startEditing = useCallback((timer: Timer) => {
    setEditingTimer(timer)
    setEditMinutes(Math.floor(timer.duration / 60).toString())
    setEditSeconds((timer.duration % 60).toString())
    setEditName(timer.name)
  }, [])

  const saveEdit = useCallback(() => {
    if (!editingTimer) return

    const minutes = parseInt(editMinutes) || 0
    const seconds = parseInt(editSeconds) || 0
    const duration = minutes * 60 + seconds

    if (duration > 0) {
      setTimers(prevTimers => prevTimers.map(timer => 
        timer.id === editingTimer.id 
          ? {
              ...timer,
              name: editName,
              duration: duration,
              remaining: isRunning && timer.id === timers[currentTimerIndex].id 
                ? timer.remaining 
                : duration
            }
          : timer
      ))
      setEditingTimer(null)
      setEditMinutes('')
      setEditSeconds('')
      setEditName('')
    }
  }, [editingTimer, editMinutes, editSeconds, editName, isRunning, timers, currentTimerIndex])

  const moveTimer = useCallback((timerId: number, direction: 'up' | 'down') => {
    setTimers(prevTimers => {
      const currentIndex = prevTimers.findIndex(timer => timer.id === timerId);
      if (currentIndex === -1) return prevTimers;
      
      const newIndex = direction === 'up' 
        ? Math.max(0, currentIndex - 1)
        : Math.min(prevTimers.length - 1, currentIndex + 1);
      
      if (currentIndex === newIndex) return prevTimers;
      
      const newTimers = [...prevTimers];
      const [movedTimer] = newTimers.splice(currentIndex, 1);
      newTimers.splice(newIndex, 0, movedTimer);
      
      if (isRunning) {
        if (currentTimerIndex === currentIndex) {
          setCurrentTimerIndex(newIndex);
        } else if (
          currentTimerIndex === newIndex && direction === 'down' ||
          currentTimerIndex === newIndex - 1 && direction === 'up'
        ) {
          setCurrentTimerIndex(currentIndex);
        }
      }
      
      return newTimers;
    });
  }, [currentTimerIndex, isRunning]);

  const handleClearTimers = () => {
    setTimers([]);
    setShowConfirmation(false);
  };

  const menuItems = [
    // ... existing menu items
    {
      label: 'Clear All Timers',
      onClick: () => setShowConfirmation(true),
    },
  ];

  return (
    <div className="min-h-screen">
      <Header 
        timers={timers} 
        setTimers={setTimers} 
        onClearTimers={() => setShowConfirmation(true)}
        remainingTotalTime={remainingTotalTime}
        totalTime={totalTime}
        onResetTimers={resetTimers}
        formatTime={formatTime}
        isSpeechEnabled={isSpeechEnabled}
        onToggleSpeech={() => setIsSpeechEnabled(!isSpeechEnabled)}
      />
      <div className="p-4 max-w-md mx-auto mt-[120px] mb-[88px]">
        <TimerList 
          timers={timers}
          formatTime={formatTime}
          onStartEditing={startEditing}
          onDeleteTimer={deleteTimer}
        />
        
        <TimerFooter 
          isRunning={isRunning}
          newTimerMinutes={newTimerMinutes}
          newTimerSeconds={newTimerSeconds}
          newTimerName={newTimerName}
          onToggleTimer={toggleTimer}
          onAddTimer={addTimer}
          setNewTimerMinutes={setNewTimerMinutes}
          setNewTimerSeconds={setNewTimerSeconds}
          setNewTimerName={setNewTimerName}
        />

        <Dialog open={editingTimer !== null} onOpenChange={(open) => !open && setEditingTimer(null)}>
          <DialogContent className="bg-background/95 backdrop-blur-sm border">
            <DialogHeader>
              <DialogTitle>Edit Timer</DialogTitle>
              <DialogDescription>
                Modify the details for your timer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Minutes"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Seconds"
                  value={editSeconds}
                  onChange={(e) => setEditSeconds(e.target.value)}
                />
              </div>
              <Input
                placeholder="Timer Name (optional)"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => editingTimer && moveTimer(editingTimer.id, 'up')}
                    disabled={!editingTimer || timers.indexOf(editingTimer) === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => editingTimer && moveTimer(editingTimer.id, 'down')}
                    disabled={!editingTimer || timers.indexOf(editingTimer) === timers.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={saveEdit}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* <Button
          onClick={() => speakMessage('Test message')}
        >
          Test Speech
        </Button> */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
              <p className="mb-4">This will delete all timers. This action cannot be undone.</p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={handleClearTimers}
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
