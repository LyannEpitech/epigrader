import { ILLMProvider, ProviderConfig } from './types.js';
import { MoonshotProvider } from './moonshot.js';
import { MammouthProvider } from './mammoth.js';

export type ProviderType = 'moonshot' | 'mammouth' | 'openai' | 'ollama';

export class LLMProviderFactory {
  static create(type: ProviderType): ILLMProvider {
    switch (type) {
      case 'moonshot':
        return new MoonshotProvider();
      case 'mammouth':
        return new MammouthProvider();
      default:
        throw new Error(`Unknown provider type: ${type}`);
    }
  }
  
  static getAvailableProviders(): Array<{ type: ProviderType; name: string; defaultModel: string }> {
    return [
      { type: 'mammouth', name: 'Mammouth AI', defaultModel: 'gpt-4.1' },
      { type: 'moonshot', name: 'Moonshot AI', defaultModel: 'moonshot-v1-8k' },
    ];
  }
}
