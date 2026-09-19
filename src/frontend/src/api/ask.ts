import { apiClient } from './client';

export interface AskSource {
  source: string;
  score: number;
  text: string;
}

export interface AskQueryResponse {
  query: string;
  answer: string;
  cached: boolean;
  cacheType?: string | null;
  sessionId?: string | null;
  sources: AskSource[];
  abstained: boolean;
  message?: string | null;
  provider?: string | null;
  model?: string | null;
}

export interface AskHealth {
  enabled: boolean;
  ragReachable: boolean;
  message: string;
}

export interface AskLlmSettings {
  canConfigure: boolean;
  defaultProvider: string;
  defaultModel: string;
  defaultFailover: boolean;
  hint: string;
}

export interface AskLlmModel {
  modelId: string;
  displayName?: string | null;
  enabled: boolean;
  isDefault: boolean;
}

export interface AskLlmProvider {
  slug: string;
  displayName: string;
  enabled: boolean;
  configured: boolean;
  models: AskLlmModel[];
}

export interface AskLlmCatalog {
  source: string;
  fetchedAt?: string | null;
  providers: AskLlmProvider[];
}

export const askApi = {
  health: () => apiClient.get<AskHealth>('/ask/health', { timeout: 10000 }),

  llmSettings: () => apiClient.get<AskLlmSettings>('/ask/llm/settings', { timeout: 10000 }),

  llmCatalog: () => apiClient.get<AskLlmCatalog>('/ask/llm/catalog', { timeout: 15000 }),

  query: (payload: {
    query: string;
    sessionId?: string;
    provider?: string;
    model?: string;
    failover?: boolean;
  }) => apiClient.post<AskQueryResponse>('/ask/query', payload, { timeout: 90000 }),
};
