import { AgentResponse, AgentType } from '../types';
import { routeCustomerQuery } from './orchestrator';
import { 
  retentionAgent, 
  expansionAgent, 
  outreachAgent, 
  strategyAgent,
  generalAgent
} from './specialized-agents';

/**
 * Customer Success multi-agent workflow
 * 
 * This is the main entry point for the customer success agent workflow.
 * It orchestrates the process of:
 * 1. Classifying the customer query
 * 2. Routing the query to the appropriate specialized agent
 * 3. Getting a response from the specialized agent
 * 4. Returning the complete response with metadata
 */
export async function customerSuccessAgent(
  query: string, 
  customerContext?: any,
  options?: {
    tools?: Record<string, any>;
  }
): Promise<AgentResponse> {
  try {
    // Step 1: Route the query to determine which specialized agent should handle it
    const { classification, agentType } = await routeCustomerQuery(query, customerContext);
    
    // Step 2: Use the appropriate specialized agent based on classification
    let response;
    
    switch (agentType) {
      case 'retention':
        response = await retentionAgent(query, customerContext, options);
        break;
      case 'expansion':
        response = await expansionAgent(query, customerContext, options);
        break;
      case 'outreach':
        response = await outreachAgent(query, customerContext, options);
        break;
      case 'strategy':
        response = await strategyAgent(query, customerContext, options);
        break;
      case 'general':
        response = await generalAgent(query, customerContext, options);
        break;
      default:
        throw new Error(`Unsupported agent type: ${agentType}`);
    }
    
    // Step 3: Return combined response with classification metadata
    return {
      content: response.content,
      metadata: {
        confidence: classification.confidence,
        reasoning: classification.reasoning,
        priority: classification.priority,
        // Don't include agentType from response.metadata as it would overwrite
        timestamp: response.metadata?.timestamp,
        agentName: response.metadata?.agentName,
        // Include other metadata, but explicitly handle known fields
        agentType: agentType
      }
    };
  } catch (error) {
    console.error('Error in customer success agent:', error);
    throw error;
  }
}

/**
 * Simple function to directly invoke a specific agent type
 * Useful when you already know which agent you need
 */
export async function invokeSpecificAgent(
  agentType: AgentType,
  query: string,
  customerContext?: any,
  options?: {
    tools?: Record<string, any>;
  }
): Promise<AgentResponse> {
  try {
    let response;
    
    switch (agentType) {
      case 'retention':
        response = await retentionAgent(query, customerContext, options);
        break;
      case 'expansion':
        response = await expansionAgent(query, customerContext, options);
        break;
      case 'outreach':
        response = await outreachAgent(query, customerContext, options);
        break;
      case 'strategy':
        response = await strategyAgent(query, customerContext, options);
        break;
      case 'general':
        response = await generalAgent(query, customerContext, options);
        break;
      default:
        throw new Error(`Unsupported agent type: ${agentType}`);
    }
    
    // Add required confidence field to match AgentResponse type
    return {
      content: response.content,
      metadata: {
        confidence: 1.0, // Default high confidence since directly invoked
        agentType: agentType,
        agentName: response.metadata?.agentName,
        timestamp: response.metadata?.timestamp
      }
    };
  } catch (error) {
    console.error(`Error invoking ${agentType} agent:`, error);
    throw error;
  }
} 