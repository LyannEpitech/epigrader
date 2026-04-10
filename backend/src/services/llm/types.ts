export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ILLMProvider {
  readonly name: string;
  readonly defaultModel: string;
  readonly requiresApiKey: boolean;
  
  configure(config: ProviderConfig): void;
  chat(messages: Message[], options?: ChatOptions): Promise<LLMResponse>;
  isConfigured(): boolean;
}

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: unknown;
}
