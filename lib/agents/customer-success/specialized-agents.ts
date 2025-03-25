import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { AgentType } from '../types';
import { agentConfigs } from '../types';

/**
 * Specialized agent handler for customer success functions
 * @param query The customer query
 * @param agentType The type of specialized agent (retention, expansion, outreach, strategy)
 * @param context Additional context about the customer
 * @param options Additional options for the agent
 * @returns The response from the specialized agent
 */
export async function handleWithSpecializedAgent(
  query: string,
  agentType: AgentType,
  context?: any,
  options?: {
    tools?: Record<string, any>;
  }
) {
  // Find the agent configuration from the predefined configs
  const agentConfig = agentConfigs.find((config) => config.id === agentType);
  
  if (!agentConfig) {
    throw new Error(`Agent type ${agentType} not found in configuration`);
  }

  // Use the model specified in the config, or fallback to a default
  const model = agentConfig.model 
    ? openai(agentConfig.model) 
    : openai('gpt-4o-mini'); // Fallback model

  // Format the context information if available
  const contextInfo = context 
    ? `\nCustomer Context:\n${JSON.stringify(context, null, 2)}` 
    : '';

  // Generate a response using the specialized agent
  const { text: response } = await generateText({
    model,
    system: agentConfig.systemPrompt,
    prompt: `${query}${contextInfo}`,
    tools: options?.tools,
  });

  // Return the response with metadata
  return {
    content: response,
    metadata: {
      agentType,
      agentName: agentConfig.name,
      timestamp: new Date().toISOString(),
    }
  };
}

/**
 * Retention agent handler - focuses on preventing churn and keeping customers happy
 */
export async function retentionAgent(query: string, context?: any, options?: { tools?: Record<string, any> }) {
  return handleWithSpecializedAgent(query, 'retention', context, options);
}

/**
 * Expansion agent handler - focuses on upselling and cross-selling opportunities
 */
export async function expansionAgent(query: string, context?: any, options?: { tools?: Record<string, any> }) {
  return handleWithSpecializedAgent(query, 'expansion', context, options);
}

/**
 * Outreach agent handler - focuses on customer acquisition and re-engagement
 */
export async function outreachAgent(query: string, context?: any, options?: { tools?: Record<string, any> }) {
  return handleWithSpecializedAgent(query, 'outreach', context, options);
}

/**
 * Strategy agent handler - focuses on complex, multi-faceted issues
 */
export async function strategyAgent(query: string, context?: any, options?: { tools?: Record<string, any> }) {
  return handleWithSpecializedAgent(query, 'strategy', context, options);
}

/**
 * General agent handler - handles routine inquiries and general communication
 */
export async function generalAgent(query: string, context?: any, options?: { tools?: Record<string, any> }) {
  return handleWithSpecializedAgent(query, 'general', context, options);
} 