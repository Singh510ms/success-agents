import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        messages: [{ 
          role: 'user', 
          content: 'Hello' 
        }],
        max_tokens: 1
      })
    });
    
    const data = await response.json();
    
    return NextResponse.json({ 
      isValid: response.ok,
      error: !response.ok ? data.error?.message : undefined
    });
  } catch (error) {
    return NextResponse.json({ 
      isValid: false, 
      error: 'Failed to validate Anthropic API key: ' + (error instanceof Error ? error.message : String(error))
    });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version'
    }
  });
} 