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
}

export interface AskHealth {
  enabled: boolean;
  ragReachable: boolean;
  message: string;
}

export const askApi = {
  health: () => apiClient.get<AskHealth>('/ask/health', { timeout: 10000 }),

  query: (payload: { query: string; sessionId?: string }) =>
    apiClient.post<AskQueryResponse>('/ask/query', payload, { timeout: 90000 }),
};
