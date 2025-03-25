import { NextRequest, NextResponse } from 'next/server';
import { customerSuccessAgent, invokeSpecificAgent } from '@/lib/agents/customer-success';
import { AgentType } from '@/lib/agents/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { query, customerContext, specificAgent } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }
    
    let response;
    
    // If a specific agent is provided, use that directly
    if (specificAgent) {
      if (!['retention', 'expansion', 'outreach', 'strategy'].includes(specificAgent)) {
        return NextResponse.json(
          { error: 'Invalid agent type specified' },
          { status: 400 }
        );
      }
      
      response = await invokeSpecificAgent(
        specificAgent as AgentType, 
        query, 
        customerContext
      );
    } else {
      // Otherwise use the orchestrator to route the query
      response = await customerSuccessAgent(query, customerContext);
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing customer success query:', error);
    return NextResponse.json(
      { error: 'Failed to process the query' },
      { status: 500 }
    );
  }
} 