'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { AgentType } from '@/lib/agents/types';

export interface PromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: AgentType;
  agentName: string;
  systemPrompt: string;
  onSave: (agentId: AgentType, prompt: string) => void;
  readOnly?: boolean;
}

export function PromptDialog({ 
  open, 
  onOpenChange, 
  agentId,
  agentName,
  systemPrompt,
  onSave,
  readOnly = false
}: PromptDialogProps) {
  const [prompt, setPrompt] = useState(systemPrompt);
  
  useEffect(() => {
    setPrompt(systemPrompt);
  }, [systemPrompt]);
  
  const handleSave = () => {
    onSave(agentId, prompt);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{readOnly ? `${agentName} Prompt` : `Edit ${agentName} Prompt`}</DialogTitle>
          {readOnly && (
            <p className="text-sm text-muted-foreground mt-1">
              Viewing in read-only mode. Editing is disabled in the preview version.
            </p>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-auto min-h-[60vh]">
          <Textarea
            value={prompt}
            onChange={(e) => !readOnly && setPrompt(e.target.value)}
            className="min-h-[60vh] font-mono text-sm"
            placeholder="Enter system prompt..."
            readOnly={readOnly}
          />
        </div>
        <DialogFooter className="mt-2">
          {!readOnly ? (
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          ) : (
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 