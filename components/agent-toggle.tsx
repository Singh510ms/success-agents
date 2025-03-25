'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAgents } from '@/hooks/use-agents';
import { AgentConfig, AgentType } from '@/lib/agents/types';
import { chatModels } from '@/lib/ai/models';
import { PromptDialog } from './prompt-dialog';

// Add an environment flag that will be true when open-sourced and false for preview
const IS_EDITABLE = process.env.NEXT_PUBLIC_ENABLE_AGENT_EDITING === 'true';

interface AgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function AgentModal({ 
  open, 
  onOpenChange, 
  title = "Configure Agents",
  description 
}: AgentModalProps) {
  const { agents, updateAgentModel, updateAgentPrompt, saveAgentChanges } = useAgents();
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [localAgents, setLocalAgents] = useState<AgentConfig[]>([]);
  
  // Update local state when agents change
  useEffect(() => {
    setLocalAgents(agents);
  }, [agents]);
  
  // Filter out the General Customer Support Agent
  const specialAgents = localAgents.filter(agent => agent.id !== 'general');
  
  const handleOpenPromptDialog = (agent: AgentConfig) => {
    setSelectedAgent(agent);
    setPromptDialogOpen(true);
  };

  const handleModelChange = (agentId: AgentType, value: string) => {
    // If no model is selected, default to 'gpt-4o-mini'
    const modelValue = value || 'gpt-4o-mini';
    updateAgentModel(agentId, modelValue);
  };
  
  const handleSaveChanges = () => {
    saveAgentChanges();
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{IS_EDITABLE ? title : "Agent Configuration"}</DialogTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {!IS_EDITABLE && (
              <p className="text-sm text-muted-foreground mt-2">
                This is a read-only view of agent configurations. Configuration changes are disabled in the preview version.
              </p>
            )}
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-3">
            {specialAgents.map((agent: AgentConfig) => (
              <div key={agent.id} className="border rounded-lg p-3 flex flex-col">
                <div className="mb-2">
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.description}</p>
                </div>
                <div className="mb-2">
                  {IS_EDITABLE ? (
                    <Select
                      value={agent.model}
                      onValueChange={(value) => handleModelChange(agent.id, value)}
                    >
                      <SelectTrigger className="w-full text-xs h-8">
                        <SelectValue placeholder="Select model">{agent.model}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {chatModels
                          .filter(model => model.id !== 'customer-success-agents' && model.id !== 'claude-3-5')
                          .map((model) => (
                            <SelectItem 
                              key={model.id} 
                              value={model.id} 
                              disabled={!IS_EDITABLE && model.id !== agent.model}
                              className={!IS_EDITABLE && model.id !== agent.model ? "cursor-not-allowed" : ""}
                            >
                              <span className="text-xs font-medium">{model.name}</span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select
                      value={agent.model}
                      onValueChange={() => {}} // Empty function, no change happens
                    >
                      <SelectTrigger className="w-full text-xs h-8">
                        <SelectValue placeholder="Select model">{agent.model}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {chatModels
                          .filter(model => model.id !== 'customer-success-agents' && model.id !== 'claude-3-5')
                          .map((model) => (
                            <SelectItem 
                              key={model.id} 
                              value={model.id} 
                              disabled={!IS_EDITABLE && model.id !== agent.model}
                              className={!IS_EDITABLE && model.id !== agent.model ? "cursor-not-allowed" : ""}
                            >
                              <span className="text-xs font-medium">{model.name}</span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="mt-auto">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full text-xs h-7"
                    onClick={() => handleOpenPromptDialog(agent)}
                  >
                    {IS_EDITABLE ? "Edit Prompt" : "View Prompt"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            {IS_EDITABLE ? (
              <Button onClick={handleSaveChanges}>
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
      
      {selectedAgent && (
        <PromptDialog
          open={promptDialogOpen}
          onOpenChange={setPromptDialogOpen}
          agentId={selectedAgent.id}
          agentName={selectedAgent.name}
          systemPrompt={selectedAgent.systemPrompt}
          onSave={updateAgentPrompt}
          readOnly={!IS_EDITABLE}
        />
      )}
    </>
  );
} 