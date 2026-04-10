import { ILLMProvider, Message, ChatOptions, LLMResponse, ProviderConfig } from './types.js';
import { LLMProviderFactory, ProviderType } from './factory.js';

/**
 * Unified LLM Service
 * 
 * Usage:
 * ```typescript
 * const llm = new LLMService();
 * llm.configure('mammoth', { apiKey: 'mmt-...' });
 * const response = await llm.chat([{ role: 'user', content: 'Hello' }]);
 * ```
 */
export class LLMService {
  private provider: ILLMProvider | null = null;
  private providerType: ProviderType | null = null;
  
  /**
   * Configure the LLM provider
   */
  configure(type: ProviderType, config: ProviderConfig): void {
    this.provider = LLMProviderFactory.create(type);
    this.provider.configure(config);
    this.providerType = type;
    
    console.log(`[LLMService] Configured provider: ${this.provider.name}`);
  }
  
  /**
   * Auto-configure from environment variables
   */
  autoConfigure(): boolean {
    // Priority: Mammouth > Moonshot
    if (process.env.MAMMOUTH_API_KEY) {
      this.configure('mammouth', {
        apiKey: process.env.MAMMOUTH_API_KEY,
        model: process.env.MAMMOUTH_MODEL,
      });
      return true;
    }
    
    if (process.env.MOONSHOT_API_KEY) {
      this.configure('moonshot', {
        apiKey: process.env.MOONSHOT_API_KEY,
        model: process.env.MOONSHOT_MODEL,
      });
      return true;
    }
    
    console.warn('[LLMService] No API key found in environment');
    return false;
  }
  
  /**
   * Check if a provider is configured
   */
  isConfigured(): boolean {
    return this.provider?.isConfigured() || false;
  }
  
  /**
   * Get current provider info
   */
  getProviderInfo(): { type: ProviderType | null; name: string; configured: boolean } {
    return {
      type: this.providerType,
      name: this.provider?.name || 'None',
      configured: this.isConfigured(),
    };
  }
  
  /**
   * Send a chat completion request
   */
  async chat(messages: Message[], options?: ChatOptions): Promise<LLMResponse> {
    if (!this.provider) {
      throw new Error('LLM provider not configured. Call configure() first.');
    }
    
    if (!this.provider.isConfigured()) {
      throw new Error(`LLM provider ${this.provider.name} is not properly configured (missing API key?)`);
    }
    
    return this.provider.chat(messages, options);
  }
  
  /**
   * Get the raw provider instance (for provider-specific features)
   */
  getProvider(): ILLMProvider | null {
    return this.provider;
  }
}

// Export singleton instance
export const llmService = new LLMService();

// Export factory
export { LLMProviderFactory };
