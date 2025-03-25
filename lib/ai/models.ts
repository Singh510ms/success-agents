import { openai } from '@ai-sdk/openai';
import {
  customProvider,
  wrapLanguageModel,
} from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import type { LanguageModelV1Middleware } from 'ai';

export const DEFAULT_CHAT_MODEL: string = 'customer-success-agents';

// Add a logging wrapper
const loggedModel = (provider: any, modelName: string) => {
  return async (...args: any[]) => {
    console.log(`[${modelName}] Attempting to use model with args:`, args);
    try {
      const result = await provider(...args);
      console.log(`[${modelName}] Success:`, {
        provider: result.provider,
        modelId: result.modelId,
        hasGenerate: !!result.doGenerate,
        hasStream: !!result.doStream
      });
      return result;
    } catch (error) {
      console.error(`[${modelName}] Error:`, error);
      throw error;
    }
  };
};

const getProviderWithKey = (provider: any, keyGetter: () => string | null, modelName: string) => {
  return async (...args: any[]) => {
    const apiKey = keyGetter();
    if (!apiKey) {
      console.error(`[${modelName}] No API key found`);
      throw new Error(`API key not configured for ${modelName}`);
    }
    
    console.log(`[${modelName}] Chat Request:`, {
      modelName,
      argsLength: args.length,
      apiKeyExists: !!apiKey,
      requestData: args[0] ? {
        messages: args[0].messages,
        systemPrompt: args[0].system,
        headers: args[0].headers,
        method: args[0].method,
        url: args[0].url
      } : null
    });

    try {
      const result = await provider(...args);
      console.log(`[${modelName}] Success:`, {
        resultType: typeof result,
        hasResponse: !!result,
        responseData: result
      });
      return result;
    } catch (error) {
      console.error(`[${modelName}] Error:`, {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        requestData: args[0]
      });
      throw error;
    }
  };
};

interface LanguageModelRequest {
  messages: Array<{ role: string; content: string }>;
  system?: string;
}

export const myProvider = customProvider({
  languageModels: {
    'gpt-4o-mini': openai('gpt-4o-mini'),
    'gpt-4o': openai('gpt-4o'),
    'claude-3-5': wrapLanguageModel({
      model: anthropic('claude-3-5-sonnet-20241022'),
      middleware: [
        {
          transformRequest: async (req: LanguageModelV1Request) => {
            const apiKey = typeof window !== 'undefined' 
              ? localStorage.getItem('anthropicApiKey')
              : process.env.ANTHROPIC_API_KEY;
            
            if (!apiKey) {
              throw new Error('Anthropic API key not configured');
            }
            
            req.headers = {
              ...req.headers,
              'x-api-key': apiKey,
              'anthropic-version': '2024-10-22'
            };

            return req;
          }
        } as LanguageModelV1Middleware
      ],
    }),
    'title-model': openai('gpt-4-turbo'),
    'artifact-model': openai('gpt-4o-mini'),
  },
  imageModels: {
    'small-model': openai.image('dall-e-2'),
    'large-model': openai.image('dall-e-3'),
  },
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4 Mini',
    description: 'Fast and efficient for simple tasks',
  },
  {
    id: 'gpt-4o', 
    name: 'GPT-4',
    description: 'Powerful model for complex tasks',
  },
  {
    id: 'claude-3-5',
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic\'s Claude - Great for analysis and reasoning',
  },
  {
    id: 'customer-success-agents',
    name: 'Success Agents',
    description: 'Specialized workflow for customer success scenarios',
  },
];

// For the middleware
interface LanguageModelV1Request {
  headers?: Record<string, string>;
  body?: any;
}
