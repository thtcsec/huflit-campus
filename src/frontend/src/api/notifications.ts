import { apiClient } from './client';
import type { Notification } from '@/types';
import type { PagedResult } from '@/types/paging';

export const notificationsApi = {
  getMyNotifications: (page = 1, pageSize = 50, unreadOnly = false) =>
    apiClient.get<PagedResult<Notification>>('/notifications', {
      params: { page, pageSize, unreadOnly },
    }),

  markAsRead: (id: string) => apiClient.post(`/notifications/${id}/read`),

  markAllAsRead: () => apiClient.post('/notifications/read-all'),

  deleteNotification: (id: string) => apiClient.delete(`/notifications/${id}`),
};
