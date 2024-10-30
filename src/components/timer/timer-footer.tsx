import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, Play, Pause } from 'lucide-react'

interface TimerFooterProps {
  isRunning: boolean
  isSpeechEnabled: boolean
  newTimerMinutes: string
  newTimerSeconds: string
  newTimerName: string
  onToggleTimer: () => void
  onToggleSpeech: () => void
  onAddTimer: () => void
  setNewTimerMinutes: (value: string) => void
  setNewTimerSeconds: (value: string) => void
  setNewTimerName: (value: string) => void
}

export function TimerFooter({
  isRunning,
  isSpeechEnabled,
  newTimerMinutes,
  newTimerSeconds,
  newTimerName,
  onToggleTimer,
  onToggleSpeech,
  onAddTimer,
  setNewTimerMinutes,
  setNewTimerSeconds,
  setNewTimerName
}: TimerFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-t">
      <div className="max-w-md mx-auto p-4 flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={onToggleSpeech}
        >
          {isSpeechEnabled ? 'Voice On' : 'Voice Off'}
        </Button>

        <Button onClick={onToggleTimer}>
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
              <Button onClick={onAddTimer}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 