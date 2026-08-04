import { apiClient } from './client';
import type { AdminDashboard, AnalyticsSummary } from '@/types';

export const dashboardApi = {
  getAdminDashboard: () =>
    apiClient.get<AdminDashboard>('/dashboard/admin'),

  getAnalyticsSummary: () =>
    apiClient.get<AnalyticsSummary>('/dashboard/analytics'),
};
