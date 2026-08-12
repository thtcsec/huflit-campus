import { apiClient } from './client';
import type { AdminDashboard } from '@/types';

export const dashboardApi = {
  getAdminDashboard: () =>
    apiClient.get<AdminDashboard>('/dashboard/admin'),
};
