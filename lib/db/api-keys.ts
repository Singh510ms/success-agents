import { getLocalStorage, setLocalStorage } from "../utils";

// Maximum number of messages a user can send with the app-provided API keys
export const MAX_FREE_MESSAGES = 10;

export function getUserMessageCount(): number {
  if (typeof window === 'undefined') return 0;
  return Number(getLocalStorage('userMessageCount') || 0);
}

export function incrementUserMessageCount(): void {
  if (typeof window === 'undefined') return;
  const currentCount = getUserMessageCount();
  setLocalStorage('userMessageCount', currentCount + 1);
}

export function resetUserMessageCount(): void {
  if (typeof window === 'undefined') return;
  setLocalStorage('userMessageCount', 0);
}

export const getOpenAIApiKey = () => {
  // Only check env variable on server side
  if (typeof window === 'undefined') {
    return process.env.OPENAI_API_KEY;
  }
  
  const messageCount = getUserMessageCount();
  const userProvidedKey = getLocalStorage('openaiApiKey');
  
  // Use environment API key for first 10 messages
  if (messageCount < MAX_FREE_MESSAGES || !userProvidedKey) {
    return process.env.NEXT_PUBLIC_OPENAI_API_KEY || userProvidedKey;
  }
  
  // After 10 messages, require user's API key
  return userProvidedKey;
};

export const setOpenAIApiKey = async (apiKey: string) => {
  if (typeof window === 'undefined') return;
  setLocalStorage('openaiApiKey', apiKey);
};

export function getAnthropicApiKey(): string | null {
  if (typeof window === 'undefined') {
    return process.env.ANTHROPIC_API_KEY || null;
  }
  
  const messageCount = getUserMessageCount();
  const userProvidedKey = getLocalStorage('anthropicApiKey');
  
  // Use environment API key for first 10 messages
  if (messageCount < MAX_FREE_MESSAGES || !userProvidedKey) {
    return process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || userProvidedKey;
  }
  
  // After 10 messages, require user's API key
  return userProvidedKey;
}

export function setAnthropicApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  setLocalStorage('anthropicApiKey', key);
}

export const getLocalOpenAIApiKey = () => {
  if (typeof window === 'undefined') return null;
  return getLocalStorage('openaiApiKey');
};

export const getLocalAnthropicApiKey = () => {
  if (typeof window === 'undefined') return null;
  return getLocalStorage('anthropicApiKey');
};

// Check if the user has reached the message limit and needs to provide their own keys
export function requiresUserApiKeys(): boolean {
  return getUserMessageCount() >= MAX_FREE_MESSAGES;
}