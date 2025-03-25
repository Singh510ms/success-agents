import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { AgentType } from '../types';

// Schema for customer query classification
const CustomerQueryClassification = z.object({
  reasoning: z.string().describe('Reasoning behind the classification'),
  agentType: z.enum(['retention', 'expansion', 'outreach', 'strategy', 'general']).describe(
    'The type of agent that should handle this query'
  ),
  priority: z.enum(['low', 'medium', 'high']).describe(
    'The priority level of this request'
  ),
  confidence: z.number().min(0).max(1).describe(
    'Confidence score (0-1) in this classification'
  )
});

/**
 * Orchestrator agent that classifies customer queries and routes them to 
 * the appropriate specialized agent
 */
export async function classifyCustomerQuery(query: string, context?: any) {
  const model = openai('gpt-4o-mini');

  // Context information can be passed to provide additional customer information
  const contextInfo = context ? 
    `\nAdditional context about this customer:
    ${JSON.stringify(context, null, 2)}` : '';

  // First step: Classify the query to determine which agent should handle it
  const { object: classification } = await generateObject({
    model,
    schema: CustomerQueryClassification,
    system: `You are an expert Customer Success Orchestrator responsible for analyzing customer queries and routing them to the most appropriate specialized agent.

    Your primary responsibilities:
    1. Accurately identify the core intent behind customer queries
    2. Determine the most suitable specialized agent to handle each query
    3. Assess the priority level based on business impact and urgency
    4. Provide clear reasoning for your classification decisions
    
    You have five agents available:
    - Retention Agent: Focuses on preventing churn, addressing dissatisfaction, and resolving service issues
    - Expansion Agent: Identifies upselling opportunities, handles feature requests, and manages growth conversations
    - Outreach Agent: Manages new customer acquisition, re-engagement of dormant accounts, and relationship building
    - Strategy Agent: Handles complex, multi-faceted issues requiring long-term planning and strategic thinking
    - General Agent: Handles routine inquiries, provides product information, and manages general communication
    
    Make your classification decisions based on:
    - The specific language and sentiment in the query
    - The implied customer lifecycle stage
    - The complexity and scope of the issue
    - The potential business impact
    
    Important: If you're not confident (below 0.7) that a specialized agent is needed, route to the General Agent.
    Your classification directly impacts how customer issues are handled, so be thorough and precise.`,
    prompt: `Analyze this customer success query and classify it:
    "${query}"${contextInfo}
    
    Determine:
    1. Which agent type should handle this (retention, expansion, outreach, strategy, general)
    2. The priority level (low, medium, high)
    3. Your confidence in this classification (0-1)
    4. Brief reasoning for your classification
    
    Guidelines:
    - Retention: For customers at risk of churning or with service issues
    - Expansion: For upselling or cross-selling opportunities
    - Outreach: For new customer acquisition or re-engagement
    - Strategy: For long-term planning or complex, multi-faceted issues
    - General: For routine inquiries, product information, or when no specialized agent is clearly needed
    
    Be specific in your reasoning and ensure your classification matches the query intent.
    If you're uncertain which specialized agent is needed (confidence below 0.7), choose the General agent.`,
  });

  return classification;
}

/**
 * Routes the customer query to the appropriate specialized agent based on classification
 */
export async function routeCustomerQuery(query: string, additionalContext?: any) {
  // Classify the query
  const classification = await classifyCustomerQuery(query, additionalContext);
  
  // Log the classification for debugging
  console.log('Query Classification:', classification);
  
  // Return both the classification and the agent type for routing
  return {
    classification,
    agentType: classification.agentType as AgentType
  };
} 