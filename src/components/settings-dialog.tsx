import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings } from "lucide-react"
import { useTheme } from "next-themes"

interface SettingsDialogProps {
  isSpeechEnabled: boolean;
  onToggleSpeech: () => void;
}

export function SettingsDialog({ isSpeechEnabled, onToggleSpeech }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span>Theme</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-background border rounded p-1"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span>Voice Announcements</span>
            <Button variant="outline" onClick={onToggleSpeech}>
              {isSpeechEnabled ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
