import { ConfigurationParameters } from 'openai';

export interface OpenAIQueryConfig extends ConfigurationParameters {
  maxTokens?: number;
}