import axios from 'axios';
import { ILLMProvider, Message, ChatOptions, LLMResponse, ProviderConfig } from './types.js';

export class MoonshotProvider implements ILLMProvider {
  readonly name = 'Moonshot AI';
  readonly defaultModel = 'moonshot-v1-8k';
  readonly requiresApiKey = true;
  
  private config: ProviderConfig = {};
  private readonly baseUrl = 'https://api.moonshot.cn/v1/chat/completions';
  
  configure(config: ProviderConfig): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
  
  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
  
  async chat(messages: Message[], options?: ChatOptions): Promise<LLMResponse> {
    const apiKey = this.config.apiKey || process.env.MOONSHOT_API_KEY;
    
    if (!apiKey) {
      throw new Error('Moonshot API key not configured');
    }
    
    const response = await axios.post(
      this.baseUrl,
      {
        model: options?.model || this.config.model || this.defaultModel,
        messages,
        temperature: options?.temperature ?? this.config.temperature ?? 1,
        max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      content: response.data.choices[0]?.message?.content || '',
      usage: response.data.usage,
    };
  }
}
