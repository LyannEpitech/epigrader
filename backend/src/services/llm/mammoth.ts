import axios from 'axios';
import { ILLMProvider, Message, ChatOptions, LLMResponse, ProviderConfig } from './types.js';

/**
 * Mammouth AI Provider
 * 
 * Mammouth AI est une plateforme française qui agrège plusieurs modèles
 * (OpenAI, Anthropic, Mistral, etc.) via une API compatible OpenAI.
 * 
 * Docs: https://info.mammouth.ai/fr/docs/api-quick-start/
 * API Base: https://api.mammouth.ai/v1
 */
export class MammouthProvider implements ILLMProvider {
  readonly name = 'Mammouth AI';
  readonly defaultModel = 'gpt-4.1';
  readonly requiresApiKey = true;
  
  private config: ProviderConfig = {};
  private readonly defaultBaseUrl = 'https://api.mammouth.ai/v1';
  
  configure(config: ProviderConfig): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
  
  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
  
  private get baseUrl(): string {
    return (this.config.baseUrl as string) || this.defaultBaseUrl;
  }
  
  async chat(messages: Message[], options?: ChatOptions): Promise<LLMResponse> {
    const apiKey = this.config.apiKey || process.env.MAMMOUTH_API_KEY;
    
    if (!apiKey) {
      throw new Error('Mammouth AI API key not configured. Get one at https://mammouth.ai');
    }
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: options?.model || this.config.model || this.defaultModel,
          messages,
          temperature: options?.temperature ?? this.config.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 1000,
          // Mammoth-specific options
          fallback: this.config.fallback ?? true, // Auto-fallback si modèle indisponible
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 secondes timeout
        }
      );
      
      return {
        content: response.data.choices[0]?.message?.content || '',
        usage: response.data.usage,
      };
    } catch (error: any) {
      // Gestion spécifique des erreurs Mammouth
      if (error.response?.status === 401) {
        throw new Error('Mammouth AI: Invalid API key');
      }
      if (error.response?.status === 429) {
        throw new Error('Mammouth AI: Rate limit exceeded');
      }
      if (error.response?.data?.error?.message) {
        throw new Error(`Mammouth AI: ${error.response.data.error.message}`);
      }
      throw error;
    }
  }
  
  /**
   * Liste les modèles disponibles sur Mammouth AI
   */
  async listModels(): Promise<string[]> {
    const apiKey = this.config.apiKey || process.env.MAMMOUTH_API_KEY;
    
    if (!apiKey) {
      return [];
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      return response.data.data?.map((m: any) => m.id) || [];
    } catch {
      // Fallback si l'endpoint n'existe pas
      return [
        'gpt-4o',
        'gpt-4o-mini',
        'claude-3-5-sonnet',
        'claude-3-opus',
        'mistral-large',
        'mistral-medium',
        'llama-3.1-70b',
        'llama-3.1-405b',
      ];
    }
  }
}
