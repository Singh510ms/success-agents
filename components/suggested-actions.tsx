'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { memo } from 'react';

interface SuggestedActionsProps {
  chatId: string;
  selectedModelId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, selectedModelId, append }: SuggestedActionsProps) {
  // Customer Success Agent prompts
  const customerSuccessActions = [
    {
      title: 'How can I reduce',
      label: 'and address customer churn?',
      action: 'How can I develop a proactive retention strategy?',
    },
    {
      title: 'What are the best strategies',
      label: 'for identifying expansion opportunities?',
      action: 'What are the best strategies for identifying upselling opportunities with existing customers and increasing their lifetime value?',
    },
    {
      title: 'How can I re-engage',
      label: 'low usage or dormant accounts?',
      action: "Help me create an effective campaign to re-engage dormant customer accounts?",
    },
    {
      title: 'How can I develop',
      label: 'a long-term customer success plan?',
      action: 'I need a comprehensive, multi-phase strategy for improving overall customer success metrics across all stages of the customer lifecycle.',
    },
  ];

  // GPT-4 Mini prompts
  const OtherModelActions = [
    {
      title: 'Best practices',
      label: 'for onboarding and high-touch support',
      action: 'What are the best practices for onboarding new customers in a SaaS environment?',
    },
    {
      title: 'Create a customer success plan',
      label: 'for ongoing support and retention',
      action: 'What elements should I include in the customer success plan to ensure long-term satisfaction?',
    },
    {
      title: 'Customer health scoring',
      label: 'best practices for implementation',
      action: 'What are the best practices for implementing a customer health scoring system that helps predict churn and identify at-risk accounts?',
    },
    {
      title: 'Enhancing customer interactions',
      label: 'with LLMs in a SaaS environment',
      action: 'What are effective ways to use LLMs to improve customer interactions in my business?',
    },
  ];


  // Select the appropriate actions based on the model
  let suggestedActions;
  switch (selectedModelId) {
    case 'customer-success-agents':
      suggestedActions = customerSuccessActions;
      break;
    case 'gpt-4o-mini':
      suggestedActions = OtherModelActions;
      break;
    case 'gpt-4o':
      suggestedActions = OtherModelActions;
      break;
    case 'claude-3-5':
      suggestedActions = OtherModelActions;
      break;
    default:
      suggestedActions = OtherModelActions; // Default to GPT-4 Mini actions
  }

  return (
    <div className="grid sm:grid-cols-2 gap-2 w-full">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
