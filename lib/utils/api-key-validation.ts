export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateOpenAIKey(apiKey: string): Promise<ValidationResult> {
  /**
   * We can check if an OpenAI API key is valid by making a request to 
   * OpenAI's Models API. If the key is valid, we will receive a list of models.
   * If the key is invalid, we will receive an error.
   */
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    return { isValid: response.ok };
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Invalid OpenAI API key. Please check your key and try again.' 
    };
  }
}

export async function validateAnthropicKey(apiKey: string): Promise<ValidationResult> {
  try {
    console.log('Attempting to validate Anthropic key:', apiKey.slice(0, 10) + '...');
    
    // Create a proxy API route to handle the validation
    const response = await fetch('/api/validate/anthropic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey })
    });
    
    const data = await response.json();
    console.log('Validation response:', {
      status: response.status,
      ok: response.ok,
      data: data
    });
    
    return { 
      isValid: data.isValid,
      error: data.error
    };
  } catch (error) {
    console.error('Detailed Anthropic validation error:', error instanceof Error ? error.message : String(error));
    return { 
      isValid: false, 
      error: 'Failed to validate Anthropic API key: ' + (error instanceof Error ? error.message : String(error))
    };
  }
}

