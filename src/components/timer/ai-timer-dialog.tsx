'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Wand2, RefreshCw } from "lucide-react"

interface Timer {
  id: number;
  name: string;
  duration: number;
  remaining: number;
}

interface AITimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcceptTimers: (timers: Timer[]) => void;
}

export function AITimerDialog({ open, onOpenChange, onAcceptTimers }: AITimerDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedTimers, setGeneratedTimers] = useState<Timer[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [conversation, setConversation] = useState<{role: string, content: string}[]>([])
  const [followUpPrompt, setFollowUpPrompt] = useState('')

  const handleSubmit = async (userPrompt: string, isFollowUp = false) => {
    setIsLoading(true)
    setError(null)
    
    // Update conversation history
    const newConversation = isFollowUp 
      ? [...conversation, { role: 'user', content: userPrompt }]
      : [{ role: 'user', content: userPrompt }];
    
    setConversation(newConversation);
    
    try {
      const response = await fetch('/api/generate-timer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: userPrompt,
          conversation: isFollowUp ? newConversation : undefined
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.timers?.length) {
        throw new Error('No timers were generated')
      }
      
      const newTimers = data.timers.map((timer: { name: string; duration: number }) => ({
        id: Math.random() * 1000000,
        name: timer.name,
        duration: timer.duration,
        remaining: timer.duration,
      }))
      
      // Add assistant response to conversation
      setConversation([
        ...newConversation,
        { role: 'assistant', content: `Generated ${newTimers.length} timers` }
      ]);
      
      setGeneratedTimers(newTimers)
      setFollowUpPrompt('')
    } catch (error) {
      console.error('Error generating timers:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate timers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInitialSubmit = () => {
    handleSubmit(prompt);
  }

  const handleFollowUpSubmit = () => {
    handleSubmit(followUpPrompt, true);
  }

  const handleAccept = () => {
    if (generatedTimers) {
      onAcceptTimers(generatedTimers)
      handleReset()
    }
  }

  const handleReset = () => {
    setPrompt('')
    setFollowUpPrompt('')
    setGeneratedTimers(null)
    setConversation([])
    onOpenChange(false)
  }

  const handleRestartConversation = () => {
    setGeneratedTimers(null)
    setFollowUpPrompt('')
    setConversation([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Timer with AI</DialogTitle>
          <DialogDescription>
            Describe your workout and let AI create a timer set for you.
          </DialogDescription>
        </DialogHeader>
        
        {!generatedTimers ? (
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Create a 20-minute arms workout with rest periods..."
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button 
              onClick={handleInitialSubmit} 
              disabled={!prompt.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Timers
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="rounded-md bg-muted p-4 max-h-[200px] overflow-y-auto">
              <h4 className="mb-2 font-medium">Generated Timer Set:</h4>
              {generatedTimers.map((timer, index) => (
                <div key={timer.id} className="flex justify-between items-center mb-2">
                  <span>{timer.name}</span>
                  <span>{Math.floor(timer.duration / 60)}:{(timer.duration % 60).toString().padStart(2, '0')}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <h4 className="mb-2 font-medium">Not quite right? Refine your timers:</h4>
              <Textarea
                placeholder="Make the workout more intense..." 
                value={followUpPrompt}
                onChange={(e) => setFollowUpPrompt(e.target.value)}
                className="min-h-[80px] mb-2"
              />
              <div className="flex gap-2 mb-4">
                <Button 
                  onClick={handleFollowUpSubmit}
                  disabled={!followUpPrompt.trim() || isLoading}
                  variant="secondary"
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refining...
                    </>
                  ) : (
                    "Refine Timers"
                  )}
                </Button>
                <Button 
                  onClick={handleRestartConversation}
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Restart
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button onClick={handleAccept}>
                Accept Timers
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 