import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export type SupportedModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'claude-opus-4-6'
  | 'claude-sonnet-4-6'
  | 'gemini-1.5-pro';

const MODEL_PROVIDERS: Record<string, 'openai' | 'anthropic'> = {
  'gpt-4o': 'openai',
  'gpt-4o-mini': 'openai',
  'claude-opus-4-6': 'anthropic',
  'claude-sonnet-4-6': 'anthropic',
  // Gemini will be added via Vertex AI later — routes to GPT-4o-mini as fallback
  'gemini-1.5-pro': 'openai',
};

export interface RouteResult {
  provider: 'openai' | 'anthropic';
  modelId: string;
}

@Injectable()
export class ModelRouterService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  readonly mockMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.mockMode = config.get('AI_MOCK_MODE') === 'true';
    this.openai = new OpenAI({
      apiKey: config.get('OPENAI_API_KEY') ?? 'mock-key',
    });
    this.anthropic = new Anthropic({
      apiKey: config.get('ANTHROPIC_API_KEY') ?? 'mock-key',
    });
  }

  route(requestedModel?: string): RouteResult {
    if (!requestedModel) {
      // Default: Claude Opus for best quality
      return { provider: 'anthropic', modelId: 'claude-opus-4-6' };
    }

    const provider = MODEL_PROVIDERS[requestedModel];
    if (!provider) {
      return { provider: 'openai', modelId: 'gpt-4o' };
    }

    return { provider, modelId: requestedModel };
  }

  getOpenAI(): OpenAI {
    return this.openai;
  }

  getAnthropic(): Anthropic {
    return this.anthropic;
  }
}
