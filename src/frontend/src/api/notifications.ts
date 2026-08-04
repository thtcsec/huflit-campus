import { apiClient } from './client';
import type { Notification } from '@/types';

export const notificationsApi = {
  getMyNotifications: () =>
    apiClient.get<Notification[]>('/notifications'),

  markAsRead: (id: string) =>
    apiClient.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.put('/notifications/read-all'),

  deleteNotification: (id: string) =>
    apiClient.delete(`/notifications/${id}`),
};
