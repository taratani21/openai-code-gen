/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenAIQuery } from '../classes/open-ai-query';

export interface ICommandConfig {
  command: string;
  callback: (query: OpenAIQuery) => Promise<any>;
}
