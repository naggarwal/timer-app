import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Edit2, Trash2 } from 'lucide-react'

interface Timer {
  id: number
  name: string
  duration: number
  remaining: number
}

interface TimerListProps {
  timers: Timer[]
  formatTime: (seconds: number) => string
  onStartEditing: (timer: Timer) => void
  onDeleteTimer: (id: number) => void
}

export function TimerList({ 
  timers, 
  formatTime, 
  onStartEditing, 
  onDeleteTimer 
}: TimerListProps) {
  return (
    <div className="space-y-4">
      {timers.map((timer, index) => (
        <div key={timer.id} className="flex flex-col p-2 border rounded">
          <div className="font-semibold mb-2">{timer.name || `Timer ${index + 1}`}</div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm">{formatTime(timer.remaining)}</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 ml-2 mr-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{width: `${(timer.remaining / timer.duration) * 100}%`}}
              ></div>
            </div>
            <div className="flex">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onStartEditing(timer)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                    <AlertDialogAction onClick={() => onDeleteTimer(timer.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 