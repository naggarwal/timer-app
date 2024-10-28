import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { parse, stringify } from 'yaml';
import { Upload } from 'lucide-react';

interface Timer {
  id: number;
  name: string;
  duration: number;
  remaining: number;
}

interface ImportedTimer {
  name: string;
  duration: number;
}

interface ImportedData {
  name: string;
  timers: ImportedTimer[];
}

interface ImportExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  timers: Timer[];
  setTimers: (timers: Timer[]) => void;
}

export function ImportExportDialog({ isOpen, onClose, timers, setTimers }: ImportExportDialogProps) {
  const { toast } = useToast();
  const [yamlContent, setYamlContent] = useState('');
  const [exportName, setExportName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      if (!exportName.trim()) {
        toast({
          title: "Error",
          description: "Please enter a name for the timer set",
          variant: "destructive",
        });
        return;
      }

      const exportData = {
        name: exportName,
        timers: timers.map(({ name, duration }) => ({
          name,
          duration,
        }))
      };
      
      const yaml = stringify(exportData);
      
      const blob = new Blob([yaml], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportName.toLowerCase().replace(/\s+/g, '-')}.yaml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportName('');
      toast({
        title: "Success",
        description: "Timers exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export timers.",
        variant: "destructive",
      });
    }
  };

  const processImportData = (importedData: ImportedData) => {
    if (!importedData?.name || !Array.isArray(importedData.timers)) {
      throw new Error('Invalid YAML format');
    }

    const newTimers = importedData.timers.map((item: ImportedTimer) => ({
      id: Date.now() + Math.random(),
      name: item.name || '',
      duration: parseInt(String(item.duration)) || 0,
      remaining: parseInt(String(item.duration)) || 0,
    }));

    const savedSets = JSON.parse(localStorage.getItem('savedTimerSets') || '{}');
    savedSets[importedData.name] = {
      name: importedData.name,
      timers: newTimers
    };
    localStorage.setItem('savedTimerSets', JSON.stringify(savedSets));

    setTimers(newTimers);
    setYamlContent('');
    onClose();
    
    toast({
      title: "Success",
      description: `Timer set "${importedData.name}" imported and saved successfully!`,
    });
  };

  const handleImport = () => {
    try {
      const importedData = parse(yamlContent);
      processImportData(importedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import timers. Please check the YAML format.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = parse(content);
        processImportData(importedData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import file. Please check the YAML format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import/Export Timers</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Enter a name for the timer set"
              value={exportName}
              onChange={(e) => setExportName(e.target.value)}
            />
            <Button onClick={handleExport} disabled={!exportName.trim()}>
              Export Timers
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="file"
                accept=".yaml,.yml"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload YAML File
              </Button>
            </div>
            <div className="relative">
              <textarea
                className="min-h-[200px] w-full p-2 border rounded-md"
                placeholder="Or paste YAML content here to import...
Example format:
name: My Timer Set
timers:
  - name: Timer 1
    duration: 300
  - name: Timer 2
    duration: 120"
                value={yamlContent}
                onChange={(e) => setYamlContent(e.target.value)}
              />
              <Button 
                onClick={handleImport} 
                disabled={!yamlContent}
                className="mt-2"
              >
                Import from Text
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 